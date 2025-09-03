const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    // req.user is set by the 'auth' middleware
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ msg: 'Access denied. Not an admin.' });
    }
    next();
  } catch (err) {
    res.status(500).send('Server Error');
  }
};