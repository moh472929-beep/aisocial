const dbInit = require('./src/db/init');

async function updateUserToPremium() {
  try {
    console.log('🔧 Initializing database...');
    await dbInit.initDB();
    
    const userModel = dbInit.getModel('User');
    const email = 'premium-test@example.com';
    
    console.log(`🔍 Finding user with email: ${email}`);
    const user = await userModel.findByEmail(email);
    
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('📋 Current user data:', {
      id: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
      postsRemaining: user.postsRemaining,
      aiEnabled: user.aiEnabled
    });
    
    // Update user to premium
    console.log('🔄 Updating user to premium...');
    
    if (typeof userModel.updateById === 'function') {
      await userModel.updateById(user.id, {
        role: 'premium',
        subscription: 'premium',
        postsRemaining: 1000,
        aiEnabled: true
      });
    } else {
      // Fallback for different model implementations
      user.role = 'premium';
      user.subscription = 'premium';
      user.postsRemaining = 1000;
      user.aiEnabled = true;
      await user.save();
    }
    
    // Verify update
    const updatedUser = await userModel.findByEmail(email);
    console.log('✅ Updated user data:', {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      subscription: updatedUser.subscription,
      postsRemaining: updatedUser.postsRemaining,
      aiEnabled: updatedUser.aiEnabled
    });
    
    console.log('✅ User successfully updated to premium');
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    process.exit(0);
  }
}

updateUserToPremium();