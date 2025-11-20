const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rating.controller');

router.post('/rate', ctrl.rateRide);
router.get('/:userId', ctrl.getUserRatings);
router.get('/ride/:rideId', ctrl.getRideRatings);

module.exports = router;