// API Configuration for Bangladesh NSU Ride-Sharing App
export const API_CONFIG = {
  // Base URLs for different environments
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  API_GATEWAY: process.env.EXPO_PUBLIC_API_GATEWAY || 'https://api.ryden.bd',
  
  // Microservices endpoints
  SERVICES: {
    AUTH: '/auth',
    USER: '/users',
    RIDE: '/rides',
    LOCATION: '/location',
    PAYMENT: '/payments',
    NOTIFICATION: '/notifications',
    CHAT: '/chat',
    RATING: '/ratings',
  },

  // Timeout configurations
  TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 120000, // 2 minutes for file uploads
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 1000,
  
  // Location update interval
  LOCATION_UPDATE_INTERVAL: 5000, // 5 seconds
  
  // Search radius for nearby drivers (in km)
  SEARCH_RADIUS: {
    INITIAL: 2,
    MEDIUM: 5,
    MAX: 10,
  },
  
  // Bangladesh-specific payment gateways
  PAYMENT_GATEWAYS: {
    BKASH: 'bkash',
    NAGAD: 'nagad',
    ROCKET: 'rocket',
    SSLCOMMERZ: 'sslcommerz',
    CASH: 'cash',
  },
  
  // Vehicle types
  VEHICLE_TYPES: {
    BIKE: 'bike',
    CAR_MINI: 'car_mini',
    CAR_SEDAN: 'car_sedan',
    CAR_PREMIUM: 'car_premium',
  },
  
  // Ride status
  RIDE_STATUS: {
    REQUESTED: 'requested',
    MATCHED: 'matched',
    STARTED: 'started',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  
  // Peak hours surge pricing
  SURGE_MULTIPLIER: {
    MORNING: 1.5, // 8-11 AM
    EVENING: 1.5, // 4:30-7:30 PM
    NORMAL: 1.0,
  },
  
  // Bangladesh VAT
  VAT_PERCENTAGE: 5,
  
  // Driver rating threshold
  MIN_DRIVER_RATING: 4.0,
  
  // NSU Campus coordinates (approximate)
  NSU_CAMPUS: {
    latitude: 23.8103,
    longitude: 90.4125,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
};

// API Headers
export const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': token ? `Bearer ${token}` : '',
  'X-App-Version': '1.0.0',
  'X-Platform': 'mobile',
});

// Error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
};
