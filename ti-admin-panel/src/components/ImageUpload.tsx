import React, { useState } from 'react';
import { Upload, Button, message, Image, Spin } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { uploadToSupabase, deleteFromSupabase, validateImageFile } from '../services/supabaseStorage';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (url: string | null) => void;
  title?: string;
  description?: string;
  maxSize?: number;
  acceptedTypes?: string[];
  bucketName?: string; // Optional: specify bucket name (defaults to 'beneficiary-images')
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageChange,
  title = "Upload Image",
  description = "Click or drag file to this area to upload",
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  bucketName = 'beneficiary-images' // Default to beneficiary-images for backward compatibility
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    console.log('ImageUpload: File selected:', file);
    
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      console.log('ImageUpload: File validation failed:', validation.error);
      message.error(validation.error);
      return false;
    }

    console.log('ImageUpload: File validation passed, starting upload...');
    setUploading(true);
    
    try {
      console.log('ImageUpload: Using bucketName:', bucketName);
      const result = await uploadToSupabase(file, bucketName);
      console.log('ImageUpload: Upload result:', result);
      
      if (result.success && result.url) {
        setPreviewUrl(result.url);
        onImageChange(result.url);
        message.success('Image uploaded successfully!');
        return false; // Prevent default upload behavior
      } else {
        console.error('ImageUpload: Upload failed:', result.error);
        message.error(result.error || 'Upload failed');
        return false;
      }
    } catch (error) {
      console.error('ImageUpload: Upload error:', error);
      message.error('Upload failed. Please try again.');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (currentImageUrl && currentImageUrl.includes('supabase.co')) {
      try {
        const result = await deleteFromSupabase(currentImageUrl, bucketName);
        if (!result.success) {
          console.warn('Failed to delete from Supabase Storage:', result.error);
        }
      } catch (error) {
        console.warn('Error deleting from Supabase Storage:', error);
      }
    }
    
    setPreviewUrl(null);
    onImageChange(null);
    message.success('Image removed');
  };

  const handlePreview = () => {
    const urlToPreview = previewUrl || currentImageUrl;
    if (urlToPreview) {
      window.open(urlToPreview, '_blank');
    }
  };

  const displayUrl = previewUrl || currentImageUrl;

  return (
    <div className="image-upload-container">
      {displayUrl ? (
        <div className="image-preview">
          <Image
            src={displayUrl}
            alt="Uploaded image"
            style={{ 
              width: 120, 
              height: 120, 
              objectFit: 'contain', 
              borderRadius: '8px',
              border: '1px solid #d9d9d9'
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
          <div className="image-actions" style={{ marginTop: '12px' }}>
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={handlePreview}
            >
              View Full Size
            </Button>
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              style={{ marginLeft: '8px' }}
              onClick={handleRemove}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Upload
          accept={acceptedTypes.join(',')}
          beforeUpload={handleUpload}
          showUploadList={false}
          disabled={uploading}
        >
          <div className="upload-area" style={{
            border: '2px dashed #d9d9d9',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#fafafa',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}>
            {uploading ? (
              <div>
                <Spin size="large" />
                <p style={{ marginTop: '12px' }}>Uploading...</p>
              </div>
            ) : (
              <div>
                <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                <p style={{ marginTop: '12px', fontWeight: 'bold' }}>{title}</p>
                <p style={{ color: '#666', marginTop: '4px' }}>{description}</p>
                <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                  Max file size: {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </div>
            )}
          </div>
        </Upload>
      )}
    </div>
  );
};

export default ImageUpload;
