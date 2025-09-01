# 🗄️ Supabase Database Setup Guide

## 🎯 **Step 1: Open Supabase SQL Editor**

1. Go to your Supabase project:
   [https://poznxxzojrncbttztinx.supabase.co](https://poznxxzojrncbttztinx.supabase.co)
2. In the left sidebar, click **"SQL Editor"**
3. Click **"New Query"**

## 📝 **Step 2: Run the Database Setup Script**

1. **Copy the entire content** from `backend/setup-database.sql`
2. **Paste it** into the SQL Editor
3. **Click "Run"** (or press Ctrl+Enter)

## ✅ **What This Script Creates:**

### **Core Tables:**

- **users** - User accounts and authentication
- **businesses** - Business information
- **conversations** - Chat conversations
- **messages** - Individual chat messages
- **leads** - Customer leads and inquiries
- **subscriptions** - Payment subscriptions
- **bot_configs** - Bot configuration settings
- **analytics** - Usage and performance metrics

### **Features:**

- ✅ UUID primary keys for security
- ✅ Proper foreign key relationships
- ✅ Automatic timestamps
- ✅ Row Level Security (RLS) enabled
- ✅ Performance indexes
- ✅ Sample data for testing

## 🔍 **Step 3: Verify Setup**

After running the script, you should see:

```sql
✅ Database setup completed successfully!
```

## 🧪 **Step 4: Test Database Connection**

Once the tables are created, we can test if your backend can connect to the database properly.

## 🚀 **Next Steps After Database Setup:**

1. ✅ **Environment Configuration** - Complete
2. ✅ **Database Setup** - In Progress
3. 🔄 **Test Full Backend** - Next
4. 🔑 **Configure Other Services** - Stripe, Telegram
5. 🚀 **Deploy to Production**

---

## 🆘 **Need Help?**

If you encounter any errors:

1. Check the error message in Supabase
2. Make sure you're in the SQL Editor
3. Ensure you copied the entire script
4. Try running it in smaller sections if needed

## 🗄️✨ **Run the database setup script now, and let me know when it's complete!**
