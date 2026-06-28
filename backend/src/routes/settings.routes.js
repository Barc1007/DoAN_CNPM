const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settings.controller');

router.get('/', authenticate, getSettings);
router.put('/', authenticate, updateSettings);

module.exports = router;