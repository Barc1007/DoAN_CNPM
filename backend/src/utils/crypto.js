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
 * Derive a 32-byte encryption key from password.
 * Returns FULL sha256 (32 bytes) as encryptionKey, no splitting.
 */
function deriveKeyFromPassword(password) {
  const encryptionKey = crypto.createHash('sha256').update(password).digest();
  // passwordHash is first 16 bytes as hex string for verification
  const passwordHash = encryptionKey.slice(0, 16).toString('hex');
  return { passwordHash, encryptionKey };
}

function getSession(userId) {
  return userSessions.get(userId);
}

function setSession(userId, session) {
  userSessions.set(userId, session);
}

function removeSession(userId) {
  userSessions.delete(userId);
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

function encrypt(text, userId) {
  if (text === null || text === undefined || text === '') return '';
  
  const key = getGlobalKey();
  
  if (!key || key.length !== 32) {
    throw new Error('Invalid encryption key length: expected 32 bytes, got ' + (key ? key.length : 'null'));
  }
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(ciphertext, userId) {
  if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;
  
  const key = getGlobalKey();
  
  if (!key || key.length !== 32) return ciphertext;
  
  const newResult = decryptNewFormat(ciphertext, key);
  if (newResult !== null) return newResult;
  
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
  encrypt,
  decrypt,
  encryptFields,
  decryptFields
};