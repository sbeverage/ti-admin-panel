# 🧪 Referral System Testing Guide

## ✅ Current Status

**The Referral Analytics page is LIVE and accessible in your admin panel!**

### How to Access:

1. **Start your admin panel** (if not already running):
   ```bash
   npm start
   ```

2. **Navigate to Referral Analytics**:
   - Click on "Referral Analytics" in the sidebar menu
   - Or go directly to: `http://localhost:3000/referral-analytics`

3. **What You'll See**:
   - Overview cards showing referral statistics
   - Top Referrers leaderboard
   - Invitation management
   - Referral channels analysis

---

## 🔍 Testing Your Donor with 5 Invites

### Current Situation:

The backend endpoint `/api/admin/analytics/referrals` is **implemented and responding**, but it's currently returning **empty data** (0 referrals). This means:

1. ✅ Frontend is working
2. ✅ Backend endpoint exists
3. ⚠️ Backend needs to query actual referral data from database

### To See Your Donor's 5 Invites:

**Option 1: Check Backend Database**

The backend needs to query the `referrals` table. Check if:
- The `referrals` table exists in your database
- Your donor's referrals are stored with `referrer_id` matching the donor's user ID
- The referrals have the correct status

**Option 2: Test the Endpoint Directly**

```bash
curl -X GET "https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/analytics/referrals?period=30d" \
  -H "X-Admin-Secret: 6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e" \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A"
```

**Current Response:**
```json
{
  "success": true,
  "data": {
    "totalReferrals": 0,
    "activeReferrers": 0,
    "conversionRate": 0,
    "topReferrers": [],
    "referralSources": [
      {"name": "Social Media", "count": 0},
      {"name": "Email", "count": 0},
      {"name": "Direct", "count": 0}
    ]
  }
}
```

---

## 🛠️ Backend Implementation Needed

The backend endpoint needs to:

1. **Query the referrals table**:
   ```sql
   SELECT 
     u.id as user_id,
     u.name,
     u.email,
     COUNT(r.id) as total_referrals,
     COUNT(r.id) FILTER (WHERE r.status = 'paid') as successful_referrals
   FROM users u
   LEFT JOIN referrals r ON r.referrer_id = u.id
   WHERE r.created_at >= NOW() - INTERVAL '30 days'
   GROUP BY u.id, u.name, u.email
   ORDER BY successful_referrals DESC;
   ```

2. **Return data in the expected format**:
   ```json
   {
     "success": true,
     "data": {
       "totalReferrals": 5,
       "activeReferrers": 1,
       "conversionRate": 100,
       "topReferrers": [
         {
           "user_id": 123,
           "name": "Your Donor Name",
           "email": "donor@example.com",
           "total_referrals": 5,
           "successful_referrals": 5,
           "conversion_rate": 100,
           "points_earned": 50,
           "total_value": 250,
           "rank": 1
         }
       ]
     }
   }
   ```

---

## 📋 Quick Checklist

- [x] Frontend component implemented
- [x] Route configured (`/referral-analytics`)
- [x] API endpoint exists (`/api/admin/analytics/referrals`)
- [ ] Backend queries actual referral data
- [ ] Database has referral records
- [ ] Referral data matches expected format

---

## 🔗 Related Files

- **Frontend Component**: `src/components/ReferralAnalytics.tsx`
- **API Service**: `src/services/api.ts` (line 1226)
- **Route**: `src/App.tsx` (line 73)
- **Documentation**: `ADMIN_PANEL_REFERRAL_GUIDE.md`

---

## 💡 Next Steps

1. **Check your database** - Verify the `referrals` table exists and has data
2. **Update backend** - Ensure the endpoint queries the correct tables
3. **Test again** - Refresh the Referral Analytics page
4. **Verify data** - Your donor with 5 invites should appear in the "Top Referrers" table

---

**Need Help?** Check the browser console (F12) for any errors when loading the page.







