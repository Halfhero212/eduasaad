#!/bin/bash
set -e

echo "🏗️  Building Abraj Platform for VPS deployment..."

# Build frontend
echo "📦 Building frontend..."
npx vite build

# Build backend (transpiles both index.ts and vite.ts)
echo "📦 Building backend..."
node esbuild.config.js

# Copy vite.config.ts for development mode (runtime import)
echo "📦 Copying vite config (dev-only)..."
cp vite.config.ts dist/

echo "✅ Build complete!"
echo ""
echo "Built files:"
echo "  - dist/public/ (frontend static files)"
echo "  - dist/index.js (backend main server)"
echo "  - dist/vite.js (dev-only module, loads vite.config.ts at runtime)"
echo "  - dist/vite.config.ts (dev-only config, never loaded in production)"
echo ""
echo "Production mode: NODE_ENV=production node dist/index.js"
echo "Development mode: NODE_ENV=development node dist/index.js (requires vite + deps in node_modules)"
