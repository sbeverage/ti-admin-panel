#!/bin/bash
set -e

echo "🔧 Starting build process..."

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "✅ Dependencies installed"

echo "🔍 Checking react-scripts..."
if [ -f "node_modules/.bin/react-scripts" ]; then
  echo "✅ react-scripts found at node_modules/.bin/react-scripts"
else
  echo "❌ react-scripts NOT found - reinstalling..."
  npm install react-scripts@5.0.1 --legacy-peer-deps
fi

echo "🏗️ Building application..."
node node_modules/.bin/react-scripts build

echo "✅ Build complete!"






















