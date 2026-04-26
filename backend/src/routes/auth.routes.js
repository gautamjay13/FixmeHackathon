const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/auth.validator');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

router.get('/me', protect, authController.getMe);
router.patch('/update-profile', protect, authController.updateProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
