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
  external: ['vite', './vite.js', './vite.config.js'],
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
  // Keep vite external, but bundle the config
  external: ['vite', './vite.config.js'],
});

// Transpile vite.config.ts to vite.config.js (for runtime import)
await esbuild.build({
  entryPoints: ['vite.config.ts'],
  bundle: false,
  platform: 'node',
  format: 'esm',
  outfile: 'vite.config.js',
  packages: 'external',
});

console.log('✅ esbuild finished: vite externals applied');
