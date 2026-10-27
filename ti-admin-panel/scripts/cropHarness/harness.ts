/**
 * Exercises the real exportCrop against a synthetic image with known landmarks.
 *
 * The test image is a 1200x600 grid of nine coloured cells. Cropping a known
 * rectangle therefore has a known answer: ask for the middle cell and the
 * output must be uniformly that cell's colour. A crop that is offset, mirrored,
 * or scaled wrong produces a different colour or a seam, which a human eyeing
 * a photo in the admin panel would never catch.
 */
import { exportCrop, IMAGE_PRESETS } from '../../src/utils/imageCrop';

const CELLS = [
  ['#e6194b', '#3cb44b', '#ffe119'],
  ['#4363d8', '#f58231', '#911eb4'],
  ['#46f0f0', '#f032e6', '#bcf60c'],
];
const W = 1200, H = 600, CW = W / 3, CH = H / 3;

function makeSource(): string {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 3; col++) {
      ctx.fillStyle = CELLS[r][col];
      ctx.fillRect(col * CW, r * CH, CW, CH);
    }
  }
  return c.toDataURL('image/png');
}

async function pixelsOf(blob: Blob) {
  const bmp = await createImageBitmap(blob);
  const c = document.createElement('canvas');
  c.width = bmp.width; c.height = bmp.height;
  c.getContext('2d')!.drawImage(bmp, 0, 0);
  return { ctx: c.getContext('2d')!, w: bmp.width, h: bmp.height };
}

const hex = (d: Uint8ClampedArray, i: number) =>
  '#' + [d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');

/**
 * Compare colours with tolerance, because the cover and highlight presets
 * export JPEG. Exact-hex comparison reported a correct crop as a failure over
 * a one-per-channel difference (#e5194a against #e6194b). 12 is far below the
 * distance between any two cells in the test grid, so a genuinely wrong crop
 * still fails loudly.
 */
const near = (a: string, b: string, tol = 12) => {
  const parse = (h: string) =>
    [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [parse(a), parse(b)];
  return x.every((v, i) => Math.abs(v - y[i]) <= tol);
};

type Result = { name: string; pass: boolean; detail: string };

async function run(): Promise<Result[]> {
  const src = makeSource();
  const out: Result[] = [];

  // 1. Output dimensions must be exactly the preset's target.
  for (const role of ['logo', 'cover', 'highlight'] as const) {
    const p = IMAGE_PRESETS[role];
    const blob = await exportCrop(src, { x: 0, y: 0, width: 600, height: 600 / p.aspect }, p);
    const { w, h } = await pixelsOf(blob);
    out.push({
      name: `${role}: output is ${p.outWidth}x${p.outHeight}`,
      pass: w === p.outWidth && h === p.outHeight,
      detail: `got ${w}x${h}`,
    });
  }

  // 2. Cropping the exact centre cell must yield only that colour.
  {
    const p = IMAGE_PRESETS.highlight;
    const blob = await exportCrop(src, { x: CW, y: CH, width: CW, height: CH }, p);
    const { ctx, w, h } = await pixelsOf(blob);
    const probes = [
      [4, 4], [w >> 1, h >> 1], [w - 5, h - 5], [4, h - 5], [w - 5, 4],
    ];
    const seen = probes.map(([x, y]) => hex(ctx.getImageData(x, y, 1, 1).data, 0));
    const want = CELLS[1][1];
    out.push({
      name: 'highlight: centre cell crop is uniformly that cell',
      pass: seen.every((c) => near(c, want)),
      detail: `want ${want}, corners+centre saw ${[...new Set(seen)].join(', ')}`,
    });
  }

  // 3. Orientation: crop the top-left cell and confirm it is not flipped.
  {
    const p = IMAGE_PRESETS.highlight;
    const blob = await exportCrop(src, { x: 0, y: 0, width: CW, height: CH }, p);
    const { ctx, w, h } = await pixelsOf(blob);
    const c = hex(ctx.getImageData(w >> 1, h >> 1, 1, 1).data, 0);
    out.push({
      name: 'highlight: top-left crop returns the top-left cell',
      pass: near(c, CELLS[0][0]),
      detail: `want ${CELLS[0][0]}, got ${c}`,
    });
  }

  // 4. A 2:1 cover crop spanning the top row must show all three top colours
  //    left to right, in order.
  {
    const p = IMAGE_PRESETS.cover;
    const blob = await exportCrop(src, { x: 0, y: 0, width: W, height: W / 2 }, p);
    const { ctx, w, h } = await pixelsOf(blob);
    const y = Math.round(h * 0.15);
    const got = [0.16, 0.5, 0.84].map((f) =>
      hex(ctx.getImageData(Math.round(w * f), y, 1, 1).data, 0),
    );
    out.push({
      name: 'cover: 2:1 crop keeps left-to-right order',
      pass: got.every((c, i) => near(c, CELLS[0][i])),
      detail: `want ${CELLS[0].join(', ')}; got ${got.join(', ')}`,
    });
  }

  // 5. JPEG presets must be opaque (a transparent source would go black
  //    without the white fill).
  {
    const c = document.createElement('canvas');
    c.width = 400; c.height = 400;
    const transparent = c.toDataURL('image/png');
    const blob = await exportCrop(transparent, { x: 0, y: 0, width: 400, height: 400 }, IMAGE_PRESETS.highlight);
    const { ctx } = await pixelsOf(blob);
    const d = ctx.getImageData(10, 10, 1, 1).data;
    out.push({
      name: 'highlight: transparent source fills white, not black',
      pass: d[0] > 240 && d[1] > 240 && d[2] > 240,
      detail: `got rgb(${d[0]}, ${d[1]}, ${d[2]})`,
    });
  }

  return out;
}

run().then((results) => {
  const el = document.getElementById('out')!;
  el.innerHTML = results
    .map((r) => `<div class="${r.pass ? 'p' : 'f'}">${r.pass ? 'PASS' : 'FAIL'} — ${r.name}<br><small>${r.detail}</small></div>`)
    .join('');
  const failed = results.filter((r) => !r.pass).length;
  document.getElementById('summary')!.textContent =
    failed === 0 ? `All ${results.length} checks passed` : `${failed} of ${results.length} FAILED`;
  document.getElementById('summary')!.className = failed === 0 ? 'p' : 'f';
}).catch((e) => {
  document.getElementById('summary')!.textContent = 'Harness threw: ' + e.message;
  document.getElementById('summary')!.className = 'f';
});
