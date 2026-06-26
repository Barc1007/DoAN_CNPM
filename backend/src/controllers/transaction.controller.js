const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { encrypt, decrypt } = require('../utils/crypto');
const { evaluateBudgets } = require('../services/budgetAlert.service');

const isEncryptedValue = (value) => (
  typeof value === 'string' && /^[a-f0-9]{32}:[a-f0-9]+$/i.test(value)
);

const decryptText = (value, userId) => {
  const decrypted = decrypt(value, userId);
  return isEncryptedValue(decrypted) ? '' : decrypted;
};

const decryptAmount = (value, userId) => {
  const decrypted = decrypt(value, userId);
  return isEncryptedValue(decrypted) ? null : Number(decrypted) || 0;
};

const getWalletBalance = async (walletId, userId, excludedTransactionId = null) => {
  const [wallets] = await pool.query(
    'SELECT initial_balance FROM wallets WHERE wallet_id = ? AND user_id = ?',
    [walletId, userId]
  );

  if (wallets.length === 0) {
    return null;
  }

  const initialBalance = Number(decrypt(wallets[0].initial_balance, userId)) || 0;
  const params = [walletId, userId];
  let excludeSql = '';

  if (excludedTransactionId) {
    excludeSql = ' AND t.transaction_id <> ?';
    params.push(excludedTransactionId);
  }

  const [transactions] = await pool.query(
    `SELECT t.amount, c.type
     FROM transactions t
     JOIN categories c ON t.category_id = c.category_id
     WHERE t.wallet_id = ? AND t.user_id = ?${excludeSql}`,
    params
  );

  return transactions.reduce((balance, transaction) => {
    const amount = Number(decrypt(transaction.amount, userId)) || 0;
    return transaction.type === 'income'
      ? balance + amount
      : balance - amount;
  }, initialBalance);
};

const getCategoryForUser = async (categoryId, userId) => {
  const [categories] = await pool.query(
    'SELECT category_id, type FROM categories WHERE category_id = ? AND (user_id IS NULL OR user_id = ?)',
    [categoryId, userId]
  );

  return categories[0] || null;
};

const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT * FROM v_transactions WHERE user_id = ? ORDER BY transaction_date DESC`,
      [userId]
    );

    const result = rows.map((t) => ({
      ...t,
      amount: decryptAmount(t.amount, userId) ?? 0,
      note: decryptText(t.note, userId) || '',
    }));

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { wallet_id, category_id, amount, transaction_date, note } = req.body;
    const userId = req.user.user_id;

    if (!wallet_id || !category_id || !amount) {
      return error(res, 'Vui lòng điền đầy đủ thông tin giao dịch', 400);
    }

    const [walletCheck] = await pool.query(
      'SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?',
      [wallet_id, userId]
    );

    if (walletCheck.length === 0) {
      return error(res, 'Ví không tồn tại hoặc không thuộc quyền sở hữu của bạn', 404);
    }

    const [result] = await pool.query(
      `INSERT INTO transactions (user_id, wallet_id, category_id, amount, transaction_date, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, wallet_id, category_id, encrypt(String(amount), userId), transaction_date || new Date(), encrypt(note || '', userId)]
    );

    const [rows] = await pool.query(
      'SELECT * FROM v_transactions WHERE transaction_id = ?',
      [result.insertId]
    );

    const response = {
      ...rows[0],
      amount: decryptAmount(rows[0].amount, userId) ?? 0,
      note: decryptText(rows[0].note, userId) || '',
    };

    await evaluateBudgets(userId, category_id, rows[0].transaction_date);

    return success(res, response, 'Tạo giao dịch thành công', 201);
  } catch (err) {
    next(err);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { wallet_id, category_id, amount, transaction_date, note, type } = req.body;
    const userId = req.user.user_id;

    const [existingRows] = await pool.query(
      `SELECT t.*, c.type
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.transaction_id = ? AND t.user_id = ?`,
      [transactionId, userId]
    );

    if (existingRows.length === 0) {
      return error(res, 'Không tìm thấy giao dịch', 404);
    }

    const existing = existingRows[0];
    if (
      wallet_id === undefined &&
      category_id === undefined &&
      amount === undefined &&
      transaction_date === undefined &&
      note === undefined &&
      type === undefined
    ) {
      return error(res, 'Không có dữ liệu để cập nhật', 400);
    }

    const nextWalletId = wallet_id !== undefined ? Number(wallet_id) : existing.wallet_id;
    const nextCategoryId = category_id !== undefined ? Number(category_id) : existing.category_id;
    const nextAmount = amount !== undefined ? Number(amount) : Number(decrypt(existing.amount, userId)) || 0;
    const requestedType = type !== undefined ? String(type).toLowerCase() : undefined;

    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      return error(res, 'Số tiền giao dịch phải lớn hơn 0', 400);
    }

    const [walletCheck] = await pool.query(
      'SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?',
      [nextWalletId, userId]
    );
    if (walletCheck.length === 0) {
      return error(res, 'Ví không tồn tại hoặc không thuộc quyền sở hữu của bạn', 404);
    }

    const category = await getCategoryForUser(nextCategoryId, userId);
    if (!category) {
      return error(res, 'Danh mục không tồn tại hoặc không thuộc quyền sử dụng của bạn', 404);
    }

    if (requestedType && !['income', 'expense'].includes(requestedType)) {
      return error(res, 'Loại giao dịch phải là income hoặc expense', 400);
    }

    if (requestedType && category.type !== requestedType) {
      return error(res, 'Danh mục phải cùng loại với giao dịch thu/chi', 400);
    }

    const balanceBeforeNewTransaction = await getWalletBalance(nextWalletId, userId, transactionId);
    if (balanceBeforeNewTransaction === null) {
      return error(res, 'Ví không tồn tại hoặc không thuộc quyền sở hữu của bạn', 404);
    }

    if (category.type === 'expense' && balanceBeforeNewTransaction - nextAmount < 0) {
      return error(res, 'Số dư ví không đủ để lưu giao dịch này', 400);
    }

    const fields = [];
    const values = [];

    if (wallet_id !== undefined) { fields.push('wallet_id = ?'); values.push(nextWalletId); }
    if (category_id !== undefined || type !== undefined) { fields.push('category_id = ?'); values.push(nextCategoryId); }
    if (amount !== undefined) { fields.push('amount = ?'); values.push(encrypt(String(nextAmount), userId)); }
    if (transaction_date !== undefined) { fields.push('transaction_date = ?'); values.push(transaction_date); }
    if (note !== undefined) { fields.push('note = ?'); values.push(encrypt(note || '', userId)); }

    values.push(transactionId, userId);
    await pool.query(
      `UPDATE transactions SET ${fields.join(', ')} WHERE transaction_id = ? AND user_id = ?`,
      values
    );

    const [rows] = await pool.query(
      'SELECT * FROM v_transactions WHERE transaction_id = ? AND user_id = ?',
      [transactionId, userId]
    );

    const response = {
      ...rows[0],
      amount: decryptAmount(rows[0].amount, userId) ?? 0,
      note: decryptText(rows[0].note, userId) || '',
    };

    await evaluateBudgets(userId, nextCategoryId, rows[0].transaction_date);

    return success(res, response, 'Cập nhật giao dịch thành công');
  } catch (err) {
    next(err);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.user_id;

    const [transactions] = await pool.query(
      `SELECT t.transaction_id, t.wallet_id, t.category_id, t.amount, c.type
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.transaction_id = ? AND t.user_id = ?`,
      [transactionId, userId]
    );

    if (transactions.length === 0) {
      return error(res, 'Không tìm thấy giao dịch', 404);
    }

    const [result] = await pool.query(
      'DELETE FROM transactions WHERE transaction_id = ? AND user_id = ?',
      [transactionId, userId]
    );

    if (result.affectedRows === 0) {
      return error(res, 'Không tìm thấy giao dịch', 404);
    }

    await evaluateBudgets(userId, transactions[0].category_id, new Date());

    return success(res, null, 'Xoá giao dịch thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };
