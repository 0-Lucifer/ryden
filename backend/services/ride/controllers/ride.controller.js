const { pgPool, redisClient } = require('./../../shared/database');
const { calculateFare, generateReferenceId, calculateDistance } = require('./../../shared/utils');
const Joi = require('joi');

// Validation schemas
const requestRideSchema = Joi.object({
  pickupLocation: Joi.object({
    address: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required(),
  dropoffLocation: Joi.object({
    address: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required(),
  vehicleType: Joi.string().valid('bike', 'car_mini', 'car_sedan', 'car_premium').required(),
  passengers: Joi.number().min(1).max(4).default(1),
  scheduledTime: Joi.date().optional(),
  paymentMethod: Joi.string().valid('cash', 'bkash', 'nagad', 'rocket', 'wallet').default('cash'),
  notes: Joi.string().optional(),
});

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
              dp.vehicle_make, dp.vehicle_model, dp.vehicle_color, dp.vehicle_plate
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
          make: ride.vehicle_make,
          model: ride.vehicle_model,
          color: ride.vehicle_color,
          plate: ride.vehicle_plate,
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
             dp.vehicle_make, dp.vehicle_model, dp.vehicle_color, dp.vehicle_plate
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
          make: offer.vehicle_make,
          model: offer.vehicle_model,
          color: offer.vehicle_color,
          plate: offer.vehicle_plate,
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
    const ride = activeRides.get(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json({ success: true, data: ride });
  } catch (e) { next(e); }
};

exports.shareRide = async (req, res, next) => {
  try {
    // Placeholder: would push notification/SMS
    res.json({ success: true });
  } catch (e) { next(e); }
};

