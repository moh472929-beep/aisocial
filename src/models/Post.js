const { ObjectId } = require('mongodb');
const dbConnection = require('../db/connection');

class Post {
  constructor() {
    this.collection = null;
  }

  async initialize() {
    const db = dbConnection.getDb();
    this.collection = db.collection('posts');
    // Create indexes
    await this.collection.createIndex({ postId: 1 });
    await this.collection.createIndex({ pageId: 1 });
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ createdAt: -1 });
    await this.collection.createIndex({ type: 1 });
  }

  async create(postData) {
    const data = {
      ...postData,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(data);
    return { ...data, id: result.insertedId.toString() };
  }

  async findByPostId(postId) {
    const post = await this.collection.findOne({ postId });
    if (post) {
      post.id = post._id.toString();
      delete post._id;
    }
    return post;
  }

  async findByPageId(pageId) {
    const posts = await this.collection.find({ pageId }).sort({ createdAt: -1 }).toArray();
    return posts.map(post => {
      post.id = post._id.toString();
      delete post._id;
      return post;
    });
  }

  async findByUserId(userId) {
    const posts = await this.collection.find({ userId }).sort({ createdAt: -1 }).toArray();
    return posts.map(post => {
      post.id = post._id.toString();
      delete post._id;
      return post;
    });
  }

  async findByUserIdAndType(userId, type) {
    const posts = await this.collection.find({ userId, type }).sort({ createdAt: -1 }).toArray();
    return posts.map(post => {
      post.id = post._id.toString();
      delete post._id;
      return post;
    });
  }

  async update(postId, updateData) {
    const result = await this.collection.updateOne(
      { postId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async updateMetrics(postId, metrics) {
    const result = await this.collection.updateOne(
      { postId },
      {
        $set: {
          likes: metrics.likes || 0,
          shares: metrics.shares || 0,
          comments: metrics.comments || 0,
          views: metrics.views || 0,
          updatedAt: new Date(),
        },
      }
    );
    return result.modifiedCount > 0;
  }

  async delete(postId) {
    const result = await this.collection.deleteOne({ postId });
    return result.deletedCount > 0;
  }

  async getTopPostsByEngagement(userId, limit = 5) {
    const posts = await this.collection
      .find({ userId })
      .sort({
        $expr: {
          $add: [
            { $ifNull: ['$likes', 0] },
            { $ifNull: ['$shares', 0] },
            { $ifNull: ['$comments', 0] },
          ],
        },
      })
      .limit(limit)
      .toArray();

    return posts.map(post => {
      post.id = post._id.toString();
      delete post._id;
      // Calculate total engagement
      post.totalEngagement = (post.likes || 0) + (post.shares || 0) + (post.comments || 0);
      return post;
    });
  }
}

module.exports = Post;
