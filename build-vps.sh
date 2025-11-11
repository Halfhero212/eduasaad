#!/bin/bash
set -e

echo "🏗️  Building Abraj Platform for VPS deployment..."

# Build frontend
echo "📦 Building frontend..."
npx vite build

# Build backend (keeps vite.config external for runtime import)
echo "📦 Building backend..."
node esbuild.config.js

# Transpile vite.config.ts to vite.config.js (for ESM runtime import)
echo "📦 Transpiling vite.config.ts..."
npx esbuild vite.config.ts --format=esm --platform=node --packages=external --outfile=vite.config.js

echo "✅ Build complete!"
echo ""
echo "Built files:"
echo "  - dist/public/ (frontend static files)"
echo "  - dist/index.js (backend main server, vite external)"
echo "  - dist/vite.js (dev-only module, imports ../vite.config at runtime)"
echo "  - vite.config.js (transpiled config for ESM import)"
echo ""
echo "Production mode: NODE_ENV=production node dist/index.js (vite never loaded)"
echo "Development mode: NODE_ENV=development node dist/index.js (requires vite + vite.config.js)"
