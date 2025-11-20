const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.post('/upload-avatar', ctrl.uploadAvatar);
router.post('/emergency-contact', ctrl.addEmergencyContact);
router.get('/stats', ctrl.getStats);

module.exports = router;