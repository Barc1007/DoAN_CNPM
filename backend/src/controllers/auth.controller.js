const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { deriveKeyFromPassword, setSession, decrypt } = require('../Utils/crypto');

const SALT_ROUNDS = 10;

const register = async (req, res, next) => {
  try {
    const { full_name, username, email, password } = req.body;

    if (!full_name || !username || !email || !password) {
      return error(res, 'Vui lòng điền đầy đủ thông tin', 400);
    }

    const [existing] = await pool.query(
      'SELECT user_id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return error(res, 'Tên đăng nhập hoặc email đã tồn tại', 409);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query(
      'INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)',
      [encrypt(full_name), username, encrypt(email), hashedPassword]
    );

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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, 'Tên đăng nhập hoặc mật khẩu không đúng', 401);
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Derive encryption key from password (full 32 bytes) and store session
    const { encryptionKey } = deriveKeyFromPassword(password);
    setSession(user.user_id, { key: encryptionKey, password });

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

    const isMatch = await bcrypt.compare(current_password, rows[0].password);
    if (!isMatch) {
      return error(res, 'Mật khẩu hiện tại không đúng', 401);
    }

    const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);
    await pool.query(
      'UPDATE users SET password = ? WHERE user_id = ?',
      [hashedPassword, userId]
    );

    // Update session with new password
    const { encryptionKey } = deriveKeyFromPassword(new_password);
    setSession(userId, { key: encryptionKey, password: new_password });

    return success(res, null, 'Đổi mật khẩu thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, changePassword };