/**
 * Mounts the real BeneficiaryProfile, with the API and storage stubbed, so the
 * cropper is exercised in exactly the tree it runs in inside the panel.
 *
 * Earlier versions mounted ImageCropUpload on its own (proving the geometry),
 * then inside the overlay markup (proving the stacking). Neither caught a
 * problem reported as "the window opens but the image will not move", so this
 * goes the whole way and renders the actual parent component.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';
import '../../../src/index.css';
import '../../../src/components/Settings.css';
import '../../../src/components/Donors.css';
import BeneficiaryProfile from '../../../src/components/BeneficiaryProfile';

/**
 * @param w,h source dimensions. Defaults are small; pass 6000x4000 to stand in
 * for a phone or DSLR photo, which is what exposed the cropper locking up.
 */
function makeTestFile(w = 1200, h = 600): Promise<File> {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#DB8633'); g.addColorStop(1, '#4CA1AF');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(h * 0.15)}px sans-serif`;
  ctx.fillText('THRIVE', w * 0.35, h * 0.55);
  return new Promise((res) =>
    c.toBlob((b) => res(new File([b!], 'test.png', { type: 'image/png' })), 'image/png'),
  );
}

createRoot(document.getElementById('root')!).render(
  <BeneficiaryProfile
    beneficiaryId={32 as any}
    beneficiaryData={{ id: 32, name: 'Harness Test Charity' } as any}
    onClose={() => {}}
    onUpdate={() => {}}
  />,
);
(window as any).__makeTestFile = makeTestFile;
