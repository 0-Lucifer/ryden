const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/location.controller');

router.get('/nearby-drivers', ctrl.getNearbyDrivers);
router.post('/update', ctrl.updateDriverLocation);
router.get('/driver/:rideId', ctrl.getDriverLocationForRide);

module.exports = router;