const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  teamSize: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed'],
    default: 'planning'
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ERMSUsers',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ERMSProject', projectSchema);
