# 🤖 Telegram Bot Setup Guide

## 🚀 Quick Start

Your SupportGenie AI backend now includes a fully functional Telegram bot with AI-powered responses! Here's how to get it running:

## 📋 Prerequisites

1. **Telegram Account** - You need a Telegram account
2. **BotFather** - Telegram's official bot creation service
3. **OpenAI API Key** - For AI responses
4. **Environment Variables** - Configure your .env file

## 🔧 Step 1: Create Your Telegram Bot

### 1.1 Contact BotFather

1. Open Telegram
2. Search for `@BotFather`
3. Start a chat with BotFather
4. Send `/newbot`

### 1.2 Configure Your Bot

```text
BotFather: Alright, a new bot. How are we going to call it? Please choose a name for your bot.
You: SupportGenie AI

BotFather: Good. Now let's choose a username for your bot. It must end in `bot`. Like this: TetrisBot or tetris_bot.
You: supportgenie_ai_bot

BotFather: Done! Congratulations on your new bot. You will find it at t.me/supportgenie_ai_bot
You can now add a description, about section and profile picture for your bot, see /help for a list of commands.
```

### 1.3 Get Your Bot Token

Send `/mybots` to BotFather, select your bot, then:

1. Click "API Token"
2. Copy the token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## 🔑 Step 2: Configure Environment Variables

Add these to your `.env` file:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
```

## 🧪 Step 3: Test Your Bot

### Option 1: Test Bot Only (Recommended for development)

```bash
cd backend
npm run bot
```

This will start just the bot with polling (no need for webhooks in development).

### Option 2: Test Full Backend

```bash
cd backend
npm run dev
```

The bot will start automatically with the full backend.

## 📱 Step 4: Test Your Bot

1. **Find Your Bot**: Search for your bot username in Telegram
2. **Start Chat**: Send `/start` to begin
3. **Send Messages**: Type any message and get AI responses!
4. **Check Console**: See all conversations logged in your terminal

## 🔍 What You'll See

### In Terminal

```bash
🤖 Starting SupportGenie AI Telegram Bot...
✅ Bot started successfully!
🤖 Bot name: SupportGenie AI
🔗 Bot username: @supportgenie_ai_bot
🆔 Bot ID: 123456789

📨 Message from John (123456789): Hello, how can you help me?
🤖 AI Response: Hi John! I'm SupportGenie AI, your friendly customer support assistant...
```

### In Telegram

- **User**: "Hello, how can you help me?"
- **Bot**: "Hi John! I'm SupportGenie AI, your friendly customer support assistant. I'm here to help you with any questions or support needs you might have. What can I assist you with today?"

## ⚙️ Configuration Options

### AI Model Settings

The bot uses `gpt-4o-mini` by default for fast, cost-effective responses. You can modify this in `routes/telegram.js`:

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini", // Change to "gpt-4" for better quality
  messages: [...],
  max_tokens: 500,      // Adjust response length
  temperature: 0.7      // Adjust creativity (0.0 = focused, 1.0 = creative)
});
```

### System Prompt

Customize the bot's personality by modifying the system prompt in `routes/telegram.js`:

```javascript
{
  role: "system",
  content: "You are SupportGenie AI, a helpful customer support assistant. Be friendly, professional, and helpful. Keep responses concise but informative."
}
```

## 🚀 Production Deployment

### Webhook Setup (Production)

For production, you'll want to use webhooks instead of polling:

1. **Set Webhook URL**:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

1. **Environment Variables**:

```env
NODE_ENV=production
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

2. **SSL Required**: Telegram requires HTTPS for webhooks

### Polling vs Webhooks

- **Development**: Use polling (`npm run bot`)
- **Production**: Use webhooks (more efficient, requires HTTPS)

## 🐛 Troubleshooting

### Common Issues

#### 1. Bot Not Responding

- Check if `TELEGRAM_BOT_TOKEN` is correct
- Verify `OPENAI_API_KEY` is valid
- Check console for error messages

#### 2. "Bot was blocked by the user"

- User blocked your bot
- This is normal - some users block bots

#### 3. OpenAI API Errors

- Check your OpenAI API key
- Verify you have credits in your OpenAI account
- Check rate limits

#### 4. Bot Stops Working

- Restart the bot: `Ctrl+C` then `npm run bot`
- Check for network issues
- Verify environment variables

### Debug Mode

Add this to see more detailed logs:

```javascript
// In test-bot.js or routes/telegram.js
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});
```

## 📊 Monitoring & Analytics

### Conversation Logging

All conversations are automatically logged:

- **Console**: Real-time logs during development
- **Database**: Persistent storage (if Supabase configured)
- **API Endpoints**: Access via `/api/conversations/*`

### Bot Statistics

Check your bot's performance:

```bash
curl "http://localhost:5000/api/telegram/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🌟 Next Steps

1. **Customize Responses**: Modify the system prompt for your business
2. **Add Commands**: Implement `/help`, `/pricing`, etc.
3. **Integrate with Database**: Store conversations for analytics
4. **Add Business Logic**: Connect to your existing systems
5. **Deploy to Production**: Set up webhooks and SSL

## 🎉 Congratulations

You now have a fully functional AI-powered Telegram bot that:

- ✅ Responds to all messages with intelligent AI replies
- ✅ Logs all conversations for analytics
- ✅ Handles errors gracefully
- ✅ Is ready for production deployment
- ✅ Integrates with your SupportGenie AI backend

## 🚀 **Your bot is ready to provide 24/7 AI customer support on Telegram!**

---

*Need help? Check the console logs or refer to the main README.md file.*
