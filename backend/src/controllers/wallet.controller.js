const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { encrypt, decrypt } = require('../utils/crypto');

const getWallets = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const [rows] = await pool.query(
      'SELECT * FROM v_wallet_balance WHERE user_id = ?',
      [userId]
    );

    const result = await Promise.all(rows.map(async (w) => {
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

      return {
        ...w,
        name: decrypt(w.name, userId),
        initial_balance: initialBalance,
        current_balance: initialBalance + income - expense,
        transaction_count: transactions.length,
      };
    }));

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

const createWallet = async (req, res, next) => {
  try {
    const { name, initial_balance, wallet_type } = req.body;
    const userId = req.body.user_id || req.user.user_id;

    if (!name || !wallet_type) {
      return error(res, 'Vui lòng nhập tên ví và loại ví', 400);
    }

    const [result] = await pool.query(
      'INSERT INTO wallets (user_id, name, initial_balance, wallet_type) VALUES (?, ?, ?, ?)',
      [userId, encrypt(name, userId), encrypt(String(initial_balance || 0), userId), wallet_type]
    );

    const [rows] = await pool.query(
      'SELECT * FROM v_wallet_balance WHERE wallet_id = ?',
      [result.insertId]
    );

    const w = rows[0];
    const response = {
      ...w,
      name: decrypt(w.name, userId),
      initial_balance: Number(decrypt(w.initial_balance, userId)) || 0,
      current_balance: Number(decrypt(w.initial_balance, userId)) || 0,
      transaction_count: 0,
    };

    return success(res, response, 'Tạo ví thành công', 201);
  } catch (err) {
    next(err);
  }
};

const updateWallet = async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const { name, initial_balance, wallet_type, is_active } = req.body;
    const userId = req.user.user_id;

    const [walletRows] = await pool.query(
      'SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?',
      [walletId, userId]
    );

    if (walletRows.length === 0) {
      return error(res, 'Không tìm thấy ví', 404);
    }

    const [transactionRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM transactions WHERE wallet_id = ?',
      [walletId]
    );
    const hasTransactions = Number(transactionRows[0].total) > 0;

    if (hasTransactions && initial_balance !== undefined) {
      return error(res, 'Không thể sửa số dư ban đầu vì ví này đã có giao dịch', 400);
    }

    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(encrypt(name, userId)); }
    if (initial_balance !== undefined) { fields.push('initial_balance = ?'); values.push(encrypt(String(initial_balance), userId)); }
    if (wallet_type !== undefined) { fields.push('wallet_type = ?'); values.push(wallet_type); }
    if (is_active !== undefined) { fields.push('is_active = ?'); values.push(is_active); }

    if (fields.length === 0) {
      return error(res, 'Không có dữ liệu để cập nhật', 400);
    }

    values.push(walletId);
    await pool.query(
      `UPDATE wallets SET ${fields.join(', ')} WHERE wallet_id = ? AND user_id = ?`,
      [...values, userId]
    );

    const [rows] = await pool.query(
      'SELECT * FROM v_wallet_balance WHERE wallet_id = ?',
      [walletId]
    );

    if (rows.length === 0) {
      return error(res, 'Không tìm thấy ví', 404);
    }

    const w = rows[0];
    const initialBalance = Number(decrypt(w.initial_balance, userId)) || 0;
    const [updatedTransactions] = await pool.query(
      `SELECT t.amount, c.type
       FROM transactions t
       JOIN categories c ON t.category_id = c.category_id
       WHERE t.wallet_id = ?`,
      [walletId]
    );

    let income = 0;
    let expense = 0;
    for (const t of updatedTransactions) {
      const amount = Number(decrypt(t.amount, userId)) || 0;
      if (t.type === 'income') income += amount;
      else expense += amount;
    }

    const response = {
      ...w,
      name: decrypt(w.name, userId),
      initial_balance: initialBalance,
      current_balance: initialBalance + income - expense,
      transaction_count: Number(transactionRows[0].total),
    };

    return success(res, response, 'Cập nhật ví thành công');
  } catch (err) {
    next(err);
  }
};

const deleteWallet = async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const userId = req.user.user_id;

    const [walletRows] = await pool.query(
      'SELECT wallet_id FROM wallets WHERE wallet_id = ? AND user_id = ?',
      [walletId, userId]
    );

    if (walletRows.length === 0) {
      return error(res, 'Không tìm thấy ví', 404);
    }

    const [transactionRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM transactions WHERE wallet_id = ?',
      [walletId]
    );

    if (Number(transactionRows[0].total) > 0) {
      return error(res, 'Không thể xoá ví vì ví này đã có giao dịch', 400);
    }

    const [result] = await pool.query(
      'DELETE FROM wallets WHERE wallet_id = ? AND user_id = ?',
      [walletId, userId]
    );

    if (result.affectedRows === 0) {
      return error(res, 'Không tìm thấy ví', 404);
    }

    return success(res, null, 'Xoá ví thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getWallets, createWallet, updateWallet, deleteWallet };
