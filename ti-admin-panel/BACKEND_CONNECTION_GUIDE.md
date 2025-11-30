# Backend Connection Guide

## ✅ **Admin Panel Updated Successfully!**

Your local admin panel has been updated to connect to the new backend API.

### **🔧 What I've Updated:**

1. **API Base URL**: Updated to `https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin`
2. **Admin Secret**: Updated to `6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e`
3. **Proxy Configuration**: Updated for development mode
4. **All API Endpoints**: Now pointing to the new backend

### **🚀 How to Test the Connection:**

1. **Start your admin panel:**
   ```bash
   npm start
   ```

2. **Test the connection:**
   - Go to Vendors page
   - Try to load vendors (should connect to new backend)
   - Check browser console for any errors

3. **Test vendor management:**
   - Create a new vendor
   - Update vendor status
   - Upload vendor logo

### **📡 API Endpoints Now Connected:**

**Vendor Management:**
- ✅ `GET /api/admin/vendors` - List all vendors
- ✅ `POST /api/admin/vendors` - Create vendor
- ✅ `PUT /api/admin/vendors/:id` - Update vendor
- ✅ `DELETE /api/admin/vendors/:id` - Delete vendor
- ✅ `PATCH /api/admin/vendors/:id/status` - Update vendor status

**Discount Management:**
- ✅ `GET /api/admin/discounts` - List all discounts
- ✅ `POST /api/admin/discounts` - Create discount
- ✅ `PUT /api/admin/discounts/:id` - Update discount
- ✅ `DELETE /api/admin/discounts/:id` - Delete discount

**Image Uploads:**
- ✅ `POST /api/admin/vendors/:id/logo` - Upload vendor logo
- ✅ `POST /api/admin/discounts/:id/image` - Upload discount image

### **🔍 Debugging Steps:**

If you encounter issues:

1. **Check Backend Status:**
   ```bash
   # Check if backend is running
   curl https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/health
   ```

2. **Check Admin Panel Console:**
   - Open browser console (F12)
   - Look for API call errors
   - Check network tab for failed requests

3. **Test API Directly:**
   ```bash
   # Test vendor endpoint
   curl -X GET "https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/vendors" \
        -H "X-Admin-Secret: 6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e" \
        -H "Content-Type: application/json" \
        -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A" \
        -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A"
   ```

### **🎯 Expected Behavior:**

**When Backend is Running:**
- ✅ Vendors load from real API
- ✅ Status toggles work (if endpoint exists)
- ✅ Image uploads work
- ✅ All CRUD operations work

**When Backend is Down:**
- ⚠️ Falls back to mock data
- ⚠️ Shows error messages
- ⚠️ Some features may not work

### **📱 For Your Live Admin Panel:**

If you have a live admin panel at `https://admin.forpurposetechnologies.com/dashboard`, you'll need to update its configuration to match these changes:

```javascript
// Update your live admin panel configuration
const API_BASE_URL = 'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin';
const ADMIN_SECRET = '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e';
```

### **🚀 Next Steps:**

1. **Test locally** - Run `npm start` and test all features
2. **Deploy changes** - Update your live admin panel with the new configuration
3. **Monitor backend** - Ensure backend is healthy and running
4. **Test end-to-end** - Verify all admin panel features work with the new backend

**Your admin panel is now ready to connect to the new backend! 🎉**









