const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

// Public routes
router.post('/register', AuthController.register);
router.post('/send-email-otp', AuthController.sendEmailOtp);
router.post('/verify-email-otp', AuthController.verifyEmailOtp);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-reset-otp', AuthController.verifyResetOtp);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.get('/me', authenticateToken, AuthController.getMe);

module.exports = router;
