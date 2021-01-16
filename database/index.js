const mongodb = require('./mongodb');

const connect = async () => {
  const dbUrl = process.env.MONGODB_URL;
  await mongodb.connect(dbUrl);
};

const disconnect = async () => {
  await mongodb.disconnect();
};

const getUserModel = () => mongodb.getUserModel();

module.exports = {
  connect,
  disconnect,
  getUserModel,
};
