const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getBudgets, createBudget, deleteBudget } = require('../controllers/budget.controller');

router.get('/', authenticate, getBudgets);
router.post('/', authenticate, createBudget);
router.delete('/:budgetId', authenticate, deleteBudget);

module.exports = router;
