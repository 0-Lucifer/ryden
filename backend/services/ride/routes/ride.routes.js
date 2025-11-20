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
router.get('/:id', ctrl.getRideDetails);
router.post('/:id/share', ctrl.shareRide);

module.exports = router;