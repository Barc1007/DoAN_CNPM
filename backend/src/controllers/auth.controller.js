const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../config/db');
const { success, error } = require('../utils/response');
const { deriveKeyFromPassword, setSession, removeSession, encryptWithKey, decrypt } = require('../utils/crypto');
const { sendOtpEmail } = require('../services/mailer');

// Lazy getter: đảm bảo đọc env SAU khi dotenv.config() đã chạy
const getGoogleClient = () => new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

const redirectGoogleFailure = (res, reason = 'google_auth_failed') => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const params = new URLSearchParams({ error: reason });
  return res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const hashEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;
  return crypto.createHash('sha256').update(normalizedEmail).digest('hex');
};

const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));

const createAccountSecret = () => crypto.randomBytes(32).toString('hex');

const getAuthProviderAfterGoogleLink = (currentProvider) => {
  if (currentProvider === 'local' || currentProvider === 'both') return 'both';
  return 'google';
};

const signUserToken = (user) => jwt.sign(
  { user_id: user.user_id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const buildUserData = (user, token, fallback = {}) => {
  const decryptedFullName = decrypt(user.full_name, user.user_id);
  const decryptedEmail = decrypt(user.email, user.user_id);

  return {
    user_id: user.user_id,
    username: user.username,
    email: looksLikeEmail(decryptedEmail) ? decryptedEmail : fallback.email,
    full_name: decryptedFullName || fallback.full_name,
    auth_provider: user.auth_provider,
    token,
  };
};

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
    const normalizedEmail = normalizeEmail(email);
    const emailLookup = hashEmail(normalizedEmail);

    if (!full_name || !username || !normalizedEmail || !password) {
      return error(res, 'Vui lòng điền đầy đủ thông tin', 400);
    }

    const [existing] = await pool.query(
      'SELECT user_id FROM users WHERE username = ? OR email_lookup = ?',
      [username, emailLookup]
    );

    if (existing.length > 0) {
      return error(res, 'Tên đăng nhập hoặc email đã tồn tại', 409);
    }

    const accountSecret = createAccountSecret();
    const { encryptionKey } = deriveKeyFromPassword(accountSecret);
    const { authenticationSecret } = deriveKeyFromPassword(password);
    const hashedPassword = await bcrypt.hash(authenticationSecret, SALT_ROUNDS);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, username, email, email_lookup, password, auth_provider, google_secret)
       VALUES (?, ?, ?, ?, ?, 'local', ?)`,
      [
        encryptWithKey(full_name, encryptionKey),
        username,
        encryptWithKey(normalizedEmail, encryptionKey),
        emailLookup,
        hashedPassword,
        accountSecret,
      ]
    );

    setSession(result.insertId, { key: encryptionKey, password: accountSecret });
    await ensureDefaultCategories();

    const newUser = {
      user_id: result.insertId,
      username,
      email: normalizedEmail,
      full_name: full_name,
      auth_provider: 'local',
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

    if (!user.password) {
      return error(res, 'Tài khoản này đăng nhập bằng Google. Vui lòng dùng Google để đăng nhập.', 401);
    }

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

    let currentUser = user;

    setSession(user.user_id, { key: encryptionKey, password });

    const decryptedEmailWithPassword = decrypt(user.email, user.user_id);
    const canDecryptWithPassword = looksLikeEmail(decryptedEmailWithPassword);
    let accountSecret = user.google_secret;

    if (!accountSecret) {
      accountSecret = createAccountSecret();
    }

    const { encryptionKey: accountKey } = deriveKeyFromPassword(accountSecret);

    setSession(user.user_id, { key: accountKey, password: accountSecret });
    const decryptedEmailWithAccountKey = decrypt(user.email, user.user_id);
    const needsReEncrypt = canDecryptWithPassword && !looksLikeEmail(decryptedEmailWithAccountKey);

    if (needsReEncrypt) {
      setSession(user.user_id, { key: encryptionKey, password });
      await reEncryptUserData(user.user_id, accountKey);
      setSession(user.user_id, { key: accountKey, password: accountSecret });
    }

    const nextEmailLookup = canDecryptWithPassword
      ? hashEmail(decryptedEmailWithPassword)
      : user.email_lookup;

    if (!user.google_secret || !user.email_lookup || needsReEncrypt) {
      await pool.query(
        'UPDATE users SET google_secret = ?, email_lookup = COALESCE(email_lookup, ?) WHERE user_id = ?',
        [accountSecret, nextEmailLookup, user.user_id]
      );

      const [updatedRows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [user.user_id]);
      currentUser = updatedRows[0];
    }

    const token = signUserToken(currentUser);

    await ensureDefaultCategories();

    return success(res, buildUserData(currentUser, token), 'Đăng nhập thành công');
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
      'SELECT password, email, google_secret FROM users WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return error(res, 'Không tìm thấy người dùng', 404);
    }

    if (!rows[0].password) {
      return error(res, 'Tài khoản Google không có mật khẩu để thay đổi', 400);
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

    const hashedPassword = await bcrypt.hash(newAuthenticationSecret, SALT_ROUNDS);
    let sessionKey;
    let sessionPassword;

    if (rows[0].google_secret) {
      const { encryptionKey: accountKey } = deriveKeyFromPassword(rows[0].google_secret);
      sessionKey = accountKey;
      sessionPassword = rows[0].google_secret;
    } else {
      setSession(userId, { key: currentEncryptionKey, password: current_password });

      const decryptedEmail = decrypt(rows[0].email, userId);
      const accountSecret = createAccountSecret();
      const { encryptionKey: accountKey } = deriveKeyFromPassword(accountSecret);

      await reEncryptUserData(userId, accountKey);
      await pool.query(
        'UPDATE users SET google_secret = ?, email_lookup = COALESCE(email_lookup, ?) WHERE user_id = ?',
        [accountSecret, looksLikeEmail(decryptedEmail) ? hashEmail(decryptedEmail) : null, userId]
      );

      sessionKey = accountKey;
      sessionPassword = accountSecret;
    }

    await pool.query(
      'UPDATE users SET password = ? WHERE user_id = ?',
      [hashedPassword, userId]
    );

    setSession(userId, { key: sessionKey, password: sessionPassword });

    return success(res, null, 'Đổi mật khẩu thành công');
  } catch (err) {
    next(err);
  }
};


const googleAuth = (req, res) => {
  const client = getGoogleClient();
  const scopes = ['openid', 'email', 'profile'];
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'select_account',
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
  });
  res.redirect(authUrl);
};

const googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (!code) {
      return redirectGoogleFailure(res, 'missing_google_code');
    }

    const client = getGoogleClient();

    // Đổi authorization code lấy tokens (phải truyền redirect_uri tường minh)
    const { tokens } = await client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    });
    client.setCredentials(tokens);

    // Xác minh ID token để lấy thông tin người dùng
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const {
      sub: googleId,
      email,
      email_verified: emailVerified,
      name: fullName,
      picture,
    } = payload;
    const normalizedEmail = normalizeEmail(email);
    const emailLookup = hashEmail(normalizedEmail);

    if (!googleId || !normalizedEmail || emailVerified === false) {
      return redirectGoogleFailure(res, 'invalid_google_profile');
    }

    const [existingByGoogleId] = await pool.query(
      'SELECT * FROM users WHERE google_id = ?',
      [googleId]
    );

    let user;
    let encryptionKey;

    if (existingByGoogleId.length > 0) {
      user = existingByGoogleId[0];

      if (!user.google_secret) {
        const accountSecret = createAccountSecret();
        await pool.query(
          'UPDATE users SET google_secret = ?, email_lookup = COALESCE(email_lookup, ?) WHERE user_id = ?',
          [accountSecret, emailLookup, user.user_id]
        );
        user.google_secret = accountSecret;
        user.email_lookup = user.email_lookup || emailLookup;
      }
    } else {
      const [existingByEmail] = await pool.query(
        'SELECT * FROM users WHERE email_lookup = ?',
        [emailLookup]
      );

      if (existingByEmail.length > 0) {
        user = existingByEmail[0];

        if (user.google_id && user.google_id !== googleId) {
          return redirectGoogleFailure(res, 'email_linked_to_other_google');
        }

        const accountSecret = user.google_secret || createAccountSecret();
        await pool.query(
          `UPDATE users
           SET google_id = ?,
               google_secret = ?,
               auth_provider = ?
           WHERE user_id = ?`,
          [
            googleId,
            accountSecret,
            getAuthProviderAfterGoogleLink(user.auth_provider),
            user.user_id,
          ]
        );

        const [updatedRows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [user.user_id]);
        user = updatedRows[0];
      } else {
        const accountSecret = createAccountSecret();
        const { encryptionKey: accountKey } = deriveKeyFromPassword(accountSecret);

        const baseUsername = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user';
        let username = baseUsername;
        let suffix = 1;
        while (true) {
          const [taken] = await pool.query('SELECT user_id FROM users WHERE username = ?', [username]);
          if (taken.length === 0) break;
          username = `${baseUsername}${suffix++}`;
        }

        const [result] = await pool.query(
          `INSERT INTO users (full_name, username, email, email_lookup, password, google_id, auth_provider, google_secret)
           VALUES (?, ?, ?, ?, NULL, ?, 'google', ?)`,
          [
            encryptWithKey(fullName || normalizedEmail, accountKey),
            username,
            encryptWithKey(normalizedEmail, accountKey),
            emailLookup,
            googleId,
            accountSecret,
          ]
        );

        const [newUser] = await pool.query('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
        user = newUser[0];

        await ensureDefaultCategories();
      }
    }

    const { encryptionKey: accountKey } = deriveKeyFromPassword(user.google_secret);
    encryptionKey = accountKey;

    setSession(user.user_id, { key: encryptionKey, password: user.google_secret });

    if (!user.email_lookup) {
      await pool.query('UPDATE users SET email_lookup = ? WHERE user_id = ?', [emailLookup, user.user_id]);
      user.email_lookup = emailLookup;
    }

    const token = signUserToken(user);
    const userData = buildUserData(user, token, {
      email: normalizedEmail,
      full_name: fullName || normalizedEmail,
      picture,
    });

    const params = new URLSearchParams({ token: JSON.stringify(userData) });
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?${params.toString()}`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    return redirectGoogleFailure(res);
  }
};

// ─── Password Reset ──────────────────────────────────────────────────────────

const OTP_VALID_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RATE_LIMIT_SECONDS = 60;
const RESET_TOKEN_EXPIRES_MINUTES = 10;

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const generateOtp = () => {
  let otp = '';
  for (let i = 0; i < 6; i++) otp += Math.floor(Math.random() * 10);
  return otp;
};

const signResetToken = (userId) =>
  jwt.sign({ user_id: userId, purpose: 'password_reset' }, process.env.JWT_SECRET, {
    expiresIn: `${RESET_TOKEN_EXPIRES_MINUTES}m`,
  });

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !looksLikeEmail(normalizedEmail)) {
      return error(res, 'Email khong hop le', 400);
    }

    const emailLookup = hashEmail(normalizedEmail);
    const [rows] = await pool.query(
      // FIX 1: Lấy thêm google_secret để giải mã full_name
      'SELECT user_id, full_name, google_secret FROM users WHERE email_lookup = ?',
      [emailLookup]
    );

    if (rows.length === 0) {
      return success(res, null, 'Neu email ton tai, chung toi da gui ma xac minh');
    }

    const user = rows[0];
    const userId = user.user_id;

    // FIX 2: Dùng rate-limit đúng — chặn nếu yêu cầu trước đó trong vòng 60 giây
    const [recent] = await pool.query(
      `SELECT reset_id FROM password_resets
       WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    if (recent.length > 0) {
      return error(res, 'Vui long cho 60 giay truoc khi yeu cau gui lai ma', 429);
    }

    // Xoa OTP cu
    await pool.query('DELETE FROM password_resets WHERE user_id = ?', [userId]);

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_VALID_MINUTES * 60 * 1000);

    await pool.query(
      `INSERT INTO password_resets (user_id, otp_hash, expires_at)
       VALUES (?, ?, ?)`,
      [userId, otpHash, expiresAt]
    );

    // FIX 1 (tiếp): Giải mã full_name bằng session tạm dùng google_secret
    let fullName = 'ban';
    if (user.google_secret) {
      const { encryptionKey } = deriveKeyFromPassword(user.google_secret);
      setSession(userId, { key: encryptionKey, password: user.google_secret });
      const decrypted = decrypt(user.full_name, userId);
      removeSession(userId);
      fullName = decrypted || 'ban';
    }

    await sendOtpEmail({ to: normalizedEmail, otp, fullName });

    return success(res, { email: normalizedEmail }, 'Da gui ma xac minh');
  } catch (err) {
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !looksLikeEmail(normalizedEmail)) {
      return error(res, 'Email khong hop le', 400);
    }

    if (!otp || !/^\d{6}$/.test(String(otp))) {
      return error(res, 'Ma xac minh phai la 6 chu so', 400);
    }

    const emailLookup = hashEmail(normalizedEmail);
    const [rows] = await pool.query(
      `SELECT pr.reset_id, pr.otp_hash, pr.expires_at, pr.attempts,
              u.user_id, u.full_name
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.user_id
       WHERE u.email_lookup = ? AND pr.consumed = 0
       ORDER BY pr.created_at DESC LIMIT 1`,
      [emailLookup]
    );

    if (rows.length === 0) {
      return error(res, 'Ma xac minh khong hop le hoac da het han', 401);
    }

    const record = rows[0];

    if (new Date(record.expires_at) < new Date()) {
      await pool.query('DELETE FROM password_resets WHERE reset_id = ?', [record.reset_id]);
      return error(res, 'Ma xac minh da het han. Vui long gui lai.', 401);
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      await pool.query('DELETE FROM password_resets WHERE reset_id = ?', [record.reset_id]);
      return error(res, 'Qua nhieu lan nhap sai. Vui long gui lai ma moi.', 429);
    }

    const inputHash = hashOtp(String(otp));
    if (inputHash !== record.otp_hash) {
      await pool.query(
        'UPDATE password_resets SET attempts = attempts + 1 WHERE reset_id = ?',
        [record.reset_id]
      );
      const remaining = OTP_MAX_ATTEMPTS - record.attempts - 1;
      return error(res, `Ma xac minh khong dung. Con ${remaining} lan thu.`, 401);
    }

    // FIX 3: Xoá OTP ngay sau khi xác thực thành công để ngăn replay attack
    await pool.query('DELETE FROM password_resets WHERE reset_id = ?', [record.reset_id]);

    // OTP dung — cap reset token
    const resetToken = signResetToken(record.user_id);

    return success(res, { reset_token: resetToken }, 'Xac minh thanh cong');
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { reset_token, new_password } = req.body;

    if (!reset_token) {
      return error(res, 'Token khong hop le', 400);
    }

    if (!new_password || new_password.length < 6) {
      return error(res, 'Mat khau moi phai co it nhat 6 ky tu', 400);
    }

    let decoded;
    try {
      decoded = jwt.verify(reset_token, process.env.JWT_SECRET);
    } catch {
      return error(res, 'Token da het han hoac khong hop le', 401);
    }

    if (decoded.purpose !== 'password_reset') {
      return error(res, 'Token khong hop le cho hanh dong nay', 401);
    }

    const userId = decoded.user_id;

    const [rows] = await pool.query(
      'SELECT password, google_secret FROM users WHERE user_id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return error(res, 'Khong tim thay nguoi dung', 404);
    }

    if (!rows[0].password) {
      return error(res, 'Tai khoan Google khong co mat khau de dat lai', 400);
    }

    const { authenticationSecret } = deriveKeyFromPassword(new_password);
    const hashedPassword = await bcrypt.hash(authenticationSecret, SALT_ROUNDS);

    await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [
      hashedPassword,
      userId,
    ]);

    // Xoa OTP da su dung
    await pool.query('DELETE FROM password_resets WHERE user_id = ?', [userId]);

    return success(res, null, 'Dat lai mat khau thanh cong');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  changePassword,
  googleAuth,
  googleCallback,
  forgotPassword,
  verifyOtp,
  resetPassword,
};

