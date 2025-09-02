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


router.put('/me', auth, async (req, res) => {
  // Add major and graduationYear to the destructuring
  const { bio, company, jobTitle, skills, major, graduationYear } = req.body;

  // Build profile object
  const profileFields = {};
  if (bio) profileFields.bio = bio;
  if (company) profileFields.company = company;
  if (jobTitle) profileFields.jobTitle = jobTitle;
  // Add the new fields to the object
  if (major) profileFields.major = major;
  if (graduationYear) profileFields.graduationYear = graduationYear;
  
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }

  try {
    // The rest of the function remains the same
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

module.exports = router;