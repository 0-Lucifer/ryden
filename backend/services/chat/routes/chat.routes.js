const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chat.controller');

router.get('/messages/:rideId', ctrl.getRideMessages);
router.post('/mark-read/:rideId', ctrl.markRead);

module.exports = router;