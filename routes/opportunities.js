const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');

// @route   GET /api/opportunities
// @desc    List opportunities with optional filters
// @access  Public (read-only)
router.get('/', async (req, res) => {
  try {
    const { type, skill, q } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (skill) filter.skills = { $in: [skill] };
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    const items = await Opportunity.find(filter).sort({ createdAt: -1 }).populate('postedBy', 'name role');
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/opportunities
// @desc    Create an opportunity (senior/faculty/admin)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !['senior', 'faculty', 'admin'].includes(user.role)) {
      return res.status(403).json({ msg: 'Only seniors, faculty, or admins can post' });
    }
    const { title, description, type, skills, location, startDate, endDate, applicationUrl } = req.body;
    const created = await Opportunity.create({
      title,
      description,
      type,
      skills,
      location,
      startDate,
      endDate,
      applicationUrl,
      postedBy: user._id,
    });
    res.status(201).json(created);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/opportunities/:id
// @desc    Update an opportunity (owner or admin)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ msg: 'Not found' });
    if (opp.postedBy.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden' });
    }
    const updatable = ['title', 'description', 'type', 'skills', 'location', 'startDate', 'endDate', 'applicationUrl'];
    updatable.forEach((k) => {
      if (req.body[k] !== undefined) opp[k] = req.body[k];
    });
    await opp.save();
    res.json(opp);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/opportunities/:id
// @desc    Delete an opportunity (owner or admin)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ msg: 'Not found' });
    if (opp.postedBy.toString() !== user._id.toString() && user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden' });
    }
    await opp.deleteOne();
    res.json({ msg: 'Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;


