#!/usr/bin/env node

/**
 * Enhanced SupportGenie AI Telegram Bot with Commands
 * Run this to test your bot without starting the full server
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');

// Check environment variables
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
  console.log('Please add TELEGRAM_BOT_TOKEN to your .env file');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY not found in environment variables');
  console.log('Please add OPENAI_API_KEY to your .env file');
  process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize bot with polling
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 Starting SupportGenie AI Telegram Bot...');
console.log('📱 Bot will respond to all messages with AI-generated replies');
console.log('🔄 Use Ctrl+C to stop the bot');

// Set bot commands
const commands = [
  { command: 'start', description: '🚀 Start the bot and get welcome message' },
  { command: 'help', description: '❓ Get help and see available commands' },
  { command: 'services', description: '🛠️ Learn about our services' },
  { command: 'pricing', description: '💰 Check our pricing plans' },
  { command: 'contact', description: '📞 Get contact information' },
  { command: 'demo', description: '🎯 Try a demo conversation' }
];

bot.setMyCommands(commands).then(() => {
  console.log('✅ Bot commands configured successfully!');
}).catch(err => {
  console.log('⚠️ Warning: Could not set bot commands:', err.message);
});

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'User';
  
  const welcomeMessage = `🎉 **Welcome to SupportGenie AI, ${userName}!** 🎉

I'm your 24/7 AI-powered customer support assistant, ready to help you with any questions or support needs.

**What I can do:**
• Answer customer service questions instantly
• Help with product information and pricing
• Provide technical support and troubleshooting
• Handle order inquiries and status updates
• Offer personalized recommendations

**Available Commands:**
/help - See all available commands
/services - Learn about our services
/pricing - Check pricing plans
/contact - Get contact information
/demo - Try a demo conversation

**Just send me any message and I'll help you right away!** 🚀

Powered by OpenAI GPT-4 for intelligent, human-like responses.`;

  await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  console.log(`🚀 /start command from ${userName} (${chatId})`);
});

// Handle /help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `❓ **SupportGenie AI - Help & Commands**

**Available Commands:**
🚀 /start - Welcome message and bot introduction
❓ /help - Show this help message
🛠️ /services - Learn about our services
💰 /pricing - Check pricing plans
📞 /contact - Get contact information
🎯 /demo - Try a demo conversation

**How to use:**
• Send any of the commands above
• Or just type your question - I'll respond with AI-powered help!
• I'm available 24/7 to assist you

**Need immediate help?**
Just type your question and I'll respond instantly! 🚀`;

  await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  console.log(`❓ /help command from user (${chatId})`);
});

// Handle /services command
bot.onText(/\/services/, async (msg) => {
  const chatId = msg.chat.id;
  
  const servicesMessage = `🛠️ **SupportGenie AI Services**

**Core Features:**
🤖 **AI-Powered Support**
• 24/7 intelligent customer assistance
• Context-aware responses
• Multi-language support
• Never gets tired or takes breaks

📱 **Multi-Platform Integration**
• Website chat widget
• Telegram bot (you're using this now!)
• WhatsApp Business integration
• Email support automation

💼 **Business Solutions**
• Customer inquiry management
• Lead generation and qualification
• Support ticket tracking
• Performance analytics

🎯 **Customization**
• Business-specific training
• Brand personality integration
• Industry-specific knowledge
• Scalable for any business size

**Ready to experience AI-powered support?**
Send me any question to see how I can help! 🚀`;

  await bot.sendMessage(chatId, servicesMessage, { parse_mode: 'Markdown' });
  console.log(`🛠️ /services command from user (${chatId})`);
});

// Handle /pricing command
bot.onText(/\/pricing/, async (msg) => {
  const chatId = msg.chat.id;
  
  const pricingMessage = `💰 **SupportGenie AI Pricing Plans**

**Starter Plan - $29/month**
• Up to 1,000 conversations/month
• Basic AI support
• Email support
• Standard response time

**Professional Plan - $79/month**
• Up to 10,000 conversations/month
• Advanced AI with GPT-4
• Multi-platform support
• Priority support
• Analytics dashboard

**Enterprise Plan - $199/month**
• Unlimited conversations
• Custom AI training
• White-label solution
• Dedicated support
• Advanced integrations
• Custom features

**Free Trial Available!**
Try our AI support for 14 days, no credit card required.

**Ready to get started?**
Contact us for a personalized demo or visit our website! 🚀`;

  await bot.sendMessage(chatId, pricingMessage, { parse_mode: 'Markdown' });
  console.log(`💰 /pricing command from user (${chatId})`);
});

// Handle /contact command
bot.onText(/\/contact/, async (msg) => {
  const chatId = msg.chat.id;
  
  const contactMessage = `📞 **Contact SupportGenie AI**

**Get in Touch:**
📧 **Email**: support@supportgenie.ai
🌐 **Website**: https://supportgenie.ai
📱 **Phone**: +1 (555) 123-4567

**Business Hours:**
Monday - Friday: 9:00 AM - 6:00 PM EST
Saturday: 10:00 AM - 4:00 PM EST
Sunday: Closed

**24/7 AI Support:**
I'm available 24/7 to help you with any questions!

**Sales Inquiries:**
For pricing, demos, or enterprise solutions:
📧 sales@supportgenie.ai

**Technical Support:**
For technical issues or bot configuration:
📧 tech@supportgenie.ai

**We're here to help!** 🚀`;

  await bot.sendMessage(chatId, contactMessage, { parse_mode: 'Markdown' });
  console.log(`📞 /contact command from user (${chatId})`);
});

// Handle /demo command
bot.onText(/\/demo/, async (msg) => {
  const chatId = msg.chat.id;
  
  const demoMessage = `🎯 **SupportGenie AI Demo**

**Let's test my AI capabilities!**

Try asking me any of these questions:
• "What are your business hours?"
• "How can I reset my password?"
• "What's your return policy?"
• "Tell me about your premium features"
• "I need help with my order"

**Or ask me anything else!**
I'll respond with intelligent, helpful answers using AI technology.

**Demo Features:**
✅ Natural language understanding
✅ Context-aware responses
✅ Professional customer service tone
✅ Quick response times
✅ 24/7 availability

**Ready to test? Just ask me anything!** 🚀`;

  await bot.sendMessage(chatId, demoMessage, { parse_mode: 'Markdown' });
  console.log(`🎯 /demo command from user (${chatId})`);
});

// Handle incoming messages (non-command)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;
  const userName = msg.from.first_name || 'User';

  if (!userMessage || userMessage.startsWith('/')) return; // Skip commands

  console.log(`📨 Message from ${userName} (${chatId}): ${userMessage}`);

  try {
    // Show typing indicator
    await bot.sendChatAction(chatId, 'typing');

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
          content: userMessage 
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Send AI response
    await bot.sendMessage(chatId, aiResponse);
    
    console.log(`🤖 AI Response: ${aiResponse.substring(0, 100)}${aiResponse.length > 100 ? '...' : ''}`);
    
  } catch (error) {
    console.error('❌ Error generating AI response:', error);
    
    // Send fallback message
    await bot.sendMessage(chatId, 
      "I'm having trouble processing your request right now. Please try again in a moment, or use /contact to reach our human support team for immediate assistance."
    );
  }
});

// Handle bot errors
bot.on('error', (error) => {
  console.error('❌ Bot error:', error);
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stopPolling();
  process.exit(0);
});

// Get bot info on startup
bot.getMe().then((botInfo) => {
  console.log(`✅ Bot started successfully!`);
  console.log(`🤖 Bot name: ${botInfo.first_name}`);
  console.log(`🔗 Bot username: @${botInfo.username}`);
  console.log(`🆔 Bot ID: ${botInfo.id}`);
  console.log(`\n💡 To test your bot:`);
  console.log(`   1. Open Telegram`);
  console.log(`   2. Search for @${botInfo.username}`);
  console.log(`   3. Send a message to start chatting!`);
  console.log(`\n📊 The bot will log all conversations to the console`);
}).catch((error) => {
  console.error('❌ Failed to get bot info:', error);
});
