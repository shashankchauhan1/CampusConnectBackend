const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

// @route   GET /api/portfolio/me
// @desc    Get current user's portfolio
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      // Create default portfolio if none exists
      portfolio = new Portfolio({ user: req.user.id });
      await portfolio.save();
    }
    
    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/portfolio/me
// @desc    Update current user's portfolio
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const {
      summary,
      skills,
      interests,
      achievements,
      certificates,
      projects,
      links
    } = req.body;

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    // Update fields
    if (summary !== undefined) portfolio.summary = summary;
    if (skills !== undefined) portfolio.skills = skills;
    if (interests !== undefined) portfolio.interests = interests;
    if (achievements !== undefined) portfolio.achievements = achievements;
    if (certificates !== undefined) portfolio.certificates = certificates;
    if (projects !== undefined) portfolio.projects = projects;
    if (links !== undefined) portfolio.links = links;

    await portfolio.save();
    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/portfolio/me/resume
// @desc    Add resume to portfolio
// @access  Private
router.post('/me/resume', auth, async (req, res) => {
  try {
    const { fileName, fileUrl } = req.body;

    if (!fileName || !fileUrl) {
      return res.status(400).json({ msg: 'File name and URL are required' });
    }

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id });
    }

    portfolio.resumes.push({ fileName, fileUrl });
    await portfolio.save();

    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/portfolio/me/resume/:resumeId
// @desc    Remove resume from portfolio
// @access  Private
router.delete('/me/resume/:resumeId', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }

    portfolio.resumes = portfolio.resumes.filter(
      resume => resume._id.toString() !== req.params.resumeId
    );
    
    await portfolio.save();
    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/portfolio/:userId
// @desc    Get public portfolio by user ID
// @access  Public
router.get('/:userId', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.params.userId })
      .populate('user', 'name role email');
    
    if (!portfolio) {
      return res.status(404).json({ msg: 'Portfolio not found' });
    }
    
    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
