# Backend Discount Creation - Implementation Guide

## 📋 Overview

The frontend is now sending discount data with new fields. The backend needs to handle these fields when creating/updating discounts.

---

## 🔌 Endpoint Details

**Endpoint:** `POST /api/admin/discounts`

**Method:** `POST`

**Headers:**
```
X-Admin-Secret: 6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e
Content-Type: application/json
apikey: [your-api-key]
Authorization: Bearer [your-token]
```

---

## 📦 Request Body (Frontend Sends)

The frontend sends data in **camelCase** format:

```json
{
  "vendorId": 28,
  "title": "10% off Pizza",
  "description": "Get 10% off any pizza order",
  "discountType": "percentage",
  "discountValue": 10,
  "discountCode": "PIZZA10",
  "usageLimit": "5",
  "isActive": true,
  "startDate": "2024-01-15T00:00:00.000Z",
  "endDate": "2025-01-15T00:00:00.000Z"
}
```

### Field Mapping

| Frontend (camelCase) | Backend (snake_case) | Required | Notes |
|---------------------|---------------------|----------|-------|
| `vendorId` | `vendor_id` | ✅ Yes | Vendor ID |
| `title` | `title` or `name` | ✅ Yes | Display title (e.g., "10% off Pizza") |
| `description` | `description` | ✅ Yes | Discount description |
| `discountType` | `discount_type` | ✅ Yes | One of: `percentage`, `fixed`, `bogo`, `free` |
| `discountValue` | `discount_value` | ✅ Yes | Numeric value (percentage or dollar amount) |
| `discountCode` | `discount_code` or `pos_code` | ✅ Yes | POS/Discount code for checkout |
| `usageLimit` | `usage_limit` | ⚠️ New | Usage limit: `"1"`, `"5"`, `"10"`, or `"unlimited"` |
| `isActive` | `is_active` | ✅ Yes | Boolean |
| `startDate` | `start_date` | ✅ Yes | ISO date string |
| `endDate` | `end_date` | ✅ Yes | ISO date string |

### ⚠️ Fields NOT to Include

The frontend is **NOT** sending these fields (they don't exist in the database):
- ❌ `minPurchase` / `min_purchase`
- ❌ `maxDiscount` / `max_discount`

---

## 🆕 New Fields to Support

### 1. `title` Field
- **Purpose:** Display title for the discount (e.g., "10% off Pizza", "FREE Coffee")
- **Database:** Should map to `title` column, or use `name` if `title` doesn't exist
- **Required:** Yes

### 2. `discountCode` / `pos_code` Field
- **Purpose:** POS/Discount code that donors enter at checkout
- **Database:** Should map to `discount_code` or `pos_code` column
- **Required:** Yes
- **Example:** "PIZZA10", "FREECOFFEE", "BOGO2024"

### 3. `usageLimit` Field
- **Purpose:** How many times per month a donor can use this discount
- **Database:** Should map to `usage_limit` column
- **Type:** String (e.g., `"1"`, `"5"`, `"10"`, `"unlimited"`)
- **Required:** Yes
- **Default:** `"unlimited"` if not provided

### 4. `discountType: 'free'` Support
- **Purpose:** Support for "FREE" discount type
- **Database:** `discount_type` should accept `'free'` as a valid value
- **Note:** When `discountType` is `'free'`, `discountValue` is set to `100` (100% off)

---

## 📊 Discount Type Values

The backend should accept these `discount_type` values:

1. **`percentage`** - Percentage off (e.g., 10% off)
   - `discountValue`: 1-100 (percentage)

2. **`fixed`** - Fixed dollar amount off (e.g., $10 off)
   - `discountValue`: Dollar amount (e.g., 10.00)

3. **`bogo`** - Buy One Get One
   - `discountValue`: Always 50 (50% off second item)

4. **`free`** - Free item
   - `discountValue`: Always 100 (100% off)

---

## 🔧 Backend Implementation Example

### Supabase Edge Function Example

```typescript
// supabase/functions/api/admin/discounts/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify admin secret
    const adminSecret = req.headers.get('X-Admin-Secret');
    if (adminSecret !== '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const discountData = await req.json();

      // Map camelCase to snake_case for database
      const dbData = {
        vendor_id: discountData.vendorId,
        name: discountData.title || discountData.name, // Use title if available, fallback to name
        title: discountData.title, // Store title if column exists
        description: discountData.description,
        discount_type: discountData.discountType,
        discount_value: discountData.discountValue,
        discount_code: discountData.discountCode || discountData.posCode, // Support both field names
        pos_code: discountData.discountCode || discountData.posCode, // Alternative field name
        usage_limit: discountData.usageLimit || 'unlimited',
        is_active: discountData.isActive !== false, // Default to true
        start_date: discountData.startDate,
        end_date: discountData.endDate,
        // DO NOT include min_purchase or max_discount - these columns don't exist
      };

      // Insert into discounts table
      const { data, error } = await supabaseClient
        .from('discounts')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('Error creating discount:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message,
            details: error.details 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: data 
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle other methods...
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 🗄️ Database Schema Requirements

### Required Columns in `discounts` Table

```sql
CREATE TABLE discounts (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES vendors(id),
  name VARCHAR(255) NOT NULL, -- Display name
  title VARCHAR(255), -- Optional: separate title field
  description TEXT,
  discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'bogo', 'free')),
  discount_value DECIMAL(10, 2) NOT NULL,
  discount_code VARCHAR(100), -- POS/Discount code
  pos_code VARCHAR(100), -- Alternative field name for POS code
  usage_limit VARCHAR(20) DEFAULT 'unlimited', -- '1', '5', '10', 'unlimited'
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### ⚠️ Important Notes

1. **Field Name Mapping:**
   - Frontend sends `discountCode` → Backend should map to `discount_code` or `pos_code`
   - Frontend sends `usageLimit` → Backend should map to `usage_limit`
   - Frontend sends `title` → Backend should use `title` column if it exists, otherwise use `name`

2. **Do NOT Include:**
   - `min_purchase` - This column doesn't exist
   - `max_discount` - This column doesn't exist

3. **Discount Type 'free':**
   - When `discountType` is `'free'`, frontend sets `discountValue` to `100`
   - Backend should accept this and store it

---

## ✅ Expected Response Format

### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "vendor_id": 28,
    "name": "10% off Pizza",
    "title": "10% off Pizza",
    "description": "Get 10% off any pizza order",
    "discount_type": "percentage",
    "discount_value": 10,
    "discount_code": "PIZZA10",
    "usage_limit": "5",
    "is_active": true,
    "start_date": "2024-01-15T00:00:00.000Z",
    "end_date": "2025-01-15T00:00:00.000Z",
    "created_at": "2024-01-15T12:00:00.000Z",
    "updated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Could not find the 'min_purchase' column of 'discounts' in the schema cache",
  "details": "..."
}
```

---

## ⚠️ Common Error: `min_purchase` Column Not Found

### Error Message
```
{"error":"Could not find the 'min_purchase' column of 'discounts' in the schema cache"}
```

### Cause
The backend code is trying to access or insert a `min_purchase` column that **does not exist** in the database schema. This can happen if:
1. The backend code has hardcoded references to `min_purchase` or `max_discount`
2. The backend is trying to set default values for these fields
3. The backend is spreading or copying fields that include these non-existent columns

### Solution

**In your Supabase Edge Function (`/functions/api/admin/discounts/index.ts`):**

1. **Remove any references to `min_purchase` and `max_discount`** in the insert/update operations:

```typescript
// ❌ WRONG - Don't do this:
const dbData = {
  vendor_id: discountData.vendorId,
  // ... other fields ...
  min_purchase: discountData.minPurchase, // ❌ This column doesn't exist!
  max_discount: discountData.maxDiscount, // ❌ This column doesn't exist!
};

// ✅ CORRECT - Only include fields that exist:
const dbData = {
  vendor_id: discountData.vendorId,
  name: discountData.title || discountData.name,
  title: discountData.title,
  description: discountData.description,
  discount_type: discountData.discountType,
  discount_value: discountData.discountValue,
  discount_code: discountData.discountCode || discountData.posCode,
  pos_code: discountData.discountCode || discountData.posCode,
  usage_limit: discountData.usageLimit || 'unlimited',
  is_active: discountData.isActive !== false,
  start_date: discountData.startDate,
  end_date: discountData.endDate,
  // ✅ Do NOT include min_purchase or max_discount
};
```

2. **If you're using object spreading, explicitly exclude these fields:**

```typescript
// ❌ WRONG - This might include unwanted fields:
const dbData = {
  ...discountData, // ❌ Might include minPurchase, maxDiscount
  vendor_id: discountData.vendorId,
  // ... field mapping ...
};

// ✅ CORRECT - Explicitly construct the object:
const dbData = {
  vendor_id: discountData.vendorId,
  name: discountData.title || discountData.name,
  // ... only include fields that exist in the database ...
};
```

3. **Check for any default value assignments:**

```typescript
// ❌ WRONG - Don't set defaults for non-existent columns:
const dbData = {
  // ... other fields ...
  min_purchase: discountData.minPurchase || 0, // ❌ Column doesn't exist!
};

// ✅ CORRECT - Only set defaults for existing columns:
const dbData = {
  // ... other fields ...
  usage_limit: discountData.usageLimit || 'unlimited', // ✅ This column exists
};
```

### Frontend Status

✅ **The frontend is already fixed** - it does NOT send `minPurchase` or `maxDiscount` fields. The frontend explicitly excludes these fields before sending the request.

### Verification

After fixing the backend, verify that:
- ✅ Creating a discount works without the `min_purchase` error
- ✅ Updating a discount works without the `min_purchase` error
- ✅ The backend only inserts/updates fields that exist in the database schema

---

## 🔄 Update Discount Endpoint

**Endpoint:** `PUT /api/admin/discounts/{id}`

Same field mapping applies for updates. The frontend sends the same camelCase fields.

**Important:** Make sure the update endpoint also excludes `min_purchase` and `max_discount` fields.

---

## 📝 Implementation Checklist

- [ ] Verify `discounts` table has `title` column (or use `name` field)
- [ ] Verify `discounts` table has `discount_code` or `pos_code` column
- [ ] Verify `discounts` table has `usage_limit` column
- [ ] Update `discount_type` CHECK constraint to include `'free'`
- [ ] Map camelCase fields to snake_case in backend
- [ ] Remove any references to `min_purchase` and `max_discount` columns
- [ ] Test creating discounts with all 4 types: `percentage`, `fixed`, `bogo`, `free`
- [ ] Test with different `usageLimit` values: `"1"`, `"5"`, `"10"`, `"unlimited"`
- [ ] Verify `discountCode` is saved correctly
- [ ] Test update endpoint with new fields

---

## 🧪 Test Cases

### Test 1: Percentage Discount
```json
{
  "vendorId": 28,
  "title": "10% off Pizza",
  "description": "Get 10% off any pizza",
  "discountType": "percentage",
  "discountValue": 10,
  "discountCode": "PIZZA10",
  "usageLimit": "5"
}
```

### Test 2: Fixed Amount Discount
```json
{
  "vendorId": 28,
  "title": "$10 off Order",
  "description": "Save $10 on your order",
  "discountType": "fixed",
  "discountValue": 10,
  "discountCode": "SAVE10",
  "usageLimit": "1"
}
```

### Test 3: BOGO Discount
```json
{
  "vendorId": 28,
  "title": "Buy One Get One Coffee",
  "description": "Buy one coffee, get one free",
  "discountType": "bogo",
  "discountValue": 50,
  "discountCode": "BOGOCOFFEE",
  "usageLimit": "unlimited"
}
```

### Test 4: Free Item Discount
```json
{
  "vendorId": 28,
  "title": "FREE Dessert",
  "description": "Free dessert with any meal",
  "discountType": "free",
  "discountValue": 100,
  "discountCode": "FREEDESSERT",
  "usageLimit": "1"
}
```

---

## 📞 Questions?

If you need help implementing any part of this:
- Field mapping from camelCase to snake_case
- Database schema updates
- Handling the new `usageLimit` field
- Supporting the `'free'` discount type
- Error handling for missing columns

Let me know which part you'd like help with!


