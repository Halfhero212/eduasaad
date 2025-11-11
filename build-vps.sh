#!/bin/bash
set -e

echo "🏗️  Building Abraj Platform for VPS deployment..."

# Build frontend
echo "📦 Building frontend..."
npx vite build

# Build backend (bundles vite.config into vite.js, keeps vite package external)
echo "📦 Building backend..."
node esbuild.config.js

echo "✅ Build complete!"
echo ""
echo "Built files:"
echo "  - dist/public/ (frontend static files)"
echo "  - dist/index.js (backend main server, vite external)"
echo "  - dist/vite.js (dev-only module with bundled vite.config, never loaded in production)"
echo ""
echo "Production mode: NODE_ENV=production node dist/index.js (vite never loaded)"
echo "Development mode: NODE_ENV=development node dist/index.js (requires vite in node_modules)"
