const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getCategoryData, createCategory, updateCategoryName, deleteCategory } = require('../controllers/category.controller');

router.get('/', authenticate, getCategoryData);
router.post('/', authenticate, createCategory);
router.put('/:categoryId', authenticate, updateCategoryName);
router.delete('/:categoryId', authenticate, deleteCategory);

module.exports = router;
