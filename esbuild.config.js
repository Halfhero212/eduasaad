import * as esbuild from 'esbuild';

// Build main server entry point with vite module marked as external
await esbuild.build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  packages: 'external',
  // Mark vite module as external so it's not bundled into index.js
  external: ['./vite.js'],
});

// Build vite module separately (for development mode dynamic imports)
await esbuild.build({
  entryPoints: ['server/vite.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/vite.js',
  packages: 'external',
});

console.log('✅ Backend bundled successfully');
