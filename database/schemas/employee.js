const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Human-readable Employee ID
  employeeId: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  middleName: String,
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: (value) => value - Date.now() < 0,
      message: 'Date of birth cannot be in future',
    },
  },
  role: String,
  team: String,
  salary: {
    type: Number,
    validate: {
      validator: (value) => value > 0,
      message: 'Salary has to be greater than zero',
    },
  },
  deleted: Boolean,
});

module.exports = employeeSchema;
