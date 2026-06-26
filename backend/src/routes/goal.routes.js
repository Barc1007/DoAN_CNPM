const router = require('express').Router();
const authenticate = require('../middleware/auth');
const {
  getGoals,
  createGoal,
  contributeToGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goal.controller');

router.get('/', authenticate, getGoals);
router.post('/', authenticate, createGoal);
router.put('/:goalId', authenticate, updateGoal);
router.patch('/:goalId/contribute', authenticate, contributeToGoal);
router.delete('/:goalId', authenticate, deleteGoal);

module.exports = router;
