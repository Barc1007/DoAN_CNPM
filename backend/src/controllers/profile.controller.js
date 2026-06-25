const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { decrypt, encrypt } = require('../utils/crypto');

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

    // Decrypt user fields (support both old CryptoJS and new AES format)
    const fullName = decrypt(user.full_name, user.user_id);
    const email = decrypt(user.email, user.user_id);

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
      full_name: fullName,
      email: email,
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

    if (full_name !== undefined) { fields.push('full_name = ?'); values.push(encrypt(full_name)); }
    if (email !== undefined) { fields.push('email = ?'); values.push(encrypt(email)); }

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

    const updatedUser = rows[0];
    const response = {
      ...updatedUser,
      full_name: decrypt(updatedUser.full_name, updatedUser.user_id),
      email: decrypt(updatedUser.email, updatedUser.user_id),
    };

    return success(res, response, 'Cập nhật hồ sơ thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
