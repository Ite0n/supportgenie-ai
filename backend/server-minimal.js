const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SupportGenie AI Minimal Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple AI endpoint for testing
app.post('/api/ai/conversation', async (req, res) => {
  try {
    const { message, platform } = req.body;
    
    res.json({
      success: true,
      data: {
        response: `Thank you for your message: "${message}". I'm here to help with your inquiry on ${platform}.`,
        confidence: 0.9,
        suggestedActions: ["Continue conversation", "Ask follow-up question"],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate response',
      message: error.message
    });
  }
});

// Environment check endpoint
app.get('/api/config/check', (req, res) => {
  const config = {
    jwt_secret: process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing',
    supabase_url: process.env.SUPABASE_URL ? '✅ Configured' : '❌ Missing',
    supabase_anon_key: process.env.SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing',
    openai_api_key: process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'
  };
  
  res.status(200).json({
    message: 'Environment Configuration Check',
    config,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SupportGenie AI Minimal Backend running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Config check: http://localhost:${PORT}/api/config/check`);
  console.log(`🤖 AI endpoint: http://localhost:${PORT}/api/ai/conversation`);
  console.log(`🔗 This minimal server works without Supabase for testing`);
});

module.exports = app;
