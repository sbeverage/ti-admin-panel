# ⚡ Quick Configuration Update

## 🔧 **Essential Changes for Live Admin Panel**

### **1. API Base URL**
```javascript
// OLD
const API_BASE_URL = 'https://api.forpurposetechnologies.com/api/admin';

// NEW
const API_BASE_URL = 'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin';
```

### **2. Admin Secret Key**
```javascript
// OLD
const ADMIN_SECRET = 'test-key';

// NEW
const ADMIN_SECRET = '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e';
```

### **3. Complete API Configuration**
```javascript
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

### **4. Environment Variables (if used)**
```bash
API_BASE_URL=https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin
ADMIN_SECRET=6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e
```

### **5. Proxy Configuration (if used)**
```json
{
  "proxy": "https://mdqgndyhzlnwojtubouh.supabase.co"
}
```

## 🚀 **Quick Deployment Steps**

1. **Update configuration files** with new URLs and secrets
2. **Test backend connection**: `curl https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/health`
3. **Build admin panel**: `npm run build`
4. **Deploy to server**
5. **Test all features**

## ✅ **Verification Checklist**

- [ ] Backend is accessible
- [ ] Admin panel loads without errors
- [ ] Vendor management works
- [ ] Image uploads function
- [ ] No console errors

**🎯 That's it! Your live admin panel should now connect to the new backend.**









