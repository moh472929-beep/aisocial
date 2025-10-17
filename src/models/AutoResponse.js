const { ObjectId } = require('mongodb');
const dbConnection = require('../db/connection');

class AutoResponse {
  constructor() {
    this.collection = null;
  }

  async initialize() {
    const db = dbConnection.getDb();
    this.collection = db.collection('auto_responses');
    // Create indexes
    await this.collection.createIndex({ user_id: 1 });
    await this.collection.createIndex({ page_id: 1 });
    await this.collection.createIndex({ comment_id: 1 });
    await this.collection.createIndex({ timestamp: -1 });
  }

  async create(responseData) {
    const data = {
      ...responseData,
      _id: new ObjectId(),
      timestamp: new Date(),
    };

    const result = await this.collection.insertOne(data);
    return { ...data, id: result.insertedId.toString() };
  }

  async findByUserId(userId) {
    const responses = await this.collection
      .find({ user_id: userId })
      .sort({ timestamp: -1 })
      .toArray();
    return responses.map(response => {
      response.id = response._id.toString();
      delete response._id;
      return response;
    });
  }

  async findByPageId(pageId) {
    const responses = await this.collection
      .find({ page_id: pageId })
      .sort({ timestamp: -1 })
      .toArray();
    return responses.map(response => {
      response.id = response._id.toString();
      delete response._id;
      return response;
    });
  }

  async findByCommentId(commentId) {
    const response = await this.collection.findOne({ comment_id: commentId });
    if (response) {
      response.id = response._id.toString();
      delete response._id;
    }
    return response;
  }

  async deleteById(id) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}

module.exports = AutoResponse;
