const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  role: String,
  team: String,
  salary: Number,
  username: String,
  passwordHash: String,
  userActivated: Boolean,
});

module.exports = userSchema;
