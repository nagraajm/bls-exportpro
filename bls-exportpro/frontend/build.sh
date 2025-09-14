#!/bin/bash

# Production build script for BLS ExportPro Frontend

echo "🚀 Starting frontend production build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Create _redirects file for SPA routing
echo "📝 Creating SPA redirects..."
cat > dist/_redirects << EOF
/*    /index.html   200
EOF

echo "✅ Frontend build completed successfully!"
echo "🎯 Ready for deployment!"
