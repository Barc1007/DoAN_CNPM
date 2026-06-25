const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getBudgets, createBudget, updateBudget, deleteBudget } = require('../controllers/budget.controller');

router.get('/', authenticate, getBudgets);
router.post('/', authenticate, createBudget);
router.put('/:budgetId', authenticate, updateBudget);
router.delete('/:budgetId', authenticate, deleteBudget);

module.exports = router;
