# 🚀 SupportGenie AI Backend

## Node.js Express API for 24/7 AI Customer Support Platform

## 🎯 Overview

SupportGenie AI Backend is a robust, scalable API that powers intelligent customer support across multiple platforms.

This includes WhatsApp, Telegram, and websites.

Built with Node.js, Express, and modern AI technologies.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Authentication**: JWT + bcrypt
- **Payments**: Stripe
- **Messaging**: Telegram Bot API, WhatsApp Business API
- **Security**: Helmet, CORS, Rate Limiting

## 🚀 Features

### **Core Functionality**

- ✅ **AI-Powered Support**: OpenAI integration for intelligent responses
- ✅ **Multi-Platform**: WhatsApp, Telegram, and website support
- ✅ **User Management**: Registration, authentication, profile management
- ✅ **Business Management**: Multi-tenant business support
- ✅ **Conversation Tracking**: Complete conversation history and analytics
- ✅ **Subscription Management**: Stripe integration for billing

### **AI Capabilities**

- **Intelligent Responses**: Context-aware customer support
- **Business Training**: Custom AI models for specific businesses
- **Confidence Scoring**: AI response quality metrics
- **Fallback Handling**: Graceful degradation when AI fails
- **Multi-Language Support**: International customer support

### **Security Features**

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP header security

## 📁 Project Structure

```text
backend/
├── config/           # Configuration files
├── middleware/       # Custom middleware (auth, validation)
├── routes/           # API route handlers
│   ├── ai.js        # AI conversation endpoints
│   ├── auth.js      # Authentication routes
│   ├── telegram.js  # Telegram bot integration
│   ├── whatsapp.js  # WhatsApp Business API
│   ├── payments.js  # Stripe payment routes
│   ├── users.js     # User management
│   └── conversations.js # Conversation tracking
├── services/         # Business logic services
│   └── aiService.js # OpenAI integration
├── utils/            # Utility functions
├── server.js         # Main application file
├── package.json      # Dependencies
└── env.example       # Environment variables template
```

## 🚀 Quick Start

### **Prerequisites**

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key
- Telegram Bot Token
- Stripe account

### **Installation**

1. **Clone and navigate to backend**

```bash
cd backend
```

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

```bash
cp env.example .env
# Edit .env with your actual values
```

3. **Start development server**

```bash
npm run dev
```

4. **Test the API**

```bash
curl http://localhost:5000/health
```

## 🔧 Environment Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database (Supabase)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_whatsapp_verify_token

# Stripe Payment
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d
```

## 📡 API Endpoints

### **Health Check**

- `GET /health` - API status and version

### **Authentication**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### **AI Support**

- `POST /api/ai/conversation` - Generate AI response
- `POST /api/ai/train` - Train AI model
- `GET /api/ai/analytics/:businessId` - AI performance analytics
- `GET /api/ai/status/:businessId` - AI model status

### **Telegram Bot**

- `POST /api/telegram/webhook` - Telegram webhook
- `POST /api/telegram/set-webhook` - Set webhook URL
- `GET /api/telegram/webhook-info` - Get webhook info
- `POST /api/telegram/send-message` - Send message
- `GET /api/telegram/bot-info` - Get bot information

### **WhatsApp**

- `GET /api/whatsapp/webhook` - Webhook verification
- `POST /api/whatsapp/webhook` - WhatsApp webhook

### **Payments**

- `GET /api/payments/subscriptions` - Get subscriptions

### **Users**

- `GET /api/users/profile` - Get user profile

### **Conversations**

- `GET /api/conversations/history` - Get conversation history

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

Include the token in the Authorization header:

```bash
Authorization: Bearer your_jwt_token_here
```

## 🧠 AI Integration

### **OpenAI Configuration**

- **Model**: GPT-4 (configurable)
- **Max Tokens**: 1000 (configurable)
- **Temperature**: 0.7 (configurable)
- **Fallback Responses**: Graceful degradation when AI fails

### **Business Context**

The AI automatically includes business-specific context for personalized responses:

- Business name and industry
- Support policies
- Previous conversation history
- Platform-specific guidelines

### **Confidence Scoring**

Each AI response includes a confidence score (0-1) based on:

- Response length and detail
- Question-answer alignment
- Uncertain language detection
- Historical performance

## 📊 Database Schema

### **Core Tables**

- `users` - User accounts and profiles
- `businesses` - Business information
- `subscriptions` - Subscription and billing data
- `conversations` - Customer conversation history
- `ai_interactions` - AI response analytics
- `platform_integrations` - WhatsApp/Telegram settings

## 🚀 Deployment

### **Production Setup**

1. **Environment Variables**: Set all required environment variables
2. **Database**: Ensure Supabase is properly configured
3. **SSL**: Enable HTTPS for production
4. **Monitoring**: Set up logging and error tracking
5. **Scaling**: Consider load balancing for high traffic

### **Docker Deployment**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### **Environment Variables for Production**

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com
# ... other production variables
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Supabase client protection
- **XSS Protection**: Helmet security headers
- **CORS Configuration**: Controlled cross-origin access
- **JWT Security**: Secure token handling

## 📈 Performance Optimization

- **Compression**: Gzip compression for responses
- **Caching**: Redis caching for AI responses (planned)
- **Database Indexing**: Optimized Supabase queries
- **Connection Pooling**: Efficient database connections
- **Async Operations**: Non-blocking I/O operations

## 🧪 Testing

### **Run Tests**

```bash
npm test
```

### **Test Coverage**

```bash
npm run test:coverage
```

### **API Testing**

Use tools like Postman or curl to test endpoints:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test AI conversation (requires auth)
curl -X POST http://localhost:5000/api/ai/conversation \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "platform": "website"}'
```

## 🔧 Development

### **Development Server**

```bash
npm run dev
```

### **Production Build**

```bash
npm run build
npm start
```

### **Code Quality**

- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks (planned)

## 📚 API Documentation

### **Request Format**

All API requests should use JSON format:

```json
{
  "key": "value"
}
```

### **Response Format**

Standardized response format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "error": null
}
```

### **Error Handling**

Comprehensive error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 🌟 Future Enhancements

### **Planned Features**

- **Redis Caching**: AI response caching
- **WebSocket Support**: Real-time conversations
- **File Upload**: Document and image support
- **Advanced Analytics**: Detailed performance metrics
- **Multi-Language**: Internationalization support
- **Webhook Management**: Dynamic webhook configuration

### **Scalability Improvements**

- **Microservices**: Service decomposition
- **Message Queues**: Async processing
- **CDN Integration**: Static asset delivery
- **Load Balancing**: Traffic distribution
- **Auto-scaling**: Cloud-native scaling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- **Documentation**: Check this README
- **Issues**: Create GitHub issue
- **Email**: <backend@supportgenie.ai>

## 📄 License

MIT License - see LICENSE file for details

---

## ❤️ **Built with love for businesses that want to provide exceptional customer support**

### **SupportGenie AI - Empowering businesses with intelligent, 24/7 customer support**
