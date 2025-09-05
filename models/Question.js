const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  tags: { type: [String], default: [] },
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'answer' }],
  acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'answer' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('question', QuestionSchema);