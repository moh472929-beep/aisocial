const { ObjectId } = require('mongodb');
const dbConnection = require('../db/connection');

class UserData {
  constructor() {
    this.collection = null;
  }

  async initialize() {
    const db = dbConnection.getDb();
    this.collection = db.collection('user_data');
    // Create indexes
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ createdAt: 1 });
  }

  async create(userData) {
    const data = {
      ...userData,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(data);
    return { ...data, id: result.insertedId.toString() };
  }

  async findByUserId(userId) {
    const data = await this.collection.findOne({ userId });
    if (data) {
      data.id = data._id.toString();
      delete data._id;
    }
    return data;
  }

  async updateByUserId(userId, updateData) {
    const result = await this.collection.updateOne(
      { userId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }

  async addPostHistory(userId, post) {
    const result = await this.collection.updateOne(
      { userId },
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
      },
      { upsert: true }
    );
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }

  async addInteractionData(userId, interaction) {
    const result = await this.collection.updateOne(
      { userId },
      {
        $push: {
          interactionData: {
            ...interaction,
            timestamp: new Date(),
          },
        },
        $set: {
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }

  async updateAIMemory(userId, aiMemory) {
    const result = await this.collection.updateOne(
      { userId },
      {
        $set: {
          aiMemory,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }
}

module.exports = UserData;
