# Vendor Logo Upload - Using `vendor-logos` Bucket

## ✅ Resolved
The code now uses the existing `vendor-logos` bucket in Supabase Storage.

## Current Configuration
- **Bucket name:** `vendor-logos`
- **Location:** `VendorProfile.tsx` line 1246
- **Status:** ✅ Configured and ready to use

## Current Status
- ✅ Vendor update functionality: **Working**
- ✅ Image upload: Using `vendor-logos` bucket
- ✅ Bucket exists: Already created in Supabase

## Test
1. Go to a vendor profile
2. Click "Edit Profile"
3. Upload a logo
4. Should upload successfully to `vendor-logos` bucket

## Note
If you need to change the bucket name in the future, update:
- `src/components/VendorProfile.tsx` line 1246: `bucketName="vendor-logos"`

