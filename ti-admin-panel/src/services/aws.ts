import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadToS3 = async (
  file: File,
  bucketName: string = process.env.REACT_APP_S3_BUCKET_NAME || 'ti-admin-images',
  folder: string = 'vendor-images'
): Promise<UploadResult> => {
  try {
    // Check if AWS credentials are configured
    const accessKeyId = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;
    
    if (!accessKeyId || accessKeyId === 'your_aws_access_key_id') {
      console.error('AWS credentials not configured');
      return {
        success: false,
        error: 'AWS credentials not configured. Please set up your .env file with AWS credentials.'
      };
    }
    
    if (!secretAccessKey || secretAccessKey === 'your_aws_secret_access_key') {
      console.error('AWS secret key not configured');
      return {
        success: false,
        error: 'AWS secret key not configured. Please set up your .env file with AWS credentials.'
      };
    }

    console.log('AWS Config:', {
      accessKeyId: accessKeyId ? 'Set' : 'Missing',
      secretAccessKey: secretAccessKey ? 'Set' : 'Missing',
      region: process.env.REACT_APP_AWS_REGION,
      bucketName
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload parameters
    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read' // Make the file publicly accessible
    };

    console.log('Uploading to S3:', uploadParams);

    const result = await s3.upload(uploadParams).promise();
    
    console.log('S3 upload successful:', result.Location);
    
    return {
      success: true,
      url: result.Location
    };
  } catch (error) {
    console.error('S3 upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

export const deleteFromS3 = async (
  url: string,
  bucketName: string = process.env.REACT_APP_S3_BUCKET_NAME || 'ti-admin-images'
): Promise<UploadResult> => {
  try {
    // Extract key from URL
    const urlParts = url.split('/');
    const key = urlParts.slice(3).join('/'); // Remove bucket name and domain

    const deleteParams = {
      Bucket: bucketName,
      Key: key
    };

    console.log('Deleting from S3:', deleteParams);

    await s3.deleteObject(deleteParams).promise();
    
    console.log('S3 delete successful');
    
    return {
      success: true
    };
  } catch (error) {
    console.error('S3 delete failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
};

// Helper function to validate file type
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 5MB'
    };
  }

  return { valid: true };
};
