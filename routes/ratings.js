// server/routes/ratings.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Rating = require('../models/Rating');
const User = require('../models/User');

// @route   POST api/ratings/:mentorId
// @desc    Rate a mentor after a session
// @access  Private (Juniors only)
router.post('/:mentorId', auth, async (req, res) => {
  try {
    const juniorId = req.user.id;
    const { rating, feedback } = req.body;

    // Check if the user is a junior
    const juniorUser = await User.findById(juniorId);
    if (juniorUser.role !== 'junior') {
      return res.status(403).json({ msg: 'Only students can leave ratings.' });
    }

    // Create and save the new rating
    const newRating = new Rating({
      mentor: req.params.mentorId,
      junior: juniorId,
      rating,
      feedback,
    });
    await newRating.save();

    // Recalculate the mentor's average rating
      const ratings = await Rating.find({ mentor: req.params.mentorId });
      const totalRatings = ratings.length;
      const sumOfRatings = ratings.reduce((acc, item) => acc + item.rating, 0);
      const average = totalRatings > 0 ? sumOfRatings / totalRatings : 0;

      // Calculate Badge Score: 80% from rating, 20% from number of reviews (capped at 50)
      const ratingComponent = (average / 5) * 80;
      const volumeComponent = (Math.min(totalRatings, 50) / 50) * 20;
      const score = Math.round(ratingComponent + volumeComponent);

      await User.findByIdAndUpdate(req.params.mentorId, {
        averageRating: average.toFixed(1),
        ratingCount: totalRatings,
        badgeScore: score,
      });

      res.json({ msg: 'Rating submitted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;