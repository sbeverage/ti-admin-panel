# 🚀 Live Admin Panel Configuration Update Guide

## 📋 **Overview**

This guide will help you update your live admin panel at `https://admin.forpurposetechnologies.com/dashboard` to connect to the new backend API.

## 🔧 **Configuration Updates Needed**

### **1. API Base URL Update**

**Current Configuration:**
```javascript
// OLD - Update this in your live admin panel
const API_BASE_URL = 'https://api.forpurposetechnologies.com/api/admin';
```

**New Configuration:**
```javascript
// NEW - Update to this in your live admin panel
const API_BASE_URL = 'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin';
```

### **2. Admin Secret Key Update**

**Current Configuration:**
```javascript
// OLD - Update this in your live admin panel
const ADMIN_SECRET = 'test-key';
```

**New Configuration:**
```javascript
// NEW - Update to this in your live admin panel
const ADMIN_SECRET = '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e';
```

## 🚀 **Step-by-Step Update Process**

### **Step 1: Access Your Live Admin Panel**

1. **SSH into your server** where the live admin panel is hosted
2. **Navigate to the admin panel directory**
3. **Locate the configuration files**

### **Step 2: Update API Configuration**

**Find and update these files:**

#### **A. API Configuration File**
```bash
# Look for files like:
# - src/services/api.ts
# - src/config/api.js
# - src/utils/api.js
# - config/api.js
```

**Update the API configuration:**
```javascript
// Update this section in your API configuration file
const API_CONFIG = {
  baseURL: 'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin',
  headers: {
    'X-Admin-Secret': '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e',
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A'
  }
};
```

#### **B. Environment Variables (if used)**
```bash
# Update your .env file or environment variables
API_BASE_URL=https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin
ADMIN_SECRET=6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e
```

### **Step 3: Update Proxy Configuration (if applicable)**

**If your live admin panel uses a proxy configuration:**

```javascript
// Update package.json or proxy configuration
{
  "proxy": "https://mdqgndyhzlnwojtubouh.supabase.co"
}
```

### **Step 4: Test the Connection**

#### **A. Test API Endpoints**
```bash
# Test the new backend connection
curl -X GET "https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/vendors" \
     -H "X-Admin-Secret: 6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e" \
     -H "Content-Type: application/json" \
     -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A"
```

#### **B. Check Backend Health**
```bash
# Check if backend is running
curl https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/health
```

### **Step 5: Deploy the Changes**

#### **A. Build the Updated Admin Panel**
```bash
# Build the updated admin panel
npm run build
```

#### **B. Deploy to Your Server**
```bash
# Deploy the built files to your web server
# This depends on your deployment method:
# - Copy files to web server directory
# - Use deployment scripts
# - Update Docker containers
# - Use CI/CD pipelines
```

## 🔍 **Files to Update in Your Live Admin Panel**

### **1. API Configuration Files**
- `src/services/api.ts` (or similar)
- `src/config/api.js`
- `src/utils/api.js`
- `config/api.js`

### **2. Environment Files**
- `.env`
- `.env.production`
- `config/environment.js`

### **3. Package Configuration**
- `package.json` (proxy settings)

### **4. Build Configuration**
- `webpack.config.js`
- `vite.config.js`
- `next.config.js`

## 🧪 **Testing Checklist**

### **Before Deployment:**
- [ ] Backend API is accessible
- [ ] Admin secret key is correct
- [ ] All API endpoints are working
- [ ] CORS is properly configured

### **After Deployment:**
- [ ] Admin panel loads without errors
- [ ] Vendor management works
- [ ] Discount management works
- [ ] Image uploads work
- [ ] All CRUD operations function
- [ ] No console errors

## 🚨 **Common Issues & Solutions**

### **Issue 1: CORS Errors**
```javascript
// Solution: Ensure CORS is configured on the backend
// The backend should allow requests from your admin panel domain
```

### **Issue 2: 404 Errors**
```bash
# Check if the backend is running
curl https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/health

# Check if the API endpoints exist
curl https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/vendors
```

### **Issue 3: Authentication Errors**
```javascript
// Verify the admin secret key is correct
// Check the X-Admin-Secret header is being sent
```

### **Issue 4: Build Errors**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📊 **Monitoring & Verification**

### **1. Check Admin Panel Functionality**
- [ ] Dashboard loads with real data
- [ ] Vendor list displays correctly
- [ ] Vendor creation works
- [ ] Vendor status toggles work
- [ ] Image uploads function
- [ ] All pages load without errors

### **2. Monitor Backend Logs**
```bash
# Check backend logs for any errors
# Monitor API response times
# Verify all requests are being processed
```

### **3. Test All Features**
- [ ] Vendor Management (CRUD operations)
- [ ] Discount Management (CRUD operations)
- [ ] Image Uploads (vendor logos, discount images)
- [ ] Status Management (active/inactive toggles)
- [ ] Data Filtering and Search
- [ ] Pagination

## 🔄 **Rollback Plan**

If issues arise after deployment:

### **1. Quick Rollback**
```bash
# Revert to previous configuration
# Restore previous API base URL
# Restore previous admin secret
# Rebuild and redeploy
```

### **2. Database Rollback**
```bash
# If database changes were made
# Restore from backup
# Verify data integrity
```

## 📞 **Support & Troubleshooting**

### **Backend Status Check**
```bash
# Check if backend is running
curl https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/health

# Expected response: {"status": "healthy"}
```

### **API Endpoint Testing**
```bash
# Test vendor endpoint
curl -X GET "https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/vendors" \
     -H "X-Admin-Secret: 6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e" \
     -H "Content-Type: application/json" \
     -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A"

# Expected response: JSON with vendor data
```

### **Common Error Messages**
- **502 Bad Gateway**: Backend is down or starting up
- **404 Not Found**: API endpoint doesn't exist
- **401 Unauthorized**: Admin secret key is incorrect
- **CORS Error**: Cross-origin requests blocked

## 🎯 **Success Criteria**

After successful deployment, you should see:

1. **✅ Admin panel loads without errors**
2. **✅ Real data from backend displays**
3. **✅ All CRUD operations work**
4. **✅ Image uploads function**
5. **✅ No console errors**
6. **✅ All features accessible**

---

## 🚀 **Ready to Deploy!**

Your admin panel is now configured to connect to the new backend API. Follow the steps above to update your live admin panel and enjoy the enhanced functionality!

**Need help?** Check the troubleshooting section above or review the backend connection guide for additional support.









