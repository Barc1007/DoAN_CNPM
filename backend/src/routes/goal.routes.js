const router = require('express').Router();
const authenticate = require('../middleware/auth');
const {
  getGoals,
  createGoal,
  contributeToGoal,
  deleteGoal,
} = require('../controllers/goal.controller');

router.get('/', authenticate, getGoals);
router.post('/', authenticate, createGoal);
router.patch('/:goalId/contribute', authenticate, contributeToGoal);
router.delete('/:goalId', authenticate, deleteGoal);

module.exports = router;
