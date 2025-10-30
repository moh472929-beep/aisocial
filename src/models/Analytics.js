import { ObjectId } from 'mongodb';
import { getDb } from '../db/connection.js';

class Analytics {
  constructor() {
    this.collection = null;
  }

  async initialize() {
    const db = getDb();
    this.collection = db.collection('analytics');
    // Create indexes
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ pageId: 1 });
    await this.collection.createIndex({ period: 1 });
    await this.collection.createIndex({ createdAt: -1 });
  }

  async create(analyticsData) {
    const data = {
      ...analyticsData,
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

  async findByUserIdAndPageId(userId, pageId) {
    const data = await this.collection.findOne({ userId, pageId });
    if (data) {
      data.id = data._id.toString();
      delete data._id;
    }
    return data;
  }

  async findByUserIdAndPeriod(userId, period) {
    const data = await this.collection.findOne({ userId, period });
    if (data) {
      data.id = data._id.toString();
      delete data._id;
    }
    return data;
  }

  async updateByUserIdAndPageId(userId, pageId, updateData) {
    const result = await this.collection.updateOne(
      { userId, pageId },
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

  async addTopPost(userId, pageId, post) {
    const result = await this.collection.updateOne(
      { userId, pageId },
      {
        $push: {
          topPosts: {
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

  async updateEngagementRate(userId, pageId, engagementRate) {
    const result = await this.collection.updateOne(
      { userId, pageId },
      {
        $set: {
          engagementRate,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }

  async updateFollowerGrowth(userId, pageId, followerGrowth) {
    const result = await this.collection.updateOne(
      { userId, pageId },
      {
        $set: {
          followerGrowth,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }

  async updateBestPostTimes(userId, pageId, bestPostTimes) {
    const result = await this.collection.updateOne(
      { userId, pageId },
      {
        $set: {
          bestPostTimes,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }
}

export default Analytics;
