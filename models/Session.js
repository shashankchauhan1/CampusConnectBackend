const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['booked', 'completed', 'canceled'], default: 'booked' },
  price: { type: Number, default: 0 },
  slotId: { type: String },
  recordingUrl: { type: String, default: '' },
  summary: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('session', SessionSchema);


