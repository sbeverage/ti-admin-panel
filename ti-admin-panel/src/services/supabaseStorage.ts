// Supabase Storage Service for Image Uploads
// Uses Supabase Storage REST API directly

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Shared config — mirrors api.ts defaults so all requests use the same creds.
// ---------------------------------------------------------------------------
const STORAGE_BASE_URL =
  (process.env.REACT_APP_API_BASE_URL?.trim().replace(/\/+$/, '') ||
    'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin');

const STORAGE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY?.trim() ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.EtIyUJ3kFILYV6bAIETAk6RE-ra7sEDd14bDG7PDVfg';

function getAdminSecret(): string {
  const raw = process.env.REACT_APP_ADMIN_SECRET;
  if (!raw) return '2b7bea7907fd07a4161dda627f81e2ecccc52f4402b2cafbcd5e0f4735a14a25';
  let s = raw.trim().replace(/^\uFEFF/, '').replace(/\r/g, '');
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s.length > 0 ? s : '2b7bea7907fd07a4161dda627f81e2ecccc52f4402b2cafbcd5e0f4735a14a25';
}

function getStorageHeaders(): Record<string, string> {
  return {
    'X-Admin-Secret': getAdminSecret(),
    'Content-Type': 'application/json',
    'apikey': STORAGE_ANON_KEY,
    'Authorization': `Bearer ${STORAGE_ANON_KEY}`,
  };
}

// ---------------------------------------------------------------------------

// Upload image to Supabase Storage via backend API
// Backend uses service role key for secure uploads
export const uploadToSupabase = async (
  file: File,
  bucketName: string = 'beneficiary-images',
  folder: string = 'uploads'
): Promise<UploadResult> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

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

    const response = await fetch(`${STORAGE_BASE_URL}/storage/upload`, {
      method: 'POST',
      headers: getStorageHeaders(),
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
      console.error('Storage upload failed:', response.status, errorText);

      if (response.status === 404) {
        return {
          success: false,
          error: 'Upload endpoint not found. Backend needs to implement /storage/upload endpoint.'
        };
      } else if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: 'Access denied. Please check backend authentication.'
        };
      }

      return {
        success: false,
        error: `Upload failed: ${response.status} ${errorText}`
      };
    }

    const result = await response.json();

    if (result.success && result.url) {
      return { success: true, url: result.url };
    } else {
      return { success: false, error: result.error || 'Upload failed' };
    }
  } catch (error) {
    console.error('Storage upload error:', error);
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
    // Extract path from URL
    // Supabase Storage URLs: https://…/storage/v1/object/public/bucket-name/path/to/file.jpg
    let filePath = '';
    if (url.includes('/storage/v1/object/public/')) {
      filePath = url.split('/storage/v1/object/public/')[1];
    } else if (url.includes('/storage/v1/object/')) {
      filePath = url.split('/storage/v1/object/')[1];
    } else {
      filePath = url;
    }

    const response = await fetch(`${STORAGE_BASE_URL}/storage/delete`, {
      method: 'POST',
      headers: getStorageHeaders(),
      body: JSON.stringify({ bucket: bucketName, path: filePath })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Storage delete failed:', response.status, errorText);
      return { success: false, error: `Delete failed: ${response.status} ${errorText}` };
    }

    const result = await response.json();
    return result.success
      ? { success: true }
      : { success: false, error: result.error || 'Delete failed' };
  } catch (error) {
    console.error('Storage delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
};

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
    };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`
    };
  }

  return { valid: true };
};
