const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getDashboardSummary } = require('../controllers/dashboard.controller');

router.get('/summary', authenticate, getDashboardSummary);

module.exports = router;
