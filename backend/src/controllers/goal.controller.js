const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { encrypt, decrypt } = require('../utils/crypto');
const { evaluateGoalDeadlines } = require('../services/goalAlert.service');

const todayDateOnly = () => new Date().toISOString().slice(0, 10);

const log = (...args) => {
  console.log('[goal.controller]', ...args);
};

const buildGoalResponse = (goal, userId) => {
  const target = Number(decrypt(goal.target_amount, userId)) || 0;
  const current = Number(decrypt(goal.current_amount, userId)) || 0;
  const remaining = Math.max(target - current, 0);
  const exceeded = Math.max(current - target, 0);
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const progressPercent = Math.round(progress * 100) / 100;
  const isCompleted = target > 0 && current >= target;

  return {
    ...goal,
    name: decrypt(goal.name, userId),
    start_date: goal.start_date || goal.created_at || null,
    target_amount: target,
    current_amount: current,
    remaining_amount: remaining,
    exceeded_amount: exceeded,
    progress_percent: progressPercent,
    is_completed: isCompleted,
    remainingAmount: remaining,
    exceededAmount: exceeded,
    progressPercent,
    isCompleted,
  };
};

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

    const result = rows.map((g) => buildGoalResponse(g, userId));

    // Kiểm tra deadline mục tiêu (fire-and-forget, không block response)
    evaluateGoalDeadlines(userId).catch(() => {});

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.user.user_id;
    const { name, target_amount, start_date, end_date, wallet_id, current_amount } = req.body;

    if (!name || !target_amount) {
      return error(res, 'Vui lòng nhập tên và số tiền mục tiêu', 400);
    }

    const targetAmount = Number(target_amount);
    const initialCurrent = current_amount !== undefined ? Number(current_amount) : 0;
    const startDate = start_date || todayDateOnly();
    const status = targetAmount > 0 && initialCurrent >= targetAmount ? 'completed' : 'active';

    const [result] = await pool.query(
      `INSERT INTO goals (user_id, wallet_id, name, target_amount, current_amount, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, wallet_id || null, encrypt(name, userId), encrypt(String(targetAmount), userId), encrypt(String(initialCurrent), userId), startDate, end_date || null, status]
    );

    const [rows] = await pool.query(
      'SELECT * FROM goals WHERE goal_id = ?',
      [result.insertId]
    );

    const response = buildGoalResponse(rows[0], userId);

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
    log('contributeToGoal start', { goalId, userId, amount, wallet_id, note });

    const contributionAmount = Number(amount);
    if (!Number.isFinite(contributionAmount) || contributionAmount <= 0) {
      log('invalid contribution amount:', amount);
      return error(res, 'Thông tin góp tiền không hợp lệ', 400);
    }

    const [goals] = await pool.query(
      'SELECT * FROM goals WHERE goal_id = ? AND user_id = ?',
      [goalId, userId]
    );

    if (goals.length === 0) {
      log('goal not found', { goalId, userId });
      return error(res, 'Không tìm thấy mục tiêu', 404);
    }

    const goal = goals[0];
    const walletId = wallet_id || goal.wallet_id;
    if (!walletId) {
      log('missing wallet_id for contribution');
      return error(res, 'Vui lòng chọn ví để góp tiền', 400);
    }

    const [walletRows] = await pool.query(
      'SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?',
      [walletId, userId]
    );
    if (walletRows.length === 0) {
      log('wallet not found or not owned', { walletId, userId });
      return error(res, 'Ví không hợp lệ', 400);
    }

    const targetAmount = Number(decrypt(goal.target_amount, userId)) || 0;
    const currentAmount = Number(decrypt(goal.current_amount, userId)) || 0;
    const newCurrentAmount = currentAmount + contributionAmount;
    const status = targetAmount > 0 && newCurrentAmount >= targetAmount ? 'completed' : 'active';

    log('updating goal', {
      goalId,
      currentAmount,
      contributionAmount,
      newCurrentAmount,
      status,
    });

    await pool.query(
      'UPDATE goals SET current_amount = ?, status = ?, wallet_id = COALESCE(wallet_id, ?) WHERE goal_id = ?',
      [encrypt(String(newCurrentAmount), userId), status, walletId, goalId]
    );

    log('inserting goal_contributions', { goalId, walletId, contributionAmount });
    await pool.query(
      `INSERT INTO goal_contributions (goal_id, wallet_id, amount, note)
       VALUES (?, ?, ?, ?)`,
      [goalId, walletId, encrypt(String(contributionAmount), userId), encrypt(note || '', userId)]
    );

    const [rows] = await pool.query(
      'SELECT * FROM goals WHERE goal_id = ?',
      [goalId]
    );

    const response = buildGoalResponse(rows[0], userId);
    log('contributeToGoal done', { goalId, newCurrentAmount });

    return success(res, response, 'Góp tiền thành công');
  } catch (err) {
    log('contributeToGoal error:', err.message);
    next(err);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { name, target_amount, current_amount, end_date, wallet_id } = req.body;
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

    const nextTarget = target_amount !== undefined ? Number(target_amount) : Number(decrypt(goal.target_amount, userId)) || 0;
    const nextCurrent = current_amount !== undefined ? Number(current_amount) : Number(decrypt(goal.current_amount, userId)) || 0;

    if (name !== undefined) { updates.push('name = ?'); values.push(encrypt(name, userId)); }
    if (target_amount !== undefined) { updates.push('target_amount = ?'); values.push(encrypt(String(nextTarget), userId)); }
    if (current_amount !== undefined) { updates.push('current_amount = ?'); values.push(encrypt(String(nextCurrent), userId)); }
    if (end_date !== undefined) { updates.push('end_date = ?'); values.push(end_date); }
    if (wallet_id !== undefined) { updates.push('wallet_id = ?'); values.push(wallet_id); }
    if (target_amount !== undefined || current_amount !== undefined) {
      updates.push('status = ?');
      values.push(nextTarget > 0 && nextCurrent >= nextTarget ? 'completed' : 'active');
    }

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

    const response = buildGoalResponse(rows[0], userId);

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
