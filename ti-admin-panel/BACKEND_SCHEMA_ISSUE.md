# 🔴 Backend Schema Issue - communities_served

**Date:** 2025-01-23  
**Status:** Backend Issue - Frontend is NOT sending the field

---

## 🔍 Problem Analysis

### Frontend Status: ✅ CORRECT

The frontend is **NOT** sending `communities_served` in the payload. Evidence from console logs:

```javascript
📦 All keys being sent: Array(31)
📦 Full payload structure: {
  "name": "The Bridge International",
  "category": "Education",
  // ... other fields ...
  // NO communities_served field
}
```

**The payload does NOT include:**
- ❌ `communities_served`
- ❌ `families_helped`
- ❌ `direct_to_programs`
- ❌ `impact_statement_1`
- ❌ `impact_statement_2`

### Backend Status: ❌ ISSUE

The backend is returning a 400 error:
```
HTTP error! status: 400 - {"error":"Could not find the 'communities_served' column of 'charities' in the schema cache"}
```

**This means:**
- The backend code is trying to access `communities_served` column
- The column doesn't exist in the database
- The backend is failing even though we're NOT sending this field

---

## 🎯 Root Cause

The backend code is likely:

1. **Trying to INSERT/UPDATE all columns** it knows about, even if not in the request
2. **Setting default values** for columns that don't exist
3. **Using a schema cache** that includes columns that don't exist in the actual database
4. **Hardcoded field references** in the backend code

---

## ✅ Frontend Fixes Applied

Even though we're not sending the field, we've added defensive code:

1. **Explicit field removal** - Delete statements for all problematic fields
2. **Verification logging** - Check that fields are removed before sending
3. **CamelCase handling** - Remove both snake_case and camelCase versions
4. **Warning logs** - Alert if fields somehow get included

### Code Added:

```javascript
const fieldsToRemove = [
  'communities_served',
  'families_helped', 
  'direct_to_programs',
  'impact_statement_1',
  'impact_statement_2',
  'transparency_rating',
  'communitiesServed', // camelCase version
  'familiesHelped', // camelCase version
  'directToPrograms', // camelCase version
  'impactStatement1', // camelCase version
  'impactStatement2' // camelCase version
];

fieldsToRemove.forEach(field => {
  if (beneficiaryData.hasOwnProperty(field)) {
    console.warn(`⚠️ Removing non-existent field: ${field}`);
    delete beneficiaryData[field];
  }
});

console.log('✅ Verified: communities_served NOT in payload:', !beneficiaryData.hasOwnProperty('communities_served'));
```

---

## 🚀 Backend Fix Required

The backend needs to be updated to:

### Option 1: Remove Column References (Recommended)

Update the backend code to NOT reference `communities_served` and other non-existent columns:

```typescript
// Backend code should only insert/update columns that:
// 1. Exist in the request payload
// 2. Actually exist in the database schema

// BAD (current):
const charity = await supabase
  .from('charities')
  .insert({
    name: data.name,
    communities_served: data.communities_served || 0, // ❌ Column doesn't exist
    // ...
  });

// GOOD (fixed):
const insertData: any = {
  name: data.name,
  // Only include fields that exist in database
};

// Only add communities_served if it exists in schema
if (data.communities_served !== undefined) {
  insertData.communities_served = data.communities_served;
}

const charity = await supabase
  .from('charities')
  .insert(insertData);
```

### Option 2: Add Columns to Database

If these fields are needed, add them to the database:

```sql
ALTER TABLE charities 
ADD COLUMN IF NOT EXISTS communities_served INTEGER,
ADD COLUMN IF NOT EXISTS families_helped VARCHAR(100),
ADD COLUMN IF NOT EXISTS direct_to_programs INTEGER,
ADD COLUMN IF NOT EXISTS impact_statement_1 TEXT,
ADD COLUMN IF NOT EXISTS impact_statement_2 TEXT;
```

### Option 3: Update Schema Cache

If using a schema cache, refresh it to match the actual database:

```typescript
// Clear and refresh schema cache
await supabase.rpc('refresh_schema_cache');
```

---

## 🧪 Testing

### Frontend Test:

1. Open browser console
2. Create a beneficiary
3. Check logs:
   - `✅ Verified: communities_served NOT in payload: true`
   - No warnings about removing fields
4. Check Network tab:
   - Payload should NOT include `communities_served`

### Backend Test:

1. Check Supabase Edge Function logs
2. Verify what payload backend receives
3. Check if backend is trying to access `communities_served`
4. Verify database schema matches backend expectations

---

## 📋 Action Items

### Frontend (✅ Done):
- [x] Remove fields from payload
- [x] Add defensive deletion
- [x] Add verification logging
- [x] Handle both snake_case and camelCase

### Backend (❌ Needs Fix):
- [ ] Update backend to not reference non-existent columns
- [ ] Or add columns to database
- [ ] Or refresh schema cache
- [ ] Test with frontend payload

---

## 🔗 Related Files

- `src/components/InviteBeneficiaryModal.tsx` - Create payload
- `src/components/BeneficiaryProfile.tsx` - Update payload
- Backend: `/functions/v1/api/admin/charities` endpoint

---

**End of Documentation**

