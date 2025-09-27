const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date },
  link: { type: String, default: '' }
}, { _id: false });

const CertificateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, default: '' },
  issueDate: { type: Date },
  credentialId: { type: String, default: '' },
  url: { type: String, default: '' }
}, { _id: false });

const ResumeSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const PortfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true },
  summary: { type: String, default: '' },
  skills: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  achievements: { type: [AchievementSchema], default: [] },
  certificates: { type: [CertificateSchema], default: [] },
  resumes: { type: [ResumeSchema], default: [] },
  projects: { type: [String], default: [] },
  links: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

PortfolioSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('portfolio', PortfolioSchema);


