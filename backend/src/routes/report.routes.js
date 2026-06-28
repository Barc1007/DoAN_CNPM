const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getReport } = require('../controllers/report.controller');

router.get('/', authenticate, getReport);

module.exports = router;