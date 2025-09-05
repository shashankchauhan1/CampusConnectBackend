const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'question', required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('answer', AnswerSchema);