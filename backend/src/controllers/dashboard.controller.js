const pool = require('../config/db');
const { success, error } = require('../utils/response');

const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const [balanceRows] = await pool.query(
      'SELECT COALESCE(SUM(current_balance), 0) AS total_balance FROM v_wallet_balance WHERE user_id = ?',
      [userId]
    );

    const [incomeRows] = await pool.query(
      `SELECT COALESCE(SUM(t.amount), 0) AS total_income
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = ? AND c.type = 'income'`,
      [userId]
    );

    const [expenseRows] = await pool.query(
      `SELECT COALESCE(SUM(t.amount), 0) AS total_expense
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = ? AND c.type = 'expense'`,
      [userId]
    );

    const [recentTransactions] = await pool.query(
      `SELECT * FROM v_transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT 5`,
      [userId]
    );

    const [categorySpent] = await pool.query(
      `SELECT
         c.name,
         COALESCE(SUM(t.amount), 0) AS amount
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = ? AND c.type = 'expense'
       GROUP BY c.category_id, c.name
       ORDER BY amount DESC
       LIMIT 5`,
      [userId]
    );

    const totalSpent = categorySpent.reduce((sum, c) => sum + Number(c.amount), 0);
    const colors = ['#4ECDC4', '#FF6B6B', '#FFE66D', '#A29BFE', '#FD79A8'];
    const categorySpentWithPercent = categorySpent.map((c, i) => ({
      name: c.name,
      amount: Number(c.amount),
      percentage: totalSpent > 0
        ? Math.round((Number(c.amount) / totalSpent) * 100 * 10) / 10
        : 0,
      color: colors[i % colors.length],
    }));

    const [goalRows] = await pool.query(
      `SELECT goal_id AS saving_goal_id, name, target_amount, current_amount, end_date
       FROM goals
       WHERE user_id = ? AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    const savingsGoal = goalRows.length > 0
      ? {
          ...goalRows[0],
          target_amount: Number(goalRows[0].target_amount),
          current_amount: Number(goalRows[0].current_amount),
        }
      : { saving_goal_id: 0, name: 'Chưa có mục tiêu', target_amount: 0, current_amount: 0, end_date: null };

    const dashboardData = {
      total_balance: Number(balanceRows[0].total_balance),
      total_income: Number(incomeRows[0].total_income),
      total_expense: Number(expenseRows[0].total_expense),
      recent_transactions: recentTransactions,
      category_spent: categorySpentWithPercent,
      savings_goal: savingsGoal,
    };

    return success(res, dashboardData);
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardSummary };
