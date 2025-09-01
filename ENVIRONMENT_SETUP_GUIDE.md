# 🔧 Environment Configuration Setup Guide

## 🎯 **Step 1: Environment Files Created ✅**

I've created the following environment files for you:

- `backend/.env` - Backend configuration
- `.env.local` - Frontend configuration

## 📋 **Step 2: Required Values to Fill In**

### **🔐 CRITICAL - Must Fill First (Blocking Deployment)**

#### **1. Database Configuration (Supabase)**

```env
# In backend/.env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get these:**

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy the URL and keys

#### **2. JWT Secret (Security)**

```env
# In backend/.env
JWT_SECRET=your_very_long_random_secret_key_here
```

**How to generate:**

```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```

#### **3. OpenAI API Key**

```env
# In backend/.env
OPENAI_API_KEY=sk-...
```

**How to get:**

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/Login
3. Go to API Keys
4. Create new secret key

#### **4. Stripe API Keys**

```env
# In backend/.env
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_...
```

**How to get:**

1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Go to Developers → API Keys
4. Copy the keys

### **🤖 IMPORTANT - Bot Integrations**

#### **5. Telegram Bot Token**

```env
# In backend/.env
TELEGRAM_BOT_TOKEN=1234567890:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDs...
```

**How to get:**

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Follow instructions
4. Copy the token

#### **6. WhatsApp Business API (Optional)**

```env
# In backend/.env
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

**How to get:**

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create WhatsApp Business app
3. Follow verification process

### **📧 OPTIONAL - Email & Monitoring**

#### **7. Email Configuration**

```env
# In backend/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**How to set up Gmail:**

1. Enable 2-factor authentication
2. Generate app password
3. Use app password instead of regular password

#### **8. Monitoring Services**

```env
# In backend/.env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**How to get:**

1. Go to [sentry.io](https://sentry.io)
2. Create account
3. Create new project
4. Copy DSN

### **🌐 FRONTEND CONFIGURATION**

#### **9. Backend API URL**

```env
# In .env.local
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

**What to put here:**

- Development: `http://localhost:5000`
- Production: Your deployed backend URL (e.g., `https://api.supportgenie.ai`)

#### **10. Analytics & Monitoring**

```env
# In .env.local
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**How to get Google Analytics:**

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create account
3. Create property
4. Copy Measurement ID (starts with G-)

## 🚀 **Step 3: Quick Setup Commands**

### **Generate JWT Secret:**

```bash
# Windows PowerShell
[System.Web.Security.Membership]::GeneratePassword(64, 0)

# Or use online generator: https://generate-secret.vercel.app/64
```

### **Test Environment Configuration:**

```bash
# Test backend
cd backend
npm run dev

# Test frontend (in another terminal)
npm run dev
```

## ⚠️ **Step 4: Security Checklist**

- [ ] JWT secret is at least 32 characters long
- [ ] All API keys are kept secret (never commit to git)
- [ ] Database credentials are secure
- [ ] CORS origins are restricted to your domains
- [ ] Rate limiting is enabled

## 🔍 **Step 5: Validation**

After filling in the values, test:

1. **Backend starts without errors**
2. **Frontend can connect to backend**
3. **Database connection works**
4. **API endpoints respond**

## 📚 **Next Steps**

Once environment configuration is complete:

1. ✅ **Environment Configuration** ← You are here
2. 🔄 **Database Setup**
3. 🔑 **API Keys & Services**
4. 🔒 **Security Configuration**
5. 🚀 **Deployment**

---

## 🆘 **Need Help?**

- **Supabase Setup**: Check `backend/README.md`
- **Telegram Bot**: Check `backend/TELEGRAM_SETUP.md`
- **Payment Setup**: Check `MONETIZATION_SETUP.md`
- **Deployment**: Check `DEPLOYMENT_CHECKLIST.md`

**Your environment files are ready! Fill in the values above and you'll be ready for the next step.** 🎉
