const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { decrypt, encrypt } = require('../utils/crypto');

const getCurrentMonthPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(endDate).padStart(2, '0')}`;
  return { start, end };
};

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

    const budgetByCategory = {};
    if (type === 'expense') {
      const today = new Date().toISOString().slice(0, 10);
      const [budgets] = await pool.query(
        `SELECT category_id, limit_amount
         FROM budgets
         WHERE user_id = ?
           AND category_id IS NOT NULL
           AND start_date <= ?
           AND end_date >= ?`,
        [userId, today, today]
      );

      for (const budget of budgets) {
        const limit = Number(decrypt(budget.limit_amount, userId)) || 0;
        budgetByCategory[budget.category_id] = Math.max(
          budgetByCategory[budget.category_id] || 0,
          limit
        );
      }
    }

    const categoriesWithPercent = categories.map((c) => {
      const catTotal = categoryTotals[c.category_id] || 0;
      const isSystem = c.user_id === null;
      const category = {
        category_id: c.category_id,
        name: isSystem ? c.name : (decrypt(c.name, userId) || c.name),
        type: c.type,
        transaction_count: Number(c.transaction_count),
        total_amount: catTotal,
        percentage: totalAmount > 0
          ? Math.round((catTotal / totalAmount) * 100 * 100) / 100
          : 0,
      };

      if (type === 'expense' && budgetByCategory[c.category_id] !== undefined) {
        category.budget_limit = budgetByCategory[c.category_id];
      }

      return category;
    });

    const budgetedCategories = categoriesWithPercent.filter(
      (category) => category.type === 'expense' && typeof category.budget_limit === 'number'
    );
    const totalBudget = budgetedCategories.reduce(
      (sum, category) => sum + (category.budget_limit || 0),
      0
    );
    const totalSpent = budgetedCategories.reduce(
      (sum, category) => sum + category.total_amount,
      0
    );

    const result = {
      summary: {
        total_amount: totalAmount,
        total_transactions: totalTransactions,
        total_categories: totalCategories,
        average_per_category: totalCategories > 0
          ? Math.round(totalAmount / totalCategories)
          : 0,
        top_category_name: categoriesWithPercent.length > 0 ? categoriesWithPercent[0].name : '',
        ...(type === 'expense' ? {
          budget: {
            total_budget: totalBudget,
            total_remaining: totalBudget - totalSpent,
            budgeted_categories: budgetedCategories.length,
            over_budget_categories: budgetedCategories.filter(
              (category) => category.total_amount > (category.budget_limit || 0)
            ).length,
            near_limit_categories: budgetedCategories.filter((category) => {
              const limit = category.budget_limit || 0;
              if (limit <= 0) return false;
              const usedRate = category.total_amount / limit;
              return usedRate >= 0.8 && usedRate <= 1;
            }).length,
          },
        } : {}),
      },
      categories: categoriesWithPercent,
    };

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  let connection;
  try {
    const { name, type, budget_limit } = req.body;
    const userId = req.body.user_id || req.user.user_id;
    const trimmedName = typeof name === 'string' ? name.trim() : '';

    if (!trimmedName) {
      return error(res, 'Tên danh mục không được để trống', 400);
    }

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return error(res, 'Tên danh mục phải từ 2 đến 50 ký tự', 400);
    }

    if (!type) {
      return error(res, 'Vui lòng chọn loại danh mục', 400);
    }

    if (!['income', 'expense'].includes(type)) {
      return error(res, 'Loại danh mục phải là income hoặc expense', 400);
    }

    if (type === 'income' && budget_limit !== undefined && budget_limit !== null && budget_limit !== '') {
      return error(res, 'Danh mục nguồn thu không được thiết lập ngân sách', 400);
    }

    let parsedBudget;
    if (type === 'expense' && budget_limit !== undefined && budget_limit !== null && budget_limit !== '') {
      parsedBudget = Number(budget_limit);
      if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
        return error(res, 'Ngân sách phải là số hợp lệ và không nhỏ hơn 0', 400);
      }
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [categories] = await connection.query(
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
      await connection.rollback();
      return error(res, 'Danh mục này đã tồn tại', 409);
    }

    const [result] = await connection.query(
      'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
      [userId, encrypt(trimmedName, userId), type]
    );

    if (type === 'expense' && parsedBudget !== undefined) {
      const { start, end } = getCurrentMonthPeriod();
      await connection.query(
        `INSERT INTO budgets (user_id, category_id, name, limit_amount, start_date, end_date, alert, spent_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          result.insertId,
          encrypt(`Ngân sách ${trimmedName}`, userId),
          encrypt(String(parsedBudget), userId),
          start,
          end,
          80,
          encrypt('0', userId),
        ]
      );
    }

    const [rows] = await connection.query(
      'SELECT * FROM categories WHERE category_id = ?',
      [result.insertId]
    );

    const response = {
      ...rows[0],
      name: decrypt(rows[0].name, userId),
    };

    await connection.commit();
    return success(res, response, 'Tạo danh mục thành công', 201);
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    next(err);
  } finally {
    if (connection) {
      connection.release();
    }
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

const deleteCategory = async (req, res, next) => {
  let connection;
  try {
    const { categoryId } = req.params;
    const userId = req.user.user_id;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [categories] = await connection.query(
      'SELECT category_id, user_id FROM categories WHERE category_id = ?',
      [categoryId]
    );

    if (categories.length === 0) {
      await connection.rollback();
      return error(res, 'Không tìm thấy danh mục', 404);
    }

    const category = categories[0];
    if (category.user_id === null) {
      await connection.rollback();
      return error(res, 'Không thể xoá danh mục mặc định của hệ thống', 403);
    }

    if (Number(category.user_id) !== Number(userId)) {
      await connection.rollback();
      return error(res, 'Bạn không có quyền xoá danh mục này', 403);
    }

    const [transactionRows] = await connection.query(
      'SELECT COUNT(*) AS count FROM transactions WHERE category_id = ? AND user_id = ?',
      [categoryId, userId]
    );

    if (Number(transactionRows[0].count) > 0) {
      await connection.rollback();
      return error(res, 'Không thể xoá danh mục đã có giao dịch liên quan', 409);
    }

    await connection.query(
      'DELETE FROM budgets WHERE category_id = ? AND user_id = ?',
      [categoryId, userId]
    );

    await connection.query(
      'DELETE FROM categories WHERE category_id = ? AND user_id = ?',
      [categoryId, userId]
    );

    await connection.commit();
    return success(res, null, 'Xoá danh mục thành công');
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    next(err);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = { getCategoryData, createCategory, updateCategoryName, deleteCategory };
