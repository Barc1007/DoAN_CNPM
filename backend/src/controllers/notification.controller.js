const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { decrypt } = require('../utils/crypto');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const result = rows.map((n) => ({
      ...n,
      title: decrypt(n.title, userId),
      message: decrypt(n.message, userId),
      is_read: Boolean(n.is_read),
    }));

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE notification_id = ?',
      [notificationId]
    );

    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE notification_id = ?',
      [notificationId]
    );

    if (rows.length === 0) {
      return error(res, 'Không tìm thấy thông báo', 404);
    }

    return success(res, { ...rows[0], is_read: true }, 'Đã đánh dấu đã đọc');
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.user.user_id;

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
    const { notificationId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM notifications WHERE notification_id = ?',
      [notificationId]
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
