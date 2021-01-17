const { MongoMemoryServer } = require('mongodb-memory-server');
const database = require('../database');

exports.mochaHooks = {
  beforeAll: async () => {
    const mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();
    process.env.MONGODB_URL = uri;
    await database.connect();
  },

  afterAll: async () => {
    await database.disconnect();
  },
};
