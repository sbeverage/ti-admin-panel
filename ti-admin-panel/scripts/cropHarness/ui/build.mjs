import * as esbuild from 'esbuild';
import path from 'node:path';

const root = process.cwd();

/** Swap the storage service for the stub, so no credentials or network. */
const stubStorage = {
  name: 'stub-storage',
  setup(build) {
    build.onResolve({ filter: /services\/supabaseStorage$/ }, () => ({
      path: path.join(root, 'scripts/cropHarness/ui/stubStorage.ts'),
    }));
  },
};

/** Swap the API service too, so the real parent component can mount. */
const stubApi = {
  name: 'stub-api',
  setup(build) {
    build.onResolve({ filter: /services\/api$/ }, () => ({
      path: path.join(root, 'scripts/cropHarness/ui/stubApi.ts'),
    }));
  },
};

await esbuild.build({
  entryPoints: ['scripts/cropHarness/ui/main.tsx'],
  bundle: true,
  outfile: 'scripts/cropHarness/ui/bundle.js',
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [stubStorage, stubApi],
  loader: { '.css': 'css', '.png': 'dataurl', '.svg': 'dataurl' },
  logLevel: 'info',
});
