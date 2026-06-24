const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getCategoryData, createCategory, updateCategoryName } = require('../controllers/category.controller');

router.get('/', authenticate, getCategoryData);
router.post('/', authenticate, createCategory);
router.put('/:categoryId', authenticate, updateCategoryName);

module.exports = router;
