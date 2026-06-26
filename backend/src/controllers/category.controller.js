const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { decrypt, encrypt } = require('../utils/crypto');

const getCategoryData = async (req, res, next) => {
  try {
    const { type } = req.query;
    const userId = req.query.user_id || req.user.user_id;

    if (!type || !['income', 'expense'].includes(type)) {
      return error(res, 'Tham số type phải là income hoặc expense', 400);
    }

    const [categories] = await pool.query(
      `SELECT c.category_id, c.name, c.type, c.user_id,
              COUNT(t.transaction_id) AS transaction_count
       FROM categories c
       LEFT JOIN transactions t
         ON c.category_id = t.category_id AND t.user_id = ?
       WHERE c.type = ?
         AND (c.user_id IS NULL OR c.user_id = ?)
       GROUP BY c.category_id, c.name, c.type, c.user_id
       ORDER BY c.category_id`,
      [userId, type, userId]
    );

    const [allTransactions] = await pool.query(
      `SELECT t.amount, t.category_id
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.user_id = ? AND c.type = ?`,
      [userId, type]
    );

    const categoryTotals = {};
    for (const t of allTransactions) {
      const catId = t.category_id;
      const amount = Number(decrypt(t.amount, userId)) || 0;
      categoryTotals[catId] = (categoryTotals[catId] || 0) + amount;
    }

    const totalAmount = Object.values(categoryTotals).reduce((sum, a) => sum + a, 0);
    const totalTransactions = allTransactions.length;
    const totalCategories = categories.length;

    const categoriesWithPercent = categories.map((c) => {
      const catTotal = categoryTotals[c.category_id] || 0;
      const isSystem = c.user_id === null;
      return {
        category_id: c.category_id,
        name: isSystem ? c.name : (decrypt(c.name, userId) || c.name),
        type: c.type,
        transaction_count: Number(c.transaction_count),
        total_amount: catTotal,
        percentage: totalAmount > 0
          ? Math.round((catTotal / totalAmount) * 100 * 100) / 100
          : 0,
      };
    });

    const result = {
      summary: {
        total_amount: totalAmount,
        total_transactions: totalTransactions,
        total_categories: totalCategories,
        average_per_category: totalCategories > 0
          ? Math.round(totalAmount / totalCategories)
          : 0,
        top_category_name: categoriesWithPercent.length > 0 ? categoriesWithPercent[0].name : '',
      },
      categories: categoriesWithPercent,
    };

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    const userId = req.body.user_id || req.user.user_id;
    const trimmedName = typeof name === 'string' ? name.trim() : '';

    if (!trimmedName || !type) {
      return error(res, 'Vui lòng nhập tên và loại danh mục', 400);
    }

    if (!['income', 'expense'].includes(type)) {
      return error(res, 'Loại danh mục phải là income hoặc expense', 400);
    }

    const [categories] = await pool.query(
      'SELECT category_id, name, user_id FROM categories WHERE type = ? AND (user_id IS NULL OR user_id = ?)',
      [type, userId]
    );

    const duplicated = categories.some((category) => {
      const categoryName = category.user_id === null
        ? category.name
        : decrypt(category.name, userId);
      return String(categoryName).trim().toLowerCase() === trimmedName.toLowerCase();
    });

    if (duplicated) {
      return error(res, 'Danh mục này đã tồn tại', 409);
    }

    const [result] = await pool.query(
      'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
      [userId, encrypt(trimmedName, userId), type]
    );

    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE category_id = ?',
      [result.insertId]
    );

    const response = {
      ...rows[0],
      name: decrypt(rows[0].name, userId),
    };

    return success(res, response, 'Tạo danh mục thành công', 201);
  } catch (err) {
    next(err);
  }
};

const updateCategoryName = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    const userId = req.user.user_id;

    if (!name) {
      return error(res, 'Vui lòng nhập tên danh mục', 400);
    }

    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE category_id = ?',
      [categoryId]
    );

    if (categories.length === 0) {
      return error(res, 'Không tìm thấy danh mục', 404);
    }

    const category = categories[0];
    if (category.user_id !== null && category.user_id !== userId) {
      return error(res, 'Bạn không có quyền sửa danh mục này', 403);
    }

    await pool.query(
      'UPDATE categories SET name = ? WHERE category_id = ?',
      [category.user_id !== null ? encrypt(name, userId) : name, categoryId]
    );

    const [updated] = await pool.query(
      'SELECT * FROM categories WHERE category_id = ?',
      [categoryId]
    );

    return success(res, updated[0], 'Cập nhật danh mục thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategoryData, createCategory, updateCategoryName };
