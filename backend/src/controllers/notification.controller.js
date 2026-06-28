const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { decrypt } = require('../utils/crypto');
const { evaluateGoalDeadlines } = require('../services/goalAlert.service');
const { evaluateCurrentBudgets } = require('../services/budgetAlert.service');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    await Promise.all([
      evaluateGoalDeadlines(userId),
      evaluateCurrentBudgets(userId),
    ]);

    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const result = rows.map((n) => ({
      ...n,
      title: decrypt(n.title, userId),
      message: (decrypt(n.message, userId) || '').replace(/\[(budget|goal):\d+:\w+\]\s*/g, ''),
      is_read: Boolean(n.is_read),
    }));

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { notificationId } = req.params;

    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
      [notificationId, userId]
    );

    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE notification_id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (rows.length === 0) {
      return error(res, 'Không tìm thấy thông báo', 404);
    }

    const decrypted = {
      ...rows[0],
      title: decrypt(rows[0].title, userId),
      message: decrypt(rows[0].message, userId),
      is_read: true,
    };
    return success(res, decrypted, 'Đã đánh dấu đã đọc');
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );

    return success(res, true, 'Đã đánh dấu tất cả đã đọc');
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { notificationId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM notifications WHERE notification_id = ? AND user_id = ?',
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      return error(res, 'Không tìm thấy thông báo', 404);
    }

    return success(res, null, 'Xoá thông báo thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
