const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { encrypt, decrypt } = require('../Utils/crypto');

const getTransactions = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const [rows] = await pool.query(
      `SELECT * FROM v_transactions WHERE user_id = ? ORDER BY transaction_date DESC`,
      [userId]
    );

    const result = rows.map((t) => ({
      ...t,
      amount: Number(decrypt(t.amount, userId)) || 0,
      note: decrypt(t.note, userId) || '',
    }));

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const { wallet_id, category_id, amount, transaction_date, note } = req.body;
    const userId = req.body.user_id || req.user.user_id;

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
      amount: Number(decrypt(rows[0].amount, userId)) || 0,
      note: decrypt(rows[0].note, userId) || '',
    };

    return success(res, response, 'Tạo giao dịch thành công', 201);
  } catch (err) {
    next(err);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { wallet_id, category_id, amount, transaction_date, note } = req.body;
    const userId = req.user.user_id;

    const fields = [];
    const values = [];

    if (wallet_id !== undefined) { fields.push('wallet_id = ?'); values.push(wallet_id); }
    if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id); }
    if (amount !== undefined) { fields.push('amount = ?'); values.push(encrypt(String(amount), userId)); }
    if (transaction_date !== undefined) { fields.push('transaction_date = ?'); values.push(transaction_date); }
    if (note !== undefined) { fields.push('note = ?'); values.push(encrypt(note, userId)); }

    if (fields.length === 0) {
      return error(res, 'Không có dữ liệu để cập nhật', 400);
    }

    // If updating wallet_id, validate ownership
    const walletIdx = fields.findIndex((f) => f.startsWith('wallet_id'));
    if (walletIdx !== -1) {
      const newWalletId = values[walletIdx];
      const [walletCheck] = await pool.query(
        'SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?',
        [newWalletId, userId]
      );
      if (walletCheck.length === 0) {
        return error(res, 'Ví không tồn tại hoặc không thuộc quyền sở hữu của bạn', 404);
      }
    }

    values.push(transactionId);
    await pool.query(
      `UPDATE transactions SET ${fields.join(', ')} WHERE transaction_id = ?`,
      values
    );

    const [rows] = await pool.query(
      'SELECT * FROM v_transactions WHERE transaction_id = ?',
      [transactionId]
    );

    const response = {
      ...rows[0],
      amount: Number(decrypt(rows[0].amount, userId)) || 0,
      note: decrypt(rows[0].note, userId) || '',
    };

    return success(res, response, 'Cập nhật giao dịch thành công');
  } catch (err) {
    next(err);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM transactions WHERE transaction_id = ?',
      [transactionId]
    );

    if (result.affectedRows === 0) {
      return error(res, 'Không tìm thấy giao dịch', 404);
    }

    return success(res, null, 'Xoá giao dịch thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction };