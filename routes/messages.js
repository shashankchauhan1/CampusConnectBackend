// server/routes/messages.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const mongoose = require('mongoose');

// @route   GET api/messages/:userId
// @desc    Get chat history with a specific user
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: loggedInUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: loggedInUserId },
      ],
    }).sort({ timestamp: 'asc' }); // Get messages in chronological order

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.get('/conversations/all', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const conversations = await Message.aggregate([
      // Stage 1: Find all messages involving the current user
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      // Stage 2: Sort messages by timestamp to find the latest
      {
        $sort: { timestamp: -1 },
      },
      // Stage 3: Group messages by conversation partner
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$sender', userId] },
              then: '$recipient',
              else: '$sender',
            },
          },
          lastMessage: { $first: '$content' },
          timestamp: { $first: '$timestamp' },
        },
      },
      // Stage 4: Lookup the other user's details
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'partnerInfo',
        },
      },
      // Stage 5: Deconstruct the partnerInfo array
      {
        $unwind: '$partnerInfo',
      },
      // Stage 6: Format the final output
      {
        $project: {
          _id: 0,
          partner: {
            _id: '$partnerInfo._id',
            name: '$partnerInfo.name',
            role: '$partnerInfo.role',
          },
          lastMessage: 1,
          timestamp: 1,
        },
      },
       // Stage 7: Sort conversations by the latest message
      {
          $sort: { timestamp: -1 }
      }
    ]);

    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;