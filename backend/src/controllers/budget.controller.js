const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { encrypt, decrypt } = require('../utils/crypto');

const getBudgets = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const [rows] = await pool.query(
      `SELECT b.budget_id, b.user_id, b.category_id, b.name,
              b.limit_amount, b.start_date, b.end_date, b.alert,
              c.name AS category_name
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.category_id
       WHERE b.user_id = ?
       ORDER BY b.end_date DESC`,
      [userId]
    );

const today = new Date().toISOString().slice(0, 10);
const toDateString = (v) => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string") return v.slice(0, 10);
  return String(v).slice(0, 10);
};
const result = await Promise.all(rows.map(async (b) => {
  const limitAmount = Number(decrypt(b.limit_amount, userId)) || 0;

  let spentAmount = 0;
  const startStr = toDateString(b.start_date);
  const endStr = toDateString(b.end_date);
  const params = [userId, `${startStr} 00:00:00`, `${endStr} 23:59:59`];

  let transactionsQuery = `SELECT t.amount, c.type AS category_type
                           FROM transactions t
                           JOIN categories c ON t.category_id = c.category_id
                           WHERE t.user_id = ?
                             AND t.transaction_date >= ?
                             AND t.transaction_date <= ?`;

  if (b.category_id) {
    transactionsQuery += ` AND t.category_id = ?`;
    params.push(b.category_id);
  } else {
    transactionsQuery += ` AND c.type = 'expense'`;
  }

  const [transactions] = await pool.query(transactionsQuery, params);
  spentAmount = transactions.reduce(
    (sum, t) =>
      t.category_type === 'expense'
        ? sum + (Number(decrypt(t.amount, userId)) || 0)
        : sum,
    0
  );

  const rawUsage = limitAmount > 0 ? (spentAmount / limitAmount) * 100 : 0;
  const usagePercent = Math.round(rawUsage * 100) / 100;
  const isActive = startStr <= today && endStr >= today;
  const isExpired = endStr < today;

  return {
    ...b,
    name: decrypt(b.name, userId),
    limit_amount: limitAmount,
    spent_amount: spentAmount,
    alert: Number(b.alert),
    usage_percent: usagePercent,
    is_active: isActive,
    is_expired: isExpired,
  };
}));

return success(res, result);
  } catch (err) {
    next(err);
  }
};

const createBudget = async (req, res, next) => {
  try {
    const userId = req.body.user_id || req.user.user_id;
    const { name, limit_amount, category_id, start_date, end_date, alert } = req.body;

    if (!name || !limit_amount || !start_date || !end_date) {
      return error(res, 'Vui lòng điền đầy đủ thông tin ngân sách', 400);
    }

    const [result] = await pool.query(
      `INSERT INTO budgets (user_id, category_id, name, limit_amount, start_date, end_date, alert, spent_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, category_id || null, encrypt(name, userId), encrypt(String(limit_amount), userId), start_date, end_date, alert ?? 80, encrypt('0', userId)]
    );

    const [rows] = await pool.query(
      'SELECT * FROM budgets WHERE budget_id = ?',
      [result.insertId]
    );

    const b = rows[0];
    const response = {
      ...b,
      name: decrypt(b.name, userId),
      limit_amount: Number(decrypt(b.limit_amount, userId)) || 0,
      spent_amount: 0,
      usage_percent: 0,
    };

    return success(res, response, 'Tạo ngân sách thành công', 201);
  } catch (err) {
    next(err);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const { budgetId } = req.params;
    const { limit_amount, name, category_id, start_date, end_date, alert } = req.body;
    const userId = req.user.user_id;

    const fields = [];
    const values = [];

    if (limit_amount !== undefined) { fields.push('limit_amount = ?'); values.push(encrypt(String(limit_amount), userId)); }
    if (name !== undefined) { fields.push('name = ?'); values.push(encrypt(name, userId)); }
    if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id || null); }
    if (start_date !== undefined) { fields.push('start_date = ?'); values.push(start_date); }
    if (end_date !== undefined) { fields.push('end_date = ?'); values.push(end_date); }
    if (alert !== undefined) { fields.push('alert = ?'); values.push(alert); }

    if (fields.length === 0) {
      return error(res, 'Không có dữ liệu để cập nhật', 400);
    }

    values.push(budgetId);
    values.push(userId);

    const [result] = await pool.query(
      `UPDATE budgets SET ${fields.join(', ')} WHERE budget_id = ? AND user_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return error(res, 'Không tìm thấy ngân sách', 404);
    }

    const [rows] = await pool.query(
      'SELECT * FROM budgets WHERE budget_id = ?',
      [budgetId]
    );

    const b = rows[0];
    const response = {
      ...b,
      name: decrypt(b.name, userId),
      limit_amount: Number(decrypt(b.limit_amount, userId)) || 0,
      spent_amount: Number(decrypt(b.spent_amount, userId)) || 0,
    };

    return success(res, response, 'Cập nhật ngân sách thành công');
  } catch (err) {
    next(err);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const { budgetId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM budgets WHERE budget_id = ? AND user_id = ?',
      [budgetId, req.user.user_id]
    );

    if (result.affectedRows === 0) {
      return error(res, 'Không tìm thấy ngân sách', 404);
    }

    return success(res, null, 'Xoá ngân sách thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };
