const pool = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * GET /api/goals
 */
const getGoals = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const [rows] = await pool.query(
      `SELECT
         goal_id,
         user_id,
         wallet_id,
         name,
         target_amount,
         current_amount,
         start_date,
         end_date,
         status,
         created_at
       FROM goals
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const result = rows.map((g) => ({
      ...g,
      target_amount: Number(g.target_amount),
      current_amount: Number(g.current_amount),
      progress_percent: g.target_amount > 0
        ? Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100))
        : 0,
    }));

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/goals
 * Body: { name, target_amount, end_date?, wallet_id? }
 */
const createGoal = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.user.user_id;
    const { name, target_amount, end_date, wallet_id } = req.body;

    if (!name || !target_amount) {
      return error(res, 'Vui lòng nhập tên và số tiền mục tiêu', 400);
    }

    const [result] = await pool.query(
      `INSERT INTO goals (user_id, wallet_id, name, target_amount, end_date, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [userId, wallet_id || null, name, target_amount, end_date || null]
    );

    const [rows] = await pool.query(
      'SELECT * FROM goals WHERE goal_id = ?',
      [result.insertId]
    );

    return success(res, rows[0], 'Tạo mục tiêu thành công', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/goals/:goalId/contribute
 * Body: { amount, wallet_id?, note? }
 */
const contributeToGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { amount, wallet_id, note } = req.body;
    const userId = req.user.user_id;

    if (!amount || Number(amount) <= 0) {
      return error(res, 'Số tiền góp không hợp lệ', 400);
    }

    const [goals] = await pool.query(
      'SELECT * FROM goals WHERE goal_id = ? AND user_id = ?',
      [goalId, userId]
    );

    if (goals.length === 0) {
      return error(res, 'Không tìm thấy mục tiêu', 404);
    }

    const goal = goals[0];
    const contribAmount = Number(amount);
    const newAmount = Number(goal.current_amount) + contribAmount;

    if (newAmount > Number(goal.target_amount)) {
      return error(res, 'Số tiền góp vượt quá mục tiêu', 400);
    }

    const walletId = wallet_id || goal.wallet_id;
    if (!walletId) {
      return error(res, 'Vui lòng chọn ví để góp tiền', 400);
    }

    await pool.query(
      'UPDATE goals SET current_amount = ? WHERE goal_id = ?',
      [newAmount, goalId]
    );

    await pool.query(
      `INSERT INTO goal_contributions (goal_id, wallet_id, amount, note)
       VALUES (?, ?, ?, ?)`,
      [goalId, walletId, contribAmount, note || null]
    );

    const [rows] = await pool.query(
      'SELECT * FROM goals WHERE goal_id = ?',
      [goalId]
    );

    return success(res, rows[0], 'Góp tiền thành công');
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/goals/:goalId
 */
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

module.exports = { getGoals, createGoal, contributeToGoal, deleteGoal };
