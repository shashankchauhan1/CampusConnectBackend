// server/models/Insight.js
const mongoose = require('mongoose');

const InsightSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  hiringTimeline: {
    type: String,
  },
  eligibility: {
    type: String,
  },
  rounds: [{
    name: String,
    type: String,
    difficulty: String,
    tips: String,
  }],
  topicsAsked: {
    type: [String],
    default: [],
  },
  tips: {
    type: String,
  },
  benefits: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('insight', InsightSchema);
