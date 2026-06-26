const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { getWallets, createWallet, updateWallet, deleteWallet } = require('../controllers/wallet.controller');

router.get('/', authenticate, getWallets);
router.post('/', authenticate, createWallet);
router.put('/:walletId', authenticate, updateWallet);
router.delete('/:walletId', authenticate, deleteWallet);

module.exports = router;
