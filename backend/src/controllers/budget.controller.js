const pool = require('../config/db');
const { success, error } = require('../utils/response');

const getBudgets = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const [rows] = await pool.query(
      `SELECT
         b.budget_id,
         b.user_id,
         b.category_id,
         b.name,
         b.limit_amount,
         b.start_date,
         b.end_date,
         b.alert,
         c.name AS category_name,
         COALESCE((
           SELECT SUM(t.amount)
           FROM transactions t
           JOIN categories cat ON t.category_id = cat.category_id
           WHERE t.user_id = b.user_id
             AND cat.type = 'expense'
             AND (b.category_id IS NULL OR t.category_id = b.category_id)
             AND DATE(t.transaction_date) BETWEEN b.start_date AND b.end_date
         ), 0) AS spent_amount
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.category_id
       WHERE b.user_id = ?
       ORDER BY b.end_date DESC`,
      [userId]
    );

    const result = rows.map((b) => ({
      ...b,
      limit_amount: Number(b.limit_amount),
      spent_amount: Number(b.spent_amount),
      alert: Number(b.alert),
      usage_percent: b.limit_amount > 0
        ? Math.round((Number(b.spent_amount) / Number(b.limit_amount)) * 100)
        : 0,
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
      `INSERT INTO budgets (user_id, category_id, name, limit_amount, start_date, end_date, alert)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, category_id || null, name, limit_amount, start_date, end_date, alert ?? 80]
    );

    const [rows] = await pool.query(
      'SELECT * FROM budgets WHERE budget_id = ?',
      [result.insertId]
    );

    return success(res, rows[0], 'Tạo ngân sách thành công', 201);
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

module.exports = { getBudgets, createBudget, deleteBudget };
