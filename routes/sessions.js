// server/routes/sessions.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Session = require('../models/Session');

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

    // Create a persistent session record
    const startTime = new Date(slotToBook.date);
    const endTime = new Date(slotToBook.date);
    // naive: no duration stored, assume 60 minutes
    endTime.setMinutes(endTime.getMinutes() + 60);

    const created = await Session.create({
      mentor: mentor._id,
      student: junior._id,
      startTime,
      endTime,
      status: 'booked',
      price: sessionPrice,
      slotId: slotToBook._id?.toString()
    });

    await junior.save();
    await mentor.save();

    res.json({ msg: 'Session booked successfully!', newBalance: junior.walletBalance, session: created });

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

// @route   GET api/sessions/my
// @desc    Get sessions for current user
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.find({ $or: [ { mentor: userId }, { student: userId } ] })
      .sort({ startTime: -1 })
      .populate('mentor', '-password')
      .populate('student', '-password');
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/sessions/:id/status
// @desc    Update session status (mentor only)
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: 'Session not found' });

    if (session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only the mentor can update status' });
    }

    session.status = status;
    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;