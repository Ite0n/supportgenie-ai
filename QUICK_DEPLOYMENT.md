# 🚀 Quick Deployment Guide - SupportGenie AI

## ⚡ Deploy in 15 Minutes!

This guide will get your SupportGenie AI live on the internet using **Vercel (Frontend)** and **Render (Backend)** - both completely FREE!

---

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Vercel account (free)
- ✅ Render account (free)
- ✅ Your code is working locally (✅ Already done!)

---

## 🚀 Step 1: Push to GitHub

### 1.1 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New repository"
3. Name: `supportgenie-ai`
4. Make it **Public** (required for free deployment)
5. Click "Create repository"

### 1.2 Push Your Code
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - SupportGenie AI ready for deployment"

# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/supportgenie-ai.git

# Push to GitHub
git push -u origin main
```

---

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Verify your email

### 2.2 Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `supportgenie-ai-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm run production`
   - **Plan**: Free

### 2.3 Set Environment Variables
Click "Environment" and add these variables:

```bash
NODE_ENV=production
PORT=10000
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=your_super_secure_jwt_secret_here_make_it_long_and_random
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Copy your backend URL (e.g., `https://supportgenie-ai-backend.onrender.com`)

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Verify your email

### 3.2 Deploy Frontend
1. Click "New Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3.3 Set Environment Variables
Click "Environment Variables" and add:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**⚠️ Important**: Replace `your-backend-domain.onrender.com` with your actual Render backend URL!

### 3.4 Deploy
1. Click "Deploy"
2. Wait for deployment (1-2 minutes)
3. Copy your frontend URL (e.g., `https://supportgenie-ai.vercel.app`)

---

## 🔄 Step 4: Update Backend CORS

### 4.1 Update Frontend URL in Render
1. Go back to Render dashboard
2. Click on your backend service
3. Go to "Environment"
4. Update `FRONTEND_URL` with your Vercel frontend URL
5. Redeploy (will happen automatically)

---

## 🧪 Step 5: Test Your Deployment

### 5.1 Test Backend
```bash
# Health check
curl https://your-backend-domain.onrender.com/health

# Should return: {"status":"healthy","environment":"production"}
```

### 5.2 Test Frontend
1. Open your Vercel frontend URL
2. Test the AI chat
3. Test user registration/login
4. Test all features

### 5.3 Test Telegram Bot
1. Send `/start` to your bot
2. Test AI responses
3. Verify all commands work

---

## 🎯 Step 6: Configure Custom Domain (Optional)

### 6.1 Backend Domain
1. In Render: Go to "Settings" → "Custom Domains"
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed

### 6.2 Frontend Domain
1. In Vercel: Go to "Settings" → "Domains"
2. Add your domain (e.g., `yourdomain.com`)
3. Update DNS records as instructed

---

## 🔒 Security Checklist

- [ ] Environment variables are set
- [ ] HTTPS is enabled (automatic on Vercel/Render)
- [ ] CORS is configured properly
- [ ] Rate limiting is active
- [ ] JWT secrets are strong

---

## 🆘 Troubleshooting

### Common Issues

**1. Backend won't start**
- Check environment variables in Render
- Verify all required packages are in package.json
- Check Render logs for errors

**2. Frontend can't connect to backend**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration
- Ensure backend is running

**3. Database connection fails**
- Verify Supabase credentials
- Check if Supabase project is active
- Verify IP allowlist settings

**4. Telegram bot not responding**
- Check bot token in environment variables
- Verify webhook URL is correct
- Check bot permissions

---

## 🎉 Success!

Your SupportGenie AI is now live on the internet! 

**Frontend**: `https://your-app.vercel.app`  
**Backend**: `https://your-app.onrender.com`  
**Database**: Supabase (already configured)  
**AI**: OpenAI (working)  
**Bot**: Telegram (active)  

---

## 🚀 Next Steps

1. **Test everything thoroughly**
2. **Set up monitoring** (UptimeRobot, Pingdom)
3. **Configure analytics** (Google Analytics, Mixpanel)
4. **Set up error tracking** (Sentry, LogRocket)
5. **Scale up** when ready (upgrade plans, add more features)

---

## 💡 Pro Tips

- **Free tier limits**: Render free tier sleeps after 15 minutes of inactivity
- **Custom domains**: Add them after initial deployment is working
- **Environment variables**: Keep them secure and never commit to git
- **Monitoring**: Set up alerts for downtime
- **Backups**: Regular database backups are crucial

---

**Need help?** Check the logs in Render and Vercel dashboards, or refer to the troubleshooting section above!
