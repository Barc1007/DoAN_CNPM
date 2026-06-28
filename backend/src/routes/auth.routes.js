const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { register, login, changePassword, googleAuth, googleCallback, forgotPassword, verifyOtp, resetPassword } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', authenticate, changePassword);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;

