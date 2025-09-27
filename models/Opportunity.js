const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['internship', 'hackathon', 'workshop', 'event', 'other'], required: true },
  skills: { type: [String], default: [] },
  location: { type: String, default: 'remote' },
  startDate: { type: Date },
  endDate: { type: Date },
  applicationUrl: { type: String, default: '' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

OpportunitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('opportunity', OpportunitySchema);


