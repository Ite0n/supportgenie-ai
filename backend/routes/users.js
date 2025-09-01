const express = require('express');
const router = express.Router();

// TODO: Implement user management routes
router.get('/profile', (req, res) => {
  res.json({ message: 'User routes coming soon' });
});

module.exports = router;
