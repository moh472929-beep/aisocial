const { ObjectId } = require('mongodb');
const dbConnection = require('../db/connection');

class FacebookPage {
  constructor() {
    this.collection = null;
  }

  async initialize() {
    const db = dbConnection.getDb();
    this.collection = db.collection('facebook_pages');
    // Create indexes
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ pageId: 1 });
    await this.collection.createIndex({ userId: 1, pageId: 1 }, { unique: true });
  }

  async create(pageData) {
    try {
      const page = {
        ...pageData,
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await this.collection.insertOne(page);
      return { ...page, id: result.insertedId.toString() };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Facebook page already connected for this user');
      }
      throw error;
    }
  }

  async findByUserId(userId) {
    const pages = await this.collection.find({ userId }).toArray();
    return pages.map(page => {
      page.id = page._id.toString();
      delete page._id;
      return page;
    });
  }

  async findByPageId(pageId) {
    const page = await this.collection.findOne({ pageId });
    if (page) {
      page.id = page._id.toString();
      delete page._id;
    }
    return page;
  }

  async findByUserIdAndPageId(userId, pageId) {
    const page = await this.collection.findOne({ userId, pageId });
    if (page) {
      page.id = page._id.toString();
      delete page._id;
    }
    return page;
  }

  async update(userId, pageId, updateData) {
    const result = await this.collection.updateOne(
      { userId, pageId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async delete(userId, pageId) {
    const result = await this.collection.deleteOne({ userId, pageId });
    return result.deletedCount > 0;
  }

  async updateSettings(userId, pageId, settings) {
    const result = await this.collection.updateOne(
      { userId, pageId },
      {
        $set: {
          settings,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }
}

module.exports = FacebookPage;
