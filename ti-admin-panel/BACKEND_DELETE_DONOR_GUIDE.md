# 🗑️ Backend Implementation Guide: Delete Donor & Get Donor Details Endpoints

This guide covers implementing both the **Delete Donor** endpoint and the **Get Donor Details** endpoint needed for the comprehensive donor profile view.

## Overview

The frontend is calling a `DELETE` endpoint to remove donors from the database. Currently, this endpoint returns a 404 because it hasn't been implemented in your Supabase Edge Function.

---

## 📋 Frontend Requirements

### Endpoint Details
- **Method:** `DELETE`
- **URL Pattern:** `/api/admin/donors/{id}`
- **Full URL:** `https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/donors/{id}`

### Request Headers (Required)
The frontend sends these headers - your backend MUST validate them:

```javascript
{
  'X-Admin-Secret': '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e',
  'Content-Type': 'application/json',
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A'
}
```

### Request Body
**None** - The donor ID is passed in the URL path.

### URL Parameters
- `{id}` - The numeric ID of the donor to delete (e.g., `/donors/24`)

---

## ✅ Expected Response Format

The frontend expects a JSON response in one of these formats:

### Success Response
```json
{
  "success": true,
  "data": {
    "id": 24,
    "message": "Donor deleted successfully"
  }
}
```

OR (simpler):
```json
{
  "success": true,
  "data": null
}
```

### Error Response
If the donor doesn't exist or deletion fails:
```json
{
  "success": false,
  "error": "Donor not found"
}
```

OR:
```json
{
  "message": "Donor not found"
}
```

---

## 🔧 Supabase Edge Function Implementation

### Step 1: Locate Your Edge Function File

Find or create the Edge Function file that handles donor operations. It's likely at:
- `supabase/functions/api/admin/index.ts` (if using a monolithic structure)
- `supabase/functions/donors/index.ts` (if using separate functions)

### Step 2: Add the DELETE Route Handler

Here's a complete example for a Supabase Edge Function using Deno:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ADMIN_SECRET = '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://mdqgndyhzlnwojtubouh.supabase.co'
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'your-anon-key'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-admin-secret, content-type, apikey',
      },
    })
  }

  try {
    // Extract path and method
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Parse the donor ID from the path
    // Expected: /functions/v1/api/admin/donors/{id}
    const donorIdMatch = path.match(/\/donors\/(\d+)$/)
    
    if (!donorIdMatch) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid donor ID' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    const donorId = parseInt(donorIdMatch[1], 10)

    // Validate admin secret
    const adminSecret = req.headers.get('x-admin-secret')
    if (adminSecret !== ADMIN_SECRET) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Use service role key for admin operations
    )

    // Delete the donor from the database
    // Adjust table name if your donors table is named differently
    const { data, error } = await supabaseClient
      .from('donors')  // Change this to your actual table name (e.g., 'users' if donors are in users table)
      .delete()
      .eq('id', donorId)
      .select()
      .single()

    if (error) {
      console.error('Delete error:', error)
      
      // Check if donor doesn't exist
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ success: false, error: 'Donor not found' }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        )
      }

      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        data: { id: donorId, message: 'Donor deleted successfully' }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
```

---

## 📊 Database Considerations

### Table Structure
You need to know:
1. **Table name** - Where donors are stored (e.g., `donors`, `users`, `donors_table`)
2. **ID column name** - Usually `id`, but could be `donor_id`, `user_id`, etc.
3. **Related data** - Do you need to delete related records (donations, addresses, etc.)?

### Example: Simple Delete
If your donors table is straightforward:
```sql
DELETE FROM donors WHERE id = {donor_id};
```

### Example: Cascade Delete
If you need to delete related records:
```sql
-- Delete related addresses
DELETE FROM donor_addresses WHERE donor_id = {donor_id};

-- Delete related donations
DELETE FROM donations WHERE donor_id = {donor_id};

-- Delete the donor
DELETE FROM donors WHERE id = {donor_id};
```

### Example: Soft Delete (Recommended)
Instead of permanently deleting, mark as deleted:
```sql
UPDATE donors 
SET deleted_at = NOW(), is_active = false 
WHERE id = {donor_id};
```

Then modify your GET queries to exclude soft-deleted donors:
```sql
SELECT * FROM donors WHERE deleted_at IS NULL;
```

---

## 🔐 Security Checklist

1. ✅ **Validate Admin Secret** - Check `X-Admin-Secret` header
2. ✅ **Validate Authorization** - Verify Bearer token if needed
3. ✅ **Validate Input** - Ensure donor ID is a valid integer
4. ✅ **Check Permissions** - Ensure the service role has delete permissions
5. ✅ **Log Actions** - Log all delete operations for audit trail
6. ✅ **Handle Errors** - Return appropriate HTTP status codes

---

## 🧪 Testing the Endpoint

### Using cURL
```bash
curl -X DELETE \
  'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/donors/24' \
  -H 'X-Admin-Secret: 6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e' \
  -H 'Content-Type: application/json' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "id": 24,
    "message": "Donor deleted successfully"
  }
}
```

---

## 📝 Implementation Steps Summary

1. **Locate your Edge Function** that handles `/api/admin/donors` routes
2. **Add DELETE route handler** with pattern `/donors/:id`
3. **Validate admin secret** from `X-Admin-Secret` header
4. **Extract donor ID** from URL path
5. **Delete from database** using Supabase client
6. **Handle errors** (404 if not found, 500 for server errors)
7. **Return JSON response** in the format shown above
8. **Deploy** the updated Edge Function
9. **Test** using cURL or the frontend interface

---

## 🚀 Quick Reference

- **Endpoint:** `DELETE /api/admin/donors/{id}`
- **Headers Required:** `X-Admin-Secret`, `Content-Type`, `apikey`, `Authorization`
- **Response Format:** `{ success: true, data: {...} }`
- **Status Codes:**
  - `200` - Success
  - `400` - Invalid donor ID
  - `401` - Unauthorized (invalid admin secret)
  - `404` - Donor not found
  - `500` - Server error

---

## ⚠️ Important Notes

1. **Table Name** - Replace `'donors'` with your actual table name
2. **Service Role Key** - Use `SUPABASE_SERVICE_ROLE_KEY` environment variable (not anon key) for admin operations
3. **Cascade Deletes** - Decide if you want to delete related records or keep them orphaned
4. **Soft Delete** - Consider implementing soft deletes instead of permanent deletion for data recovery
5. **Audit Trail** - Log all delete operations for compliance

Once implemented, the Delete button in the frontend will work automatically! 🎉

---

# 📋 Get Donor Details Endpoint

## Overview

The frontend calls a `GET` endpoint to retrieve detailed donor information for the comprehensive donor profile view. This includes payment methods, monthly donations, donation history, discount redemptions, and leaderboard position.

---

## 📋 Frontend Requirements

### Endpoint Details
- **Method:** `GET`
- **URL Pattern:** `/api/admin/donors/{id}/details`
- **Full URL:** `https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/donors/{id}/details`

### Request Headers (Required)
Same as DELETE endpoint:

```javascript
{
  'X-Admin-Secret': '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e',
  'Content-Type': 'application/json',
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A'
}
```

### Request Body
**None** - The donor ID is passed in the URL path.

### URL Parameters
- `{id}` - The numeric ID of the donor (e.g., `/donors/24/details`)

---

## ✅ Expected Response Format

The frontend expects a JSON response with all donor profile information:

### Success Response
```json
{
  "success": true,
  "data": {
    "payment_methods": [
      {
        "type": "card",
        "brand": "visa",
        "last4": "1234",
        "exp_month": 12,
        "exp_year": 2025,
        "is_default": true
      },
      {
        "type": "apple_pay",
        "is_default": false
      }
    ],
    "monthly_donation": {
      "amount": 50.00,
      "active": true,
      "start_date": "2024-01-15",
      "next_charge_date": "2024-02-15"
    },
    "current_beneficiary": {
      "name": "United Way",
      "category": "Charity",
      "amount": 50.00,
      "start_date": "2024-01-15"
    },
    "donation_history": [
      {
        "date": "2024-01-15",
        "amount": 50.00,
        "beneficiary_name": "United Way",
        "type": "monthly"
      },
      {
        "date": "2023-12-15",
        "amount": 50.00,
        "beneficiary_name": "United Way",
        "type": "monthly"
      },
      {
        "date": "2023-11-20",
        "amount": 100.00,
        "beneficiary_name": "American Red Cross",
        "type": "one_time"
      }
    ],
    "discount_redemptions": [
      {
        "vendor_name": "Coffee Shop",
        "discount_name": "20% Off",
        "date": "2024-01-20",
        "savings": 5.00,
        "location": "123 Main St, City, State"
      },
      {
        "vendor_name": "Restaurant",
        "discount_name": "$10 Off $50+",
        "date": "2024-01-18",
        "savings": 10.00,
        "location": "456 Oak Ave, City, State"
      }
    ],
    "total_savings": 15.00,
    "leaderboard_position": {
      "rank": 5,
      "points": 1250,
      "period": "all_time"
    }
  }
}
```

### Error Response
If the donor doesn't exist:
```json
{
  "success": false,
  "error": "Donor not found"
}
```

---

## 🔧 Supabase Edge Function Implementation

### Complete GET /donors/{id}/details Implementation

Here's a complete example for retrieving comprehensive donor details:

```typescript
// Handle GET /donors/{id}/details
if (method === 'GET' && path.match(/\/donors\/(\d+)\/details$/)) {
  const donorIdMatch = path.match(/\/donors\/(\d+)\/details$/)
  const donorId = parseInt(donorIdMatch[1], 10)

  // Validate admin secret
  const adminSecret = req.headers.get('x-admin-secret')
  if (adminSecret !== ADMIN_SECRET) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }

  // Create Supabase client
  const supabaseClient = createClient(
    SUPABASE_URL,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  try {
    // Fetch payment methods
    const { data: paymentMethods, error: pmError } = await supabaseClient
      .from('payment_methods')  // Adjust table name as needed
      .select('*')
      .eq('donor_id', donorId)
      .order('is_default', { ascending: false })

    // Fetch monthly donation/subscription
    const { data: monthlyDonation, error: mdError } = await supabaseClient
      .from('donor_subscriptions')  // Adjust table name as needed
      .select('*')
      .eq('donor_id', donorId)
      .eq('active', true)
      .single()

    // Fetch current beneficiary
    const { data: currentBeneficiary, error: cbError } = await supabaseClient
      .from('donor_beneficiaries')  // Adjust table name as needed
      .select('*, beneficiaries(*)')
      .eq('donor_id', donorId)
      .eq('is_current', true)
      .single()

    // Fetch donation history (past few months/years)
    const { data: donationHistory, error: dhError } = await supabaseClient
      .from('donations')  // Adjust table name as needed
      .select('*, beneficiaries(name)')
      .eq('donor_id', donorId)
      .order('date', { ascending: false })
      .limit(50)  // Get last 50 donations

    // Fetch discount redemptions
    const { data: redemptions, error: redError } = await supabaseClient
      .from('discount_redemptions')  // Adjust table name as needed
      .select('*, discounts(name), vendors(name, address)')
      .eq('donor_id', donorId)
      .order('redeemed_at', { ascending: false })
      .limit(100)  // Get last 100 redemptions

    // Calculate total savings
    const totalSavings = redemptions?.reduce((sum, r) => sum + (r.savings || 0), 0) || 0

    // Fetch leaderboard position
    // This requires calculating rank based on points
    const { data: leaderboardData, error: lbError } = await supabaseClient
      .from('donor_points')  // Adjust table name as needed
      .select('points, rank')
      .eq('donor_id', donorId)
      .single()

    // Calculate rank if not stored
    let rank = leaderboardData?.rank
    if (!rank) {
      const { data: allDonors, error: rankError } = await supabaseClient
        .from('donor_points')
        .select('donor_id, points')
        .order('points', { ascending: false })

      if (allDonors) {
        const donorIndex = allDonors.findIndex(d => d.donor_id === donorId)
        rank = donorIndex >= 0 ? donorIndex + 1 : null
      }
    }

    // Format response
    const responseData = {
      payment_methods: paymentMethods?.map(pm => ({
        type: pm.type || 'card',
        brand: pm.brand,
        last4: pm.last4,
        exp_month: pm.exp_month,
        exp_year: pm.exp_year,
        is_default: pm.is_default || false
      })) || [],
      monthly_donation: monthlyDonation ? {
        amount: monthlyDonation.amount,
        active: monthlyDonation.active,
        start_date: monthlyDonation.start_date,
        next_charge_date: monthlyDonation.next_charge_date
      } : null,
      current_beneficiary: currentBeneficiary ? {
        name: currentBeneficiary.beneficiaries?.name || currentBeneficiary.beneficiary_name,
        category: currentBeneficiary.beneficiaries?.category || 'Charity',
        amount: currentBeneficiary.amount || currentBeneficiary.monthly_amount,
        start_date: currentBeneficiary.start_date
      } : null,
      donation_history: donationHistory?.map(d => ({
        date: d.date,
        amount: d.amount,
        beneficiary_name: d.beneficiaries?.name || d.beneficiary_name,
        type: d.type || (d.is_recurring ? 'monthly' : 'one_time')
      })) || [],
      discount_redemptions: redemptions?.map(r => ({
        vendor_name: r.vendors?.name || r.vendor_name,
        discount_name: r.discounts?.name || r.discount_name,
        date: r.redeemed_at || r.date,
        savings: r.savings || r.discount_amount,
        location: r.vendors?.address || r.location
      })) || [],
      total_savings: totalSavings,
      leaderboard_position: rank ? {
        rank: rank,
        points: leaderboardData?.points || 0,
        period: 'all_time'
      } : null
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    console.error('Error fetching donor details:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to fetch donor details' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}
```

---

## 📊 Database Table Structure Reference

To implement this endpoint, you'll need access to the following tables. Adjust table/column names to match your actual database schema:

### Required Tables

1. **`payment_methods`** (or similar)
   - `id`, `donor_id`, `type` (card/apple_pay), `brand`, `last4`, `exp_month`, `exp_year`, `is_default`

2. **`donor_subscriptions`** or **`monthly_donations`** (or similar)
   - `id`, `donor_id`, `amount`, `active`, `start_date`, `next_charge_date`

3. **`donor_beneficiaries`** or **`beneficiary_assignments`** (or similar)
   - `id`, `donor_id`, `beneficiary_id`, `is_current`, `start_date`, `amount`

4. **`beneficiaries`** (reference table)
   - `id`, `name`, `category`

5. **`donations`** (or similar)
   - `id`, `donor_id`, `beneficiary_id`, `amount`, `date`, `type` (monthly/one_time), `is_recurring`

6. **`discount_redemptions`** (or similar)
   - `id`, `donor_id`, `discount_id`, `vendor_id`, `redeemed_at`, `savings`, `discount_amount`

7. **`vendors`** (reference table)
   - `id`, `name`, `address`

8. **`discounts`** (reference table)
   - `id`, `name`, `discount_value`

9. **`donor_points`** or **`leaderboard`** (or similar)
   - `donor_id`, `points`, `rank` (optional - can be calculated)

---

## 🔍 Alternative: Single Query Approach

If you prefer to fetch everything in fewer queries, you can use PostgreSQL JOINs:

```sql
WITH donor_data AS (
  SELECT 
    d.id as donor_id,
    -- Payment Methods
    json_agg(DISTINCT jsonb_build_object(
      'type', pm.type,
      'brand', pm.brand,
      'last4', pm.last4,
      'exp_month', pm.exp_month,
      'exp_year', pm.exp_year,
      'is_default', pm.is_default
    )) FILTER (WHERE pm.id IS NOT NULL) as payment_methods,
    
    -- Monthly Donation
    jsonb_build_object(
      'amount', sub.amount,
      'active', sub.active,
      'start_date', sub.start_date,
      'next_charge_date', sub.next_charge_date
    ) as monthly_donation,
    
    -- Current Beneficiary
    jsonb_build_object(
      'name', b.name,
      'category', b.category,
      'amount', db.amount,
      'start_date', db.start_date
    ) as current_beneficiary,
    
    -- Donation History
    json_agg(DISTINCT jsonb_build_object(
      'date', don.date,
      'amount', don.amount,
      'beneficiary_name', b2.name,
      'type', don.type
    ) ORDER BY don.date DESC) FILTER (WHERE don.id IS NOT NULL) as donation_history,
    
    -- Discount Redemptions
    json_agg(DISTINCT jsonb_build_object(
      'vendor_name', v.name,
      'discount_name', disc.name,
      'date', dr.redeemed_at,
      'savings', dr.savings,
      'location', v.address
    ) ORDER BY dr.redeemed_at DESC) FILTER (WHERE dr.id IS NOT NULL) as discount_redemptions,
    
    -- Total Savings
    COALESCE(SUM(dr.savings), 0) as total_savings,
    
    -- Leaderboard Position
    jsonb_build_object(
      'rank', (SELECT COUNT(*) + 1 FROM donor_points WHERE points > dp.points),
      'points', dp.points,
      'period', 'all_time'
    ) as leaderboard_position
    
  FROM donors d
  LEFT JOIN payment_methods pm ON pm.donor_id = d.id
  LEFT JOIN donor_subscriptions sub ON sub.donor_id = d.id AND sub.active = true
  LEFT JOIN donor_beneficiaries db ON db.donor_id = d.id AND db.is_current = true
  LEFT JOIN beneficiaries b ON b.id = db.beneficiary_id
  LEFT JOIN donations don ON don.donor_id = d.id
  LEFT JOIN beneficiaries b2 ON b2.id = don.beneficiary_id
  LEFT JOIN discount_redemptions dr ON dr.donor_id = d.id
  LEFT JOIN vendors v ON v.id = dr.vendor_id
  LEFT JOIN discounts disc ON disc.id = dr.discount_id
  LEFT JOIN donor_points dp ON dp.donor_id = d.id
  WHERE d.id = {donor_id}
  GROUP BY d.id, sub.amount, sub.active, sub.start_date, sub.next_charge_date, 
           b.name, b.category, db.amount, db.start_date, dp.points
)
SELECT * FROM donor_data;
```

**Note:** Adjust table and column names to match your actual database schema!

---

## 📝 Implementation Steps Summary

1. **Locate your Edge Function** that handles `/api/admin/donors` routes
2. **Add GET route handler** with pattern `/donors/:id/details`
3. **Validate admin secret** from `X-Admin-Secret` header
4. **Extract donor ID** from URL path
5. **Query all related tables** (payment methods, subscriptions, donations, redemptions, etc.)
6. **Calculate aggregations** (total savings, leaderboard rank)
7. **Format response** in the exact structure shown above
8. **Handle errors** (404 if donor not found, 500 for server errors)
9. **Return JSON response** in the format shown above
10. **Deploy** the updated Edge Function
11. **Test** using cURL or the frontend interface

---

## 🧪 Testing the GET /donors/{id}/details Endpoint

### Using cURL
```bash
curl -X GET \
  'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/donors/24/details' \
  -H 'X-Admin-Secret: 6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e' \
  -H 'Content-Type: application/json' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Expected Response Structure
```json
{
  "success": true,
  "data": {
    "payment_methods": [...],
    "monthly_donation": {...},
    "current_beneficiary": {...},
    "donation_history": [...],
    "discount_redemptions": [...],
    "total_savings": 15.00,
    "leaderboard_position": {...}
  }
}
```

---

## ⚠️ Important Notes for Get Donor Details

1. **Table Names** - Adjust all table names to match your actual database schema
2. **Column Names** - Column names may differ (e.g., `donor_id` vs `user_id`, `redeemed_at` vs `redemption_date`)
3. **Null Handling** - Handle cases where donor has no payment methods, subscriptions, or history
4. **Performance** - Consider adding database indexes on `donor_id` columns for faster queries
5. **Leaderboard Calculation** - You may need to calculate rank dynamically or cache it in a `donor_points` table
6. **Date Formatting** - Return dates in ISO 8601 format (YYYY-MM-DD) or timestamp format
7. **Pagination** - For donation history and redemptions, consider limiting results (last 50-100 items)

---

## 🎯 Key Information to Display

The frontend expects this data structure to populate these tabs:

- **Payment Methods Tab**: Credit cards and Apple Pay on file
- **Monthly Donation Tab**: Current monthly subscription amount and schedule
- **Current Beneficiary Tab**: Who they're currently donating to
- **Donation History Tab**: Timeline of all past donations
- **Discount Redemptions Tab**: Where they've used discounts and savings amount
- **Leaderboard Tab**: Their rank and points

Once both endpoints are implemented, the comprehensive donor profile will work automatically! 🎉

