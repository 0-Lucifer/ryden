const Joi = require('joi');
const { pgPool, redisClient } = require('../../../shared/database');
const { errorHandler } = require('../../../shared/middleware');
const utils = require('../../../shared/utils');

exports.requestRide = async (req, res, next) => {
  try {
    const { error, value } = requestRideSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { pickupLocation, dropoffLocation, vehicleType, passengers, scheduledTime, paymentMethod, notes } = value;
    const userId = req.user.id;

    // Check if user already has an active ride
    const existingRide = await pgPool.query(
      `SELECT id FROM rides WHERE rider_id = $1 AND status IN ('pending', 'accepted', 'started') LIMIT 1`,
      [userId]
    );

    if (existingRide.rows.length > 0) {
      return res.status(409).json({ error: 'You already have an active ride' });
    }

    // Calculate distance and duration (placeholder until Google Maps integration)
    const distance = calculateDistance(
      pickupLocation.latitude,
      pickupLocation.longitude,
      dropoffLocation.latitude,
      dropoffLocation.longitude
    );
    const estimatedDuration = Math.ceil(distance * 2.5); // Rough estimate: 2.5 min per km

    // Calculate fare with surge pricing
    const fareDetails = calculateFare(distance, estimatedDuration, vehicleType);

    // Create ride in database
    const rideId = generateReferenceId('RIDE');
    const result = await pgPool.query(
      `INSERT INTO rides (
        id, rider_id, pickup_address, pickup_lat, pickup_lng,
        dropoff_address, dropoff_lat, dropoff_lng, vehicle_type,
        passengers, status, scheduled_time, payment_method, notes,
        estimated_distance, estimated_duration, estimated_fare, base_fare,
        distance_fare, time_fare, surge_multiplier, platform_fee
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *`,
      [
        rideId, userId, pickupLocation.address, pickupLocation.latitude, pickupLocation.longitude,
        dropoffLocation.address, dropoffLocation.latitude, dropoffLocation.longitude,
        vehicleType, passengers,
        scheduledTime ? 'scheduled' : 'pending',
        scheduledTime || null, paymentMethod, notes,
        distance, estimatedDuration, fareDetails.totalFare, fareDetails.baseFare,
        fareDetails.distanceFare, fareDetails.timeFare, fareDetails.surgeMultiplier, fareDetails.platformFee
      ]
    );

    const ride = result.rows[0];

    // Store in Redis for quick access
    await redisClient.setEx(`ride:${rideId}`, 3600, JSON.stringify(ride));

    // TODO: Trigger driver matching algorithm
    // TODO: Send push notifications to nearby drivers

    res.status(201).json({
      success: true,
      data: {
        id: ride.id,
        status: ride.status,
        pickup: {
          address: ride.pickup_address,
          latitude: ride.pickup_lat,
          longitude: ride.pickup_lng,
        },
        dropoff: {
          address: ride.dropoff_address,
          latitude: ride.dropoff_lat,
          longitude: ride.dropoff_lng,
        },
        vehicleType: ride.vehicle_type,
        passengers: ride.passengers,
        estimatedDistance: ride.estimated_distance,
        estimatedDuration: ride.estimated_duration,
        fareDetails: {
          baseFare: parseFloat(ride.base_fare),
          distanceFare: parseFloat(ride.distance_fare),
          timeFare: parseFloat(ride.time_fare),
          surgeMultiplier: parseFloat(ride.surge_multiplier),
          platformFee: parseFloat(ride.platform_fee),
          totalFare: parseFloat(ride.estimated_fare),
        },
        scheduledTime: ride.scheduled_time,
        paymentMethod: ride.payment_method,
        createdAt: ride.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

const calculateFareSchema = Joi.object({
  pickup: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required(),
  dropoff: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required(),
  vehicleType: Joi.string().valid('bike', 'car', 'suv').default('car'),
});

exports.calculateFare = async (req, res, next) => {
  try {
    const { error, value } = calculateFareSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { pickup, dropoff, vehicleType } = value;

    // Calculate distance
    const distance = calculateDistance(
      pickup.latitude, pickup.longitude,
      dropoff.latitude, dropoff.longitude
    );

    // Estimate duration (assume 2.5 min per km in city traffic)
    const duration = distance * 2.5;

    // Calculate fare with surge pricing
    const fareBreakdown = calculateFare(distance, duration, vehicleType);

    res.json({
      success: true,
      data: {
        distance: parseFloat(distance.toFixed(2)),
        estimatedDuration: Math.round(duration),
        vehicleType,
        ...fareBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};



exports.getActiveRide = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check Redis cache first
    const cacheKey = `user:${userId}:active_ride`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached) });
    }

    // Query database
    const result = await pgPool.query(
      `SELECT r.*, 
              d.first_name as driver_first_name, d.last_name as driver_last_name,
              d.phone as driver_phone, d.profile_image_url as driver_image,
              d.rating as driver_rating,
              dp.vehicle_model, dp.vehicle_color, dp.vehicle_number
       FROM rides r
       LEFT JOIN users d ON r.driver_id = d.id
       LEFT JOIN driver_profiles dp ON r.driver_id = dp.user_id
       WHERE r.rider_id = $1 AND r.status IN ('pending', 'accepted', 'started')
       ORDER BY r.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    const ride = result.rows[0];
    const rideData = {
      id: ride.id,
      status: ride.status,
      pickup: {
        address: ride.pickup_address,
        latitude: ride.pickup_lat,
        longitude: ride.pickup_lng,
      },
      dropoff: {
        address: ride.dropoff_address,
        latitude: ride.dropoff_lat,
        longitude: ride.dropoff_lng,
      },
      driver: ride.driver_id ? {
        id: ride.driver_id,
        name: `${ride.driver_first_name} ${ride.driver_last_name}`,
        phone: ride.driver_phone,
        image: ride.driver_image,
        rating: parseFloat(ride.driver_rating),
        vehicle: {
          model: ride.vehicle_model,
          color: ride.vehicle_color,
          number: ride.vehicle_number,
        },
      } : null,
      vehicleType: ride.vehicle_type,
      passengers: ride.passengers,
      estimatedFare: parseFloat(ride.estimated_fare),
      actualFare: ride.actual_fare ? parseFloat(ride.actual_fare) : null,
      paymentMethod: ride.payment_method,
      createdAt: ride.created_at,
      acceptedAt: ride.accepted_at,
      startedAt: ride.started_at,
    };

    // Cache for 30 seconds
    await redisClient.setEx(cacheKey, 30, JSON.stringify(rideData));

    res.json({ success: true, data: rideData });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, 
             d.first_name as driver_first_name, d.last_name as driver_last_name,
             d.profile_image_url as driver_image, d.rating as driver_rating
      FROM rides r
      LEFT JOIN users d ON r.driver_id = d.id
      WHERE r.rider_id = $1
    `;
    
    const params = [userId];
    
    if (status) {
      query += ` AND r.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pgPool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM rides WHERE rider_id = $1';
    const countParams = [userId];
    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }
    const countResult = await pgPool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    const rides = result.rows.map(ride => ({
      id: ride.id,
      status: ride.status,
      pickup: { address: ride.pickup_address },
      dropoff: { address: ride.dropoff_address },
      driver: ride.driver_id ? {
        name: `${ride.driver_first_name} ${ride.driver_last_name}`,
        image: ride.driver_image,
        rating: parseFloat(ride.driver_rating),
      } : null,
      fare: parseFloat(ride.actual_fare || ride.estimated_fare),
      paymentMethod: ride.payment_method,
      createdAt: ride.created_at,
      completedAt: ride.completed_at,
    }));

    res.json({
      success: true,
      data: {
        rides,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelRide = async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const userId = req.user.id;
    const { reason } = req.body;

    // Get ride
    const rideResult = await pgPool.query(
      'SELECT * FROM rides WHERE id = $1 AND rider_id = $2',
      [rideId, userId]
    );

    if (rideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    const ride = rideResult.rows[0];

    if (!['pending', 'accepted'].includes(ride.status)) {
      return res.status(400).json({ error: 'Cannot cancel ride in current status' });
    }

    // Calculate cancellation fee if applicable
    let cancellationFee = 0;
    if (ride.status === 'accepted' && ride.accepted_at) {
      const minutesSinceAccepted = (Date.now() - new Date(ride.accepted_at).getTime()) / 60000;
      if (minutesSinceAccepted > 5) {
        cancellationFee = 20; // ৳20 cancellation fee
      }
    }

    // Update ride status
    await pgPool.query(
      `UPDATE rides SET status = 'cancelled', cancelled_at = NOW(), 
        cancelled_by = 'rider', cancellation_reason = $1, cancellation_fee = $2
       WHERE id = $3`,
      [reason, cancellationFee, rideId]
    );

    // Clear cache
    await redisClient.del(`ride:${rideId}`);
    await redisClient.del(`user:${userId}:active_ride`);

    // TODO: Notify driver if ride was accepted
    // TODO: Update driver availability

    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      data: { cancellationFee },
    });
  } catch (error) {
    next(error);
  }
};

exports.getScheduled = async (req, res, next) => {
  try { res.json({ success: true, data: [] }); } catch (e) { next(e); }
};


const searchOffersSchema = Joi.object({
  pickup: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required(),
  dropoff: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required(),
  departureTime: Joi.date().iso().optional(),
  maxDetour: Joi.number().min(1).max(10).default(5), // km
  vehicleType: Joi.string().valid('bike', 'car', 'suv', 'any').default('any'),
});

exports.searchOffers = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    
    // For backward compatibility, support old query format
    if (from && to) {
      const now = new Date();
      const sample = [
        { id: 'offer-1', driver: { id: 'u1', name: 'Tahsin Rahman', rating: 4.9, reviews:127, isInstant:true }, route:{ from, to }, when:{ dateTime: now.toISOString(), durationMinutes:45 }, vehicle:{ type:'car', model:'Toyota Axio' }, pricePerSeat:120, currency:'৳', availableSeats:2, tags:['AC','Music','Student friendly']},
        { id: 'offer-2', driver: { id: 'u2', name: 'Nusrat Jahan', rating:4.8, reviews:89, isFemaleDriver:true }, route:{ from, to:'Gulshan 2' }, when:{ dateTime: now.toISOString(), durationMinutes:30 }, vehicle:{ type:'car', model:'Honda Civic' }, pricePerSeat:80, currency:'৳', availableSeats:3, tags:['AC']},
        { id: 'offer-3', driver: { id: 'u3', name: 'Rafid Ahmed', rating:5.0, reviews:263, isInstant:true }, route:{ from, to:'Uttara Sector 7' }, when:{ dateTime: now.toISOString(), durationMinutes:55 }, vehicle:{ type:'car', model:'Axio' }, pricePerSeat:100, currency:'৳', availableSeats:4, tags:['AC','Music','Wifi']}
      ];
      return res.json({ success: true, data: sample });
    }

    // New format with coordinates
    const { error, value } = searchOffersSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { pickup, dropoff, departureTime, maxDetour, vehicleType } = value;

    // Search for matching ride offers
    let query = `
      SELECT ro.*, 
             u.first_name, u.last_name, u.profile_image_url, u.rating,
             dp.vehicle_model, dp.vehicle_color, dp.vehicle_number
      FROM ride_offers ro
      JOIN users u ON ro.driver_id = u.id
      LEFT JOIN driver_profiles dp ON ro.driver_id = dp.user_id
      WHERE ro.status = 'available'
        AND ro.available_seats > 0
        AND ro.departure_time >= NOW()
    `;

    const params = [];

    if (departureTime) {
      query += ` AND ro.departure_time <= $${params.length + 1}`;
      params.push(new Date(new Date(departureTime).getTime() + 2 * 60 * 60 * 1000)); // Within 2 hours
    }

    if (vehicleType !== 'any') {
      query += ` AND ro.vehicle_type = $${params.length + 1}`;
      params.push(vehicleType);
    }

    query += ' ORDER BY ro.departure_time ASC LIMIT 50';

    const result = await pgPool.query(query, params);

    // Filter by route proximity (offers that pass near pickup and dropoff)
    const matchingOffers = result.rows.filter(offer => {
      const pickupDist = calculateDistance(
        pickup.latitude, pickup.longitude,
        offer.route_start_lat, offer.route_start_lng
      );
      const dropoffDist = calculateDistance(
        dropoff.latitude, dropoff.longitude,
        offer.route_end_lat, offer.route_end_lng
      );
      return pickupDist <= maxDetour && dropoffDist <= maxDetour;
    });

    // Calculate estimated fare for each offer
    const offers = matchingOffers.map(offer => {
      const distance = calculateDistance(pickup.latitude, pickup.longitude, dropoff.latitude, dropoff.longitude);
      const estimatedFare = (offer.price_per_seat * distance / offer.total_distance).toFixed(2);

      return {
        id: offer.id,
        driver: {
          id: offer.driver_id,
          name: `${offer.first_name} ${offer.last_name}`,
          image: offer.profile_image_url,
          rating: parseFloat(offer.rating),
        },
        route: {
          start: { address: offer.route_start_address },
          end: { address: offer.route_end_address },
        },
        departureTime: offer.departure_time,
        vehicleType: offer.vehicle_type,
        vehicle: {
          model: offer.vehicle_model,
          color: offer.vehicle_color,
          number: offer.vehicle_number,
        },
        availableSeats: offer.available_seats,
        pricePerSeat: parseFloat(offer.price_per_seat),
        estimatedFare: parseFloat(estimatedFare),
        amenities: offer.amenities || [],
      };
    });

    res.json({ success: true, data: offers });
  } catch (error) {
    next(error);
  }
};

const offerRideSchema = Joi.object({
  route: Joi.object({
    start: Joi.object({
      address: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }).required(),
    end: Joi.object({
      address: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }).required(),
  }).required(),
  departureTime: Joi.date().iso().required(),
  vehicleType: Joi.string().valid('bike', 'car', 'suv').required(),
  totalSeats: Joi.number().integer().min(1).max(7).required(),
  pricePerSeat: Joi.number().min(10).max(1000).required(),
  amenities: Joi.array().items(Joi.string()).default([]),
  notes: Joi.string().max(500).optional(),
});

exports.offerRide = async (req, res, next) => {
  try {
    // Support old format
    const { from, to, date, time, seats } = req.body;
    if (from && to && date && time && seats && req.body.pricePerSeat) {
      const offerId = generateReferenceId('OFFER');
      return res.status(201).json({ success: true, data: { offerId, from, to, date, time, seats, pricePerSeat: req.body.pricePerSeat } });
    }

    // New format
    const { error, value } = offerRideSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.user.id;
    const { route, departureTime, vehicleType, totalSeats, pricePerSeat, amenities, notes } = value;

    // Verify user is a registered driver
    const driverResult = await pgPool.query(
      'SELECT * FROM driver_profiles WHERE user_id = $1 AND status = $2',
      [userId, 'approved']
    );

    if (driverResult.rows.length === 0) {
      return res.status(403).json({ error: 'Driver profile not approved' });
    }

    // Check for conflicting offers
    const conflictResult = await pgPool.query(
      `SELECT id FROM ride_offers 
       WHERE driver_id = $1 AND status = 'available'
         AND departure_time BETWEEN $2 AND $3`,
      [userId, new Date(departureTime), new Date(new Date(departureTime).getTime() + 4 * 60 * 60 * 1000)]
    );

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({ error: 'You already have an offer in this time window' });
    }

    // Calculate route distance
    const distance = calculateDistance(
      route.start.latitude, route.start.longitude,
      route.end.latitude, route.end.longitude
    );

    const offerId = generateReferenceId();

    // Create ride offer
    const insertResult = await pgPool.query(
      `INSERT INTO ride_offers (
        id, driver_id, route_start_address, route_start_lat, route_start_lng,
        route_end_address, route_end_lat, route_end_lng, departure_time,
        vehicle_type, total_seats, available_seats, price_per_seat,
        total_distance, amenities, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        offerId, userId,
        route.start.address, route.start.latitude, route.start.longitude,
        route.end.address, route.end.latitude, route.end.longitude,
        departureTime, vehicleType, totalSeats, totalSeats, pricePerSeat,
        distance, JSON.stringify(amenities), notes, 'available'
      ]
    );

    const offer = insertResult.rows[0];

    // Cache offer
    await redisClient.setEx(`ride_offer:${offerId}`, 3600, JSON.stringify(offer));

    res.status(201).json({
      success: true,
      message: 'Ride offer created successfully',
      data: {
        id: offer.id,
        route: {
          start: { address: offer.route_start_address },
          end: { address: offer.route_end_address },
        },
        departureTime: offer.departure_time,
        totalSeats: offer.total_seats,
        availableSeats: offer.available_seats,
        pricePerSeat: parseFloat(offer.price_per_seat),
        status: offer.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getRideDetails = async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const userId = req.user.id;

    const result = await pgPool.query(
      `SELECT r.*, 
              rider.first_name as rider_first_name, rider.last_name as rider_last_name,
              rider.phone as rider_phone, rider.profile_image_url as rider_image,
              d.first_name as driver_first_name, d.last_name as driver_last_name,
              d.phone as driver_phone, d.profile_image_url as driver_image,
              d.rating as driver_rating,
              dp.vehicle_make, dp.vehicle_model, dp.vehicle_color, dp.vehicle_plate
       FROM rides r
       LEFT JOIN users rider ON r.rider_id = rider.id
       LEFT JOIN users d ON r.driver_id = d.id
       LEFT JOIN driver_profiles dp ON r.driver_id = dp.user_id
       WHERE r.id = $1 AND (r.rider_id = $2 OR r.driver_id = $2)`,
      [rideId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    const ride = result.rows[0];
    res.json({
      success: true,
      data: {
        id: ride.id,
        status: ride.status,
        pickup: {
          address: ride.pickup_address,
          latitude: parseFloat(ride.pickup_lat),
          longitude: parseFloat(ride.pickup_lng),
        },
        dropoff: {
          address: ride.dropoff_address,
          latitude: parseFloat(ride.dropoff_lat),
          longitude: parseFloat(ride.dropoff_lng),
        },
        rider: {
          id: ride.rider_id,
          name: `${ride.rider_first_name} ${ride.rider_last_name}`,
          phone: ride.rider_phone,
          image: ride.rider_image,
        },
        driver: ride.driver_id ? {
          id: ride.driver_id,
          name: `${ride.driver_first_name} ${ride.driver_last_name}`,
          phone: ride.driver_phone,
          image: ride.driver_image,
          rating: parseFloat(ride.driver_rating || 0),
          vehicle: {
            make: ride.vehicle_make,
            model: ride.vehicle_model,
            color: ride.vehicle_color,
            plate: ride.vehicle_plate,
          },
        } : null,
        vehicleType: ride.vehicle_type,
        estimatedDistance: parseFloat(ride.estimated_distance || 0),
        estimatedDuration: ride.estimated_duration,
        estimatedFare: parseFloat(ride.estimated_fare || ride.total_fare),
        actualFare: ride.actual_fare ? parseFloat(ride.actual_fare) : null,
        paymentMethod: ride.payment_method,
        paymentStatus: ride.payment_status,
        createdAt: ride.created_at,
        acceptedAt: ride.accepted_at,
        startedAt: ride.started_at,
        completedAt: ride.completed_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Accept a ride (driver)
exports.acceptRide = async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const driverId = req.user.id;

    // Check if driver has approved profile
    const driverResult = await pgPool.query(
      `SELECT dp.*, u.first_name, u.last_name 
       FROM driver_profiles dp 
       JOIN users u ON dp.user_id = u.id
       WHERE dp.user_id = $1`,
      [driverId]
    );

    if (driverResult.rows.length === 0) {
      return res.status(403).json({ error: 'Driver profile not found' });
    }

    // Get and validate ride
    const rideResult = await pgPool.query(
      'SELECT * FROM rides WHERE id = $1 AND status = $2',
      [rideId, 'pending']
    );

    if (rideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found or already taken' });
    }

    // Update ride with driver
    await pgPool.query(
      `UPDATE rides SET 
        driver_id = $1, 
        status = 'accepted', 
        accepted_at = NOW(),
        updated_at = NOW()
       WHERE id = $2`,
      [driverId, rideId]
    );

    // Clear cache
    await redisClient.del(`ride:${rideId}`);

    // TODO: Send notification to rider

    res.json({
      success: true,
      message: 'Ride accepted successfully',
      data: { rideId, status: 'accepted' },
    });
  } catch (error) {
    next(error);
  }
};

// Start a ride (driver)
exports.startRide = async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const driverId = req.user.id;

    const rideResult = await pgPool.query(
      'SELECT * FROM rides WHERE id = $1 AND driver_id = $2 AND status = $3',
      [rideId, driverId, 'accepted']
    );

    if (rideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found or not in accepted state' });
    }

    await pgPool.query(
      `UPDATE rides SET status = 'started', started_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [rideId]
    );

    await redisClient.del(`ride:${rideId}`);

    res.json({
      success: true,
      message: 'Ride started',
      data: { rideId, status: 'started', startedAt: new Date() },
    });
  } catch (error) {
    next(error);
  }
};

// Complete a ride (driver)
exports.completeRide = async (req, res, next) => {
  try {
    const rideId = req.params.id;
    const driverId = req.user.id;
    const { actualDistance, actualDuration } = req.body;

    const rideResult = await pgPool.query(
      'SELECT * FROM rides WHERE id = $1 AND driver_id = $2 AND status = $3',
      [rideId, driverId, 'started']
    );

    if (rideResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found or not started' });
    }

    const ride = rideResult.rows[0];

    // Calculate actual fare if distance provided
    let actualFare = ride.total_fare;
    if (actualDistance) {
      const fareDetails = calculateFare(actualDistance, actualDuration || ride.estimated_duration, ride.vehicle_type);
      actualFare = fareDetails.totalFare;
    }

    await pgPool.query(
      `UPDATE rides SET 
        status = 'completed', 
        completed_at = NOW(),
        actual_distance = COALESCE($2, estimated_distance),
        actual_duration = COALESCE($3, estimated_duration),
        total_fare = $4,
        updated_at = NOW()
       WHERE id = $1`,
      [rideId, actualDistance, actualDuration, actualFare]
    );

    // Update rider and driver stats
    await pgPool.query(
      'UPDATE users SET total_rides = total_rides + 1 WHERE id IN ($1, $2)',
      [ride.rider_id, driverId]
    );

    await redisClient.del(`ride:${rideId}`);
    await redisClient.del(`user:${ride.rider_id}:active_ride`);

    res.json({
      success: true,
      message: 'Ride completed',
      data: { 
        rideId, 
        status: 'completed', 
        fare: actualFare,
        completedAt: new Date() 
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get my ride offers (driver)
exports.getMyOffers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT ro.*, 
        (SELECT COUNT(*) FROM ride_offer_bookings WHERE offer_id = ro.id AND status = 'confirmed') as booking_count
      FROM ride_offers ro
      WHERE ro.driver_id = $1
    `;
    const params = [userId];

    if (status) {
      query += ` AND ro.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY ro.departure_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pgPool.query(query, params);

    const offers = result.rows.map(o => ({
      id: o.id,
      route: {
        start: { address: o.route_start_address, lat: parseFloat(o.route_start_lat), lng: parseFloat(o.route_start_lng) },
        end: { address: o.route_end_address, lat: parseFloat(o.route_end_lat), lng: parseFloat(o.route_end_lng) },
      },
      departureTime: o.departure_time,
      vehicleType: o.vehicle_type,
      totalSeats: o.total_seats,
      availableSeats: o.available_seats,
      bookedSeats: parseInt(o.booking_count || 0),
      pricePerSeat: parseFloat(o.price_per_seat),
      status: o.status,
      createdAt: o.created_at,
    }));

    res.json({ success: true, data: offers });
  } catch (error) {
    next(error);
  }
};

// Get offer details
exports.getOfferDetails = async (req, res, next) => {
  try {
    const offerId = req.params.id;

    const result = await pgPool.query(
      `SELECT ro.*, 
              u.first_name, u.last_name, u.profile_image_url, u.rating, u.total_rides,
              dp.vehicle_make, dp.vehicle_model, dp.vehicle_color, dp.vehicle_plate
       FROM ride_offers ro
       JOIN users u ON ro.driver_id = u.id
       LEFT JOIN driver_profiles dp ON ro.driver_id = dp.user_id
       WHERE ro.id = $1`,
      [offerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const o = result.rows[0];

    // Get bookings for this offer
    const bookingsResult = await pgPool.query(
      `SELECT rob.*, u.first_name, u.last_name, u.profile_image_url
       FROM ride_offer_bookings rob
       JOIN users u ON rob.rider_id = u.id
       WHERE rob.offer_id = $1 AND rob.status = 'confirmed'`,
      [offerId]
    );

    res.json({
      success: true,
      data: {
        id: o.id,
        driver: {
          id: o.driver_id,
          name: `${o.first_name} ${o.last_name}`,
          image: o.profile_image_url,
          rating: parseFloat(o.rating || 0),
          totalRides: o.total_rides,
        },
        route: {
          start: { address: o.route_start_address, lat: parseFloat(o.route_start_lat), lng: parseFloat(o.route_start_lng) },
          end: { address: o.route_end_address, lat: parseFloat(o.route_end_lat), lng: parseFloat(o.route_end_lng) },
          distance: parseFloat(o.total_distance || 0),
        },
        departureTime: o.departure_time,
        vehicle: {
          type: o.vehicle_type,
          make: o.vehicle_make,
          model: o.vehicle_model,
          color: o.vehicle_color,
          plate: o.vehicle_plate,
        },
        totalSeats: o.total_seats,
        availableSeats: o.available_seats,
        pricePerSeat: parseFloat(o.price_per_seat),
        amenities: o.amenities || [],
        notes: o.notes,
        status: o.status,
        bookings: bookingsResult.rows.map(b => ({
          id: b.id,
          rider: { id: b.rider_id, name: `${b.first_name} ${b.last_name}`, image: b.profile_image_url },
          seats: b.seats_booked,
          pickup: b.pickup_address,
          dropoff: b.dropoff_address,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Book a ride offer
const bookRideSchema = Joi.object({
  seats: Joi.number().integer().min(1).max(7).required(),
  pickup: Joi.object({
    address: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required(),
  dropoff: Joi.object({
    address: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required(),
  paymentMethod: Joi.string().valid('cash', 'bkash', 'nagad', 'wallet').default('cash'),
});

exports.bookRide = async (req, res, next) => {
  try {
    const offerId = req.params.id;
    const riderId = req.user.id;
    const { error, value } = bookRideSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { seats, pickup, dropoff, paymentMethod } = value;

    // Get offer
    const offerResult = await pgPool.query(
      'SELECT * FROM ride_offers WHERE id = $1 AND status = $2',
      [offerId, 'available']
    );

    if (offerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found or not available' });
    }

    const offer = offerResult.rows[0];

    // Check if rider is the driver
    if (offer.driver_id === riderId) {
      return res.status(400).json({ error: 'You cannot book your own ride' });
    }

    // Check available seats
    if (offer.available_seats < seats) {
      return res.status(400).json({ error: `Only ${offer.available_seats} seats available` });
    }

    // Check for existing booking
    const existingBooking = await pgPool.query(
      'SELECT id FROM ride_offer_bookings WHERE offer_id = $1 AND rider_id = $2 AND status = $3',
      [offerId, riderId, 'confirmed']
    );

    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a booking for this ride' });
    }

    // Calculate fare based on distance
    const riderDistance = calculateDistance(
      pickup.latitude, pickup.longitude,
      dropoff.latitude, dropoff.longitude
    );
    const fare = (offer.price_per_seat * seats * (riderDistance / offer.total_distance)).toFixed(2);

    const bookingId = generateReferenceId('BOOK');

    // Create booking
    await pgPool.query(
      `INSERT INTO ride_offer_bookings (
        id, offer_id, rider_id, seats_booked,
        pickup_address, pickup_lat, pickup_lng,
        dropoff_address, dropoff_lat, dropoff_lng,
        fare, payment_method, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        bookingId, offerId, riderId, seats,
        pickup.address, pickup.latitude, pickup.longitude,
        dropoff.address, dropoff.latitude, dropoff.longitude,
        fare, paymentMethod, 'confirmed'
      ]
    );

    // Update available seats
    const newAvailable = offer.available_seats - seats;
    await pgPool.query(
      `UPDATE ride_offers SET 
        available_seats = $1, 
        status = CASE WHEN $1 = 0 THEN 'full' ELSE status END,
        updated_at = NOW()
       WHERE id = $2`,
      [newAvailable, offerId]
    );

    // TODO: Send notification to driver

    res.status(201).json({
      success: true,
      message: 'Booking confirmed',
      data: {
        bookingId,
        offerId,
        seats,
        fare: parseFloat(fare),
        status: 'confirmed',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get my bookings (rider)
exports.getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT rob.*, 
             ro.route_start_address, ro.route_end_address, ro.departure_time, ro.vehicle_type,
             u.first_name as driver_first_name, u.last_name as driver_last_name, 
             u.profile_image_url as driver_image, u.rating as driver_rating,
             dp.vehicle_make, dp.vehicle_model, dp.vehicle_plate
      FROM ride_offer_bookings rob
      JOIN ride_offers ro ON rob.offer_id = ro.id
      JOIN users u ON ro.driver_id = u.id
      LEFT JOIN driver_profiles dp ON ro.driver_id = dp.user_id
      WHERE rob.rider_id = $1
    `;
    const params = [userId];

    if (status) {
      query += ` AND rob.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY ro.departure_time DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pgPool.query(query, params);

    const bookings = result.rows.map(b => ({
      id: b.id,
      offerId: b.offer_id,
      driver: {
        name: `${b.driver_first_name} ${b.driver_last_name}`,
        image: b.driver_image,
        rating: parseFloat(b.driver_rating || 0),
      },
      route: {
        start: b.route_start_address,
        end: b.route_end_address,
      },
      pickup: b.pickup_address,
      dropoff: b.dropoff_address,
      departureTime: b.departure_time,
      seats: b.seats_booked,
      fare: parseFloat(b.fare),
      paymentStatus: b.payment_status,
      status: b.status,
      vehicle: {
        type: b.vehicle_type,
        model: b.vehicle_model,
        number: b.vehicle_number,
      },
    }));

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const { reason } = req.body;

    const bookingResult = await pgPool.query(
      `SELECT rob.*, ro.departure_time, ro.driver_id
       FROM ride_offer_bookings rob
       JOIN ride_offers ro ON rob.offer_id = ro.id
       WHERE rob.id = $1 AND rob.rider_id = $2`,
      [bookingId, userId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    // Check if cancellation is too close to departure (e.g., less than 1 hour)
    const hoursUntilDeparture = (new Date(booking.departure_time) - Date.now()) / (1000 * 60 * 60);
    const cancellationFee = hoursUntilDeparture < 1 ? booking.fare * 0.2 : 0; // 20% fee if < 1 hour

    // Update booking
    await pgPool.query(
      `UPDATE ride_offer_bookings SET 
        status = 'cancelled', 
        cancelled_at = NOW(),
        cancellation_reason = $1,
        updated_at = NOW()
       WHERE id = $2`,
      [reason, bookingId]
    );

    // Return seats to offer
    await pgPool.query(
      `UPDATE ride_offers SET 
        available_seats = available_seats + $1,
        status = CASE WHEN status = 'full' THEN 'available' ELSE status END,
        updated_at = NOW()
       WHERE id = $2`,
      [booking.seats_booked, booking.offer_id]
    );

    // TODO: Notify driver

    res.json({
      success: true,
      message: 'Booking cancelled',
      data: { 
        bookingId, 
        cancellationFee,
        refundAmount: booking.fare - cancellationFee 
      },
    });
  } catch (error) {
    next(error);
  }
};

