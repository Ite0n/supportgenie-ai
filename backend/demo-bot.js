#!/usr/bin/env node

/**
 * 🚀 SupportGenie AI - Public Demo Bot
 * 
 * This bot showcases our AI support capabilities to potential customers.
 * It's designed to go viral by demonstrating instant, intelligent responses.
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');

// Demo bot configuration
const DEMO_BOT_TOKEN = process.env.DEMO_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!DEMO_BOT_TOKEN) {
  console.error('❌ DEMO_BOT_TOKEN or TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is required');
  process.exit(1);
}

// Initialize bot and OpenAI
const bot = new TelegramBot(DEMO_BOT_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Demo bot system prompt - designed for viral appeal
const DEMO_SYSTEM_PROMPT = `You are SupportGenie AI, a revolutionary 24/7 AI support system that never sleeps and responds instantly to customer inquiries.

Your mission: Demonstrate how AI can transform customer support by providing:
- Instant, accurate responses (under 1 second)
- Professional, helpful tone
- Problem-solving capabilities
- 24/7 availability

Key talking points to emphasize:
- "Never miss a customer again"
- "24/7 instant support"
- "Save time and boost sales"
- "AI that actually helps"

When users ask about SupportGenie AI:
- Explain it's a platform for businesses to deploy AI support
- Mention WhatsApp, Telegram, and website integration
- Highlight the free trial and pricing
- Encourage them to visit supportgenie.ai

Keep responses concise, engaging, and showcase your intelligence.
Always end with a call-to-action to learn more about SupportGenie AI.`;

// Track demo usage for analytics
const demoStats = {
  totalUsers: new Set(),
  totalMessages: 0,
  startTime: new Date(),
  platform: 'telegram'
};

// Welcome message for new users
const WELCOME_MESSAGE = `🤖 **Welcome to SupportGenie AI Demo!**

I'm your AI support assistant, ready to help 24/7. 

**What I can do:**
• Answer questions instantly
• Solve problems quickly  
• Provide 24/7 support
• Never get tired or frustrated

**Try asking me anything!** Examples:
• "How can I improve customer service?"
• "What's the best way to handle refunds?"
• "Tell me about SupportGenie AI"

💡 **Pro tip:** I respond in under 1 second!

---
*This is a demo of SupportGenie AI - the future of customer support*
🌐 Learn more: [supportgenie.ai](https://supportgenie.ai)`;

// Handle incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const messageText = msg.text;
  const userName = msg.from.first_name || 'User';

  // Track stats
  demoStats.totalUsers.add(userId);
  demoStats.totalMessages++;

  console.log(`📱 [${new Date().toISOString()}] ${userName} (${userId}): ${messageText}`);

  try {
    // Send typing indicator for better UX
    bot.sendChatAction(chatId, 'typing');

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: DEMO_SYSTEM_PROMPT },
        { role: 'user', content: messageText }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    // Add demo branding to responses
    const brandedResponse = `${aiResponse}

---
🤖 *Powered by SupportGenie AI*
💡 **Ready to deploy this for your business?**
🌐 [Start Free Trial](https://supportgenie.ai)
📱 24/7 AI Support on WhatsApp, Telegram & Website`;

    // Send response
    await bot.sendMessage(chatId, brandedResponse, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });

    console.log(`🤖 [${new Date().toISOString()}] AI Response sent to ${userName}`);

  } catch (error) {
    console.error('❌ Error generating AI response:', error);
    
    // Fallback response
    const fallbackResponse = `I apologize, but I'm experiencing a temporary issue. 

This is exactly why businesses need reliable AI support systems like SupportGenie AI! 

🌐 Visit [supportgenie.ai](https://supportgenie.ai) to learn how we can help your business never miss a customer again.`;

    await bot.sendMessage(chatId, fallbackResponse, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
  }
});

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, WELCOME_MESSAGE, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Handle /help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `🔧 **SupportGenie AI Demo - Help**

**Commands:**
/start - Welcome message
/help - This help message
/stats - Demo statistics
/about - About SupportGenie AI

**What to try:**
• Ask me business questions
• Test my problem-solving skills
• See how fast I respond
• Experience 24/7 AI support

**Ready to deploy this for your business?**
🌐 [supportgenie.ai](https://supportgenie.ai)
📧 support@supportgenie.ai`;

  await bot.sendMessage(chatId, helpMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Handle /stats command (for demo purposes)
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const uptime = Math.floor((new Date() - demoStats.startTime) / 1000 / 60);
  
  const statsMessage = `📊 **Demo Bot Statistics**

**Performance:**
• Total Users: ${demoStats.totalUsers.size}
• Total Messages: ${demoStats.totalMessages}
• Uptime: ${uptime} minutes
• Platform: ${demoStats.platform}

**This is just a demo!**
Imagine having this level of support for your business 24/7.

🌐 [Deploy Your Own AI Support](https://supportgenie.ai)`;

  await bot.sendMessage(chatId, statsMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Handle /about command
bot.onText(/\/about/, async (msg) => {
  const chatId = msg.chat.id;
  const aboutMessage = `🚀 **About SupportGenie AI**

**What We Do:**
We help businesses deploy AI-powered customer support that:
• Responds instantly (under 1 second)
• Works 24/7 without breaks
• Integrates with WhatsApp, Telegram & websites
• Learns and improves over time

**Why It's Revolutionary:**
• Never miss a customer inquiry
• Reduce support costs by 80%
• Increase customer satisfaction
• Scale support without hiring

**Perfect For:**
• E-commerce stores
• SaaS companies
• Service businesses
• Any business with customers

🌐 [Start Free Trial](https://supportgenie.ai)
📧 support@supportgenie.ai
💬 Join our community`;

  await bot.sendMessage(chatId, aboutMessage, { 
    parse_mode: 'Markdown',
    disable_web_page_preview: true 
  });
});

// Log bot startup
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});

bot.on('webhook_error', (error) => {
  console.error('❌ Webhook error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down demo bot...');
  
  // Log final stats
  console.log('\n📊 Final Demo Statistics:');
  console.log(`Total Unique Users: ${demoStats.totalUsers.size}`);
  console.log(`Total Messages: ${demoStats.totalMessages}`);
  console.log(`Uptime: ${Math.floor((new Date() - demoStats.startTime) / 1000 / 60)} minutes`);
  
  await bot.stopPolling();
  process.exit(0);
});

// Startup message
console.log('🚀 SupportGenie AI Demo Bot Starting...');
console.log('📱 Bot Token:', DEMO_BOT_TOKEN ? '✅ Configured' : '❌ Missing');
console.log('🤖 OpenAI Key:', OPENAI_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('⏰ Started at:', new Date().toISOString());
console.log('💡 Demo bot is now running and ready to go viral!');
console.log('📊 Use /stats to see demo performance');
console.log('🛑 Press Ctrl+C to stop the bot\n');

// Log periodic stats
setInterval(() => {
  const uptime = Math.floor((new Date() - demoStats.startTime) / 1000 / 60);
  console.log(`📊 [${new Date().toISOString()}] Demo Stats - Users: ${demoStats.totalUsers.size}, Messages: ${demoStats.totalMessages}, Uptime: ${uptime}m`);
}, 5 * 60 * 1000); // Every 5 minutes
