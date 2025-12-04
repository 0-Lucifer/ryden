const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ride.controller');

router.post('/request', ctrl.requestRide);
router.post('/calculate-fare', ctrl.calculateFare);
router.get('/active', ctrl.getActiveRide);
router.get('/history', ctrl.getHistory);
router.post('/:id/cancel', ctrl.cancelRide);
router.get('/scheduled', ctrl.getScheduled);
router.get('/search', ctrl.searchOffers);
router.post('/offer', ctrl.offerRide);
router.get('/offers/my', ctrl.getMyOffers);
router.get('/offers/:id', ctrl.getOfferDetails);
router.post('/offers/:id/book', ctrl.bookRide);
router.get('/bookings/my', ctrl.getMyBookings);
router.post('/bookings/:id/cancel', ctrl.cancelBooking);
router.get('/:id', ctrl.getRideDetails);
router.post('/:id/accept', ctrl.acceptRide);
router.post('/:id/start', ctrl.startRide);
router.post('/:id/complete', ctrl.completeRide);

module.exports = router;

