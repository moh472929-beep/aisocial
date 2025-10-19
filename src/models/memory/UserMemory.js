const crypto = require('crypto');

class UserMemory {
  constructor() {
    this.users = new Map();
  }

  async initialize() {
    return true;
  }

  async findByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id) {
    return this.users.get(id) || null;
  }

  async create(data) {
    const id = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : crypto.randomBytes(16).toString('hex');

    const user = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      refreshTokens: [],
    };

    this.users.set(id, user);
    return user;
  }

  async addRefreshToken(userId, tokenHash, expiresAt) {
    const user = this.users.get(userId);
    if (!user) return false;
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ tokenHash, expiresAt });
    return true;
  }

  async removeRefreshToken(userId, tokenHash) {
    const user = this.users.get(userId);
    if (!user) return false;
    user.refreshTokens = (user.refreshTokens || []).filter(rt => rt.tokenHash !== tokenHash);
    return true;
  }

  async findByEmailVerificationToken(token) {
    for (const user of this.users.values()) {
      if (user.emailVerificationToken === token) return user;
    }
    return null;
  }

  async markEmailVerified(userId) {
    const user = this.users.get(userId);
    if (!user) return false;
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    this.users.set(userId, user);
    return true;
  }
}

module.exports = UserMemory;