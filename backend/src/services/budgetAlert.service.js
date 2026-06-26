const pool = require('../config/db');
const { encrypt, decrypt } = require('../utils/crypto');

const toDateString = (v) => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'string') return v.slice(0, 10);
  return String(v).slice(0, 10);
};

const computeBudgetSpent = async (budget, userId) => {
  const startStr = toDateString(budget.start_date);
  const endStr = toDateString(budget.end_date);
  const params = [userId, `${startStr} 00:00:00`, `${endStr} 23:59:59`];

  let sql = `SELECT t.amount, c.type AS category_type
             FROM transactions t
             JOIN categories c ON t.category_id = c.category_id
             WHERE t.user_id = ?
               AND t.transaction_date >= ?
               AND t.transaction_date <= ?`;

  if (budget.category_id) {
    sql += ' AND t.category_id = ?';
    params.push(budget.category_id);
  } else {
    sql += " AND c.type = 'expense'";
  }

  const [rows] = await pool.query(sql, params);
  return rows.reduce((sum, row) => {
    const amount = Number(decrypt(row.amount, userId)) || 0;
    return row.category_type === 'expense' ? sum + amount : sum;
  }, 0);
};

const findActiveBudgetsForCategory = async (userId, categoryId, atDate) => {
  const day = toDateString(atDate);
  const [rows] = await pool.query(
    `SELECT budget_id, user_id, category_id, name, limit_amount, start_date, end_date, alert
     FROM budgets
     WHERE user_id = ?
       AND start_date <= ?
       AND end_date >= ?
       AND (category_id IS NULL OR category_id = ?)`,
    [userId, day, day, categoryId]
  );
  return rows;
};

const hasRecentAlert = async (userId, budgetId, severity) => {
  const [rows] = await pool.query(
    `SELECT message FROM notifications
     WHERE user_id = ? AND type = 'budget_alert'
       AND created_at >= NOW() - INTERVAL 6 HOUR`,
    [userId]
  );
  const tag = `[budget:${budgetId}:${severity}]`;
  return rows.some((r) => {
    const msg = decrypt(r.message, userId);
    return typeof msg === 'string' && msg.includes(tag);
  });
};

const formatVnd = (value) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(value)) + ' VND';

const buildAlertPayload = (budget, spent, limit, level) => {
  const over = spent - limit;
  const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const name = decrypt(budget.name, budget.user_id);
  const tag = level === 'over'
    ? `[budget:${budget.budget_id}:over]`
    : `[budget:${budget.budget_id}:near]`;

  let title;
  let body;
  if (level === 'over') {
    title = `Vuot ngan sach: ${name}`;
    body = `${tag} Ban da chi ${formatVnd(spent)} (${percent}%), vuot ${formatVnd(over)} so voi han muc ${formatVnd(limit)}.`;
  } else {
    title = `Sap dat han muc: ${name}`;
    body = `${tag} Ban da dat ${percent}% han muc "${name}" (${formatVnd(spent)} / ${formatVnd(limit)}).`;
  }

  return { title, message: body };
};

const insertNotification = async (userId, title, message) => {
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES (?, 'budget_alert', ?, ?)`,
    [userId, encrypt(title, userId), encrypt(message, userId)]
  );
};

const evaluateBudgets = async (userId, categoryId, atDate) => {
  try {
    const [settingsRows] = await pool.query(
      'SELECT budget_reminders FROM user_settings WHERE user_id = ?',
      [userId]
    );
    const remindersEnabled = settingsRows.length === 0 || toBool(settingsRows[0].budget_reminders);
    if (!remindersEnabled) return;

    const budgets = await findActiveBudgetsForCategory(userId, categoryId, atDate);
    if (budgets.length === 0) return;

    for (const budget of budgets) {
      const limit = Number(decrypt(budget.limit_amount, userId)) || 0;
      if (limit <= 0) continue;

      const spent = await computeBudgetSpent(budget, userId);
      const percent = (spent / limit) * 100;
      const alertThreshold = Number(budget.alert) || 80;

      let level = null;
      if (percent >= 100) level = 'over';
      else if (percent >= alertThreshold) level = 'near';

      if (!level) continue;

      const alreadyNotified = await hasRecentAlert(userId, budget.budget_id, level);
      if (alreadyNotified) continue;

      const { title, message } = buildAlertPayload(budget, spent, limit, level);
      await insertNotification(userId, title, message);
    }
  } catch (err) {
    console.error('[budgetAlert] evaluate failed:', err.message);
  }
};

module.exports = { evaluateBudgets };