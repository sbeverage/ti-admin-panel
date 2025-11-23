// Supabase Storage Service for Image Uploads
// Uses Supabase Storage REST API directly

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Supabase configuration
const SUPABASE_URL = 'https://mdqgndyhzlnwojtubouh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A';

// Upload image to Supabase Storage using REST API
export const uploadToSupabase = async (
  file: File,
  bucketName: string = 'beneficiary-images',
  folder: string = 'uploads'
): Promise<UploadResult> => {
  try {
    console.log('Supabase Storage: Starting upload...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      bucketName,
      folder
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `${bucketName}/${fileName}`;

    // Upload to Supabase Storage using REST API
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${filePath}`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': file.type,
        'x-upsert': 'true' // Allow overwriting if file exists
      },
      body: file
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase Storage upload failed:', response.status, errorText);
      
      // If bucket doesn't exist or access denied, provide helpful error
      if (response.status === 404) {
        return {
          success: false,
          error: `Storage bucket '${bucketName}' not found. Please create it in Supabase Dashboard.`
        };
      } else if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: 'Access denied. Please check Supabase Storage bucket permissions.'
        };
      }
      
      return {
        success: false,
        error: `Upload failed: ${response.status} ${errorText}`
      };
    }

    // Construct public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${filePath}`;
    
    console.log('Supabase Storage upload successful:', publicUrl);
    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Supabase Storage upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

// Delete image from Supabase Storage using REST API
export const deleteFromSupabase = async (
  url: string,
  bucketName: string = 'beneficiary-images'
): Promise<UploadResult> => {
  try {
    console.log('Supabase Storage: Deleting image...', { url, bucketName });

    // Extract path from URL
    // Supabase Storage URLs look like: https://mdqgndyhzlnwojtubouh.supabase.co/storage/v1/object/public/bucket-name/path/to/file.jpg
    let filePath = '';
    if (url.includes('/storage/v1/object/public/')) {
      filePath = url.split('/storage/v1/object/public/')[1];
    } else if (url.includes('/storage/v1/object/')) {
      filePath = url.split('/storage/v1/object/')[1];
    } else {
      // Assume it's just the path
      filePath = url;
    }

    const deleteUrl = `${SUPABASE_URL}/storage/v1/object/${filePath}`;

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase Storage delete failed:', response.status, errorText);
      return {
        success: false,
        error: `Delete failed: ${response.status} ${errorText}`
      };
    }

    console.log('Supabase Storage delete successful');
    return {
      success: true
    };
  } catch (error) {
    console.error('Supabase Storage delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
};

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
    };
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`
    };
  }

  return { valid: true };
};

