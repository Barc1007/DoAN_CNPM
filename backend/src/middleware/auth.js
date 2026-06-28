const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');
const pool = require('../config/db');
const { deriveKeyFromPassword, getSession, setSession } = require('../utils/crypto');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Không có token xác thực', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (!getSession(decoded.user_id)) {
      const [rows] = await pool.query(
        'SELECT google_secret FROM users WHERE user_id = ?',
        [decoded.user_id]
      );

      if (rows[0]?.google_secret) {
        const { encryptionKey } = deriveKeyFromPassword(rows[0].google_secret);
        setSession(decoded.user_id, { key: encryptionKey, password: rows[0].google_secret });
      }
    }

    next();
  } catch (err) {
    return error(res, 'Token không hợp lệ hoặc đã hết hạn', 401);
  }
};

module.exports = authenticate;
