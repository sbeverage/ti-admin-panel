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

await esbuild.build({
  entryPoints: ['scripts/cropHarness/ui/main.tsx'],
  bundle: true,
  outfile: 'scripts/cropHarness/ui/bundle.js',
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: [stubStorage],
  logLevel: 'info',
});
