const { ObjectId } = require('mongodb');
const dbConnection = require('../db/connection');

class User {
  constructor() {
    this.collection = null;
  }

  async initialize() {
    const db = dbConnection.getDb();
    this.collection = db.collection('users');
    // Create indexes
    await this.collection.createIndex({ email: 1 }, { unique: true });
    await this.collection.createIndex({ username: 1 }, { unique: true });
  }

  async create(userData) {
    try {
      const user = {
        ...userData,
        _id: new ObjectId(),
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

      const result = await this.collection.insertOne(user);
      return { ...user, id: result.insertedId.toString() };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('User with this email or username already exists');
      }
      throw error;
    }
  }

  async findById(id) {
    const user = await this.collection.findOne({ _id: new ObjectId(id) });
    if (user) {
      user.id = user._id.toString();
      delete user._id;
    }
    return user;
  }

  async findByEmail(email) {
    const user = await this.collection.findOne({ email });
    if (user) {
      user.id = user._id.toString();
      delete user._id;
    }
    return user;
  }

  async findByUsername(username) {
    const user = await this.collection.findOne({ username });
    if (user) {
      user.id = user._id.toString();
      delete user._id;
    }
    return user;
  }

  async update(id, updateData) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async updateAIMemory(id, aiMemory) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          aiMemory,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async addInteractionToHistory(id, interaction) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          'aiMemory.interactionHistory': {
            ...interaction,
            timestamp: new Date(),
          },
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async addPostToHistory(id, post) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          postsHistory: {
            ...post,
            timestamp: new Date(),
          },
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async updateEngagementMetrics(id, metrics) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          engagementMetrics: metrics,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async addFacebookPage(id, page) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          facebookPages: page,
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async removeFacebookPage(id, pageId) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: {
          facebookPages: { pageId: pageId },
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  // Email verification helpers
  async findByEmailVerificationToken(token) {
    const user = await this.collection.findOne({ emailVerificationToken: token });
    if (user) {
      user.id = user._id.toString();
      delete user._id;
    }
    return user;
  }

  async markEmailVerified(id) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: { isEmailVerified: true, updatedAt: new Date() },
        $unset: { emailVerificationToken: '' },
      }
    );
    return result.modifiedCount > 0;
  }

  // Refresh token management (store hashed tokens)
  async addRefreshToken(id, hashedToken) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { refreshTokens: hashedToken },
        $set: { updatedAt: new Date() },
      }
    );
    return result.modifiedCount > 0;
  }

  async removeRefreshToken(id, hashedToken) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: { refreshTokens: hashedToken },
        $set: { updatedAt: new Date() },
      }
    );
    return result.modifiedCount > 0;
  }
}

module.exports = User;
