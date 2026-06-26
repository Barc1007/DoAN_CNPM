const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { deriveKeyFromPassword, setSession, encryptWithKey, decrypt } = require('../utils/crypto');

const SALT_ROUNDS = 10;
const DEFAULT_CATEGORIES = [
  ['Ăn uống', 'expense'],
  ['Di chuyển', 'expense'],
  ['Học phí', 'expense'],
  ['Giải trí', 'expense'],
  ['Mua sắm', 'expense'],
  ['Tiền nhà', 'expense'],
  ['Hóa đơn điện/nước', 'expense'],
  ['Lương / Trợ cấp', 'income'],
  ['Tiền thưởng', 'income'],
  ['Tiền phụ huynh', 'income'],
  ['Thu nhập khác', 'income'],
];

const ensureDefaultCategories = async () => {
  const [rows] = await pool.query(
    'SELECT name, type FROM categories WHERE user_id IS NULL'
  );
  const existing = new Set(rows.map((row) => `${row.name}:${row.type}`));
  const missing = DEFAULT_CATEGORIES.filter(
    ([name, type]) => !existing.has(`${name}:${type}`)
  );

  if (missing.length === 0) return;

  await pool.query(
    'INSERT INTO categories (user_id, name, type) VALUES ?',
    [missing.map(([name, type]) => [null, name, type])]
  );
};

const reEncryptUserData = async (userId, newEncryptionKey) => {
  const encryptValue = (value) => encryptWithKey(decrypt(value, userId), newEncryptionKey);

  const [users] = await pool.query(
    'SELECT full_name, email FROM users WHERE user_id = ?',
    [userId]
  );
  if (users.length > 0) {
    await pool.query(
      'UPDATE users SET full_name = ?, email = ? WHERE user_id = ?',
      [encryptValue(users[0].full_name), encryptValue(users[0].email), userId]
    );
  }

  const reEncryptTable = async (table, idColumn, fields, whereSql, params) => {
    const [rows] = await pool.query(
      `SELECT ${idColumn}, ${fields.join(', ')} FROM ${table} WHERE ${whereSql}`,
      params
    );

    for (const row of rows) {
      const assignments = fields.map((field) => `${field} = ?`).join(', ');
      const values = fields.map((field) => encryptValue(row[field]));
      await pool.query(
        `UPDATE ${table} SET ${assignments} WHERE ${idColumn} = ?`,
        [...values, row[idColumn]]
      );
    }
  };

  await reEncryptTable('categories', 'category_id', ['name'], 'user_id = ?', [userId]);
  await reEncryptTable('wallets', 'wallet_id', ['name', 'initial_balance'], 'user_id = ?', [userId]);
  await reEncryptTable('transactions', 'transaction_id', ['amount', 'note'], 'user_id = ?', [userId]);
  await reEncryptTable('budgets', 'budget_id', ['name', 'limit_amount', 'spent_amount'], 'user_id = ?', [userId]);
  await reEncryptTable('goals', 'goal_id', ['name', 'target_amount', 'current_amount'], 'user_id = ?', [userId]);
  await reEncryptTable('notifications', 'notification_id', ['title', 'message'], 'user_id = ?', [userId]);

  const [contributions] = await pool.query(
    `SELECT gc.contribution_id, gc.amount, gc.note
     FROM goal_contributions gc
     JOIN goals g ON gc.goal_id = g.goal_id
     WHERE g.user_id = ?`,
    [userId]
  );

  for (const row of contributions) {
    await pool.query(
      'UPDATE goal_contributions SET amount = ?, note = ? WHERE contribution_id = ?',
      [encryptValue(row.amount), encryptValue(row.note), row.contribution_id]
    );
  }
};

const register = async (req, res, next) => {
  try {
    const { full_name, username, email, password } = req.body;

    if (!full_name || !username || !email || !password) {
      return error(res, 'Vui lòng điền đầy đủ thông tin', 400);
    }

    const [existing] = await pool.query(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return error(res, 'Tên đăng nhập hoặc email đã tồn tại', 409);
    }

    const { authenticationSecret, encryptionKey } = deriveKeyFromPassword(password);
    const hashedPassword = await bcrypt.hash(authenticationSecret, SALT_ROUNDS);

    const [result] = await pool.query(
      'INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)',
      [encryptWithKey(full_name, encryptionKey), username, encryptWithKey(email, encryptionKey), hashedPassword]
    );

    setSession(result.insertId, { key: encryptionKey, password });
    await ensureDefaultCategories();

    const newUser = {
      user_id: result.insertId,
      username,
      email: email,
      full_name: full_name,
    };

    return success(res, newUser, 'Đăng ký thành công', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return error(res, 'Vui lòng nhập tên đăng nhập và mật khẩu', 400);
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return error(res, 'Tên đăng nhập hoặc mật khẩu không đúng', 401);
    }

    const user = rows[0];

    const { authenticationSecret, encryptionKey } = deriveKeyFromPassword(password);
    let isMatch = await bcrypt.compare(authenticationSecret, user.password);
    const isLegacyPasswordHash = !isMatch && await bcrypt.compare(password, user.password);
    isMatch = isMatch || isLegacyPasswordHash;

    if (!isMatch) {
      return error(res, 'Tên đăng nhập hoặc mật khẩu không đúng', 401);
    }

    if (isLegacyPasswordHash) {
      const upgradedPassword = await bcrypt.hash(authenticationSecret, SALT_ROUNDS);
      await pool.query(
        'UPDATE users SET password = ? WHERE user_id = ?',
        [upgradedPassword, user.user_id]
      );
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    setSession(user.user_id, { key: encryptionKey, password });
    await ensureDefaultCategories();

    // Decrypt user fields (support both old CryptoJS and new AES format)
    const fullName = decrypt(user.full_name, user.user_id);
    const email = decrypt(user.email, user.user_id);

    const userData = {
      user_id: user.user_id,
      username: user.username,
      email: email,
      full_name: fullName,
    };

    return success(res, { ...userData, token }, 'Đăng nhập thành công');
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.user_id;

    if (!current_password || !new_password) {
      return error(res, 'Vui lòng nhập đầy đủ mật khẩu', 400);
    }

    if (new_password.length < 6) {
      return error(res, 'Mật khẩu mới phải có ít nhất 6 ký tự', 400);
    }

    const [rows] = await pool.query(
      'SELECT password FROM users WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return error(res, 'Không tìm thấy người dùng', 404);
    }

    const {
      authenticationSecret: currentAuthenticationSecret,
      encryptionKey: currentEncryptionKey,
    } = deriveKeyFromPassword(current_password);
    let isMatch = await bcrypt.compare(currentAuthenticationSecret, rows[0].password);
    const isLegacyPasswordHash = !isMatch && await bcrypt.compare(current_password, rows[0].password);
    isMatch = isMatch || isLegacyPasswordHash;

    if (!isMatch) {
      return error(res, 'Mật khẩu hiện tại không đúng', 401);
    }

    const {
      authenticationSecret: newAuthenticationSecret,
      encryptionKey: newEncryptionKey,
    } = deriveKeyFromPassword(new_password);

    setSession(userId, { key: currentEncryptionKey, password: current_password });
    await reEncryptUserData(userId, newEncryptionKey);

    const hashedPassword = await bcrypt.hash(newAuthenticationSecret, SALT_ROUNDS);
    await pool.query(
      'UPDATE users SET password = ? WHERE user_id = ?',
      [hashedPassword, userId]
    );

    setSession(userId, { key: newEncryptionKey, password: new_password });

    return success(res, null, 'Đổi mật khẩu thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, changePassword };
