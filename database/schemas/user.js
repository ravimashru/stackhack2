const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
});

module.exports = userSchema;
