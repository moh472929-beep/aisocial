require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('../src/db/connection');
const User = require('../src/models/User');

async function run() {
  const email = process.env.UPDATE_EMAIL || 'theblackhook9112@gmail.com';
  const newPassword = process.env.UPDATE_PASSWORD || 'Moh@9112!';
  if (!email || !newPassword) {
    console.error('Missing email or new password');
    process.exit(1);
  }
  try {
    await connectDB();
    const userModel = new User();
    await userModel.initialize();
    const user = await userModel.findByEmail(email.toLowerCase());
    if (!user) {
      console.error('User not found for email:', email);
      process.exit(2);
    }
    const hash = await bcrypt.hash(newPassword, 10);
    const ok = await userModel.update(user.id, { passwordHash: hash });
    if (!ok) {
      console.error('Password update failed');
      process.exit(3);
    }
    console.log('Password updated successfully for', email);
    process.exit(0);
  } catch (err) {
    console.error('Update error:', err.message || err);
    process.exit(4);
  }
}

run();