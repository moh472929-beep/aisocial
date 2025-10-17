/**
 * Simple in-memory cache utility
 * For production, consider using Redis
 */
class Cache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live for each key
  }

  /**
   * Set a value in cache with optional TTL (in seconds)
   */
  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value);

    if (ttlSeconds > 0) {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      this.ttl.set(key, expiresAt);

      // Auto-delete after TTL
      setTimeout(() => {
        this.delete(key);
      }, ttlSeconds * 1000);
    }

    return true;
  }

  /**
   * Get a value from cache
   */
  get(key) {
    // Check if key has expired
    if (this.ttl.has(key)) {
      const expiresAt = this.ttl.get(key);
      if (Date.now() > expiresAt) {
        this.delete(key);
        return null;
      }
    }

    return this.cache.get(key) || null;
  }

  /**
   * Check if key exists in cache
   */
  has(key) {
    if (this.ttl.has(key)) {
      const expiresAt = this.ttl.get(key);
      if (Date.now() > expiresAt) {
        this.delete(key);
        return false;
      }
    }

    return this.cache.has(key);
  }

  /**
   * Delete a key from cache
   */
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
    return true;
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.ttl.clear();
    return true;
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get or set pattern - useful for caching function results
   */
  async getOrSet(key, fetchFunction, ttlSeconds = 300) {
    // Check if value exists in cache
    if (this.has(key)) {
      return this.get(key);
    }

    // Fetch new value
    const value = await fetchFunction();

    // Store in cache
    this.set(key, value, ttlSeconds);

    return value;
  }

  /**
   * Delete keys matching a pattern
   */
  deletePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));

    return keysToDelete.length;
  }

  /**
   * Get all keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache statistics
   */
  stats() {
    return {
      size: this.size(),
      keys: this.keys().length,
      ttlKeys: this.ttl.size,
    };
  }
}

// Create singleton instance
const cache = new Cache();

module.exports = cache;
