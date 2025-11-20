const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notification.controller');

router.post('/send', ctrl.sendNotification);
router.get('/history', ctrl.getHistory);
router.put('/read/:id', ctrl.markRead);
router.post('/token', ctrl.registerToken);

module.exports = router;