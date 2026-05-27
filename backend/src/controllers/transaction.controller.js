const pool = require('../config/db');
const { success, error } = require('../utils/response');

const getTransactions = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const [rows] = await pool.query(
      `SELECT * FROM v_transactions WHERE user_id = ? ORDER BY transaction_date DESC`,
      [userId]
    );

    return success(res, rows);
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

    const [result] = await pool.query(
      `INSERT INTO transactions (user_id, wallet_id, category_id, amount, transaction_date, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, wallet_id, category_id, amount, transaction_date || new Date(), note || null]
    );

    const [rows] = await pool.query(
      'SELECT * FROM v_transactions WHERE transaction_id = ?',
      [result.insertId]
    );

    return success(res, rows[0], 'Tạo giao dịch thành công', 201);
  } catch (err) {
    next(err);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { wallet_id, category_id, amount, transaction_date, note } = req.body;

    const fields = [];
    const values = [];

    if (wallet_id !== undefined) { fields.push('wallet_id = ?'); values.push(wallet_id); }
    if (category_id !== undefined) { fields.push('category_id = ?'); values.push(category_id); }
    if (amount !== undefined) { fields.push('amount = ?'); values.push(amount); }
    if (transaction_date !== undefined) { fields.push('transaction_date = ?'); values.push(transaction_date); }
    if (note !== undefined) { fields.push('note = ?'); values.push(note); }

    if (fields.length === 0) {
      return error(res, 'Không có dữ liệu để cập nhật', 400);
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

    return success(res, rows[0], 'Cập nhật giao dịch thành công');
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
