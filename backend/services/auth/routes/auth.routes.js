const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken, errorHandler } = require('../../../shared/middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/check-availability', authController.checkAvailability);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/refresh-token', authController.refreshToken);
router.post('/social-login', authController.socialLogin);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-email-otp', authController.verifyEmailOTP);

// Firebase Auth routes
router.post('/firebase/register', authController.firebaseRegister);
router.post('/firebase/login', authController.firebaseLogin);
router.post('/firebase/check-verification', authController.checkFirebaseVerification);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;

