const mongoose = require('mongoose');

// See: https://mongoosejs.com/docs/deprecations.html#findandmodify
mongoose.set('useFindAndModify', false);

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
