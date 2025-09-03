const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');

// @route   GET api/admin/pending-mentors
// @desc    Get all mentors pending verification
// @access  Private, Admin
router.get('/pending-mentors', [auth, admin], async (req, res) => {
  try {
    const pendingMentors = await User.find({ 
      role: 'senior', 
      verificationStatus: 'pending' 
    }).select('-password');
    res.json(pendingMentors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/verify-mentor/:id
// @desc    Approve a mentor's verification
// @access  Private, Admin
router.put('/verify-mentor/:id', [auth, admin], async (req, res) => {
    try {
        const mentor = await User.findById(req.params.id);
        if (!mentor) {
            return res.status(404).json({ msg: 'Mentor not found' });
        }
        mentor.verificationStatus = 'approved';
        await mentor.save();
        res.json({ msg: 'Mentor approved successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;