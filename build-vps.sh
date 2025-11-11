#!/bin/bash
set -e

echo "🏗️  Building Abraj Platform for VPS deployment..."

# Build frontend
echo "📦 Building frontend..."
npx vite build

# Build backend (transpiles both index.ts and vite.ts)
echo "📦 Building backend..."
node esbuild.config.js

echo "✅ Build complete!"
echo ""
echo "Built files:"
echo "  - dist/public/ (frontend static files)"
echo "  - dist/index.js (backend main server)"
echo "  - dist/vite.js (dev-only vite module, never loaded in production)"
echo ""
echo "Production mode: NODE_ENV=production node dist/index.js"
echo "Development mode: NODE_ENV=development node dist/index.js (requires vite in node_modules)"
