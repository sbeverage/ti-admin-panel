/**
 * Upload a charity image and crop it to the shape it will actually be shown in.
 *
 * Why this exists: charity art was uploaded at whatever size the charity had
 * it, and the app cropped with `resizeMode: "cover"`, which centre-crops. A
 * 2:1 cover photo rendered into the roughly-square browse card lost its left
 * and right thirds, so a subject that was not dead centre simply disappeared
 * from the list while looking fine on the profile. Nobody could see that
 * happening at upload time, which is the real problem: the crop was decided by
 * the renderer, silently, after the fact.
 *
 * So the crop is decided here instead. You frame it against the exact slot,
 * the browser exports precisely that rectangle at the target pixel size, and
 * the stored file is already the right shape. The app renders it as-is, with
 * no positioning maths, and every screen agrees because there is nothing left
 * to disagree about.
 *
 * Re-cropping means re-uploading, which is the trade: the original is not
 * kept. That is fine for this job (the charity has the original; we have a
 * crop of it) and it keeps the app simple and the downloads small.
 */
import React, { useCallback, useState } from 'react';
import { Upload, Button, message, Image as AntImage, Modal, Slider, Space, Typography, Spin } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  ScissorOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { IMAGE_PRESETS, exportCrop, prepareCropSource } from '../utils/imageCrop';
import type { ImageRole } from '../utils/imageCrop';
import { uploadToSupabase, deleteFromSupabase, validateImageFile } from '../services/supabaseStorage';

// Re-exported so existing callers can keep importing the role type and the
// presets from this component; the definitions live in utils/imageCrop.ts so
// the crop geometry can be tested on its own.
export type { ImageRole };
export { IMAGE_PRESETS };

const { Text } = Typography;

interface ImageCropUploadProps {
  role: ImageRole;
  currentImageUrl?: string;
  onImageChange: (url: string | null) => void;
  bucketName?: string;
  /** Hide the helper sentence, e.g. when the surrounding card already says it. */
  showHelp?: boolean;
}

const ImageCropUpload: React.FC<ImageCropUploadProps> = ({
  role,
  currentImageUrl,
  onImageChange,
  bucketName = 'charity-images',
  showHelp = true,
}) => {
  const preset = IMAGE_PRESETS[role];

  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  // Decoding and downscaling a large photo takes a moment. Without a visible
  // state the dragger just sits there and the click looks ignored.
  const [preparing, setPreparing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  const closeCropper = () => {
    // Object URLs are per-file allocations; releasing keeps a long editing
    // session from holding every image the admin opened.
    if (source && source.startsWith('blob:')) URL.revokeObjectURL(source);
    setSource(null);
    setArea(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  /** antd calls this per selected file; returning false stops its own upload. */
  const handleSelect = (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      message.error(validation.error);
      return false;
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setPreparing(true);
    // Downscale first if needed. A full-resolution camera photo makes the
    // cropper unusable, because every pointer move re-transforms the whole
    // image, so this has to happen before the cropper ever sees it.
    prepareCropSource(file)
      .then(({ url, original, downscaledTo }) => {
        setSource(url);
        if (downscaledTo) {
          message.info(
            `That photo was ${original.w} x ${original.h}, so it has been scaled to ` +
              `${downscaledTo.w} x ${downscaledTo.h} to crop. Still plenty for the ` +
              `${preset.outWidth} x ${preset.outHeight} it saves at.`,
          );
        }
      })
      .catch((e: any) => {
        message.error(e?.message || 'That image could not be opened. Give it another try?');
      })
      .finally(() => setPreparing(false));
    return false;
  };

  /** Re-frame an image that is already uploaded, without picking a new file. */
  const handleRecrop = () => {
    if (!currentImageUrl) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    // Already-stored images are within the target sizes, so these need no
    // preparation; they are fetched straight into the cropper.
    setSource(currentImageUrl);
  };

  const handleSaveCrop = async () => {
    if (!source || !area) return;
    setSaving(true);
    try {
      const blob = await exportCrop(source, area, preset);
      const ext = preset.png ? 'png' : 'jpg';
      const cropped = new File([blob], `${role}-${Date.now()}.${ext}`, {
        type: blob.type,
      });

      const result = await uploadToSupabase(cropped, bucketName);
      if (result.success && result.url) {
        onImageChange(result.url);
        message.success(`${preset.label} image saved at ${preset.outWidth}x${preset.outHeight}.`);
        closeCropper();
      } else {
        message.error(result.error || 'That did not upload. Give it another try?');
      }
    } catch (error: any) {
      message.error(error?.message || 'That crop did not save. Give it another try?');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (currentImageUrl && currentImageUrl.includes('supabase.co')) {
      try {
        await deleteFromSupabase(currentImageUrl, bucketName);
      } catch {
        // The row is what the app reads, so clearing the field is what
        // matters. A leftover object in the bucket is harmless.
      }
    }
    onImageChange(null);
  };

  // Preview at the shape the app will use, so a wrong crop is obvious here
  // rather than on someone's phone.
  const previewWidth = preset.round ? 96 : preset.aspect >= 2 ? 240 : 120;
  const previewHeight = Math.round(previewWidth / preset.aspect);

  return (
    <div>
      {currentImageUrl ? (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div
            style={{
              width: previewWidth,
              height: previewHeight,
              borderRadius: preset.round ? '50%' : 8,
              overflow: 'hidden',
              background: '#f5f5f5',
              border: '1px solid #f0f0f0',
            }}
          >
            <AntImage
              src={currentImageUrl}
              alt={`${preset.label} image`}
              width={previewWidth}
              height={previewHeight}
              style={{ objectFit: 'cover' }}
            />
          </div>
          <Space size="small">
            <Button icon={<ScissorOutlined />} onClick={handleRecrop}>
              Reframe
            </Button>
            <Upload beforeUpload={handleSelect} showUploadList={false} accept="image/*">
              <Button icon={<UploadOutlined />} loading={preparing}>
                Replace
              </Button>
            </Upload>
            <Button danger icon={<DeleteOutlined />} onClick={handleRemove}>
              Remove
            </Button>
          </Space>
        </Space>
      ) : (
        <Upload.Dragger
          beforeUpload={handleSelect}
          showUploadList={false}
          accept="image/*"
          style={{ padding: '12px 8px' }}
        >
          <p style={{ margin: 0 }}>
            <UploadOutlined style={{ fontSize: 22, color: '#DB8633' }} />
          </p>
          <p style={{ margin: '6px 0 0', fontWeight: 500 }}>
            {preparing
              ? 'Getting the image ready'
              : `Add the ${preset.label.toLowerCase()} image`}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#888' }}>
            {preparing ? 'One moment' : 'You will position and crop it next'}
          </p>
        </Upload.Dragger>
      )}

      {showHelp && (
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
          {preset.help}
        </Text>
      )}

      <Modal
        open={!!source}
        title={`Position the ${preset.label.toLowerCase()} image`}
        onCancel={closeCropper}
        okText="Save this crop"
        cancelText="Cancel"
        confirmLoading={saving}
        onOk={handleSaveCrop}
        width={720}
        destroyOnClose
      >
        <Spin spinning={saving} tip="Saving the crop">
          <Text type="secondary" style={{ fontSize: 13 }}>
            Drag to move, zoom to fill. Whatever is inside the frame is exactly
            what donors will see. You can come back and reframe this at any
            time.
          </Text>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 380,
              marginTop: 12,
              background: '#1f1f1f',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {source && (
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                aspect={preset.aspect}
                cropShape={preset.round ? 'round' : 'rect'}
                showGrid={!preset.round}
                restrictPosition
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <Space align="center" style={{ width: '100%', marginTop: 16 }}>
            <ZoomOutOutlined style={{ color: '#888' }} />
            <Slider
              min={1}
              max={4}
              step={0.01}
              value={zoom}
              onChange={setZoom}
              style={{ width: 320 }}
              tooltip={{ formatter: (v) => `${Number(v).toFixed(1)}x` }}
            />
            <ZoomInOutlined style={{ color: '#888' }} />
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
              Saves at {preset.outWidth} x {preset.outHeight}
            </Text>
          </Space>
        </Spin>
      </Modal>
    </div>
  );
};

export default ImageCropUpload;
