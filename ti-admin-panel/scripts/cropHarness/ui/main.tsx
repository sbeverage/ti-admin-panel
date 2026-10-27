/**
 * Mounts the real ImageCropUpload inside the real BeneficiaryProfile overlay
 * markup, with the panel's actual stylesheets loaded.
 *
 * The first version of this harness mounted the component bare, which proved
 * the geometry but not the environment. BeneficiaryProfile is a hand-rolled
 * fixed overlay rather than an antd Modal, and the cropper is an antd Modal
 * portalled to document.body, so the two stack against each other. That
 * interaction is invisible to a bare mount.
 */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';
import '../../../src/index.css';
import '../../../src/components/BeneficiaryProfile.css';
import '../../../src/components/InviteDonorModal.css';
import ImageCropUpload from '../../../src/components/ImageCropUpload';
import type { ImageRole } from '../../../src/utils/imageCrop';

function makeTestFile(): Promise<File> {
  const c = document.createElement('canvas');
  c.width = 1200; c.height = 600;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 1200, 600);
  g.addColorStop(0, '#DB8633'); g.addColorStop(1, '#4CA1AF');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1200, 600);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 90px sans-serif';
  ctx.fillText('THRIVE', 420, 330);
  return new Promise((res) =>
    c.toBlob((b) => res(new File([b!], 'test.png', { type: 'image/png' })), 'image/png'),
  );
}

function App() {
  const [urls, setUrls] = useState<Record<string, string>>({});
  return (
    // The same two wrappers BeneficiaryProfile renders, so the cropper modal
    // has to stack above a position:fixed z-index:1000 overlay exactly as it
    // does in the panel.
    <div className="beneficiary-profile-overlay">
      <div className="beneficiary-profile-container">
        <div style={{ padding: 24, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {(['logo', 'highlight', 'cover'] as ImageRole[]).map((role) => (
            <div key={role} style={{ width: 260 }}>
              <h3>{role}</h3>
              <ImageCropUpload
                role={role}
                currentImageUrl={urls[role]}
                onImageChange={(u) => setUrls((p) => ({ ...p, [role]: u || '' }))}
              />
              <div data-saved={role} style={{ fontSize: 11, color: '#888', marginTop: 6 }}>
                {urls[role] ? 'saved' : 'empty'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
(window as any).__makeTestFile = makeTestFile;
