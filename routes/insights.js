const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Insight = require('../models/Insight');
const User = require('../models/User');

// @route   POST api/insights
// @desc    A senior mentor submits a new company insight
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'senior') {
      return res.status(403).json({ msg: 'Only mentors can submit insights.' });
    }

    const newInsight = new Insight({
      ...req.body,
      author: req.user.id,
      status: 'pending', // All new insights require admin approval
    });

    const insight = await newInsight.save();
    res.json(insight);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/insights
// @desc    Get all approved company insights
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const insights = await Insight.find({ status: 'approved' })
      .populate('author', 'name company jobTitle') // Get author's details
      .sort({ createdAt: -1 }); // Show newest first
    res.json(insights);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;