import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  packages: 'external',
  // Mark vite and vite.config as external so they're not bundled
  // This allows dynamic imports to work properly
  external: ['vite', '../vite.config', '../vite.config.ts'],
  // Keep dynamic imports as dynamic (don't bundle them)
  splitting: false,
  banner: {
    js: `// Production build - vite is only loaded via dynamic import in development
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`
  }
});

console.log('✅ Backend bundled successfully');
