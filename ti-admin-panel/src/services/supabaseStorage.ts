// Supabase Storage Service for Image Uploads
// Uses Supabase Storage instead of AWS S3

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Get Supabase client configuration from environment
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mdqgndyhzlnwojtubouh.supabase.co';
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A';
  
  return { supabaseUrl, supabaseAnonKey };
};

// Upload image to Supabase Storage via backend API
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

    // Use the backend API to handle Supabase Storage upload
    // This is more secure as it keeps Supabase credentials on the server
    const API_CONFIG = {
      baseURL: 'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin',
      headers: {
        'X-Admin-Secret': '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e',
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A'
      }
    };

    // Convert file to base64 for API upload
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (data:image/jpeg;base64,)
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
    reader.readAsDataURL(file);

    const base64Data = await base64Promise;

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload via backend API
    const response = await fetch(`${API_CONFIG.baseURL}/upload-image`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({
        bucket: bucketName,
        path: fileName,
        file: base64Data,
        contentType: file.type,
        fileName: file.name
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase Storage upload failed:', errorText);
      return {
        success: false,
        error: `Upload failed: ${response.status} ${errorText}`
      };
    }

    const result = await response.json();
    
    if (result.success && result.url) {
      console.log('Supabase Storage upload successful:', result.url);
      return {
        success: true,
        url: result.url
      };
    } else {
      return {
        success: false,
        error: result.error || 'Upload failed'
      };
    }
  } catch (error) {
    console.error('Supabase Storage upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

// Delete image from Supabase Storage via backend API
export const deleteFromSupabase = async (
  url: string,
  bucketName: string = 'beneficiary-images'
): Promise<UploadResult> => {
  try {
    console.log('Supabase Storage: Deleting image...', { url, bucketName });

    const API_CONFIG = {
      baseURL: 'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin',
      headers: {
        'X-Admin-Secret': '6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e',
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A'
      }
    };

    // Extract path from URL
    // Supabase Storage URLs look like: https://mdqgndyhzlnwojtubouh.supabase.co/storage/v1/object/public/bucket-name/path/to/file.jpg
    const urlParts = url.split('/storage/v1/object/public/');
    const path = urlParts.length > 1 ? urlParts[1] : url;

    const response = await fetch(`${API_CONFIG.baseURL}/delete-image`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({
        bucket: bucketName,
        path: path
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase Storage delete failed:', errorText);
      return {
        success: false,
        error: `Delete failed: ${response.status} ${errorText}`
      };
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('Supabase Storage delete successful');
      return {
        success: true
      };
    } else {
      return {
        success: false,
        error: result.error || 'Delete failed'
      };
    }
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

