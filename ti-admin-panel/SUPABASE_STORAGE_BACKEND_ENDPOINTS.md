# Supabase Storage Backend Endpoints Required

## Overview

The admin panel now uploads images to Supabase Storage via backend API endpoints. You need to create these endpoints in your Supabase Edge Function.

## Required Endpoints

### 1. Upload Image Endpoint

**Endpoint:** `POST /api/admin/storage/upload`

**Authentication:** Required (uses X-Admin-Secret header)

**Request Body:**
```json
{
  "bucket": "beneficiary-images",
  "path": "uploads/1234567890-abc123.jpg",
  "file": "base64EncodedImageData",
  "contentType": "image/jpeg",
  "fileName": "original-filename.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://mdqgndyhzlnwojtubouh.supabase.co/storage/v1/object/public/beneficiary-images/uploads/1234567890-abc123.jpg"
}
```

**Implementation Example (Supabase Edge Function):**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify admin secret
    const adminSecret = req.headers.get('x-admin-secret')
    if (adminSecret !== '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { bucket, path, file, contentType } = await req.json()

    // Create Supabase client with service role key (has full access)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://mdqgndyhzlnwojtubouh.supabase.co'
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // Get from Supabase Dashboard
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Convert base64 to Uint8Array
    const fileData = Uint8Array.from(atob(file), c => c.charCodeAt(0))

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileData, {
        contentType: contentType,
        upsert: true
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: urlData.publicUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 2. Delete Image Endpoint

**Endpoint:** `POST /api/admin/storage/delete`

**Authentication:** Required (uses X-Admin-Secret header)

**Request Body:**
```json
{
  "bucket": "beneficiary-images",
  "path": "beneficiary-images/uploads/1234567890-abc123.jpg"
}
```

**Response:**
```json
{
  "success": true
}
```

**Implementation Example (Supabase Edge Function):**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify admin secret
    const adminSecret = req.headers.get('x-admin-secret')
    if (adminSecret !== '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { bucket, path } = await req.json()

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://mdqgndyhzlnwojtubouh.supabase.co'
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Extract just the file path (remove bucket name if included)
    let filePath = path
    if (path.startsWith(`${bucket}/`)) {
      filePath = path.replace(`${bucket}/`, '')
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

## Environment Variables Needed

In your Supabase Edge Function, set these environment variables:

- `SUPABASE_URL`: `https://mdqgndyhzlnwojtubouh.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: Get from Supabase Dashboard → Settings → API → service_role key

## Storage Bucket Setup

1. Go to Supabase Dashboard → Storage
2. Create a bucket named `beneficiary-images`
3. Set it to **Public** (or configure RLS policies for public read access)
4. Ensure the service role key has write permissions

## Testing

Once endpoints are created, test with:

```bash
# Upload test
curl -X POST https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/storage/upload \
  -H "X-Admin-Secret: 6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e" \
  -H "Content-Type: application/json" \
  -d '{
    "bucket": "beneficiary-images",
    "path": "uploads/test.jpg",
    "file": "base64EncodedDataHere",
    "contentType": "image/jpeg",
    "fileName": "test.jpg"
  }'
```

## Notes

- The service role key has full access to Supabase Storage
- Never expose the service role key in frontend code
- Always verify the X-Admin-Secret header
- Handle CORS properly for browser requests

