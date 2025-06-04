const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['engineer', 'manager'],
    required: true
  },
  skills: {
    type: [String],
    default: [],
  },
  seniority: {
    type: String,
    enum: ['junior', 'mid', 'senior'],
    default: null
  },
  maxCapacity: {
    type: Number,
    default: null
  },
  department: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('ERMSUsers', userSchema);
