const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { register, login, changePassword } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', authenticate, changePassword);

module.exports = router;
