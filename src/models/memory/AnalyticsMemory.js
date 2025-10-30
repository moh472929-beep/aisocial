class AnalyticsMemory {
  constructor() {
    this.data = new Map();
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
    console.log('✅ Analytics model initialized (in-memory)');
  }

  async create(data) {
    const id = Date.now().toString();
    const record = { id, ...data, createdAt: new Date() };
    this.data.set(id, record);
    return record;
  }

  async findOne(query) {
    for (const [id, record] of this.data.entries()) {
      if (this.matchesQuery(record, query)) {
        return record;
      }
    }
    return null;
  }

  async find(query = {}) {
    const results = [];
    for (const [id, record] of this.data.entries()) {
      if (this.matchesQuery(record, query)) {
        results.push(record);
      }
    }
    return results;
  }

  async updateOne(query, update) {
    for (const [id, record] of this.data.entries()) {
      if (this.matchesQuery(record, query)) {
        const updatedRecord = { ...record, ...update.$set };
        this.data.set(id, updatedRecord);
        return { modifiedCount: 1 };
      }
    }
    return { modifiedCount: 0 };
  }

  async deleteOne(query) {
    for (const [id, record] of this.data.entries()) {
      if (this.matchesQuery(record, query)) {
        this.data.delete(id);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }

  matchesQuery(record, query) {
    if (!query || Object.keys(query).length === 0) return true;
    
    for (const [key, value] of Object.entries(query)) {
      if (record[key] !== value) {
        return false;
      }
    }
    return true;
  }

  // Analytics-specific methods
  async getPageAnalytics(pageId, period = 'daily') {
    // Return mock analytics data for testing
    return {
      pageId,
      period,
      metrics: {
        followers: Math.floor(Math.random() * 10000) + 1000,
        engagement: Math.floor(Math.random() * 100) + 10,
        reach: Math.floor(Math.random() * 50000) + 5000,
        impressions: Math.floor(Math.random() * 100000) + 10000
      },
      posts: [
        {
          id: '1',
          content: 'منشور تجريبي 1',
          likes: Math.floor(Math.random() * 500) + 10,
          comments: Math.floor(Math.random() * 50) + 1,
          shares: Math.floor(Math.random() * 20) + 1,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          content: 'منشور تجريبي 2',
          likes: Math.floor(Math.random() * 500) + 10,
          comments: Math.floor(Math.random() * 50) + 1,
          shares: Math.floor(Math.random() * 20) + 1,
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
        }
      ],
      bestPostingTimes: ['09:00', '14:00', '19:00'],
      followerGrowth: {
        daily: Math.floor(Math.random() * 100) + 10,
        weekly: Math.floor(Math.random() * 500) + 50,
        monthly: Math.floor(Math.random() * 2000) + 200
      }
    };
  }

  async processAnalytics(pageId, data) {
    // Mock processing - just store the data
    const record = await this.create({
      pageId,
      data,
      processedAt: new Date(),
      status: 'processed'
    });
    return record;
  }
}

export default AnalyticsMemory;