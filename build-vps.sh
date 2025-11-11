#!/bin/bash
set -e

echo "🏗️  Building Abraj Platform for VPS deployment..."

# Build frontend
echo "📦 Building frontend..."
npx vite build

# Build backend with proper externals
echo "📦 Building backend..."
node esbuild.config.js

echo "✅ Build complete!"
echo ""
echo "Built files:"
echo "  - dist/public/ (frontend)"
echo "  - dist/index.js (backend)"
echo ""
echo "To start the app:"
echo "  NODE_ENV=production node dist/index.js"
