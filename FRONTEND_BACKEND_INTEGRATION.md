# 🔗 Frontend + Backend Integration Guide

## 🎯 Overview

This guide will help you connect your Next.js frontend with your Express
backend to create a fully functional SupportGenie AI application.

## 🚀 Quick Start

### 1. **Start Both Servers**

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

**Terminal 2 - Frontend:**

```bash
# In the root directory
npm run dev
# Frontend will run on http://localhost:3000
```

### 2. **Configure Environment Variables**

Create a `.env.local` file in your root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🔧 What's Been Integrated

### ✅ **Authentication System**

- **Login/Register Modal** - Beautiful authentication forms
- **JWT Token Management** - Automatic token storage and API calls
- **Protected Routes** - Dashboard access for authenticated users
- **User Context** - Global state management for user data

### ✅ **API Integration Layer**

- **Centralized API Client** - `app/lib/api.ts`
- **Type-Safe Interfaces** - Full TypeScript support
- **Error Handling** - Graceful error management
- **Authentication Headers** - Automatic token inclusion

### ✅ **Real-Time Features**

- **Bot Status Monitoring** - Live bot status updates
- **Conversation Analytics** - Real-time conversation data
- **Platform Integration** - Telegram, WhatsApp, Website support

### ✅ **User Experience**

- **Responsive Header** - Navigation with authentication
- **Dynamic CTAs** - Different buttons for logged-in vs. guests
- **Dashboard** - Full management interface for users
- **Loading States** - Smooth user experience

## 📁 File Structure

```text
app/
├── components/
│   ├── Header.tsx          # Navigation + Auth buttons
│   ├── AuthModal.tsx       # Login/Register forms
│   ├── DemoChat.tsx        # AI chat demo
│   └── ContactForm.tsx     # Contact form
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── dashboard/
│   └── page.tsx            # User dashboard
├── lib/
│   └── api.ts              # API client & utilities
├── layout.tsx              # Root layout with AuthProvider
└── page.tsx                # Landing page
```

## 🔐 Authentication Flow

### **Registration Process**

1. User clicks "Get Started" button
2. AuthModal opens with registration form
3. User fills in details (name, email, password, company)
4. Form submits to `/api/auth/register`
5. Backend creates user and business
6. Frontend receives JWT token
7. User is automatically logged in
8. Modal closes, user sees dashboard button

### **Login Process**

1. User clicks "Sign In" button
2. AuthModal opens with login form
3. User enters email and password
4. Form submits to `/api/auth/login`
5. Backend validates credentials
6. Frontend receives JWT token
7. User is logged in
8. Modal closes, user sees profile menu

### **Token Management**

- **Automatic Storage**: JWT tokens stored in localStorage
- **API Headers**: Tokens automatically included in API calls
- **Session Persistence**: Users stay logged in across page refreshes
- **Secure Logout**: Tokens cleared on logout

## 🌐 API Endpoints

### **Authentication**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### **AI & Conversations**

- `POST /api/ai/conversation` - Generate AI response
- `GET /api/conversations/history` - Get conversation history
- `GET /api/conversations/analytics` - Get analytics

### **Telegram Bot**

- `GET /api/telegram/status` - Get bot status
- `POST /api/telegram/send-message` - Send message

### **Health Check**

- `GET /health` - Backend status

## 🎨 UI Components

### **Header Component**

- **Logo & Branding** - SupportGenie AI branding
- **Navigation Menu** - Features, Pricing, Demo, Contact
- **Authentication Buttons** - Dynamic based on login status
- **User Menu** - Profile dropdown for logged-in users

### **AuthModal Component**

- **Dual Mode** - Login and registration in one modal
- **Form Validation** - Client-side validation
- **Error Handling** - User-friendly error messages
- **Success States** - Confirmation messages

### **Dashboard Component**

- **Real-Time Stats** - Live conversation data
- **Bot Management** - Bot status and controls
- **Platform Overview** - Multi-platform support status
- **Quick Actions** - Common management tasks

## 🔄 Data Flow

### **Frontend → Backend**

1. User interacts with UI component
2. Component calls API function from `api.ts`
3. API client adds authentication headers
4. Request sent to backend endpoint
5. Backend processes request and responds
6. Frontend receives response and updates UI

### **Backend → Frontend**

1. Backend processes webhook/API request
2. Data stored in database
3. Frontend polls for updates or receives real-time data
4. UI components re-render with new data
5. User sees updated information

## 🧪 Testing the Integration

### **1. Test Authentication**

```bash
# Start both servers
cd backend && npm run dev
# In another terminal
npm run dev

# Open http://localhost:3000
# Click "Get Started" button
# Fill out registration form
# Verify user is created and logged in
```

### **2. Test API Connection**

```bash
# Check backend health
curl http://localhost:5000/health

# Check frontend can reach backend
# Open browser dev tools → Network tab
# Look for API calls to localhost:5000
```

### **3. Test Dashboard**

```bash
# After logging in, click "Go to Dashboard"
# Verify dashboard loads with user data
# Check bot status and conversation stats
```

## 🐛 Troubleshooting

### **Common Issues**

#### **1. CORS Errors**

**Problem**: Frontend can't reach backend
**Solution**: Backend CORS is configured for `http://localhost:3000`

#### **2. Authentication Fails**

**Problem**: Login/register doesn't work
**Solution**:

- Check backend is running on port 5000
- Verify `.env.local` has correct API URL
- Check browser console for errors

#### **3. Dashboard Not Loading**

**Problem**: Dashboard shows loading forever
**Solution**:

- Check user is authenticated
- Verify backend API endpoints are working
- Check browser network tab for failed requests

#### **4. Bot Status Unknown**

**Problem**: Bot status shows as offline
**Solution**:

- Ensure backend is running
- Check Telegram bot token is set
- Verify bot is configured properly

### **Debug Steps**

1. **Check Backend Logs** - Look for API request logs
2. **Check Frontend Console** - Look for JavaScript errors
3. **Check Network Tab** - Verify API calls are being made
4. **Check Environment Variables** - Ensure API URL is correct

## 🚀 Production Deployment

### **Environment Variables**

```env
# Production
NEXT_PUBLIC_API_URL=https://your-backend-domain.com

# Development
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### **CORS Configuration**

Backend automatically configures CORS for your frontend domain.

### **SSL Requirements**

- **Frontend**: HTTPS required for production
- **Backend**: HTTPS required for Telegram webhooks

## 🌟 Next Steps

### **Immediate Enhancements**

1. **Real-Time Updates** - WebSocket integration for live data
2. **Push Notifications** - Browser notifications for new conversations
3. **Advanced Analytics** - Charts and graphs for conversation data
4. **User Settings** - Profile and bot configuration pages

### **Advanced Features**

1. **Multi-User Support** - Team collaboration features
2. **Advanced Bot Training** - Custom AI model training
3. **Integration APIs** - Third-party service connections
4. **Mobile App** - React Native mobile application

## 🎉 Congratulations

You now have a **fully integrated frontend and backend** that provides:

- ✅ **User Authentication** - Complete login/register system
- ✅ **Real-Time Dashboard** - Live bot status and analytics
- ✅ **API Integration** - Seamless frontend-backend communication
- ✅ **Professional UI** - Beautiful, responsive interface
- ✅ **Production Ready** - Scalable architecture

## 🎯 Final Achievement

Your SupportGenie AI application is now a complete, revenue-generating
platform! 🚀💰

---

## 📚 Additional Resources

- **Backend Documentation**: `backend/README.md`
- **Telegram Bot Setup**: `backend/TELEGRAM_SETUP.md`
- **API Reference**: Check the backend routes for detailed endpoint information
- **Component Library**: All components are built with Tailwind CSS and Lucide icons

**Need help?** Check the console logs, network tab, and backend terminal for
debugging information.
