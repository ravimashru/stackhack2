const mongoose = require('mongoose');
let connection;

const connect = async (dbUrl) => {
  connection = mongoose.createConnection(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create models
  connection.model('User', require('./schemas/user'));
};

const disconnect = async () => {
  connection.close();
};

const getUserModel = () => {
  return connection.model('User');
};

module.exports = {
  connect,
  disconnect,
  getUserModel,
};
