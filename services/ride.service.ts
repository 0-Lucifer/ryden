// Ride Service - Handles ride requests, matching, tracking
import { API_CONFIG } from '@/config/api.config';
import ApiService from './api.service';

export interface RideRequest {
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  vehicleType: string;
  passengers: number;
  scheduledTime?: string; // ISO date string for scheduled rides
  isShared: boolean;
  paymentMethod: string;
  notes?: string;
}

// Ride Offer listing used in search results
export interface RideOffer {
  id: string;
  driver: {
    id: string;
    name: string;
    avatarUrl?: string;
    rating: number;
    reviews: number;
    isInstant?: boolean;
    isFemaleDriver?: boolean;
  };
  route: {
    from: string;
    to: string;
    via?: string[];
  };
  when: {
    dateTime: string; // ISO
    durationMinutes?: number;
  };
  vehicle: {
    type: string; // bike | car | cng
    model?: string;
  };
  pricePerSeat: number;
  currency: string;
  availableSeats: number;
  tags?: string[]; // e.g. ['AC', 'Music']
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  status: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  vehicleType: string;
  passengers: number;
  fare: FareDetails;
  driver?: DriverInfo;
  estimatedArrival?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface FareDetails {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  vat: number;
  total: number;
  currency: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicle: {
    type: string;
    model: string;
    plate: string;
    color: string;
  };
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface NearbyDriver {
  id: string;
  name: string;
  rating: number;
  distance: number; // in km
  eta: number; // in minutes
  vehicleType: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

class RideService {
  // Request a new ride
  async requestRide(data: RideRequest): Promise<Ride> {
    try {
      const response = await ApiService.post<{ success: boolean; data: Ride }>(
        `${API_CONFIG.SERVICES.RIDE}/request`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('[RideService] Request ride failed:', error);
      throw error;
    }
  }

  // Search rides (driver-published offers)
  async searchRides(params: {
    from: string;
    to: string;
    date?: string; // ISO date (YYYY-MM-DD)
    time?: string; // HH:mm (optional)
    passengers?: number;
    vehicleType?: string;
  }): Promise<RideOffer[]> {
    try {
      const response = await ApiService.get<{ success: boolean; data: RideOffer[] }>(
        `${API_CONFIG.SERVICES.RIDE}/search`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('[RideService] Search rides failed:', error);
      throw error;
    }
  }

  // Offer a ride (driver publishes seats)
  async offerRide(data: {
    from: string;
    to: string;
    stops?: string[];
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    vehicle: string; // free text
    vehicleType: string; // bike | car | cng
    seats: number;
    pricePerSeat: number;
    amenities?: {
      instantBooking?: boolean;
      music?: boolean;
      pets?: boolean;
      luggage?: boolean;
    };
  }): Promise<{ success: boolean; offerId: string }>{
    try {
      const response = await ApiService.post<{ success: boolean; data: { offerId: string } }>(
        `${API_CONFIG.SERVICES.RIDE}/offer`,
        data
      );
      return { success: true, offerId: response.data.offerId };
    } catch (error) {
      console.error('[RideService] Offer ride failed:', error);
      throw error;
    }
  }

  // Calculate fare estimate
  async calculateFare(
    pickup: { latitude: number; longitude: number },
    dropoff: { latitude: number; longitude: number },
    vehicleType: string
  ): Promise<FareDetails> {
    try {
      const response = await ApiService.post<{ success: boolean; data: FareDetails }>(
        `${API_CONFIG.SERVICES.RIDE}/calculate-fare`,
        { pickup, dropoff, vehicleType }
      );
      return response.data;
    } catch (error) {
      console.error('[RideService] Calculate fare failed:', error);
      throw error;
    }
  }

  // Get nearby available drivers
  async getNearbyDrivers(
    location: { latitude: number; longitude: number },
    vehicleType?: string,
    radius?: number
  ): Promise<NearbyDriver[]> {
    try {
      const response = await ApiService.get<{ success: boolean; data: NearbyDriver[] }>(
        `${API_CONFIG.SERVICES.LOCATION}/nearby-drivers`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            vehicleType,
            radius: radius || API_CONFIG.SEARCH_RADIUS.INITIAL,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('[RideService] Get nearby drivers failed:', error);
      throw error;
    }
  }

  // Get ride details
  async getRideDetails(rideId: string): Promise<Ride> {
    try {
      const response = await ApiService.get<{ success: boolean; data: Ride }>(
        `${API_CONFIG.SERVICES.RIDE}/${rideId}`
      );
      return response.data;
    } catch (error) {
      console.error('[RideService] Get ride details failed:', error);
      throw error;
    }
  }

  // Cancel ride
  async cancelRide(rideId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      return await ApiService.post(
        `${API_CONFIG.SERVICES.RIDE}/${rideId}/cancel`,
        { reason }
      );
    } catch (error) {
      console.error('[RideService] Cancel ride failed:', error);
      throw error;
    }
  }

  // Get active ride (ongoing or requested)
  async getActiveRide(): Promise<Ride | null> {
    try {
      const response = await ApiService.get<{ success: boolean; data: Ride | null }>(
        `${API_CONFIG.SERVICES.RIDE}/active`
      );
      return response.data;
    } catch (error) {
      console.error('[RideService] Get active ride failed:', error);
      return null;
    }
  }

  // Get ride history
  async getRideHistory(page = 1, limit = 20): Promise<{ rides: Ride[]; total: number }> {
    try {
      const response = await ApiService.get<{ success: boolean; data: { rides: Ride[]; total: number } }>(
        `${API_CONFIG.SERVICES.RIDE}/history`,
        { params: { page, limit } }
      );
      return response.data;
    } catch (error) {
      console.error('[RideService] Get ride history failed:', error);
      throw error;
    }
  }

  // Get upcoming scheduled rides
  async getScheduledRides(): Promise<Ride[]> {
    try {
      const response = await ApiService.get<{ success: boolean; data: Ride[] }>(
        `${API_CONFIG.SERVICES.RIDE}/scheduled`
      );
      return response.data;
    } catch (error) {
      console.error('[RideService] Get scheduled rides failed:', error);
      throw error;
    }
  }

  // Track driver location (real-time updates via Socket.IO handled separately)
  async getDriverLocation(rideId: string): Promise<{ latitude: number; longitude: number }> {
    try {
      const response = await ApiService.get<{ success: boolean; data: { latitude: number; longitude: number } }>(
        `${API_CONFIG.SERVICES.LOCATION}/driver/${rideId}`
      );
      return response.data;
    } catch (error) {
      console.error('[RideService] Get driver location failed:', error);
      throw error;
    }
  }

  // Share ride details (emergency contact feature)
  async shareRideDetails(rideId: string, contactPhone: string): Promise<{ success: boolean }> {
    try {
      return await ApiService.post(
        `${API_CONFIG.SERVICES.RIDE}/${rideId}/share`,
        { contactPhone }
      );
    } catch (error) {
      console.error('[RideService] Share ride details failed:', error);
      throw error;
    }
  }

  // Rate ride after completion
  async rateRide(
    rideId: string,
    rating: number,
    review?: string,
    tags?: string[]
  ): Promise<{ success: boolean }> {
    try {
      return await ApiService.post(
        `${API_CONFIG.SERVICES.RATING}/rate`,
        { rideId, rating, review, tags }
      );
    } catch (error) {
      console.error('[RideService] Rate ride failed:', error);
      throw error;
    }
  }
}

export default new RideService();
