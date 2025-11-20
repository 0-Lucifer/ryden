const crypto = require('crypto');

// Generate OTP
const generateOTP = (length = 6) => {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  ).toString();
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Calculate ride fare
const calculateFare = (distance, duration, vehicleType = 'bike', surgeMultiplier = 1) => {
  const BASE_FARE = 50;
  const PER_KM_RATE = vehicleType === 'car' ? 25 : 15;
  const PER_MINUTE_RATE = 2;
  
  const distanceCost = distance * PER_KM_RATE;
  const timeCost = (duration / 60) * PER_MINUTE_RATE;
  const subtotal = BASE_FARE + distanceCost + timeCost;
  
  const surgeAmount = subtotal * (surgeMultiplier - 1);
  const vatAmount = (subtotal + surgeAmount) * 0.05;
  const total = Math.round(subtotal + surgeAmount + vatAmount);
  
  return {
    baseFare: BASE_FARE,
    distanceCost: Math.round(distanceCost),
    timeCost: Math.round(timeCost),
    subtotal: Math.round(subtotal),
    surgeMultiplier,
    surgeAmount: Math.round(surgeAmount),
    vat: Math.round(vatAmount),
    total,
  };
};

// Check if location is within NSU campus geofence
const isWithinCampus = (lat, lng) => {
  const NSU_LAT = 23.8103;
  const NSU_LNG = 90.4125;
  const RADIUS_KM = 5;
  
  const distance = calculateDistance(NSU_LAT, NSU_LNG, lat, lng);
  return distance <= RADIUS_KM;
};

// Generate random reference ID
const generateReferenceId = (prefix = 'RYD') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Format phone number to Bangladesh format
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Add +880 if not present
  if (!cleaned.startsWith('880')) {
    if (cleaned.startsWith('0')) {
      cleaned = '880' + cleaned.slice(1);
    } else {
      cleaned = '880' + cleaned;
    }
  }
  
  return '+' + cleaned;
};

// Check if time is peak hours (surge pricing)
const isPeakHour = () => {
  const hour = new Date().getHours();
  // Morning peak: 7-10 AM, Evening peak: 5-8 PM
  return (hour >= 7 && hour < 10) || (hour >= 17 && hour < 20);
};

// Validate Bangladesh mobile number
const isValidBDPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  // Bangladesh mobile numbers: 01[3-9]xxxxxxxx (11 digits) or 8801[3-9]xxxxxxxx (13 digits)
  return /^(01[3-9]\d{8}|8801[3-9]\d{8})$/.test(cleaned);
};

// Mask sensitive data
const maskSensitiveData = (data, type) => {
  if (!data) return '';
  
  switch (type) {
    case 'phone':
      return data.slice(0, -4).replace(/\d/g, '*') + data.slice(-4);
    case 'email':
      const [local, domain] = data.split('@');
      return local.slice(0, 2) + '***@' + domain;
    case 'card':
      return '**** **** **** ' + data.slice(-4);
    default:
      return data;
  }
};

module.exports = {
  generateOTP,
  calculateDistance,
  calculateFare,
  isWithinCampus,
  generateReferenceId,
  formatPhoneNumber,
  isPeakHour,
  isValidBDPhone,
  maskSensitiveData,
};
