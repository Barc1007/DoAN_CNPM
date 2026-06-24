const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { encrypt, decrypt } = require('../Utils/crypto');

const getGoals = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const [rows] = await pool.query(
      `SELECT goal_id, user_id, wallet_id, name,
              target_amount, current_amount,
              start_date, end_date, status, created_at
       FROM goals
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const result = rows.map((g) => {
      const target = Number(decrypt(g.target_amount, userId)) || 0;
      const current = Number(decrypt(g.current_amount, userId)) || 0;
      return {
        ...g,
        name: decrypt(g.name, userId),
        target_amount: target,
        current_amount: current,
        progress_percent: target > 0 ? Math.round((current / target) * 100 * 100) / 100 : 0,
      };
    });

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.user.user_id;
    const { name, target_amount, end_date, wallet_id, current_amount } = req.body;

    if (!name || !target_amount) {
      return error(res, 'Vui lòng nhập tên và số tiền mục tiêu', 400);
    }

    const initialCurrent = current_amount !== undefined ? Number(current_amount) : 0;

    const [result] = await pool.query(
      `INSERT INTO goals (user_id, wallet_id, name, target_amount, end_date, status, current_amount)
       VALUES (?, ?, ?, ?, ?, 'active', ?)`,
      [userId, wallet_id || null, encrypt(name, userId), encrypt(String(target_amount), userId), end_date || null, encrypt(String(initialCurrent), userId)]
    );

    const [rows] = await pool.query(
      'SELECT * FROM goals WHERE goal_id = ?',
      [result.insertId]
    );

    const g = rows[0];
    const response = {
      ...g,
      name: decrypt(g.name, userId),
      target_amount: Number(decrypt(g.target_amount, userId)) || 0,
      current_amount: Number(decrypt(g.current_amount, userId)) || 0,
      progress_percent: 0,
    };

    return success(res, response, 'Tạo mục tiêu thành công', 201);
  } catch (err) {
    next(err);
  }
};

const contributeToGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { amount, wallet_id, note } = req.body;
    const userId = req.user.user_id;

    if (!amount) {
      return error(res, 'Thông tin góp tiền không hợp lệ', 400);
    }

    const [goals] = await pool.query(
      'SELECT * FROM goals WHERE goal_id = ? AND user_id = ?',
      [goalId, userId]
    );

    if (goals.length === 0) {
      return error(res, 'Không tìm thấy mục tiêu', 404);
    }

    const goal = goals[0];
    const walletId = wallet_id || goal.wallet_id;
    if (!walletId) {
      return error(res, 'Vui lòng chọn ví để góp tiền', 400);
    }

    const currentAmount = Number(decrypt(goal.current_amount, userId)) || 0;
    const newCurrentAmount = currentAmount + Number(amount);

    await pool.query(
      'UPDATE goals SET current_amount = ? WHERE goal_id = ?',
      [encrypt(String(newCurrentAmount), userId), goalId]
    );

    await pool.query(
      `INSERT INTO goal_contributions (goal_id, wallet_id, amount, note)
       VALUES (?, ?, ?, ?)`,
      [goalId, walletId, encrypt(String(amount), userId), encrypt(note || '', userId)]
    );

    const [rows] = await pool.query(
      'SELECT * FROM goals WHERE goal_id = ?',
      [goalId]
    );

    const g = rows[0];
    const target = Number(decrypt(g.target_amount, userId)) || 0;
    const current = Number(decrypt(g.current_amount, userId)) || 0;
    const response = {
      ...g,
      name: decrypt(g.name, userId),
      target_amount: target,
      current_amount: current,
      progress_percent: target > 0 ? Math.round((current / target) * 100 * 100) / 100 : 0,
    };

    return success(res, response, 'Góp tiền thành công');
  } catch (err) {
    next(err);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { name, target_amount, end_date, wallet_id } = req.body;
    const userId = req.user.user_id;

    const [goals] = await pool.query(
      'SELECT * FROM goals WHERE goal_id = ? AND user_id = ?',
      [goalId, userId]
    );

    if (goals.length === 0) {
      return error(res, 'Không tìm thấy mục tiêu', 404);
    }

    const goal = goals[0];
    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(encrypt(name, userId)); }
    if (target_amount !== undefined) { updates.push('target_amount = ?'); values.push(encrypt(String(target_amount), userId)); }
    if (end_date !== undefined) { updates.push('end_date = ?'); values.push(end_date); }
    if (wallet_id !== undefined) { updates.push('wallet_id = ?'); values.push(wallet_id); }

    if (updates.length === 0) {
      return error(res, 'Không có dữ liệu để cập nhật', 400);
    }

    values.push(goalId);
    await pool.query(
      `UPDATE goals SET ${updates.join(', ')} WHERE goal_id = ?`,
      values
    );

    const [rows] = await pool.query(
      'SELECT * FROM goals WHERE goal_id = ?',
      [goalId]
    );

    const g = rows[0];
    const target = Number(decrypt(g.target_amount, userId)) || 0;
    const current = Number(decrypt(g.current_amount, userId)) || 0;
    const response = {
      ...g,
      name: decrypt(g.name, userId),
      target_amount: target,
      current_amount: current,
      progress_percent: target > 0 ? Math.round((current / target) * 100 * 100) / 100 : 0,
    };

    return success(res, response, 'Cập nhật mục tiêu thành công');
  } catch (err) {
    next(err);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM goals WHERE goal_id = ? AND user_id = ?',
      [goalId, req.user.user_id]
    );

    if (result.affectedRows === 0) {
      return error(res, 'Không tìm thấy mục tiêu', 404);
    }

    return success(res, null, 'Xoá mục tiêu thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getGoals, createGoal, contributeToGoal, updateGoal, deleteGoal };
