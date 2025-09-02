// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['junior', 'senior'], default: 'junior' },
  bio: { type: String, default: '' },
  
  // Senior-specific fields
  company: { type: String, default: '' },
  jobTitle: { type: String, default: '' },
  
  // Junior-specific fields (NEW)
  major: { type: String, default: '' },
  graduationYear: { type: Number, default: null },

  skills: { type: [String], default: [] },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('user', UserSchema);