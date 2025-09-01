#!/usr/bin/env node

/**
 * SupportGenie AI Advanced Features Demo Server
 * This server showcases all the advanced features including:
 * - AI-powered responses
 * - Stripe payments
 * - Advanced analytics
 * - WhatsApp integration
 * - Enhanced security
 * - Real-time WebSocket
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Import advanced services
const PaymentService = require('./payment-service');
const AnalyticsService = require('./analytics-service');
const WhatsAppService = require('./whatsapp-service');
const SecurityService = require('./security-service');
const WebSocketService = require('./websocket-service');

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

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(securityService.createCorsMiddleware());
app.use(securityService.createSecurityHeaders());
app.use(securityService.createRequestLogger());
app.use(securityService.createSqlInjectionProtection());

// Rate limiting
const generalLimiter = securityService.createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const authLimiter = securityService.createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 auth requests per windowMs
});

app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      openai: !!openai,
      payment: true,
      analytics: true,
      whatsapp: true,
      security: true,
      websocket: true
    },
    version: '2.0.0-advanced'
  });
});

// Service status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
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
    let confidence = 0.8; // Default confidence

    // Track conversation start
    const conversationResult = await analyticsService.trackConversation({
      userId: userId || 'anonymous',
      businessId: businessId || 'demo',
      platform,
      metadata
    });

    if (openai) {
      try {
        // Generate AI response
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
        confidence = 0.9; // High confidence for successful AI response

        console.log(`🤖 AI response generated: ${tokensUsed} tokens`);
      } catch (error) {
        console.error('❌ OpenAI error:', error);
        aiResponse = "I'm having trouble processing your request right now. Please try again in a moment.";
        confidence = 0.3; // Low confidence for failed AI response
      }
    } else {
      aiResponse = "Thank you for your message. I'm SupportGenie AI, your customer support assistant. I'm here to help you with any questions or support needs you might have.";
    }

    const responseTime = Date.now() - startTime;

    // Track message
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

      // Track AI response
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

app.post('/api/payments/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', customerId, metadata = {} } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const result = await paymentService.createPaymentIntent(amount, currency, customerId, metadata);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
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

app.get('/api/analytics/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = '30d' } = req.query;

    const result = await analyticsService.getUserAnalytics(userId, timeRange);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error getting user analytics:', error);
    res.status(500).json({ error: 'Failed to get user analytics' });
  }
});

app.get('/api/analytics/platform/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { timeRange = '30d' } = req.query;

    const result = await analyticsService.getPlatformAnalytics(platform, timeRange);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error getting platform analytics:', error);
    res.status(500).json({ error: 'Failed to get platform analytics' });
  }
});

app.get('/api/analytics/report/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { timeRange = '30d' } = req.query;

    const result = await analyticsService.generatePerformanceReport(businessId, timeRange);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error generating performance report:', error);
    res.status(500).json({ error: 'Failed to generate performance report' });
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

app.post('/api/whatsapp/send-media', async (req, res) => {
  try {
    const { to, mediaType, mediaUrl, caption } = req.body;

    if (!to || !mediaType || !mediaUrl) {
      return res.status(400).json({ error: 'Recipient, media type, and media URL are required' });
    }

    const result = await whatsappService.sendMediaMessage(to, mediaType, mediaUrl, caption);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error sending WhatsApp media:', error);
    res.status(500).json({ error: 'Failed to send WhatsApp media' });
  }
});

app.post('/api/whatsapp/send-button', async (req, res) => {
  try {
    const { to, body, buttons } = req.body;

    if (!to || !body || !buttons || !Array.isArray(buttons)) {
      return res.status(400).json({ error: 'Recipient, body, and buttons array are required' });
    }

    const result = await whatsappService.sendButtonMessage(to, body, buttons);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error sending WhatsApp button message:', error);
    res.status(500).json({ error: 'Failed to send WhatsApp button message' });
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

app.post('/api/security/blacklist-token', async (req, res) => {
  try {
    const { token, expiresIn = '24h' } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const result = await securityService.blacklistToken(token, expiresIn);
    
    if (result) {
      res.json({ success: true, message: 'Token blacklisted successfully' });
    } else {
      res.status(400).json({ error: 'Failed to blacklist token' });
    }
  } catch (error) {
    console.error('❌ Error blacklisting token:', error);
    res.status(500).json({ error: 'Failed to blacklist token' });
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
          '/api/payments/create-subscription',
          '/api/payments/create-payment-intent'
        ]
      },
      {
        name: 'Advanced Analytics',
        description: 'Comprehensive business and user analytics',
        status: 'active',
        endpoints: [
          '/api/analytics/business/:businessId',
          '/api/analytics/user/:userId',
          '/api/analytics/platform/:platform',
          '/api/analytics/report/:businessId'
        ]
      },
      {
        name: 'WhatsApp Integration',
        description: 'Full WhatsApp Business API integration',
        status: 'active',
        endpoints: [
          '/api/whatsapp/send-message',
          '/api/whatsapp/send-media',
          '/api/whatsapp/send-button'
        ]
      },
      {
        name: 'Enhanced Security',
        description: 'Rate limiting, authentication, and monitoring',
        status: 'active',
        endpoints: [
          '/api/security/stats',
          '/api/security/blacklist-token'
        ]
      },
      {
        name: 'Real-time WebSocket',
        description: 'Live updates and notifications',
        status: 'active',
        endpoint: 'WebSocket connection'
      }
    ],
    timestamp: new Date().toISOString(),
    version: '2.0.0-advanced'
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
      'POST /api/payments/create-payment-intent',
      'GET /api/analytics/business/:businessId',
      'GET /api/analytics/user/:userId',
      'GET /api/analytics/platform/:platform',
      'GET /api/analytics/report/:businessId',
      'POST /api/whatsapp/send-message',
      'POST /api/whatsapp/send-media',
      'POST /api/whatsapp/send-button',
      'GET /api/security/stats',
      'POST /api/security/blacklist-token',
      'GET /api/demo/features'
    ]
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 SupportGenie AI Advanced Features Demo Server');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
  console.log(`🎯 Demo features: http://localhost:${PORT}/api/demo/features`);
  console.log('');
  console.log('✅ Advanced Features Enabled:');
  console.log('   🤖 AI-Powered Responses');
  console.log('   💳 Stripe Payment Integration');
  console.log('   📊 Advanced Analytics Dashboard');
  console.log('   📱 WhatsApp Business API');
  console.log('   🔒 Enhanced Security & Rate Limiting');
  console.log('   🔌 Real-time WebSocket Support');
  console.log('');
  console.log('🔄 Use Ctrl+C to stop the server');
});

// Initialize WebSocket service
const webSocketService = new WebSocketService(server);
webSocketService.startCleanupInterval();

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
