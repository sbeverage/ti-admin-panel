/**
 * Charity image roles, their target shapes, and the crop export.
 *
 * Split out of ImageCropUpload so the geometry can be exercised directly in a
 * browser harness (scripts/cropHarness) rather than only by eye through the
 * admin UI. A crop that is subtly wrong produces a plausible-looking image, so
 * "it rendered something" is not evidence that it rendered the right thing.
 */
import type { Area } from 'react-easy-crop';

export type ImageRole = 'logo' | 'cover' | 'highlight';

type Preset = {
  label: string;
  /** width / height of the slot in the app. */
  aspect: number;
  /** Exported pixel size. Roughly 3x the rendered point size, for retina. */
  outWidth: number;
  outHeight: number;
  /** Draw the crop overlay as a circle (the slot is circular). */
  round: boolean;
  /** Keep alpha. Logos are often a mark on transparency. */
  png: boolean;
  /** Shown under the control so whoever uploads knows what they are framing. */
  help: string;
};

/**
 * One entry per image role, matching what the app actually renders.
 *
 *   logo       110pt circle on the charity profile
 *   cover      full-width 2:1 band across the top of the profile
 *   highlight  120pt square thumbnail on the charity browse list
 *
 * Changing an aspect here without changing the app's layout to match puts the
 * silent centre-crop straight back, so these are paired with the styles in
 * components/BeneficiaryDetailCard.js and app/(tabs)/(main)/beneficiary/index.js.
 */
export const IMAGE_PRESETS: Record<ImageRole, Preset> = {
  logo: {
    label: 'Logo',
    aspect: 1,
    outWidth: 512,
    outHeight: 512,
    round: true,
    png: true,
    help: 'Square. Shown as a circle on the profile, so keep the mark centred and leave a little breathing room at the edges.',
  },
  cover: {
    label: 'Cover',
    aspect: 2,
    outWidth: 1600,
    outHeight: 800,
    round: false,
    png: false,
    help: 'Wide banner across the top of the profile. The bottom edge sits behind the logo and the charity name, so keep faces and text out of the lower left.',
  },
  highlight: {
    label: 'Highlight',
    aspect: 1,
    outWidth: 600,
    outHeight: 600,
    round: false,
    png: false,
    help: 'Square thumbnail on the browse list, where donors see the charity before tapping in. One clear subject reads best this small.',
  },
};

/** Load a URL or object URL into an <img> we can draw to a canvas. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    // Needed to re-crop an image already in Supabase Storage: without it the
    // canvas is tainted and toBlob throws a security error. Public buckets
    // send permissive CORS, so this succeeds; if it ever does not, the caller
    // reports it rather than failing silently.
    img.crossOrigin = 'anonymous';
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () => reject(new Error('That image could not be opened for cropping.')));
    img.src = src;
  });
}

/**
 * Draw the chosen rectangle of the source onto a canvas at the target size.
 *
 * `area` arrives from react-easy-crop in natural source pixels, so this is a
 * straight copy of that rectangle. Drawing directly to the output dimensions
 * does the downscale in one step, which is both sharper and cheaper than
 * cropping and then resizing.
 */
export async function exportCrop(
  src: string,
  area: Area,
  preset: Preset,
): Promise<Blob> {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = preset.outWidth;
  canvas.height = preset.outHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser could not prepare the crop.');

  // A JPEG has no alpha, so anything transparent would render black. Fill
  // white first; harmless for photos, correct for a logo saved as JPEG.
  if (!preset.png) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    img,
    Math.round(area.x),
    Math.round(area.y),
    Math.round(area.width),
    Math.round(area.height),
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('That crop could not be saved. Give it another try?'));
      },
      preset.png ? 'image/png' : 'image/jpeg',
      preset.png ? undefined : 0.9,
    );
  });
}

