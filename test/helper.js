const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

// List your collection names here
const COLLECTIONS = ["challenges"];

class DBManager {
  constructor() {
    this.db = null;
    this.server = new MongoMemoryServer();
    this.connection = null;
  }

  async start() {
    const url = await this.server.getUri();
    this.connection = await MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true });
    this.db = this.connection.db(await this.server.getDbName());
  }

  stop() {
    this.connection.close();
    return this.server.stop();
  }

  cleanup() {
    return Promise.all(COLLECTIONS.map(c => this.db.collection(c).deleteMany({})));
  }
}

module.exports = DBManager;