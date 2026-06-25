const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Store session data per user: { key: Buffer, password: string }
const userSessions = new Map();

// Fallback key when no session (for demo / server restart)
function getGlobalKey() {
  if (!getGlobalKey._cached) {
    getGlobalKey._cached = true;
    try {
      const envKey = process.env.ENCRYPTION_KEY;
      if (envKey) {
        let key = Buffer.from(envKey, 'hex');
        if (key.length !== 32) {
          key = crypto.createHash('sha256').update(envKey).digest();
        }
        getGlobalKey._value = key;
      } else {
        getGlobalKey._value = crypto.createHash('sha256').update('studentmoney-fallback-key').digest();
      }
    } catch {
      getGlobalKey._value = crypto.createHash('sha256').update('studentmoney-fallback-key').digest();
    }
  }
  return getGlobalKey._value;
}
getGlobalKey._cached = false;
getGlobalKey._value = null;

/**
 * Derive separate authentication and encryption materials from one password.
 * The authentication secret is bcrypt-hashed in DB; the encryption key stays in memory.
 */
function deriveKeyFromPassword(password) {
  const digest = crypto.createHash('sha512').update(password).digest();
  const authenticationSecret = digest.slice(0, 32).toString('hex');
  const encryptionKey = digest.slice(32, 64);
  return { passwordHash: authenticationSecret, authenticationSecret, encryptionKey };
}

function getSession(userId) {
  return userSessions.get(String(userId));
}

function setSession(userId, session) {
  userSessions.set(String(userId), session);
}

function removeSession(userId) {
  userSessions.delete(String(userId));
}

function decryptNewFormat(ciphertext, key) {
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}

function decryptOldFormat(ciphertext, password) {
  try {
    const ciphertextBytes = Buffer.from(ciphertext, 'base64');
    if (ciphertextBytes.length < 16) return null;
    
    if (ciphertextBytes.toString('ascii', 0, 8) !== 'Salted__') return null;
    
    const salt = ciphertextBytes.slice(8, 16);
    const encrypted = ciphertextBytes.slice(16);
    
    const d1 = crypto.createHash('md5').update(password).update(salt).digest();
    const d2 = crypto.createHash('md5').update(d1).update(password).update(salt).digest();
    const d3 = crypto.createHash('md5').update(d2).update(password).update(salt).digest();
    
    const key = Buffer.concat([d1, d2]);
    const iv = d3;
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    const padding = decrypted[decrypted.length - 1];
    decrypted = decrypted.slice(0, decrypted.length - padding);
    
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}

function encryptWithKey(text, key) {
  if (text === null || text === undefined || text === '') return '';

  if (!key || key.length !== 32) {
    throw new Error('Invalid encryption key length: expected 32 bytes, got ' + (key ? key.length : 'null'));
  }
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function getUserKey(userId) {
  const session = getSession(userId);
  return session && session.key ? session.key : null;
}

function encrypt(text, userId) {
  if (text === null || text === undefined || text === '') return '';

  if (userId) {
    const key = getUserKey(userId);
    if (!key) {
      throw new Error('Phiên mã hóa đã hết hạn, vui lòng đăng nhập lại');
    }
    return encryptWithKey(text, key);
  }

  return encryptWithKey(text, getGlobalKey());
}

function decrypt(ciphertext, userId) {
  if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;

  const session = getSession(userId);
  if (session && session.key) {
    const sessionResult = decryptNewFormat(ciphertext, session.key);
    if (sessionResult !== null) return sessionResult;

    if (session.password) {
      const oldResult = decryptOldFormat(ciphertext, session.password);
      if (oldResult !== null) return oldResult;
    }
  }

  const globalResult = decryptNewFormat(ciphertext, getGlobalKey());
  if (globalResult !== null) return globalResult;
  
  return ciphertext;
}

function encryptFields(obj, fields, userId) {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] !== undefined) {
      result[field] = encrypt(result[field], userId);
    }
  }
  return result;
}

function decryptFields(obj, fields, userId) {
  const result = { ...obj };
  for (const field of fields) {
    if (result[field] !== undefined) {
      result[field] = decrypt(result[field], userId);
    }
  }
  return result;
}

module.exports = {
  deriveKeyFromPassword,
  getSession,
  setSession,
  removeSession,
  encryptWithKey,
  encrypt,
  decrypt,
  encryptFields,
  decryptFields
};
