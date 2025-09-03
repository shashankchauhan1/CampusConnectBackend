// server/routes/sessions.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/sessions/book/:mentorId
// @desc    Book a session with a mentor
// @access  Private (Juniors only)
router.post('/book/:mentorId', auth, async (req, res) => {
  const { slotId } = req.body; // We now expect the specific slot ID
  
  try {
    const juniorId = req.user.id;
    const mentorId = req.params.mentorId;

    const junior = await User.findById(juniorId);
    const mentor = await User.findById(mentorId);

    if (!mentor || mentor.role !== 'senior') {
      return res.status(404).json({ msg: 'Mentor not found.' });
    }
    
    // Find the specific slot the user wants to book
    const slotToBook = mentor.availableTimeSlots.id(slotId);
    if (!slotToBook) {
        return res.status(404).json({ msg: 'Time slot not found.' });
    }
    if (slotToBook.isBooked) {
        return res.status(400).json({ msg: 'This time slot is no longer available.' });
    }

    const sessionPrice = mentor.pricing;
    if (junior.walletBalance < sessionPrice) {
      return res.status(400).json({ msg: 'Insufficient credits.' });
    }

    // Process transaction
    junior.walletBalance -= sessionPrice;
    mentor.walletBalance += sessionPrice;
    
    // Mark the slot as booked
    slotToBook.isBooked = true;

    await junior.save();
    await mentor.save();

    res.json({ msg: 'Session booked successfully!', newBalance: junior.walletBalance });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// A simple test route for adding credits
router.put('/wallet/add', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.walletBalance += 100; // Add 100 credits
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;