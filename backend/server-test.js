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
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SupportGenie AI Backend Test Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    jwt_secret_configured: !!process.env.JWT_SECRET,
    supabase_url_configured: !!process.env.SUPABASE_URL,
    openai_key_configured: !!process.env.OPENAI_API_KEY
  });
});

// Environment check endpoint
app.get('/api/config/check', (req, res) => {
  const config = {
    jwt_secret: process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing',
    supabase_url: process.env.SUPABASE_URL ? '✅ Configured' : '❌ Missing',
    supabase_anon_key: process.env.SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing',
    openai_api_key: process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing',
    stripe_secret_key: process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Missing',
    telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Missing'
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
  console.log(`🚀 SupportGenie AI Test Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Config check: http://localhost:${PORT}/api/config/check`);
  console.log(`🔗 Test this server before setting up full Supabase integration`);
});

module.exports = app;
