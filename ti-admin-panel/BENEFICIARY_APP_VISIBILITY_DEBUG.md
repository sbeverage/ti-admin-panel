# 🔍 Beneficiary App Visibility Debug Guide

**Issue:** Beneficiary "War Angel Farms" created in admin panel but not showing in app

---

## 🔍 Possible Causes

### 1. **Different API Endpoints**
- **Admin Panel:** Uses `/api/admin/charities`
- **App:** May use `/api/charities` (without `/admin`) or different endpoint
- **Fix:** Verify app uses same endpoint or ensure both endpoints return same data

### 2. **Filtering by `is_active` Status**
- **Admin Panel:** Sets `is_active: true` when creating
- **App:** May filter to only show `is_active = true` beneficiaries
- **Issue:** Backend might not be saving `is_active` correctly
- **Fix:** Verify backend saves `is_active` field correctly

### 3. **Filtering by `verification_status`**
- **Admin Panel:** Sets `verification_status: false` by default
- **App:** May filter to only show `verification_status = true` beneficiaries
- **Fix:** Either set `verification_status: true` when creating, or remove filter from app

### 4. **Backend Not Saving Data**
- **Issue:** Backend might be rejecting the request or not saving correctly
- **Fix:** Check backend logs and verify data is actually in database

### 5. **Different Table/View**
- **Issue:** App might use a different table or database view
- **Fix:** Verify app queries same `charities` table

---

## 🧪 Debugging Steps

### Step 1: Verify Beneficiary Was Created
1. Open admin panel
2. Go to Beneficiaries page
3. Search for "War Angel Farms"
4. Check if it appears in the list
5. Click on it to view profile
6. Check the `is_active` toggle - is it ON or OFF?
7. Check the `verification_status` - is it verified?

### Step 2: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for logs when creating beneficiary:
   - `📦 Beneficiary data payload:` - Check what was sent
   - `✅ Beneficiary creation response:` - Check what backend returned
   - Look for any errors

### Step 3: Check Backend Response
The creation response should include:
- `success: true`
- `data: { id, name, is_active, ... }`

If response shows `success: false` or error, the beneficiary wasn't created.

### Step 4: Verify Database
1. Check Supabase database
2. Query `charities` table
3. Search for "War Angel Farms"
4. Check:
   - Does the record exist?
   - What is `is_active` value?
   - What is `verification_status` value?
   - Are all fields populated?

### Step 5: Check App Endpoint
1. Check what endpoint the app uses to fetch beneficiaries
2. Compare with admin panel endpoint
3. If different, ensure both return same data

---

## 🔧 Quick Fixes

### Fix 1: Ensure `is_active` is Set to `true`
**File:** `src/components/InviteBeneficiaryModal.tsx`

Currently sets:
```typescript
is_active: allData.isActive !== undefined ? allData.isActive : true,
```

**Verify:** Check if `allData.isActive` is being set correctly in the form.

### Fix 2: Set `verification_status` to `true` (if app filters by this)
**File:** `src/components/InviteBeneficiaryModal.tsx`

Currently sets:
```typescript
verification_status: allData.verificationStatus || false,
```

**Change to:**
```typescript
verification_status: allData.verificationStatus !== undefined ? allData.verificationStatus : true,
```

Or ensure the checkbox is checked when creating.

### Fix 3: Add Logging to Verify Creation
Already added logging to see:
- What data is being sent
- What response is received
- `is_active` and `verification_status` values

---

## 📋 Checklist

- [ ] Beneficiary appears in admin panel beneficiaries list
- [ ] Beneficiary `is_active` toggle is ON in admin panel
- [ ] Beneficiary `verification_status` is set (check if app filters by this)
- [ ] Backend returns `success: true` when creating
- [ ] Beneficiary exists in database `charities` table
- [ ] Database record has `is_active = true`
- [ ] App uses same endpoint or same data source
- [ ] App doesn't filter out the beneficiary

---

## 🚨 Most Likely Issues

1. **`is_active` not set correctly** - Backend might not be saving it
2. **`verification_status` filtering** - App might only show verified beneficiaries
3. **Different endpoint** - App might use different API endpoint
4. **Backend error** - Creation might have failed silently

---

## 🔍 Next Steps

1. Check admin panel - does "War Angel Farms" appear?
2. Check browser console - what was the creation response?
3. Check database - does the record exist?
4. Check app endpoint - what endpoint does app use?
5. Check app filters - does app filter by `is_active` or `verification_status`?

---

**End of Debug Guide**

