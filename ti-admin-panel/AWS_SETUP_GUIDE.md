# AWS S3 Image Upload Setup Guide

## Environment Variables Required

Create a `.env` file in the root directory with the following variables:

```bash
# AWS Configuration for Image Uploads
REACT_APP_AWS_ACCESS_KEY_ID=your_aws_access_key_id
REACT_APP_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
REACT_APP_AWS_REGION=us-east-1
REACT_APP_S3_BUCKET_NAME=ti-admin-images
```

## AWS S3 Setup Steps

### 1. Create S3 Bucket
1. Go to AWS S3 Console
2. Create a new bucket named `ti-admin-images` (or your preferred name)
3. Set the region to `us-east-1` (or your preferred region)
4. Enable public access for uploaded images

### 2. Configure Bucket Policy
Add this bucket policy to allow public read access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::ti-admin-images/*"
        }
    ]
}
```

### 3. Create IAM User
1. Go to AWS IAM Console
2. Create a new user for the admin panel
3. Attach the following policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::ti-admin-images/*"
        }
    ]
}
```

### 4. Get Access Keys
1. Go to the IAM user you created
2. Go to "Security credentials" tab
3. Create access keys
4. Copy the Access Key ID and Secret Access Key
5. Add them to your `.env` file

## Features

- ✅ Upload images to AWS S3
- ✅ Automatic file validation (type and size)
- ✅ Image preview and management
- ✅ Delete images from S3
- ✅ Public URL generation
- ✅ Drag and drop support
- ✅ Progress indicators

## File Structure

```
src/
├── services/
│   └── aws.ts              # AWS S3 upload utilities
├── components/
│   ├── ImageUpload.tsx     # Reusable image upload component
│   └── VendorProfile.tsx   # Updated with image upload
```

## Usage

The image upload component is now integrated into the vendor profile. Users can:

1. **Upload Logo**: Click or drag an image to upload
2. **View Image**: Click "View Full Size" to see the full image
3. **Remove Image**: Click "Remove" to delete from S3
4. **Replace Image**: Upload a new image to replace the current one

## Security Notes

- Images are stored with public read access
- File types are validated (JPEG, PNG, GIF, WebP only)
- File size is limited to 5MB
- Unique filenames prevent conflicts
- Old images are deleted when replaced



















