# 🎯 Admin Panel Deployment Guide

## ✅ Current Deployment Architecture

### **Admin Panel:**
- **Hosting:** Vercel (auto-deploys from GitHub)
- **Domain:** https://admin.forpurposetechnologies.com
- **CDN/Proxy:** Cloudflare (for HTTPS and security)
- **GitHub Repo:** https://github.com/sbeverage/ti-admin-panel.git
- **Auto-Deploy:** ✅ Enabled (pushes to GitHub → auto-deploy to Vercel)

### **Backend API:**
- **Hosting:** Supabase Edge Functions
- **Domain:** https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin
- **Database:** Supabase PostgreSQL
- **CDN/Proxy:** Cloudflare (for HTTPS and security)

---

## 🔍 About "Proxy Detected" Message

The **"Proxy Detected"** message is from **Cloudflare**, not AWS!

- **Cloudflare** sits between users and Vercel
- **Vercel** hosts the actual React admin panel
- **Cloudflare** provides SSL/TLS encryption and proxying

**This is normal and expected!** 🔐

---

## 🚀 How to Deploy the Admin Panel

### **Method 1: Push to GitHub (RECOMMENDED)**

```bash
# Navigate to admin panel directory
cd /Users/stephaniebeverage/ti-admin-panel

# Make your changes to the code
# Then commit and push:
git add .
git commit -m "Your update message"
git push origin main

# Vercel will automatically:
# 1. Detect the push
# 2. Run npm install
# 3. Run npm run build
# 4. Deploy to production
# 5. Update https://admin.forpurposetechnologies.com
```

**⏱️ Deployment Time:** 1-2 minutes

### **Method 2: Deploy from Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Find your `ti-admin-panel` project
3. Click **"Redeploy"** to rebuild from latest GitHub commit

---

## 🔧 Current Configuration

### **Admin Panel API Config** (`src/services/api.ts`):

```typescript
const API_CONFIG = {
  baseURL: process.env.NODE_ENV === 'development'
    ? '/api/admin'  // Use proxy in development
    : 'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin',  // Production Supabase Edge Function URL
  headers: {
    'X-Admin-Secret': '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e',
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A'
  }
};
```

### **Environment Variables** (Set in Vercel Dashboard):

```env
REACT_APP_API_BASE_URL=https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin
REACT_APP_ADMIN_SECRET=6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e
NODE_ENV=production
```

---

## 📋 Quick Update Workflow

### **1. Test Locally:**
```bash
cd /Users/stephaniebeverage/ti-admin-panel
npm start
# Check http://localhost:3000
```

### **2. Commit Changes:**
```bash
git add .
git commit -m "Description of changes"
```

### **3. Deploy:**
```bash
git push origin main
# Wait 1-2 minutes for Vercel to auto-deploy
```

### **4. Verify:**
```bash
# Check if admin panel loads
curl -sI https://admin.forpurposetechnologies.com | head -5
```

---

## ✅ Verification Tests

### **Test Admin Panel:**
```bash
# Check if admin panel loads
curl -sI https://admin.forpurposetechnologies.com | head -5

# Should return:
# HTTP/2 200 
# content-type: text/html; charset=utf-8
# server: Vercel
```

### **Test API Backend:**
```bash
# Check if backend is accessible
curl -s https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/health | jq .

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-20T...",
#   "environment": "production"
# }
```

---

## 📝 What You DON'T Need to Do

**You do NOT need to:**
- ❌ Upload to S3
- ❌ Use AWS CLI
- ❌ Configure CloudFront
- ❌ Deploy to EC2
- ❌ Use Elastic Beanstalk for the admin panel
- ❌ Manually copy files to a server
- ❌ Run `npm run build` manually
- ❌ Configure Nginx or Apache

**The admin panel auto-deploys from GitHub via Vercel!** 🚀

---

## 🔧 Troubleshooting

### **Issue: Changes Not Showing Up**

1. **Check Vercel deployment status:**
   - Go to https://vercel.com/dashboard
   - Check if deployment succeeded
   - View deployment logs if failed

2. **Clear browser cache:**
   ```bash
   # Hard refresh in browser
   # Chrome/Firefox: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   ```

3. **Verify Git push succeeded:**
   ```bash
   git status
   git log --oneline -5
   ```

### **Issue: API Connection Errors**

1. **Check backend health:**
   ```bash
   curl https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/health
   ```

2. **Verify environment variables in Vercel:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Ensure `REACT_APP_API_BASE_URL` is set correctly

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for CORS or network errors

### **Issue: "Proxy Detected" Message**

**This is normal!** Cloudflare is working correctly. It's not an error.

---

## 📂 Files in This Directory

- **`api-config.js`** - Reference API configuration
- **`env-production.txt`** - Reference environment variables
- **`package.json`** - Reference package configuration
- **`deploy.sh`** - Deployment verification script

**Note:** These are reference files. Changes should be made in the main `src/` directory and pushed to GitHub.

---

## 🎯 Key Points to Remember

1. **Admin Panel = Vercel** (NOT AWS)
2. **Backend API = Supabase** (Edge Functions)
3. **Both use Cloudflare** for HTTPS (that's the "Proxy Detected")
4. **Deployment:** Push to GitHub → Vercel auto-deploys
5. **Current Status:** ✅ Everything is working and HTTPS-enabled

---

## 🎉 Current Status

- ✅ Admin panel is LIVE on Vercel
- ✅ HTTPS is working via Cloudflare
- ✅ Auto-deploy from GitHub is enabled
- ✅ Backend API is connected and working
- ✅ Everything is production-ready!

---

## 📞 Need Help?

If you encounter issues:

1. **Check Vercel deployment logs**
2. **Verify backend is running** (`curl https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/health`)
3. **Check browser console for errors** (F12 → Console)
4. **Review environment variables in Vercel dashboard**

**🚀 Happy deploying!**
