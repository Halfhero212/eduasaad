import * as esbuild from 'esbuild';

// Build main server entry point with vite completely external
await esbuild.build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  packages: 'external',
  // Keep vite-related imports external - never bundle them
  external: ['vite', './vite.js', '../vite.config', '../vite.config.ts'],
  banner: {
    js: `// Production build: Vite is external and dynamically imported only in dev
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`,
  },
});

// Build vite module separately (for development mode only)
await esbuild.build({
  entryPoints: ['server/vite.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/vite.js',
  packages: 'external',
  // Keep vite and its config external even in the dev bundle
  external: ['vite', '../vite.config', '../vite.config.ts'],
});

console.log('✅ esbuild finished: vite externals applied');
