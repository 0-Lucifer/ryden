const { redisClient } = require('../../../shared/database');
const { calculateDistance } = require('../../../shared/utils');

// KEY namespaces
const DRIVER_GEO_KEY = 'driver:geo';
const DRIVER_LOC_PREFIX = 'driver:loc:';
const RIDE_DRIVER_PREFIX = 'ride:driver:';

exports.updateDriverLocation = async (req, res, next) => {
  try {
    const { driverId, latitude, longitude } = req.body;
    if (!driverId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'driverId, latitude, longitude required' });
    }
    // Store geo position
    await redisClient.geoAdd(DRIVER_GEO_KEY, [{ longitude, latitude, member: driverId }]);
    await redisClient.hSet(DRIVER_LOC_PREFIX + driverId, { latitude, longitude, ts: Date.now() });
    res.json({ success: true });
  } catch (e) { next(e); }
};

exports.getNearbyDrivers = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query; // radius meters
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'latitude & longitude required' });
    }
    const raw = await redisClient.geoRadius(DRIVER_GEO_KEY, Number(longitude), Number(latitude), Number(radius), 'm', { WITHDIST: true, COUNT: 20 });
    const drivers = raw.map(d => ({ id: d.member, distanceKm: parseFloat((d.distance / 1000).toFixed(2)) }));
    res.json({ success: true, data: drivers });
  } catch (e) { next(e); }
};

exports.getDriverLocationForRide = async (req, res, next) => {
  try {
    const rideId = req.params.rideId;
    // Placeholder mapping ride->driver stored elsewhere; for now echo first driver
    const driverId = await redisClient.get(RIDE_DRIVER_PREFIX + rideId);
    if (!driverId) return res.status(404).json({ error: 'Driver not assigned' });
    const loc = await redisClient.hGetAll(DRIVER_LOC_PREFIX + driverId);
    res.json({ success: true, data: { driverId, latitude: Number(loc.latitude), longitude: Number(loc.longitude) } });
  } catch (e) { next(e); }
};
