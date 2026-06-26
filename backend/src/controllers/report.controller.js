const pool = require('../config/db');
const { success } = require('../utils/response');
const { decrypt } = require('../utils/crypto');

const CATEGORY_COLORS = [
  '#2f8f89',
  '#b87935',
  '#a65f7a',
  '#4f6f9f',
  '#6f638f',
  '#596f99',
  '#c77a86',
  '#d6a64e',
];

const PERIOD_FORMATS = {
  week: 'weekday',
  month: 'day-of-month',
  quarter: 'month-short',
  year: 'month-short',
};

const getCurrentPeriodRange = (period, now = new Date()) => {
  const today = new Date(now);
  let startDate;
  let endDate;

  if (period === 'week') {
    const dayOfWeek = today.getDay();
    startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek);
    endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - dayOfWeek));
  } else if (period === 'month') {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  } else if (period === 'quarter') {
    const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
    startDate = new Date(today.getFullYear(), quarterStartMonth, 1);
    endDate = new Date(today.getFullYear(), quarterStartMonth + 3, 0);
  } else if (period === 'year') {
    startDate = new Date(today.getFullYear(), 0, 1);
    endDate = new Date(today.getFullYear(), 11, 31);
  } else {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
};

const getPreviousPeriodRange = (period, now = new Date()) => {
  const today = new Date(now);
  let startDate;
  let endDate;

  if (period === 'week') {
    const dayOfWeek = today.getDay();
    endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek - 1);
    startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 6);
  } else if (period === 'month') {
    endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  } else if (period === 'quarter') {
    const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
    endDate = new Date(today.getFullYear(), quarterStartMonth, 0);
    startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 2, 1);
  } else if (period === 'year') {
    const year = today.getFullYear() - 1;
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31);
  } else {
    endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
};

const getDateRange = (period) => {
  const groupFormat = PERIOD_FORMATS[period] || PERIOD_FORMATS.month;
  const { startDate, endDate } = getCurrentPeriodRange(period);
  return { startDate, endDate, groupFormat };
};

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const formatGroupLabel = (date, groupFormat, period, indexInGroup, totalInGroup) => {
  const d = new Date(date);

  if (groupFormat === 'weekday') {
    return WEEKDAY_LABELS[d.getDay()];
  }

  if (groupFormat === 'day-of-month') {
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  if (groupFormat === 'month-short') {
    if (period === 'quarter') {
      return `Tháng ${d.getMonth() + 1}`;
    }
    return `T${d.getMonth() + 1}`;
  }

  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const buildBuckets = (startDate, endDate, period) => {
  const buckets = [];
  const cursor = new Date(startDate);

  if (period === 'week') {
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(cursor);
      day.setDate(cursor.getDate() + i);
      day.setHours(0, 0, 0, 0);
      buckets.push(day);
    }
  } else if (period === 'month') {
    const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= lastDay; day += 1) {
      buckets.push(new Date(startDate.getFullYear(), startDate.getMonth(), day));
    }
  } else if (period === 'quarter') {
    const quarterStartMonth = Math.floor(startDate.getMonth() / 3) * 3;
    for (let i = 0; i < 3; i += 1) {
      const monthDate = new Date(startDate.getFullYear(), quarterStartMonth + i, 1);
      buckets.push(monthDate);
    }
  } else if (period === 'year') {
    for (let i = 0; i < 12; i += 1) {
      buckets.push(new Date(startDate.getFullYear(), i, 1));
    }
  }

  return buckets;
};

const getBucketStart = (date, period) => {
  const d = new Date(date);

  if (period === 'week') {
    const dayOfWeek = d.getDay();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - dayOfWeek);
  }

  if (period === 'month') {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  if (period === 'quarter' || period === 'year') {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};


const getReport = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const period = req.query.period || 'month';

    if (!PERIOD_FORMATS[period]) {
      return success(res, null, 'Khoảng thời gian không hợp lệ');
    }

    const { startDate, endDate, groupFormat } = getDateRange(period);
    const { startDate: previousStart, endDate: previousEnd } = getPreviousPeriodRange(period);

    const [transactions] = await pool.query(
      `SELECT t.transaction_id, t.amount, t.transaction_date, t.note,
              c.category_id, c.name AS category_name, c.type AS category_type
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = ? AND t.transaction_date BETWEEN ? AND ?
       ORDER BY t.transaction_date ASC`,
      [userId, startDate, endDate]
    );

    const decrypted = transactions.map((t) => ({
      ...t,
      amount: Number(decrypt(t.amount, userId)) || 0,
      category_name: decrypt(t.category_name, userId) || '',
      note: decrypt(t.note, userId) || '',
    }));

    let totalIncome = 0;
    let totalExpense = 0;

    decrypted.forEach((t) => {
      if (t.category_type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0
      ? Math.round((balance / totalIncome) * 1000) / 10
      : 0;

    const buckets = buildBuckets(startDate, endDate, period);

    const cashflowMap = new Map();
    buckets.forEach((b) => {
      const key = getBucketStart(b, period).getTime();
      cashflowMap.set(key, {
        ts: key,
        income: 0,
        expense: 0,
      });
    });

    decrypted.forEach((t) => {
      const key = getBucketStart(t.transaction_date, period).getTime();
      const bucket = cashflowMap.get(key);
      if (!bucket) return;
      if (t.category_type === 'income') bucket.income += t.amount;
      else bucket.expense += t.amount;
    });

    const sortedKeys = Array.from(cashflowMap.keys()).sort((a, b) => a - b);
    const cashflow = sortedKeys.map((key, index) => {
      const bucket = cashflowMap.get(key);
      const date = new Date(key);
      return {
        label: formatGroupLabel(date, groupFormat, period, index, sortedKeys.length),
        income: bucket.income,
        expense: bucket.expense,
      };
    });

    const expenseByDate = new Map();
    decrypted
      .filter((t) => t.category_type === 'expense')
      .forEach((t) => {
        const key = getBucketStart(t.transaction_date, period).getTime();
        const bucket = expenseByDate.get(key) || {
          ts: key,
          amount: 0,
          date: new Date(key),
        };
        bucket.amount += t.amount;
        expenseByDate.set(key, bucket);
      });

    const expenseTrend = sortedKeys
      .map((key) => {
        const bucket = expenseByDate.get(key);
        const date = new Date(key);
        return {
          date: formatGroupLabel(date, groupFormat, period, 0, 0),
          amount: bucket ? bucket.amount : 0,
        };
      });

    const categoryMap = new Map();
    decrypted
      .filter((t) => t.category_type === 'expense')
      .forEach((t) => {
        const existing = categoryMap.get(t.category_id) || {
          category_id: t.category_id,
          name: t.category_name,
          amount: 0,
        };
        existing.amount += t.amount;
        categoryMap.set(t.category_id, existing);
      });

    const [previousTransactions] = await pool.query(
      `SELECT t.amount, c.category_id, c.type AS category_type
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = ? AND t.transaction_date BETWEEN ? AND ?
         AND c.type = 'expense'`,
      [userId, previousStart, previousEnd]
    );

    const previousCategoryMap = new Map();
    previousTransactions.forEach((t) => {
      const amount = Number(decrypt(t.amount, userId)) || 0;
      const existing = previousCategoryMap.get(t.category_id) || 0;
      previousCategoryMap.set(t.category_id, existing + amount);
    });

    const totalExpenseForBreakdown = Array.from(categoryMap.values())
      .reduce((sum, c) => sum + c.amount, 0);

    const categoryBreakdown = Array.from(categoryMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((c, index) => {
        const previousAmount = previousCategoryMap.get(c.category_id) || 0;
        const previousChange = previousAmount > 0
          ? Math.round(((c.amount - previousAmount) / previousAmount) * 100)
          : 0;
        const percentage = totalExpenseForBreakdown > 0
          ? Math.round((c.amount / totalExpenseForBreakdown) * 1000) / 10
          : 0;

        return {
          category_id: c.category_id,
          name: c.name,
          amount: c.amount,
          percentage,
          previous_change: previousChange,
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        };
      });

    const reportData = {
      period,
      summary: {
        total_income: totalIncome,
        total_expense: totalExpense,
        balance,
        savings_rate: savingsRate,
      },
      cashflow,
      category_breakdown: categoryBreakdown,
      expense_trend: expenseTrend,
    };

    return success(res, reportData, 'Tải báo cáo thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getReport };