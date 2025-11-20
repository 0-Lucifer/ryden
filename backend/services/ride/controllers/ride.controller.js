const { pgPool } = require('../../../shared/database');
const { calculateFare, generateReferenceId } = require('../../../shared/utils');

// Simple in-memory active rides cache (replace with Redis later)
const activeRides = new Map();

exports.requestRide = async (req, res, next) => {
  try {
    const { pickupLocation, dropoffLocation, vehicleType, passengers } = req.body;
    const id = generateReferenceId('RIDE');
    const fare = calculateFare(5, 45, vehicleType); // Placeholder distance/duration
    activeRides.set(id, { id, status: 'pending', pickupLocation, dropoffLocation, vehicleType, passengers, fare });
    res.status(201).json({ success: true, data: activeRides.get(id) });
  } catch (e) { next(e); }
};

exports.calculateFare = async (req, res, next) => {
  try {
    const { pickup, dropoff, vehicleType } = req.body;
    // Placeholder: distance/time static until real distance matrix integrated
    const fare = calculateFare(5, 45, vehicleType);
    res.json({ success: true, data: fare });
  } catch (e) { next(e); }
};

exports.getActiveRide = async (req, res, next) => {
  try {
    // naive: return first active ride for user
    const ride = [...activeRides.values()].find(r => r.riderId === req.user.id || r.status === 'pending');
    res.json({ success: true, data: ride || null });
  } catch (e) { next(e); }
};

exports.getHistory = async (req, res, next) => {
  try {
    // Placeholder empty history
    res.json({ success: true, data: { rides: [], total: 0 } });
  } catch (e) { next(e); }
};

exports.cancelRide = async (req, res, next) => {
  try {
    const ride = activeRides.get(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    ride.status = 'cancelled';
    res.json({ success: true, message: 'Ride cancelled' });
  } catch (e) { next(e); }
};

exports.getScheduled = async (req, res, next) => {
  try { res.json({ success: true, data: [] }); } catch (e) { next(e); }
};

exports.searchOffers = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    // placeholder static offers matching UI
    const now = new Date();
    const sample = [
      { id: 'offer-1', driver: { id: 'u1', name: 'Tahsin Rahman', rating: 4.9, reviews:127, isInstant:true }, route:{ from, to }, when:{ dateTime: now.toISOString(), durationMinutes:45 }, vehicle:{ type:'car', model:'Toyota Axio' }, pricePerSeat:120, currency:'৳', availableSeats:2, tags:['AC','Music','Student friendly']},
      { id: 'offer-2', driver: { id: 'u2', name: 'Nusrat Jahan', rating:4.8, reviews:89, isFemaleDriver:true }, route:{ from, to:'Gulshan 2' }, when:{ dateTime: now.toISOString(), durationMinutes:30 }, vehicle:{ type:'car', model:'Honda Civic' }, pricePerSeat:80, currency:'৳', availableSeats:3, tags:['AC']},
      { id: 'offer-3', driver: { id: 'u3', name: 'Rafid Ahmed', rating:5.0, reviews:263, isInstant:true }, route:{ from, to:'Uttara Sector 7' }, when:{ dateTime: now.toISOString(), durationMinutes:55 }, vehicle:{ type:'car', model:'Axio' }, pricePerSeat:100, currency:'৳', availableSeats:4, tags:['AC','Music','Wifi']}
    ];
    res.json({ success: true, data: sample });
  } catch (e) { next(e); }
};

exports.offerRide = async (req, res, next) => {
  try {
    const { from, to, date, time, seats, pricePerSeat } = req.body;
    const offerId = generateReferenceId('OFFER');
    res.status(201).json({ success: true, data: { offerId, from, to, date, time, seats, pricePerSeat } });
  } catch (e) { next(e); }
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
