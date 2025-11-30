# ⚠️ Beneficiary Schema Fields Removed

**Date:** 2025-01-23  
**Issue:** HTTP 400 error - `communities_served` column doesn't exist in `charities` table

---

## 🔴 Problem

The backend returned a 400 error:
```
HTTP error! status: 400 - {"error":"Could not find the 'communities_served' column of 'charities' in the schema cache"}
```

This means the frontend was sending fields that don't exist in the actual database schema.

---

## ✅ Solution

Removed the following fields from create/update payloads:

### Fields Removed

1. **`communities_served`** ❌ - Causing 400 error
2. **`families_helped`** ❌ - May not exist
3. **`direct_to_programs`** ❌ - May not exist
4. **`impact_statement_1`** ❌ - May not exist
5. **`impact_statement_2`** ❌ - May not exist
6. **`transparency_rating`** ❌ - May not exist

### Files Changed

- `src/components/InviteBeneficiaryModal.tsx` - Create payload
- `src/components/BeneficiaryProfile.tsx` - Update payload

---

## 📋 Fields Still Being Sent

These fields are still included in the payload (verified to exist or safe to send):

✅ **Core Fields:**
- `name`
- `category`
- `type`
- `location`, `city`, `state`, `zip_code`
- `phone`
- `contact_name`
- `about`
- `why_this_matters`
- `success_story`
- `story_author`
- `verification_status`
- `ein`
- `website`
- `social`
- `is_active`
- `imageUrl` / `logoUrl`
- `profile_links`

---

## 🔍 Root Cause

The `DATABASE_SCHEMA_UPDATE.sql` file defines these columns:
```sql
ALTER TABLE beneficiaries 
ADD COLUMN IF NOT EXISTS communities_served INTEGER,
ADD COLUMN IF NOT EXISTS families_helped VARCHAR(100),
ADD COLUMN IF NOT EXISTS direct_to_programs INTEGER,
ADD COLUMN IF NOT EXISTS impact_statement_1 TEXT,
ADD COLUMN IF NOT EXISTS impact_statement_2 TEXT;
```

However:
1. The SQL script may not have been run on the production database
2. The table name might be `charities` instead of `beneficiaries`
3. The columns may have been added to a different table

---

## 🚀 Next Steps

### Option 1: Add Columns to Database (Recommended)

If these fields are needed, run the SQL migration on the actual database:

```sql
ALTER TABLE charities 
ADD COLUMN IF NOT EXISTS communities_served INTEGER,
ADD COLUMN IF NOT EXISTS families_helped VARCHAR(100),
ADD COLUMN IF NOT EXISTS direct_to_programs INTEGER CHECK (direct_to_programs >= 0 AND direct_to_programs <= 100),
ADD COLUMN IF NOT EXISTS impact_statement_1 TEXT,
ADD COLUMN IF NOT EXISTS impact_statement_2 TEXT,
ADD COLUMN IF NOT EXISTS transparency_rating INTEGER;
```

**Note:** Replace `charities` with the actual table name if different.

### Option 2: Keep Fields Removed

If these fields aren't needed for MVP, keep them removed from the frontend.

### Option 3: Make Fields Conditional

Once columns are added, uncomment the fields in the code and they'll be included again.

---

## 🧪 Testing

After this fix:
1. ✅ Create beneficiary should work (no 400 error)
2. ✅ Update beneficiary should work (no 400 error)
3. ⚠️ Impact metrics won't be saved (until columns are added)

---

## 📝 Notes

- The form still collects these fields from users
- The fields are just not sent to the backend
- Once database columns are added, uncomment the fields in code
- Consider adding these fields to the database if they're needed for the app

---

**End of Documentation**

