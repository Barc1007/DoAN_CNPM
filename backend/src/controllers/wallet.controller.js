const pool = require('../config/db');
const { success, error } = require('../utils/response');

const getWallets = async (req, res, next) => {
  try {
    const userId = req.query.user_id || req.user.user_id;

    const [rows] = await pool.query(
      'SELECT * FROM v_wallet_balance WHERE user_id = ?',
      [userId]
    );

    return success(res, rows);
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
      [userId, name, initial_balance || 0, wallet_type]
    );

    const [rows] = await pool.query(
      'SELECT * FROM v_wallet_balance WHERE wallet_id = ?',
      [result.insertId]
    );

    return success(res, rows[0], 'Tạo ví thành công', 201);
  } catch (err) {
    next(err);
  }
};

const updateWallet = async (req, res, next) => {
  try {
    const { walletId } = req.params;
    const { name, initial_balance, wallet_type, is_active } = req.body;

    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (initial_balance !== undefined) { fields.push('initial_balance = ?'); values.push(initial_balance); }
    if (wallet_type !== undefined) { fields.push('wallet_type = ?'); values.push(wallet_type); }
    if (is_active !== undefined) { fields.push('is_active = ?'); values.push(is_active); }

    if (fields.length === 0) {
      return error(res, 'Không có dữ liệu để cập nhật', 400);
    }

    values.push(walletId);
    await pool.query(
      `UPDATE wallets SET ${fields.join(', ')} WHERE wallet_id = ?`,
      values
    );

    const [rows] = await pool.query(
      'SELECT * FROM v_wallet_balance WHERE wallet_id = ?',
      [walletId]
    );

    if (rows.length === 0) {
      return error(res, 'Không tìm thấy ví', 404);
    }

    return success(res, rows[0], 'Cập nhật ví thành công');
  } catch (err) {
    next(err);
  }
};

const deleteWallet = async (req, res, next) => {
  try {
    const { walletId } = req.params;

    const [result] = await pool.query(
      'DELETE FROM wallets WHERE wallet_id = ?',
      [walletId]
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
