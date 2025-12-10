// Ride Context - Global ride state management
import { useAuth } from '@/context/AuthContext';
import RideService, { NearbyDriver, Ride, RideOffer, RideRequest } from '@/services/ride.service';
import WebSocketService from '@/services/websocket.service';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface BookingData {
  seats: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'wallet';
  pickupNote?: string;
}

interface BookingResult {
  success: boolean;
  bookingId: string;
  status: string;
}

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
  bookRide: (offerId: string, data: BookingData) => Promise<BookingResult>;
  respondToBookingRequest: (bookingId: string, action: 'accept' | 'decline') => Promise<{ success: boolean }>;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [isLoadingRide, setIsLoadingRide] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDriver[]>([]);

  const fetchActiveRide = useCallback(async () => {
    try {
      const ride = await RideService.getActiveRide();
      setActiveRide(ride);
      
      if (ride) {
        // Join ride room for real-time updates
        WebSocketService.joinRide(ride.id);
      }
    } catch (error) {
      // Silently fail if ride service not available yet
      console.warn('[RideContext] Ride service not available:', error);
      setActiveRide(null);
    }
  }, []);

  // Fetch active ride on mount (only if explicitly authenticated === true)
  useEffect(() => {
    if (isAuthenticated !== true) {
      setActiveRide(null);
      // remove handlers only if available
      if (typeof WebSocketService.offRideStatusChange === 'function') {
        WebSocketService.offRideStatusChange();
      }
      if (typeof WebSocketService.offRideMatched === 'function') {
        WebSocketService.offRideMatched();
      }
      return;
    }
    
    fetchActiveRide();
    
    // handlers use functional updates to avoid stale closures
    const handleStatusChange = (data: any) => {
      setActiveRide(prev => {
        if (prev && prev.id === data.rideId) {
          return { ...prev, status: data.status };
        }
        return prev;
      });
    };

    const handleRideMatched = () => {
      fetchActiveRide(); // Refresh ride details
    };

    if (typeof WebSocketService.onRideStatusChange === 'function') {
      WebSocketService.onRideStatusChange(handleStatusChange);
    }
    if (typeof WebSocketService.onRideMatched === 'function') {
      WebSocketService.onRideMatched(handleRideMatched);
    }

    return () => {
      if (typeof WebSocketService.offRideStatusChange === 'function') {
        WebSocketService.offRideStatusChange(handleStatusChange);
      }
      if (typeof WebSocketService.offRideMatched === 'function') {
        WebSocketService.offRideMatched(handleRideMatched);
      }
    };
  }, [isAuthenticated, fetchActiveRide]);

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

  const bookRide: RideContextType['bookRide'] = async (offerId, data) => {
    try {
      setIsLoadingRide(true);
      const result = await RideService.bookRide(offerId, data);
      
      // If booking succeeded and was auto-confirmed (instant booking), fetch active ride
      if (result.success && result.status === 'confirmed') {
        await fetchActiveRide();
      }
      
      return result;
    } catch (error) {
      console.error('[RideContext] Book ride error:', error);
      throw error;
    } finally {
      setIsLoadingRide(false);
    }
  };

  const respondToBookingRequest: RideContextType['respondToBookingRequest'] = async (bookingId, action) => {
    try {
      setIsLoadingRide(true);
      return await RideService.respondToBookingRequest(bookingId, action);
    } catch (error) {
      console.error('[RideContext] Respond to booking error:', error);
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
        bookRide,
        respondToBookingRequest,
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
