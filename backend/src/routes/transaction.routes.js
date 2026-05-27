const router = require('express').Router();
const authenticate = require('../middleware/auth');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transaction.controller');

router.get('/', authenticate, getTransactions);
router.post('/', authenticate, createTransaction);
router.put('/:transactionId', authenticate, updateTransaction);
router.delete('/:transactionId', authenticate, deleteTransaction);

module.exports = router;
