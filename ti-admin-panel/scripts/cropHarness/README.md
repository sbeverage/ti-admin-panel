# Crop harness

Two throwaway pages for checking `src/utils/imageCrop.ts` and
`src/components/ImageCropUpload.tsx` without logging into the panel or writing
to the real bucket. Neither ships; the bundles are gitignored.

A wrong crop produces a plausible-looking image, so eyeballing a photo in the
admin UI does not tell you the geometry is right. That is what these are for.

## Geometry (`harness.ts`)

Crops a 3x3 grid of known colours and asserts the output is the cell that was
asked for, at the preset's exact pixel size, the right way up, with transparent
sources filled white rather than black. Colours compare with tolerance because
two presets export JPEG.

    npx esbuild scripts/cropHarness/harness.ts --bundle \
      --outfile=scripts/cropHarness/bundle.js --format=iife

## Component (`ui/`)

Mounts the real `ImageCropUpload` for all three roles with the storage service
swapped for a stub that records what it was handed.

    node scripts/cropHarness/ui/build.mjs

Serve either with the `crop-harness` config in `.claude/launch.json`
(http://localhost:4399, `/ui/` for the component page). Opening the files
directly over `file://` will not work: the scripts need an http origin.
