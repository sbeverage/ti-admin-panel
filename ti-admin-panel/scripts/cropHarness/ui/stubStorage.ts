/**
 * Stands in for services/supabaseStorage in the UI harness, so the component
 * can be driven without credentials and without writing to the real bucket.
 * Records what it was handed so the harness can assert on it.
 */
export const lastUpload: { file: File | null; bucket: string | null } = {
  file: null,
  bucket: null,
};

export const uploadToSupabase = async (file: File, bucketName = 'stub') => {
  lastUpload.file = file;
  lastUpload.bucket = bucketName;
  (window as any).__lastUpload = {
    name: file.name,
    type: file.type,
    bytes: file.size,
    bucket: bucketName,
  };
  return { success: true, url: URL.createObjectURL(file) };
};

export const deleteFromSupabase = async () => ({ success: true });

export const validateImageFile = (file: File) => {
  const ok = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return ok.includes(file.type)
    ? { valid: true as const }
    : { valid: false as const, error: 'Invalid file type.' };
};
