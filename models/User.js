// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['junior', 'senior'], default: 'junior' },
  bio: { type: String, default: '' },
  
  // --- Junior-specific fields ---
  branch: { type: String, default: '' }, // 
  year: { type: Number, default: null }, // 
  interests: { type: [String], default: [] }, // 
  targetCompanies: { type: [String], default: [] }, // 
  resumeUrl: { type: String, default: '' }, // 
  
  // --- Senior-specific fields ---
  company: { type: String, default: '' }, // 
  jobTitle: { type: String, default: '' }, // 
  yearsOfExperience: { type: Number, default: 0 }, // 
  techStack: { type: [String], default: [] }, // 
  interviewRoundsExperience: { type: String, default: '' }, // 
availableTimeSlots: [{
    date: Date,
    time: String,
    isBooked: { type: Boolean, default: false }
  }],  sessionTypes: { type: [String], default: [] }, // 
  pricing: { type: Number, default: 0 }, // 
  communicationModes: { type: [String], default: [] }, // 
  
  // --- General fields from your guide ---
  skills: { type: [String], default: [] },
  // Replace isVerified with this more detailed status tracker
  verificationStatus: {
    type: String,
    enum: ['unsubmitted', 'pending', 'approved', 'rejected'],
    default: 'unsubmitted',
  },
  linkedInUrl: { type: String, default: '' }, // For mentor verification

    // ## ADD THESE NEW FIELDS ##
    averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  badgeScore: { type: Number, default: 0 }, // <-- ADD THIS

  walletBalance: { type: Number, default: 100 }, // NEW: Give users 100 free credits to start
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('user', UserSchema);