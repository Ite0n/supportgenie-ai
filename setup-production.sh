#!/bin/bash

# 🚀 SupportGenie AI Production Setup Script
# This script helps you set up your production environment

echo "🚀 Welcome to SupportGenie AI Production Setup!"
echo "================================================"

# Check if running on Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "⚠️  Windows detected. Some commands may need manual execution."
    echo "Please run the equivalent Windows commands manually."
    echo ""
fi

echo "📋 Let's get your application production-ready!"
echo ""

# 1. Environment Files Setup
echo "1️⃣  Setting up environment files..."
echo "   - Copy backend/env.example to backend/.env"
echo "   - Copy env.production.example to .env.local"
echo "   - Fill in your actual production values"
echo ""

# 2. Database Setup
echo "2️⃣  Database Setup Required:"
echo "   - Create Supabase project at https://supabase.com"
echo "   - Get your project URL and API keys"
echo "   - Update backend/.env with database credentials"
echo ""

# 3. API Keys Setup
echo "3️⃣  API Keys Required:"
echo "   - OpenAI API key: https://platform.openai.com/api-keys"
echo "   - Stripe API keys: https://dashboard.stripe.com/apikeys"
echo "   - Telegram bot token: @BotFather on Telegram"
echo ""

# 4. Security Setup
echo "4️⃣  Security Configuration:"
echo "   - Generate strong JWT secret (use: openssl rand -base64 32)"
echo "   - Configure CORS for your production domains"
echo "   - Set up rate limiting"
echo ""

# 5. Deployment Options
echo "5️⃣  Deployment Options:"
echo "   Backend: Railway (recommended), Render, or DigitalOcean"
echo "   Frontend: Vercel (recommended) or Netlify"
echo ""

# 6. Testing
echo "6️⃣  Testing Requirements:"
echo "   - Run: npm run test:integration"
echo "   - Test all API endpoints"
echo "   - Verify authentication flows"
echo "   - Test payment processing"
echo ""

# 7. Monitoring
echo "7️⃣  Monitoring Setup:"
echo "   - Google Analytics 4"
echo "   - Sentry for error tracking"
echo "   - Uptime monitoring"
echo ""

echo "🎯 NEXT STEPS:"
echo "==============="
echo "1. Complete the DEPLOYMENT_CHECKLIST.md"
echo "2. Set up your environment variables"
echo "3. Configure your database"
echo "4. Deploy backend first, then frontend"
echo "5. Test everything thoroughly"
echo ""

echo "📚 RESOURCES:"
echo "============="
echo "• DEPLOYMENT_CHECKLIST.md - Complete deployment guide"
echo "• FRONTEND_BACKEND_INTEGRATION.md - Integration details"
echo "• MONETIZATION_SETUP.md - Payment configuration"
echo "• VIRAL_GROWTH_STRATEGY.md - Growth strategies"
echo ""

echo "🚀 You're ready to deploy SupportGenie AI to production!"
echo "Need help? Check the documentation files above."
