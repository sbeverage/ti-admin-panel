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

It mounts them inside the real `.beneficiary-profile-overlay` wrappers with the
panel's actual stylesheets loaded, because `BeneficiaryProfile` is a hand-rolled
`position: fixed` overlay rather than an antd Modal, while the cropper is an
antd Modal portalled to `document.body`. The two stack against each other at the
same z-index, and a bare mount cannot see that at all. The first version of this
harness mounted the component with no stylesheets, which proved the geometry and
nothing about the environment.

Needs esbuild on hand (`npm install --no-save esbuild`); it is not a dependency
of the app.

    node scripts/cropHarness/ui/build.mjs

Serve either with the `crop-harness` config in `.claude/launch.json`
(http://localhost:4399, `/ui/` for the component page). Opening the files
directly over `file://` will not work: the scripts need an http origin.
