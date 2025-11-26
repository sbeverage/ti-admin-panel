# 🚨 Deployment Troubleshooting Guide

**Date:** 2025-01-23  
**Issue:** Changes not appearing in production

---

## ✅ What We've Done

All code changes have been:
- ✅ Committed to git
- ✅ Pushed to GitHub (`origin/master`)
- ✅ Latest commits:
  - `b092c47` - Fix: Initialize additional images state
  - `2d1aac7` - Fix: Properly initialize additional images state
  - `e65895c` - Add logo and additional images upload
  - `a043c68` - Add detailed formData logging
  - `5dde6df` - Fix: Send null instead of empty strings
  - `fcac51e` - Fix: Improve save functionality
  - `38415dd` - CRITICAL FIX: Use form.getFieldsValue()
  - `25c2238` - Enhance logging
  - `2054f93` - Always include contact fields
  - `a63d70d` - Remove 'N/A' from table display
  - `51a89fc` - Display actual data in table
  - `76d0f69` - Improve impact metrics display

---

## 🔍 Deployment Status Check

### Step 1: Verify Vercel Deployment

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Find your `ti-admin-panel` project
   - Check the "Deployments" tab

2. **Check Latest Deployment:**
   - Look for the most recent deployment
   - Check if it shows "Ready" (green) or "Error" (red)
   - Check the commit hash matches our latest commits
   - Check deployment time (should be recent)

3. **If Deployment Failed:**
   - Click on the failed deployment
   - Check the build logs
   - Look for error messages
   - Common issues:
     - Build script errors
     - Missing dependencies
     - TypeScript errors
     - Environment variable issues

### Step 2: Check Branch Configuration

Vercel might be watching `main` branch instead of `master`:

1. **In Vercel Dashboard:**
   - Go to Project Settings → Git
   - Check which branch is configured for Production
   - If it's `main`, we need to either:
     - Push to `main` branch, OR
     - Change Vercel to watch `master` branch

2. **Quick Fix - Push to main:**
   ```bash
   git checkout -b main
   git push origin main
   ```

### Step 3: Manual Deployment Trigger

If auto-deploy isn't working:

1. **Using Vercel Dashboard:**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - Or click "Deploy" → "Deploy from GitHub" → Select `master` branch

2. **Using Vercel CLI:**
   ```bash
   vercel --prod
   ```

---

## 🔧 Code Issues to Check

### Issue 1: Contact Fields Not Saving

**From logs, we see:**
- `formData.contactName: ''` (empty string)
- `formData.contactNumber: ''` (empty string)
- Backend returns `phone: null`, `contact_name: undefined`

**Possible causes:**
1. **Input fields not updating formData** - Check browser console for `📝 Contact Name input changed:` logs
2. **Backend not saving** - Check if backend accepts `contact_name` and `phone` fields
3. **Backend returning null** - Backend might not be persisting these fields

**Debug steps:**
1. Open browser console
2. Type in contact name field
3. Check if you see: `📝 Contact Name input changed: [your text]`
4. If you DON'T see this log → Input handler not working
5. If you DO see the log but formData is still empty → State update issue

### Issue 2: Browser Cache

**Solution:**
1. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Clear cache:**
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Or use Incognito/Private mode
3. **Disable cache in DevTools:**
   - Open DevTools (F12)
   - Go to Network tab
   - Check "Disable cache"
   - Keep DevTools open while testing

### Issue 3: Backend Not Saving Data

**Check backend logs:**
- The backend might be rejecting the update
- Check if `contact_name` and `phone` columns exist in database
- Check if backend API is actually saving these fields

**Test backend directly:**
```bash
curl -X PUT https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/charities/14 \
  -H "X-Admin-Secret: 6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e" \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A" \
  -d '{"name":"Test","contact_name":"Test Contact","phone":"555-1234"}'
```

---

## 🎯 Immediate Actions

### Action 1: Check Vercel Deployment
1. Go to https://vercel.com/dashboard
2. Check if latest deployment succeeded
3. If failed, check build logs
4. If successful but old, trigger redeploy

### Action 2: Verify Branch
1. Check which branch Vercel is watching
2. If `main`, push to `main`:
   ```bash
   git checkout -b main
   git push origin main
   ```

### Action 3: Manual Deploy
```bash
cd /Users/stephaniebeverage/ti-admin-panel
vercel --prod
```

### Action 4: Clear Browser Cache
- Hard refresh: Cmd+Shift+R
- Or use Incognito mode
- Or clear cache completely

### Action 5: Check Browser Console
- Open DevTools (F12)
- Check for errors
- Check network tab for failed requests
- Look for our detailed logs

---

## 📋 What to Report Back

Please check and report:

1. **Vercel Deployment Status:**
   - [ ] Latest deployment status (Ready/Error)
   - [ ] Latest deployment commit hash
   - [ ] Latest deployment time
   - [ ] Any build errors

2. **Branch Configuration:**
   - [ ] Which branch is Vercel watching? (`main` or `master`)

3. **Browser Console:**
   - [ ] Do you see `📝 Contact Name input changed:` when typing?
   - [ ] What does `💾 formData.contactName:` show before save?
   - [ ] Any JavaScript errors?

4. **Network Tab:**
   - [ ] Does the PUT request to `/charities/14` succeed?
   - [ ] What's the response status code?
   - [ ] What's in the response body?

5. **After Save:**
   - [ ] Does the success message appear?
   - [ ] What does the refetched data show?
   - [ ] Are contact fields still empty?

---

## 🚀 Quick Fixes to Try

### Fix 1: Force Redeploy
```bash
# Trigger Vercel deployment
vercel --prod
```

### Fix 2: Push to Main Branch (if Vercel watches main)
```bash
git checkout -b main
git push origin main
```

### Fix 3: Clear All Caches
1. Clear browser cache
2. Hard refresh (Cmd+Shift+R)
3. Try in Incognito mode

### Fix 4: Check Vercel Environment Variables
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Verify all required variables are set
3. Redeploy if you changed any

---

**End of Troubleshooting Guide**

