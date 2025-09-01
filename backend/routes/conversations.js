const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get conversation history for a user
router.get('/history', auth, async (req, res) => {
  try {
    const { platform, limit = 50 } = req.query;
    const userId = req.userId;
    
    const conversationService = require('../services/conversationService');
    const history = await conversationService.getConversationHistory(userId, platform, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        conversations: history,
        total: history.length,
        platform: platform || 'all'
      }
    });
  } catch (error) {
    console.error('Get conversation history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation history',
      message: error.message
    });
  }
});

// Get conversation analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const conversationService = require('../services/conversationService');
    const analytics = await conversationService.getConversationAnalytics(null, startDate, endDate);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get conversation analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversation analytics',
      message: error.message
    });
  }
});

// Get recent conversations (last 24 hours)
router.get('/recent', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { platform } = req.query;
    
    const conversationService = require('../services/conversationService');
    const history = await conversationService.getConversationHistory(userId, platform, 10);
    
    // Filter for recent conversations (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentConversations = history.filter(conv => 
      new Date(conv.timestamp) > oneDayAgo
    );
    
    res.json({
      success: true,
      data: {
        conversations: recentConversations,
        total: recentConversations.length,
        timeRange: '24h'
      }
    });
  } catch (error) {
    console.error('Get recent conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent conversations',
      message: error.message
    });
  }
});

module.exports = router;
