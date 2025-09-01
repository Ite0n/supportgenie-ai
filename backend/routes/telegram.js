const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');
const router = express.Router();
const auth = require('../middleware/auth');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Telegram bot with polling for development
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
  polling: process.env.NODE_ENV === 'development' // Use polling in dev, webhooks in production
});

// Basic AI-powered message handler
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (!msg.text) return;

  try {
    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast & cheap for support
      messages: [
        {
          role: "system",
          content: "You are SupportGenie AI, a helpful customer support assistant. Be friendly, professional, and helpful. Keep responses concise but informative."
        },
        { 
          role: "user", 
          content: msg.text 
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Send AI response back to user
    await bot.sendMessage(chatId, aiResponse);
    
    // Log the conversation
    await logConversation(msg, aiResponse);
    
  } catch (error) {
    console.error('AI response error:', error);
    
    // Send fallback message
    await bot.sendMessage(chatId, 
      "I'm having trouble processing your request right now. Please try again in a moment, or contact our human support team for immediate assistance."
    );
  }
});

// Webhook endpoint for Telegram (production)
router.post('/webhook', async (req, res) => {
  try {
    const { message, callback_query } = req.body;
    
    if (message) {
      await handleWebhookMessage(message);
    } else if (callback_query) {
      await handleCallbackQuery(callback_query);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(500).send('Error');
  }
});

// Set webhook endpoint
router.post('/set-webhook', auth, async (req, res) => {
  try {
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    const result = await bot.setWebhook(webhookUrl);
    
    res.json({
      success: true,
      data: {
        webhookSet: result,
        webhookUrl,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Set webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set webhook',
      message: error.message
    });
  }
});

// Get webhook info
router.get('/webhook-info', auth, async (req, res) => {
  try {
    const webhookInfo = await bot.getWebhookInfo();
    
    res.json({
      success: true,
      data: webhookInfo
    });
  } catch (error) {
    console.error('Get webhook info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get webhook info',
      message: error.message
    });
  }
});

// Send message endpoint
router.post('/send-message', auth, async (req, res) => {
  try {
    const { chatId, message, parseMode = 'HTML' } = req.body;
    
    if (!chatId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Chat ID and message are required'
      });
    }
    
    const result = await bot.sendMessage(chatId, message, { parse_mode: parseMode });
    
    res.json({
      success: true,
      data: {
        messageId: result.message_id,
        chatId: result.chat.id,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message
    });
  }
});

// Get bot info
router.get('/bot-info', auth, async (req, res) => {
  try {
    const botInfo = await bot.getMe();
    
    res.json({
      success: true,
      data: botInfo
    });
  } catch (error) {
    console.error('Get bot info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bot info',
      message: error.message
    });
  }
});

// Get bot status
router.get('/status', auth, async (req, res) => {
  try {
    const botInfo = await bot.getMe();
    const webhookInfo = await bot.getWebhookInfo();
    
    res.json({
      success: true,
      data: {
        bot: botInfo,
        webhook: webhookInfo,
        polling: process.env.NODE_ENV === 'development',
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Get bot status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bot status',
      message: error.message
    });
  }
});

// Handle webhook messages (for production)
async function handleWebhookMessage(message) {
  try {
    const { chat, text, from } = message;
    
    if (!text) return;
    
    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are SupportGenie AI, a helpful customer support assistant. Be friendly, professional, and helpful. Keep responses concise but informative."
        },
        { 
          role: "user", 
          content: text 
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Send response back to user
    await bot.sendMessage(chat.id, aiResponse);
    
    // Log the conversation
    await logConversation(message, aiResponse);
    
  } catch (error) {
    console.error('Handle webhook message error:', error);
    
    // Send fallback message
    try {
      await bot.sendMessage(message.chat.id, 
        'Sorry, I\'m having trouble processing your request. Please try again later.'
      );
    } catch (sendError) {
      console.error('Send fallback message error:', sendError);
    }
  }
}

// Handle callback queries (for inline keyboards)
async function handleCallbackQuery(callbackQuery) {
  try {
    const { data, message, from } = callbackQuery;
    
    // Handle different callback data
    switch (data) {
      case 'help':
        await bot.sendMessage(message.chat.id, 'How can I help you today?');
        break;
      case 'pricing':
        await bot.sendMessage(message.chat.id, 'Check out our pricing plans at supportgenie.ai/pricing');
        break;
      case 'contact':
        await bot.sendMessage(message.chat.id, 'Contact us at hello@supportgenie.ai');
        break;
      default:
        await bot.sendMessage(message.chat.id, 'I didn\'t understand that option.');
    }
    
    // Answer callback query
    await bot.answerCallbackQuery(callbackQuery.id);
    
  } catch (error) {
    console.error('Handle callback query error:', error);
  }
}

// Log conversation for analytics
async function logConversation(message, aiResponse) {
  try {
    // Import conversation service if available
    const conversationService = require('../services/conversationService');
    await conversationService.logConversation({
      platform: 'telegram',
      userId: message.from.id,
      chatId: message.chat.id,
      message: message.text,
      response: aiResponse,
      timestamp: new Date()
    });
  } catch (error) {
    // If conversation service is not available, just log to console
    console.log('Conversation logged:', {
      platform: 'telegram',
      userId: message.from.id,
      chatId: message.chat.id,
      message: message.text,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping Telegram bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping Telegram bot...');
  bot.stopPolling();
  process.exit(0);
});

module.exports = router;
