import { ObjectId } from 'mongodb';
import { getDb } from '../db/connection.js';

class TrendingTopic {
  constructor() {
    this.collection = null;
  }

  async initialize() {
    const db = getDb();
    this.collection = db.collection('user_trending_topics');
    // Create indexes
    await this.collection.createIndex({ user_id: 1, topic_keyword: 1 }, { unique: true });
    await this.collection.createIndex({ user_id: 1 });
    await this.collection.createIndex({ location: 1 });
    await this.collection.createIndex({ last_updated_at: -1 });
  }

  async create(topicData) {
    try {
      const topic = {
        ...topicData,
        _id: new ObjectId(),
        created_at: new Date(),
        last_updated_at: new Date(),
      };

      const result = await this.collection.insertOne(topic);
      return { ...topic, id: result.insertedId.toString() };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Duplicate topic for this user');
      }
      throw error;
    }
  }

  async findByUserIdAndKeyword(userId, topicKeyword) {
    const topic = await this.collection.findOne({
      user_id: userId,
      topic_keyword: topicKeyword,
    });
    if (topic) {
      topic.id = topic._id.toString();
      delete topic._id;
    }
    return topic;
  }

  async findByUserId(userId, limit = 50) {
    const topics = await this.collection
      .find({ user_id: userId })
      .sort({ last_updated_at: -1 })
      .limit(limit)
      .toArray();

    return topics.map(topic => {
      topic.id = topic._id.toString();
      delete topic._id;
      return topic;
    });
  }

  async updateStatus(id, status) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: status,
          last_updated_at: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async updateContentId(id, contentId) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          content_id: contentId,
          last_updated_at: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async updateSubscriptionType(userId, topicKeyword, subscriptionType) {
    const result = await this.collection.updateOne(
      { user_id: userId, topic_keyword: topicKeyword },
      {
        $set: {
          subscription_type: subscriptionType,
          last_updated_at: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async deleteOldTopics(userId, daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.collection.deleteMany({
      user_id: userId,
      last_updated_at: { $lt: cutoffDate },
    });

    return result.deletedCount;
  }
}

export default TrendingTopic;
