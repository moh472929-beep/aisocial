import crypto from "crypto";

/**
 * Helper utility functions
 */

/**
 * Generate a random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a secure token
 */
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('base64url');
};

/**
 * Sleep/delay function
 */
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Format date to readable string
 */
const formatDate = (date, locale = 'ar-SA') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate time difference in human-readable format
 */
const timeAgo = (date, locale = 'ar') => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = {
    ar: {
      year: 'سنة',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم',
      hour: 'ساعة',
      minute: 'دقيقة',
      second: 'ثانية',
      ago: 'منذ',
    },
    en: {
      year: 'year',
      month: 'month',
      week: 'week',
      day: 'day',
      hour: 'hour',
      minute: 'minute',
      second: 'second',
      ago: 'ago',
    },
  };

  const lang = intervals[locale] || intervals.en;

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${lang.ago} ${interval} ${lang.year}`;

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${lang.ago} ${interval} ${lang.month}`;

  interval = Math.floor(seconds / 604800);
  if (interval >= 1) return `${lang.ago} ${interval} ${lang.week}`;

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${lang.ago} ${interval} ${lang.day}`;

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${lang.ago} ${interval} ${lang.hour}`;

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${lang.ago} ${interval} ${lang.minute}`;

  return `${lang.ago} ${Math.floor(seconds)} ${lang.second}`;
};

/**
 * Sanitize user input
 */
const sanitizeInput = input => {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Truncate text to specified length
 */
const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Calculate percentage
 */
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(2));
};

/**
 * Calculate engagement rate
 */
const calculateEngagementRate = (likes, comments, shares, followers) => {
  if (followers === 0) return 0;
  const totalEngagement = (likes || 0) + (comments || 0) + (shares || 0);
  return parseFloat(((totalEngagement / followers) * 100).toFixed(2));
};

/**
 * Format number with commas
 */
const formatNumber = (num, locale = 'ar-SA') => {
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Parse pagination parameters
 */
const parsePagination = (page = 1, limit = 10) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = Math.min(parseInt(limit) || 10, 100); // Max 100 items per page
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
};

/**
 * Build pagination response
 */
const buildPaginationResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Validate email format
 */
const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
const isValidUrl = url => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extract domain from URL
 */
const extractDomain = url => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
};

/**
 * Generate slug from text
 */
const generateSlug = text => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Deep clone object
 */
const deepClone = obj => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove undefined/null values from object
 */
const cleanObject = obj => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

/**
 * Retry async function with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }
};

/**
 * Chunk array into smaller arrays
 */
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Get random item from array
 */
const getRandomItem = array => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Shuffle array
 */
const shuffleArray = array => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Check if object is empty
 */
const isEmpty = obj => {
  return Object.keys(obj).length === 0;
};

/**
 * Merge objects deeply
 */
const deepMerge = (target, source) => {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
};

/**
 * Check if value is object
 */
const isObject = item => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Convert object to query string
 */
const objectToQueryString = obj => {
  return Object.entries(obj)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};

/**
 * Parse query string to object
 */
const queryStringToObject = queryString => {
  const params = new URLSearchParams(queryString);
  const obj = {};

  for (const [key, value] of params) {
    obj[key] = value;
  }

  return obj;
};

/**
 * Match a path against a pattern with wildcard support
 * Supports * for single segment wildcards and ** for multi-segment wildcards
 * 
 * @param {string} path - The path to check
 * @param {string} pattern - The pattern to match against
 * @returns {boolean} Whether the path matches the pattern
 */
const matchPath = (path, pattern) => {
  // Normalize paths
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedPattern = pattern.startsWith('/') ? pattern : `/${pattern}`;
  
  // Convert pattern to regex
  const regexPattern = normalizedPattern
    // Escape regex special characters except * and /
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    // Replace ** with a special placeholder
    .replace(/\*\*/g, '{{DOUBLE_WILDCARD}}')
    // Replace * with a regex for a single segment
    .replace(/\*/g, '[^/]*')
    // Replace the double wildcard placeholder with a regex for multiple segments
    .replace(/{{DOUBLE_WILDCARD}}/g, '.*');
  
  // Create regex with start and end anchors
  const regex = new RegExp(`^${regexPattern}$`);
  
  // Test the path against the regex
  return regex.test(normalizedPath);
};

module.exports = {
  generateRandomString,
  generateSecureToken,
  sleep,
  formatDate,
  timeAgo,
  sanitizeInput,
  truncateText,
  calculatePercentage,
  calculateEngagementRate,
  formatNumber,
  parsePagination,
  buildPaginationResponse,
  isValidEmail,
  isValidUrl,
  extractDomain,
  generateSlug,
  deepClone,
  cleanObject,
  retryWithBackoff,
  chunkArray,
  getRandomItem,
  shuffleArray,
  isEmpty,
  deepMerge,
  isObject,
  objectToQueryString,
  queryStringToObject,
  matchPath,
};
