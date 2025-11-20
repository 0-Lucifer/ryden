// Ride Context - Global ride state management
import RideService, { NearbyDriver, Ride, RideOffer, RideRequest } from '@/services/ride.service';
import WebSocketService from '@/services/websocket.service';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface RideContextType {
  activeRide: Ride | null;
  isLoadingRide: boolean;
  nearbyDrivers: NearbyDriver[];
  requestRide: (data: RideRequest) => Promise<Ride>;
  cancelRide: (rideId: string, reason?: string) => Promise<void>;
  fetchActiveRide: () => Promise<void>;
  fetchNearbyDrivers: (location: { latitude: number; longitude: number }) => Promise<void>;
  searchRides: (params: { from: string; to: string; date?: string; time?: string; passengers?: number; vehicleType?: string }) => Promise<RideOffer[]>;
  publishRide: (data: { from: string; to: string; stops?: string[]; date: string; time: string; vehicle: string; vehicleType: string; seats: number; pricePerSeat: number; amenities?: { instantBooking?: boolean; music?: boolean; pets?: boolean; luggage?: boolean } }) => Promise<{ success: boolean; offerId: string }>;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider = ({ children }: { children: ReactNode }) => {
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [isLoadingRide, setIsLoadingRide] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDriver[]>([]);

  // Fetch active ride on mount
  useEffect(() => {
    fetchActiveRide();
    
    // Listen for ride status changes
    WebSocketService.onRideStatusChange((data) => {
      console.log('[RideContext] Ride status changed:', data);
      if (activeRide && activeRide.id === data.rideId) {
        setActiveRide({ ...activeRide, status: data.status });
      }
    });

    // Listen for ride matched
    WebSocketService.onRideMatched((data) => {
      console.log('[RideContext] Ride matched:', data);
      fetchActiveRide(); // Refresh ride details
    });

    return () => {
      WebSocketService.offRideStatusChange();
    };
  }, []);

  const requestRide = async (data: RideRequest): Promise<Ride> => {
    try {
      setIsLoadingRide(true);
      const ride = await RideService.requestRide(data);
      setActiveRide(ride);
      
      // Join ride room for real-time updates
      WebSocketService.joinRide(ride.id);
      
      return ride;
    } catch (error) {
      console.error('[RideContext] Request ride error:', error);
      throw error;
    } finally {
      setIsLoadingRide(false);
    }
  };

  const cancelRide = async (rideId: string, reason?: string) => {
    try {
      setIsLoadingRide(true);
      await RideService.cancelRide(rideId, reason);
      
      // Leave ride room
      WebSocketService.leaveRide(rideId);
      
      setActiveRide(null);
    } catch (error) {
      console.error('[RideContext] Cancel ride error:', error);
      throw error;
    } finally {
      setIsLoadingRide(false);
    }
  };

  const fetchActiveRide = async () => {
    try {
      const ride = await RideService.getActiveRide();
      setActiveRide(ride);
      
      if (ride) {
        // Join ride room for real-time updates
        WebSocketService.joinRide(ride.id);
      }
    } catch (error) {
      console.error('[RideContext] Fetch active ride error:', error);
    }
  };

  const fetchNearbyDrivers = async (location: { latitude: number; longitude: number }) => {
    try {
      const drivers = await RideService.getNearbyDrivers(location);
      setNearbyDrivers(drivers);
    } catch (error) {
      console.error('[RideContext] Fetch nearby drivers error:', error);
      setNearbyDrivers([]);
    }
  };

  const searchRides: RideContextType['searchRides'] = async (params) => {
    try {
      setIsLoadingRide(true);
      return await RideService.searchRides(params);
    } catch (error) {
      console.error('[RideContext] Search rides error:', error);
      throw error;
    } finally {
      setIsLoadingRide(false);
    }
  };

  const publishRide: RideContextType['publishRide'] = async (data) => {
    try {
      setIsLoadingRide(true);
      return await RideService.offerRide(data);
    } catch (error) {
      console.error('[RideContext] Publish ride error:', error);
      throw error;
    } finally {
      setIsLoadingRide(false);
    }
  };

  return (
    <RideContext.Provider
      value={{
        activeRide,
        isLoadingRide,
        nearbyDrivers,
        requestRide,
        cancelRide,
        fetchActiveRide,
        fetchNearbyDrivers,
        searchRides,
        publishRide,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

// Custom hook to use ride context
export const useRide = () => {
  const context = useContext(RideContext);
  if (context === undefined) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};
