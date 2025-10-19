require('dotenv').config();
const express = require('express');
const axios = require('axios');
const dbInit = require('../src/db/init.js');

async function startServer() {
  const app = express();
  app.use(express.json());
  // Mount auth router
  const authRouter = require('../src/api/auth.js');
  app.use('/api/auth', authRouter);
  
  // Initialize DB (will fallback to memory if no Mongo URI)
  await dbInit.initDB();

  return new Promise((resolve, reject) => {
    const server = app.listen(10002, () => resolve(server));
    server.on('error', reject);
  });
}

async function runTests() {
  const server = await startServer();
  const base = 'http://localhost:10002/api/auth';

  const testUser = {
    fullName: 'Manual Test User',
    email: 'manual_test@example.com',
    username: 'manualtestuser',
    password: 'TestPass123',
  };

  try {
    // Signup success
    const signupRes = await axios.post(`${base}/signup`, testUser);
    console.log('Signup status:', signupRes.status, 'success:', signupRes.data.success);
    if (!signupRes.data.success) throw new Error('Signup failed');
    const signupUser = signupRes.data.data?.user;
    if (!signupUser) throw new Error('Signup response missing user');
    if (signupUser.passwordHash) throw new Error('passwordHash leaked in signup response');

    // Duplicate signup should fail (409 or 400)
    let duplicateStatus;
    try {
      await axios.post(`${base}/signup`, testUser);
    } catch (err) {
      duplicateStatus = err.response ? err.response.status : 0;
      console.log('Duplicate signup status:', duplicateStatus);
      if (![400,409].includes(duplicateStatus)) throw new Error('Unexpected status for duplicate signup: ' + duplicateStatus);
    }

    // Login by email
    const loginEmailRes = await axios.post(`${base}/login`, { email: testUser.email, password: testUser.password });
    console.log('Login(email) status:', loginEmailRes.status, 'success:', loginEmailRes.data.success);
    if (!loginEmailRes.data.success) throw new Error('Login by email failed');
    const loginUserByEmail = loginEmailRes.data.data?.user;
    if (!loginUserByEmail) throw new Error('Login(email) response missing user');
    if (loginEmailRes.data.data?.user?.passwordHash) throw new Error('passwordHash leaked in login(email) response');
    if (!loginEmailRes.data.data?.accessToken) throw new Error('accessToken missing in login(email) response');

    // Login by username
    const loginUserRes = await axios.post(`${base}/login`, { username: testUser.username, password: testUser.password });
    console.log('Login(username) status:', loginUserRes.status, 'success:', loginUserRes.data.success);
    if (!loginUserRes.data.success) throw new Error('Login by username failed');
    if (loginUserRes.data.data?.user?.passwordHash) throw new Error('passwordHash leaked in login(username) response');

    // Login with wrong password should fail (401)
    let wrongStatus;
    try {
      await axios.post(`${base}/login`, { email: testUser.email, password: 'WrongPass123' });
    } catch (err) {
      wrongStatus = err.response ? err.response.status : 0;
      console.log('Login(wrong) status:', wrongStatus);
      if (wrongStatus !== 401) throw new Error('Unexpected status for wrong password: ' + wrongStatus);
    }

    // All tests passed
    console.log('\nAll manual auth tests passed ✅');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('\nManual auth test failed:', err.message);
    server.close(() => process.exit(1));
  }
}

runTests().catch(err => {
  console.error('Unexpected test runner error:', err);
  process.exit(1);
});