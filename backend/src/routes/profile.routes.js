const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/profile.controller');

router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);

module.exports = router;
