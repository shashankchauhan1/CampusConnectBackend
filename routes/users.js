// server/routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import our auth middleware
const User = require('../models/User');

// @route   GET api/users
// @desc    Get all users
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Find all users but exclude their passwords from the result
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    // If the ID is not a valid ObjectId, it will throw an error
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});


// @route   PUT api/users/me
// @desc    Update current user's profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  // ## THE FIX IS HERE: We now correctly look for 'branch' and 'year' ##
  const { bio, company, jobTitle, skills, branch, year, yearsOfExperience, pricing, techStack, interests } = req.body;

  const profileFields = {};
  if (bio) profileFields.bio = bio;
  if (company) profileFields.company = company;
  if (jobTitle) profileFields.jobTitle = jobTitle;
  if (yearsOfExperience) profileFields.yearsOfExperience = yearsOfExperience;
  if (pricing) profileFields.pricing = pricing;

  // Add the corrected junior-specific fields
  if (branch) profileFields.branch = branch;
  if (year) profileFields.year = year;

  // Handle the array fields
  if (skills) profileFields.skills = skills;
  if (interests) profileFields.interests = interests;
  if (techStack) profileFields.techStack = techStack;

  try {
    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   POST api/users/me/submit-verification
// @desc    Submit verification details for a senior mentor
// @access  Private
router.post('/me/submit-verification', auth, async (req, res) => {
  const { linkedInUrl } = req.body;

  if (!linkedInUrl) {
    return res.status(400).json({ msg: 'Please provide a LinkedIn URL.' });
  }

  try {
    const user = await User.findById(req.user.id);

    // Only seniors can submit for verification
    if (user.role !== 'senior') {
      return res.status(403).json({ msg: 'Only senior mentors can be verified.' });
    }

    user.linkedInUrl = linkedInUrl;
    user.verificationStatus = 'pending'; // Set status to pending for admin review
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/me/availability
// @desc    Update a mentor's available time slots
// @access  Private (Seniors only)
router.put('/me/availability', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'senior') {
      return res.status(403).json({ msg: 'Only mentors can set availability.' });
    }
    // The frontend will send the entire new array of slots
    user.availableTimeSlots = req.body.slots;
    await user.save();
    res.json(user.availableTimeSlots);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;