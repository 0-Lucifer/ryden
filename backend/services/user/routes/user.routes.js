const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');
const { authenticateToken, errorHandler } = require('../../../shared/middleware');

router.get('/profile', ctrl.getProfile);
router.get('/profile/:id', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.post('/upload-avatar', ctrl.uploadAvatar);
router.post('/emergency-contact', ctrl.addEmergencyContact);
router.get('/emergency-contacts', ctrl.getEmergencyContacts);
router.delete('/emergency-contact/:id', ctrl.deleteEmergencyContact);
router.get('/stats', ctrl.getStats);
router.post('/driver-profile', ctrl.createDriverProfile);

module.exports = router;

