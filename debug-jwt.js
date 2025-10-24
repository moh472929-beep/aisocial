const jwt = require('jsonwebtoken');

// Get JWT secret (same logic as server)
function getJWTSecret() {
  return process.env.JWT_SECRET || process.env.SESSION_SECRET || 'facebook-ai-manager-secret-key-2025';
}

// Test JWT generation and verification
const secret = getJWTSecret();
console.log('JWT Secret:', secret);

const testPayload = {
  userId: 'test-123',
  email: 'test@example.com',
  role: 'premium',
  subscription: 'premium'
};

console.log('\nGenerating JWT with payload:', testPayload);

const token = jwt.sign(testPayload, secret, { 
  expiresIn: '15m',
  algorithm: 'HS256',
  audience: process.env.JWT_AUDIENCE || 'facebook-ai-manager',
  issuer: process.env.JWT_ISSUER || 'facebook-ai-manager-auth'
});

console.log('\nGenerated token:', token);

try {
  const decoded = jwt.verify(token, secret, {
    algorithms: ['HS256'],
    audience: process.env.JWT_AUDIENCE || 'facebook-ai-manager',
    issuer: process.env.JWT_ISSUER || 'facebook-ai-manager-auth'
  });
  console.log('\nDecoded payload:', decoded);
} catch (error) {
  console.error('\nDecoding error:', error.message);
}