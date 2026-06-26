const router = require('express').Router();
const authenticate = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notification.controller');

router.get('/', authenticate, getNotifications);
router.patch('/read-all', authenticate, markAllAsRead);
router.patch('/:notificationId/read', authenticate, markAsRead);
router.delete('/:notificationId', authenticate, deleteNotification);

module.exports = router;
