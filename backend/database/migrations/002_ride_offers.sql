-- Migration for ride offers table
-- Run after 001_init_schema.sql

CREATE TABLE IF NOT EXISTS ride_offers (
  id VARCHAR(50) PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Route information
  route_start_address TEXT NOT NULL,
  route_start_lat DECIMAL(10, 8) NOT NULL,
  route_start_lng DECIMAL(11, 8) NOT NULL,
  route_end_address TEXT NOT NULL,
  route_end_lat DECIMAL(10, 8) NOT NULL,
  route_end_lng DECIMAL(11, 8) NOT NULL,
  total_distance DECIMAL(10, 2), -- in km
  
  -- Schedule
  departure_time TIMESTAMP NOT NULL,
  
  -- Vehicle and capacity
  vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('bike', 'car', 'suv')),
  total_seats INTEGER NOT NULL CHECK (total_seats > 0 AND total_seats <= 7),
  available_seats INTEGER NOT NULL CHECK (available_seats >= 0 AND available_seats <= total_seats),
  
  -- Pricing
  price_per_seat DECIMAL(10, 2) NOT NULL CHECK (price_per_seat > 0),
  
  -- Additional info
  amenities JSONB DEFAULT '[]',
  notes TEXT,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'available' 
    CHECK (status IN ('available', 'full', 'started', 'completed', 'cancelled')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ride_offers_driver ON ride_offers(driver_id);
CREATE INDEX idx_ride_offers_status ON ride_offers(status);
CREATE INDEX idx_ride_offers_departure ON ride_offers(departure_time);
CREATE INDEX idx_ride_offers_route_start ON ride_offers(route_start_lat, route_start_lng);
CREATE INDEX idx_ride_offers_route_end ON ride_offers(route_end_lat, route_end_lng);

-- Trigger for updated_at
CREATE TRIGGER update_ride_offers_updated_at
BEFORE UPDATE ON ride_offers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Bookings for ride offers
CREATE TABLE IF NOT EXISTS ride_offer_bookings (
  id VARCHAR(50) PRIMARY KEY,
  offer_id VARCHAR(50) NOT NULL REFERENCES ride_offers(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Booking details
  seats_booked INTEGER NOT NULL CHECK (seats_booked > 0),
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10, 8) NOT NULL,
  pickup_lng DECIMAL(11, 8) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_lat DECIMAL(10, 8) NOT NULL,
  dropoff_lng DECIMAL(11, 8) NOT NULL,
  
  -- Payment
  fare DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' 
    CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT
);

-- Indexes for bookings
CREATE INDEX idx_bookings_offer ON ride_offer_bookings(offer_id);
CREATE INDEX idx_bookings_rider ON ride_offer_bookings(rider_id);
CREATE INDEX idx_bookings_status ON ride_offer_bookings(status);

-- Trigger for bookings updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON ride_offer_bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
