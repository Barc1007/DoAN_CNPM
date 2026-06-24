const pool = require('../config/db');
const { success } = require('../utils/response');
const { decrypt } = require('../utils/crypto');

const buildSavingsGoal = (goal, userId) => {
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

const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const [walletRows] = await pool.query(
      'SELECT * FROM v_wallet_balance WHERE user_id = ?',
      [userId]
    );

    let totalBalance = 0;
    for (const w of walletRows) {
      const initialBalance = Number(decrypt(w.initial_balance, userId)) || 0;

      const [transactions] = await pool.query(
        `SELECT t.amount, c.type
         FROM transactions t
         JOIN categories c ON t.category_id = c.category_id
         WHERE t.wallet_id = ?`,
        [w.wallet_id]
      );

      let income = 0;
      let expense = 0;
      for (const t of transactions) {
        const amount = Number(decrypt(t.amount, userId)) || 0;
        if (t.type === 'income') income += amount;
        else expense += amount;
      }
      totalBalance += initialBalance + income - expense;
    }

    const [allTransactions] = await pool.query(
      `SELECT t.amount, c.type
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = ?`,
      [userId]
    );

    let totalIncome = 0;
    let totalExpense = 0;
    for (const t of allTransactions) {
      const amount = Number(decrypt(t.amount, userId)) || 0;
      if (t.type === 'income') totalIncome += amount;
      else totalExpense += amount;
    }

    const [recentTransactions] = await pool.query(
      `SELECT * FROM v_transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT 5`,
      [userId]
    );

    const recentDecrypted = recentTransactions.map((t) => ({
      ...t,
      amount: Number(decrypt(t.amount, userId)) || 0,
      note: decrypt(t.note, userId) || '',
    }));

    const [categorySpent] = await pool.query(
      `SELECT c.name, c.category_id, t.amount
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = ? AND c.type = 'expense'`,
      [userId]
    );

    const categoryMap = {};
    for (const row of categorySpent) {
      const amount = Number(decrypt(row.amount, userId)) || 0;
      if (!categoryMap[row.category_id]) {
        categoryMap[row.category_id] = { name: row.name, amount: 0 };
      }
      categoryMap[row.category_id].amount += amount;
    }

    const totalSpent = Object.values(categoryMap).reduce((sum, c) => sum + c.amount, 0);
    const colors = ['#4ECDC4', '#FF6B6B', '#FFE66D', '#A29BFE', '#FD79A8'];
    const categorySpentWithPercent = Object.values(categoryMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((c, i) => ({
        name: c.name,
        amount: c.amount,
        percentage: totalSpent > 0
          ? Math.round((c.amount / totalSpent) * 100 * 10) / 10
          : 0,
        color: colors[i % colors.length],
      }));

    const [goalRows] = await pool.query(
      `SELECT goal_id AS saving_goal_id, name, target_amount, current_amount, end_date, status
       FROM goals
       WHERE user_id = ? AND status IN ('active', 'completed')
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    const savingsGoal = goalRows.length > 0
      ? buildSavingsGoal(goalRows[0], userId)
      : {
          saving_goal_id: 0,
          name: 'Chưa có mục tiêu',
          target_amount: 0,
          current_amount: 0,
          remaining_amount: 0,
          exceeded_amount: 0,
          progress_percent: 0,
          is_completed: false,
          remainingAmount: 0,
          exceededAmount: 0,
          progressPercent: 0,
          isCompleted: false,
          end_date: null,
          status: 'active',
        };

    const dashboardData = {
      total_balance: totalBalance,
      total_income: totalIncome,
      total_expense: totalExpense,
      recent_transactions: recentDecrypted,
      category_spent: categorySpentWithPercent,
      savings_goal: savingsGoal,
    };

    return success(res, dashboardData);
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardSummary };
