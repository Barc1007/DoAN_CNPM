const pool = require('../config/db');
const { success, error } = require('../utils/response');

const getProfile = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const [rows] = await pool.query(
      'SELECT user_id, username, email, full_name, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return error(res, 'Không tìm thấy người dùng', 404);
    }

    const user = rows[0];

    const [transCount] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM transactions WHERE user_id = ?',
      [userId]
    );
    const [budgetCount] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM budgets WHERE user_id = ?',
      [userId]
    );
    const [goalCount] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM goals WHERE user_id = ?',
      [userId]
    );

    const profile = {
      ...user,
      join_date: user.created_at,
      stats: {
        transactions: transCount[0].cnt,
        budgets: budgetCount[0].cnt,
        goals: goalCount[0].cnt,
      },
    };

    return success(res, profile);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.user.user_id;
    const { full_name, email } = req.body;

    const fields = [];
    const values = [];

    if (full_name !== undefined) { fields.push('full_name = ?'); values.push(full_name); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }

    if (fields.length === 0) {
      return error(res, 'Không có dữ liệu để cập nhật', 400);
    }

    values.push(userId);
    await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );

    const [rows] = await pool.query(
      'SELECT user_id, username, email, full_name, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    return success(res, rows[0], 'Cập nhật hồ sơ thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
