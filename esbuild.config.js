import * as esbuild from 'esbuild';

// Build main server entry point with vite completely external
await esbuild.build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  packages: 'external',
  // Mark './vite' as external (NOT './vite.js') to match the actual import path
  external: [
    'vite',
    './vite',
    '../vite.config',
    '../vite.config.ts',
    '../vite.config.js',
    'vite.config',
    'vite.config.ts',
    'vite.config.js'
  ],
  banner: {
    js: `// Production build: Vite is external and dynamically imported only in dev
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`,
  },
});

// Build vite module separately (for development mode only)
// Bundle vite.config INTO this file, only keep vite package external
await esbuild.build({
  entryPoints: ['server/vite.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/vite.js',
  packages: 'external',
  // Only keep vite package external, bundle vite.config code
  external: ['vite'],
});

console.log('✅ esbuild finished: vite externals applied');
