#!/usr/bin/env node

/**
 * SupportGenie AI Production Server
 * Optimized for deployment with proper error handling and production settings
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import services
const PaymentService = require('./payment-service');
const AnalyticsService = require('./analytics-service');
const WhatsAppService = require('./whatsapp-service');
const SecurityService = require('./security-service');

// Import OpenAI for AI responses
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize services
const paymentService = new PaymentService();
const analyticsService = new AnalyticsService();
const whatsappService = new WhatsAppService();
const securityService = new SecurityService();

// Initialize OpenAI
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('✅ OpenAI initialized');
} else {
  console.log('⚠️ OpenAI not configured');
}

// Production middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration for production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://your-frontend-domain.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0-production',
    services: {
      openai: !!openai,
      payment: true,
      analytics: true,
      whatsapp: true,
      security: true
    }
  });
});

// Service status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      services: {}
    };

    // Check OpenAI status
    if (openai) {
      try {
        await openai.models.list();
        status.services.openai = { status: 'healthy', message: 'Connected' };
      } catch (error) {
        status.services.openai = { status: 'unhealthy', message: error.message };
      }
    } else {
      status.services.openai = { status: 'disabled', message: 'Not configured' };
    }

    // Check WhatsApp status
    const whatsappHealth = await whatsappService.checkHealth();
    status.services.whatsapp = whatsappHealth;

    // Check security status
    const securityStats = await securityService.getSecurityStats();
    status.services.security = { status: 'healthy', stats: securityStats };

    res.json(status);
  } catch (error) {
    console.error('❌ Error getting service status:', error);
    res.status(500).json({ error: 'Failed to get service status' });
  }
});

// AI Conversation endpoint with analytics
app.post('/api/ai/conversation', async (req, res) => {
  try {
    const { message, userId, businessId, platform = 'web', metadata = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const startTime = Date.now();
    let aiResponse = null;
    let tokensUsed = 0;
    let confidence = 0.8;

    // Track conversation start
    const conversationResult = await analyticsService.trackConversation({
      userId: userId || 'anonymous',
      businessId: businessId || 'demo',
      platform,
      metadata
    });

    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are SupportGenie AI, a helpful customer support assistant. Be friendly, professional, and helpful. Keep responses concise but informative. You're helping customers with their inquiries. If they ask about pricing, services, or contact info, provide helpful information. Always maintain a professional yet warm tone."
            },
            { 
              role: "user", 
              content: message 
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        });

        aiResponse = completion.choices[0].message.content;
        tokensUsed = completion.usage.total_tokens;
        confidence = 0.9;

        console.log(`🤖 AI response generated: ${tokensUsed} tokens`);
      } catch (error) {
        console.error('❌ OpenAI error:', error);
        aiResponse = "I'm having trouble processing your request right now. Please try again in a moment.";
        confidence = 0.3;
      }
    } else {
      aiResponse = "Thank you for your message. I'm SupportGenie AI, your customer support assistant. I'm here to help you with any questions or support needs you might have.";
    }

    const responseTime = Date.now() - startTime;

    // Track message and AI response
    if (conversationResult.success) {
      await analyticsService.trackMessage({
        conversationId: conversationResult.conversationId,
        userId: userId || 'anonymous',
        businessId: businessId || 'demo',
        content: message,
        type: 'user',
        platform,
        metadata
      });

      await analyticsService.trackAIResponse({
        conversationId: conversationResult.conversationId,
        userId: userId || 'anonymous',
        businessId: businessId || 'demo',
        model: 'gpt-4o-mini',
        responseTime,
        tokensUsed,
        confidence,
        platform,
        metadata
      });
    }

    res.json({
      success: true,
      response: aiResponse,
      metadata: {
        responseTime,
        tokensUsed,
        confidence,
        conversationId: conversationResult.success ? conversationResult.conversationId : null
      }
    });

  } catch (error) {
    console.error('❌ Error in AI conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe payment endpoints
app.post('/api/payments/create-customer', async (req, res) => {
  try {
    const { email, name, metadata = {} } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const result = await paymentService.createCustomer(email, name, metadata);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

app.post('/api/payments/create-subscription', async (req, res) => {
  try {
    const { customerId, priceId, metadata = {} } = req.body;

    if (!customerId || !priceId) {
      return res.status(400).json({ error: 'Customer ID and price ID are required' });
    }

    const result = await paymentService.createSubscription(customerId, priceId, metadata);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Analytics endpoints
app.get('/api/analytics/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { timeRange = '30d' } = req.query;

    const result = await analyticsService.getBusinessAnalytics(businessId, timeRange);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error getting business analytics:', error);
    res.status(500).json({ error: 'Failed to get business analytics' });
  }
});

// WhatsApp endpoints
app.post('/api/whatsapp/send-message', async (req, res) => {
  try {
    const { to, text, previewUrl = false } = req.body;

    if (!to || !text) {
      return res.status(400).json({ error: 'Recipient and text are required' });
    }

    const result = await whatsappService.sendTextMessage(to, text, previewUrl);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
});

// Security endpoints
app.get('/api/security/stats', async (req, res) => {
  try {
    const stats = await securityService.getSecurityStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Error getting security stats:', error);
    res.status(500).json({ error: 'Failed to get security stats' });
  }
});

// Demo endpoints
app.get('/api/demo/features', (req, res) => {
  res.json({
    features: [
      {
        name: 'AI-Powered Responses',
        description: 'Intelligent customer support using OpenAI GPT-4',
        status: 'active',
        endpoint: '/api/ai/conversation'
      },
      {
        name: 'Stripe Payments',
        description: 'Complete payment processing and subscription management',
        status: 'active',
        endpoints: [
          '/api/payments/create-customer',
          '/api/payments/create-subscription'
        ]
      },
      {
        name: 'Advanced Analytics',
        description: 'Comprehensive business and user analytics',
        status: 'active',
        endpoint: '/api/analytics/business/:businessId'
      },
      {
        name: 'WhatsApp Integration',
        description: 'Full WhatsApp Business API integration',
        status: 'active',
        endpoint: '/api/whatsapp/send-message'
      },
      {
        name: 'Enhanced Security',
        description: 'Rate limiting, authentication, and monitoring',
        status: 'active',
        endpoint: '/api/security/stats'
      }
    ],
    timestamp: new Date().toISOString(),
    version: '1.0.0-production'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /health',
      'GET /api/status',
      'POST /api/ai/conversation',
      'POST /api/payments/create-customer',
      'POST /api/payments/create-subscription',
      'GET /api/analytics/business/:businessId',
      'POST /api/whatsapp/send-message',
      'GET /api/security/stats',
      'GET /api/demo/features'
    ]
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 SupportGenie AI Production Server');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
  console.log(`🎯 Demo features: http://localhost:${PORT}/api/demo/features`);
  console.log('');
  console.log('✅ Production Features Enabled:');
  console.log('   🤖 AI-Powered Responses');
  console.log('   💳 Stripe Payment Integration');
  console.log('   📊 Advanced Analytics Dashboard');
  console.log('   📱 WhatsApp Business API');
  console.log('   🔒 Enhanced Security & Rate Limiting');
  console.log('');
  console.log('🔄 Use Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
