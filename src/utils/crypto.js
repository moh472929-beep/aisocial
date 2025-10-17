const crypto = require('crypto');

// Derive 32-byte key from ENCRYPTION_KEY using SHA-256
const getKey = () => {
  const secret = process.env.ENCRYPTION_KEY || '';
  return crypto.createHash('sha256').update(secret).digest();
};

// Encrypts a token using AES-256-GCM
// Returns base64 string of iv:tag:ciphertext
const encryptToken = (plainText) => {
  if (!plainText) return '';
  const key = getKey();
  const iv = crypto.randomBytes(12); // GCM recommended IV size
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
};

// Decrypts a token stored as base64(iv|tag|ciphertext)
const decryptToken = (cipherTextBase64) => {
  if (!cipherTextBase64) return '';
  const key = getKey();
  const data = Buffer.from(cipherTextBase64, 'base64');
  const iv = data.slice(0, 12);
  const authTag = data.slice(12, 28);
  const encrypted = data.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
};

module.exports = {
  encryptToken,
  decryptToken,
};