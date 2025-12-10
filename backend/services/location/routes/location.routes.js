const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/location.controller');
const { authenticateToken, errorHandler } = require('../../../shared/middleware');

router.get('/nearby-drivers', ctrl.getNearbyDrivers);
router.post('/update', ctrl.updateDriverLocation);
router.post('/status', ctrl.setDriverStatus);
router.get('/driver/:rideId', ctrl.getDriverLocationForRide);

module.exports = router;

