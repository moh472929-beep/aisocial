const { ObjectId } = require('mongodb');
const dbConnection = require('../db/connection');

class CompetitorAnalytics {
  constructor() {
    this.collection = null;
  }

  async initialize() {
    const db = dbConnection.getDb();
    this.collection = db.collection('competitor_analytics');
    // Create indexes
    await this.collection.createIndex({ user_id: 1 });
    await this.collection.createIndex({ competitor_page_id: 1 });
    await this.collection.createIndex({ analyzed_at: -1 });
  }

  async create(analyticsData) {
    const data = {
      ...analyticsData,
      _id: new ObjectId(),
      analyzed_at: new Date(),
    };

    const result = await this.collection.insertOne(data);
    return { ...data, id: result.insertedId.toString() };
  }

  async findByUserId(userId) {
    const analytics = await this.collection
      .find({ user_id: userId })
      .sort({ analyzed_at: -1 })
      .toArray();
    return analytics.map(analytic => {
      analytic.id = analytic._id.toString();
      delete analytic._id;
      return analytic;
    });
  }

  async findByCompetitorPageId(competitorPageId) {
    const analytics = await this.collection
      .find({ competitor_page_id: competitorPageId })
      .sort({ analyzed_at: -1 })
      .toArray();
    return analytics.map(analytic => {
      analytic.id = analytic._id.toString();
      delete analytic._id;
      return analytic;
    });
  }

  async findByUserIdAndCompetitorPageId(userId, competitorPageId) {
    const analytic = await this.collection.findOne({
      user_id: userId,
      competitor_page_id: competitorPageId,
    });
    if (analytic) {
      analytic.id = analytic._id.toString();
      delete analytic._id;
    }
    return analytic;
  }

  async updateByUserIdAndCompetitorPageId(userId, competitorPageId, updateData) {
    const result = await this.collection.updateOne(
      { user_id: userId, competitor_page_id: competitorPageId },
      {
        $set: {
          ...updateData,
          analyzed_at: new Date(),
        },
      },
      { upsert: true }
    );
    return result.upsertedCount > 0 || result.modifiedCount > 0;
  }

  async deleteById(id) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}

module.exports = CompetitorAnalytics;
