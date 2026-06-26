const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { register, login, changePassword, googleAuth, googleCallback } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', authenticate, changePassword);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

module.exports = router;

