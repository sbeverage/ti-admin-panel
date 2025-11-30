# Create `vendor-images` Bucket in Supabase

## Issue
The `vendor-images` bucket doesn't exist in Supabase Storage, causing upload failures with error: "Bucket not found"

## Quick Fix (Temporary)
The code has been updated to use `beneficiary-images` bucket for vendor logos temporarily.

## Proper Fix: Create the Bucket

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/mdqgndyhzlnwojtubouh
   - Or: https://mdqgndyhzlnwojtubouh.supabase.co

2. **Go to Storage**
   - Click "Storage" in the left sidebar
   - Click "Buckets"

3. **Create New Bucket**
   - Click "New bucket" button
   - **Bucket name:** `vendor-images`
   - **Public bucket:** ✅ Check this (or configure RLS policies for public read)
   - Click "Create bucket"

4. **Verify Permissions**
   - Ensure the service role key has write permissions
   - Public read access should be enabled

5. **Update Code (After Bucket is Created)**
   - Change `VendorProfile.tsx` line 1246 back to:
     ```tsx
     bucketName="vendor-images"
     ```

## Current Status
- ✅ Vendor update functionality: **Working**
- ⚠️ Image upload: Using `beneficiary-images` bucket temporarily
- 📋 Action needed: Create `vendor-images` bucket in Supabase

## Test After Creating Bucket
1. Go to a vendor profile
2. Click "Edit Profile"
3. Upload a logo
4. Should upload successfully to `vendor-images` bucket

