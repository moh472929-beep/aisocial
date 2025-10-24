const { MongoClient } = require('mongodb');

// Database connection
let db = null;

async function initializeDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/facebook-ai-manager';
    const client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db();
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('📝 Using in-memory models (data will not persist)');
    return false;
  }
}

async function createPremiumUser() {
  const testUser = {
    fullName: 'Premium Test User',
    username: 'premiumtest',
    email: 'premium-test@example.com',
    password: 'TestPassword123!',
    role: 'premium',
    subscription: 'premium',
    isEmailVerified: true,
    aiEnabled: true,
    postsRemaining: 999
  };

  try {
    // Initialize database
    const dbConnected = await initializeDatabase();
    if (!dbConnected) {
      console.log('❌ Cannot create user without database connection');
      return;
    }

    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: testUser.email });
    if (existingUser) {
      console.log('📝 User already exists, updating to premium...');
      
      // Update existing user to premium
      const updateResult = await usersCollection.updateOne(
        { email: testUser.email },
        {
          $set: {
            role: 'premium',
            subscription: 'premium',
            aiEnabled: true,
            postsRemaining: 999,
            updatedAt: new Date()
          }
        }
      );

      if (updateResult.modifiedCount > 0) {
        console.log('✅ User updated to premium successfully');
        
        // Fetch and display updated user
        const updatedUser = await usersCollection.findOne({ email: testUser.email });
        console.log('📋 Updated user details:');
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   Role: ${updatedUser.role}`);
        console.log(`   Subscription: ${updatedUser.subscription}`);
        console.log(`   AI Enabled: ${updatedUser.aiEnabled}`);
        console.log(`   Posts Remaining: ${updatedUser.postsRemaining}`);
      } else {
        console.log('❌ Failed to update user');
      }
    } else {
      console.log('📝 Creating new premium user...');
      
      // Create new user with a simple password hash (for testing only)
      const newUser = {
        ...testUser,
        passwordHash: '$2b$10$example.hash.for.testing.purposes.only', // Placeholder hash
        createdAt: new Date(),
        updatedAt: new Date(),
        aiMemory: {
          preferences: {},
          interactionHistory: [],
          learningData: {},
        },
        facebookPages: [],
        postsHistory: [],
        engagementMetrics: {},
      };

      delete newUser.password; // Remove plain password

      const insertResult = await usersCollection.insertOne(newUser);
      
      if (insertResult.insertedId) {
        console.log('✅ Premium user created successfully');
        console.log('📋 User details:');
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Username: ${newUser.username}`);
        console.log(`   Role: ${newUser.role}`);
        console.log(`   Subscription: ${newUser.subscription}`);
        console.log(`   AI Enabled: ${newUser.aiEnabled}`);
        console.log(`   Posts Remaining: ${newUser.postsRemaining}`);
      } else {
        console.log('❌ Failed to create user');
      }
    }

  } catch (error) {
    console.error('❌ Error creating/updating premium user:', error);
  }
}

// Run the script
createPremiumUser().then(() => {
  console.log('🏁 Script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});