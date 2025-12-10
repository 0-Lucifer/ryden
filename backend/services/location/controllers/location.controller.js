const Joi = require('joi');
const { pgPool } = require('../../../shared/database');
const { errorHandler } = require('../../../shared/middleware');
const utils = require('../../../shared/utils');

// KEY namespaces
const DRIVER_GEO_KEY = 'driver:geo';
const DRIVER_LOC_PREFIX = 'driver:loc:';
const DRIVER_STATUS_PREFIX = 'driver:status:';
const RIDE_DRIVER_PREFIX = 'ride:driver:';

const updateLocationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  heading: Joi.number().min(0).max(360).optional(),
  speed: Joi.number().min(0).optional(),
});

exports.updateDriverLocation = async (req, res, next) => {
  try {
    const driverId = req.user.id; // From JWT
    const { error, value } = updateLocationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { latitude, longitude, heading, speed } = value;

    // Verify user is a driver
    const driverCheck = await pgPool.query(
      'SELECT id FROM driver_profiles WHERE user_id = $1 AND status = $2',
      [driverId, 'approved']
    );

    if (driverCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Driver profile not approved' });
    }

    // Store geo position in Redis sorted set for radius queries
    await redisClient.geoAdd(DRIVER_GEO_KEY, [{
      longitude,
      latitude,
      member: driverId
    }]);

    // Store detailed location data with TTL (5 minutes)
    const locationData = {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      timestamp: Date.now().toString(),
    };
    
    if (heading !== undefined) locationData.heading = heading.toString();
    if (speed !== undefined) locationData.speed = speed.toString();

    await redisClient.hSet(DRIVER_LOC_PREFIX + driverId, locationData);
    await redisClient.expire(DRIVER_LOC_PREFIX + driverId, 300); // 5 min TTL

    // Update last seen timestamp
    await redisClient.set(DRIVER_STATUS_PREFIX + driverId, 'online', { EX: 300 });

    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    next(error);
  }
};

const nearbyDriversSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  radius: Joi.number().min(500).max(10000).default(5000), // meters
  vehicleType: Joi.string().valid('bike', 'car', 'suv', 'any').default('any'),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

exports.getNearbyDrivers = async (req, res, next) => {
  try {
    const { error, value } = nearbyDriversSchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { latitude, longitude, radius, vehicleType, limit } = value;

    // Get drivers within radius using Redis GEORADIUS
    const raw = await redisClient.geoRadius(
      DRIVER_GEO_KEY,
      Number(longitude),
      Number(latitude),
      Number(radius),
      'm',
      { WITHDIST: true, COUNT: limit, SORT: 'ASC' }
    );

    if (!raw || raw.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Get driver IDs
    const driverIds = raw.map(d => d.member);

    // Fetch driver details from database
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.profile_image_url, u.rating,
             dp.vehicle_type, dp.vehicle_make, dp.vehicle_model, dp.vehicle_color, dp.vehicle_plate
      FROM users u
      JOIN driver_profiles dp ON u.id = dp.user_id
      WHERE u.id = ANY($1) AND dp.status = 'approved'
    `;
    
    const params = [driverIds];
    
    if (vehicleType !== 'any') {
      query += ' AND dp.vehicle_type = $2';
      params.push(vehicleType);
    }

    const result = await pgPool.query(query, params);

    // Merge distance with driver info
    const drivers = result.rows.map(driver => {
      const geoData = raw.find(d => d.member === driver.id);
      return {
        id: driver.id,
        name: `${driver.first_name} ${driver.last_name}`,
        image: driver.profile_image_url,
        rating: parseFloat(driver.rating),
        vehicle: {
          type: driver.vehicle_type,
          make: driver.vehicle_make,
          model: driver.vehicle_model,
          color: driver.vehicle_color,
          plate: driver.vehicle_plate,
        },
        distance: parseFloat((geoData.distance / 1000).toFixed(2)), // km
      };
    });

    res.json({ success: true, data: drivers });
  } catch (error) {
    next(error);
  }
};

exports.getDriverLocationForRide = async (req, res, next) => {
  try {
    const rideId = req.params.rideId;
    const userId = req.user.id;

    // Verify user is part of this ride (either rider or driver)
    const rideResult = await pgPool.query(
      'SELECT rider_id, driver_id FROM rides WHERE id = $1',
      [rideId]
    );

    if (rideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    const ride = rideResult.rows[0];
    
    if (ride.rider_id !== userId && ride.driver_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view this ride location' });
    }

    if (!ride.driver_id) {
      return res.status(404).json({ error: 'Driver not assigned yet' });
    }

    // Get driver location from Redis
    const loc = await redisClient.hGetAll(DRIVER_LOC_PREFIX + ride.driver_id);
    
    if (!loc || !loc.latitude) {
      return res.status(404).json({ error: 'Driver location not available' });
    }

    res.json({
      success: true,
      data: {
        driverId: ride.driver_id,
        latitude: parseFloat(loc.latitude),
        longitude: parseFloat(loc.longitude),
        heading: loc.heading ? parseFloat(loc.heading) : null,
        speed: loc.speed ? parseFloat(loc.speed) : null,
        timestamp: loc.timestamp ? parseInt(loc.timestamp) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.setDriverStatus = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const { status } = req.body; // 'online', 'offline', 'busy'

    if (!['online', 'offline', 'busy'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify driver profile
    const driverCheck = await pgPool.query(
      'SELECT id FROM driver_profiles WHERE user_id = $1',
      [driverId]
    );

    if (driverCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Driver profile not found' });
    }

    if (status === 'offline') {
      // Remove from active drivers
      await redisClient.del(DRIVER_STATUS_PREFIX + driverId);
      await redisClient.zRem(DRIVER_GEO_KEY, driverId);
    } else {
      // Set status with TTL
      await redisClient.set(DRIVER_STATUS_PREFIX + driverId, status, { EX: 3600 });
    }

    res.json({ success: true, message: 'Status updated', data: { status } });
  } catch (error) {
    next(error);
  }
};

