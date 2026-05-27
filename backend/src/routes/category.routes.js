const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getCategoryData } = require('../controllers/category.controller');

router.get('/', authenticate, getCategoryData);

module.exports = router;
