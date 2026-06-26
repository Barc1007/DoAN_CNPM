require('dotenv').config();
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { deriveKeyFromPassword, setSession, decrypt } = require('../src/utils/crypto');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;
  return crypto.createHash('sha256').update(normalizedEmail).digest('hex');
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

async function countOwnedRows(connection, userId) {
  const tables = ['wallets', 'transactions', 'budgets', 'goals', 'notifications'];
  let total = 0;

  for (const table of tables) {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS total FROM ${table} WHERE user_id = ?`,
      [userId]
    );
    total += Number(rows[0].total);
  }

  return total;
}

async function resolveSimpleDuplicateEmailUsers(connection) {
  const [duplicateGroups] = await connection.query(
    `SELECT email_lookup
     FROM users
     WHERE email_lookup IS NOT NULL
     GROUP BY email_lookup
     HAVING COUNT(*) > 1`
  );

  for (const group of duplicateGroups) {
    const [users] = await connection.query(
      `SELECT user_id, password, google_id, google_secret, auth_provider, email_lookup
       FROM users
       WHERE email_lookup = ?
       ORDER BY user_id`,
      [group.email_lookup]
    );

    if (users.length !== 2) {
      throw new Error(`Cannot auto-merge ${users.length} users with the same email_lookup.`);
    }

    const localUser = users.find((user) => user.password && !user.google_id);
    const googleUser = users.find((user) => !user.password && user.google_id);

    if (!localUser || !googleUser) {
      throw new Error('Cannot auto-merge duplicate email users that are not a local/google pair.');
    }

    const googleOwnedRows = await countOwnedRows(connection, googleUser.user_id);
    if (googleOwnedRows > 0) {
      throw new Error('Cannot auto-merge duplicate Google user because it owns related records.');
    }

    await connection.beginTransaction();
    try {
      await connection.query('UPDATE users SET google_id = NULL WHERE user_id = ?', [googleUser.user_id]);
      await connection.query(
        `UPDATE users
         SET google_id = ?,
             google_secret = google_secret,
             auth_provider = 'both'
         WHERE user_id = ?`,
        [googleUser.google_id, localUser.user_id]
      );

      await connection.query('DELETE FROM users WHERE user_id = ?', [googleUser.user_id]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }

    console.log(`Merged Google user ${googleUser.user_id} into local user ${localUser.user_id}.`);
  }
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [columns] = await connection.query('SHOW COLUMNS FROM users');
  const fields = new Set(columns.map((column) => column.Field));
  const alters = [];

  if (!fields.has('email_lookup')) {
    alters.push('ADD COLUMN email_lookup CHAR(64) NULL AFTER email');
  }

  if (!fields.has('google_id')) {
    alters.push('ADD COLUMN google_id VARCHAR(255) NULL AFTER full_name');
  }

  if (!fields.has('auth_provider')) {
    alters.push("ADD COLUMN auth_provider ENUM('local','google','both') NOT NULL DEFAULT 'local' AFTER google_id");
  } else {
    const authProviderColumn = columns.find((column) => column.Field === 'auth_provider');
    if (authProviderColumn && !authProviderColumn.Type.includes("'both'")) {
      alters.push("MODIFY COLUMN auth_provider ENUM('local','google','both') NOT NULL DEFAULT 'local'");
    }
  }

  if (!fields.has('google_secret')) {
    alters.push('ADD COLUMN google_secret VARCHAR(255) NULL AFTER auth_provider');
  }

  const passwordColumn = columns.find((column) => column.Field === 'password');
  if (passwordColumn && passwordColumn.Null === 'NO') {
    alters.push('MODIFY COLUMN password VARCHAR(255) NULL');
  }

  if (alters.length > 0) {
    await connection.query(`ALTER TABLE users ${alters.join(', ')}`);
  }

  const [users] = await connection.query(
    'SELECT user_id, email, google_secret FROM users WHERE email_lookup IS NULL'
  );

  for (const user of users) {
    let email = user.email;

    if (user.google_secret) {
      const { encryptionKey } = deriveKeyFromPassword(user.google_secret);
      setSession(user.user_id, { key: encryptionKey, password: user.google_secret });
      email = decrypt(user.email, user.user_id);
    } else {
      email = decrypt(user.email, user.user_id);
    }

    if (looksLikeEmail(email)) {
      await connection.query(
        'UPDATE users SET email_lookup = ? WHERE user_id = ?',
        [hashEmail(email), user.user_id]
      );
    }
  }

  await resolveSimpleDuplicateEmailUsers(connection);

  const [duplicateEmails] = await connection.query(
    `SELECT email_lookup, COUNT(*) AS total
     FROM users
     WHERE email_lookup IS NOT NULL
     GROUP BY email_lookup
     HAVING total > 1`
  );
  if (duplicateEmails.length > 0) {
    throw new Error('Cannot add unique email_lookup index: duplicate email_lookup values exist.');
  }

  const [duplicateGoogleIds] = await connection.query(
    `SELECT google_id, COUNT(*) AS total
     FROM users
     WHERE google_id IS NOT NULL
     GROUP BY google_id
     HAVING total > 1`
  );
  if (duplicateGoogleIds.length > 0) {
    throw new Error('Cannot add unique google_id index: duplicate google_id values exist.');
  }

  const [emailLookupIndexes] = await connection.query(
    "SHOW INDEX FROM users WHERE Column_name = 'email_lookup' AND Non_unique = 0"
  );
  if (emailLookupIndexes.length === 0) {
    await connection.query('CREATE UNIQUE INDEX uq_users_email_lookup ON users (email_lookup)');
  }

  const [googleIdUniqueIndexes] = await connection.query(
    "SHOW INDEX FROM users WHERE Column_name = 'google_id' AND Non_unique = 0"
  );
  if (googleIdUniqueIndexes.length === 0) {
    await connection.query('CREATE UNIQUE INDEX uq_users_google_id ON users (google_id)');
  }

  const [googleIdIndexes] = await connection.query("SHOW INDEX FROM users WHERE Key_name = 'idx_users_google_id'");
  if (googleIdIndexes.length === 0) {
    try {
      await connection.query('CREATE INDEX idx_users_google_id ON users (google_id)');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    }
  }

  const [updatedColumns] = await connection.query('SHOW COLUMNS FROM users');
  for (const column of updatedColumns.filter((item) => (
    ['email_lookup', 'google_id', 'auth_provider', 'google_secret', 'password'].includes(item.Field)
  ))) {
    console.log(`${column.Field}:${column.Type}:Null=${column.Null}`);
  }

  await connection.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
