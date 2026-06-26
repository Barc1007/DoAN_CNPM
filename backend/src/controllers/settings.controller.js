const pool = require('../config/db');
const { success, error } = require('../utils/response');

const SETTING_KEYS = ['dark_mode', 'tx_notifications', 'budget_reminders', 'auto_backup'];

const toBool = (v) => v === 1 || v === '1' || v === true || v === 'true';

const rowToSettings = (row) => ({
  dark_mode: toBool(row.dark_mode),
  tx_notifications: toBool(row.tx_notifications),
  budget_reminders: toBool(row.budget_reminders),
  auto_backup: toBool(row.auto_backup),
});

const getSettings = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [userId]);

    if (rows.length === 0) {
      await pool.query('INSERT INTO user_settings (user_id) VALUES (?)', [userId]);
      return success(res, rowToSettings({
        dark_mode: 0, tx_notifications: 1, budget_reminders: 1, auto_backup: 0,
      }));
    }

    return success(res, rowToSettings(rows[0]));
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const updates = {};

    for (const key of SETTING_KEYS) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key] ? 1 : 0;
      }
    }

    if (Object.keys(updates).length === 0) {
      return error(res, 'Không có dữ liệu để cập nhật', 400);
    }

    const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
    const values = Object.values(updates);

    await pool.query(
      `INSERT INTO user_settings (user_id, ${Object.keys(updates).join(', ')})
       VALUES (?, ${values.map(() => '?').join(', ')})
       ON DUPLICATE KEY UPDATE ${setClause}`,
      [userId, ...values, ...values]
    );

    const [rows] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
    return success(res, rowToSettings(rows[0]), 'Cập nhật cài đặt thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };