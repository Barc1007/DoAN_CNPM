const pool = require('../config/db');
const { success, error } = require('../utils/response');

const getCategoryData = async (req, res, next) => {
  try {
    const { type } = req.query;
    const userId = req.query.user_id || req.user.user_id;

    if (!type || !['income', 'expense'].includes(type)) {
      return error(res, 'Tham số type phải là income hoặc expense', 400);
    }

    const [categories] = await pool.query(
      `SELECT
         c.category_id,
         c.name,
         c.type,
         COUNT(t.transaction_id)     AS transaction_count,
         COALESCE(SUM(t.amount), 0)  AS total_amount
       FROM categories c
       LEFT JOIN transactions t
         ON c.category_id = t.category_id AND t.user_id = ?
       WHERE c.type = ?
         AND (c.user_id IS NULL OR c.user_id = ?)
       GROUP BY c.category_id, c.name, c.type
       ORDER BY total_amount DESC`,
      [userId, type, userId]
    );

    const totalAmount = categories.reduce((sum, c) => sum + Number(c.total_amount), 0);
    const totalTransactions = categories.reduce((sum, c) => sum + Number(c.transaction_count), 0);
    const totalCategories = categories.length;

    const categoriesWithPercent = categories.map((c) => ({
      ...c,
      total_amount: Number(c.total_amount),
      transaction_count: Number(c.transaction_count),
      percentage: totalAmount > 0
        ? Math.round((Number(c.total_amount) / totalAmount) * 100 * 100) / 100
        : 0,
    }));

    const result = {
      summary: {
        total_amount: totalAmount,
        total_transactions: totalTransactions,
        total_categories: totalCategories,
        average_per_category: totalCategories > 0
          ? Math.round(totalAmount / totalCategories)
          : 0,
        top_category_name: categories.length > 0 ? categories[0].name : '',
      },
      categories: categoriesWithPercent,
    };

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategoryData };
