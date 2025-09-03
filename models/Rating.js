// server/models/Rating.js
const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  junior: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('rating', RatingSchema);