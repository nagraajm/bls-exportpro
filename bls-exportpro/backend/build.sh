#!/bin/bash

# Production build script for BLS ExportPro Backend

echo "🚀 Starting production build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data
mkdir -p logs
mkdir -p uploads

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 data
chmod 755 logs
chmod 755 uploads

# Initialize database if needed
echo "🗄️ Initializing database..."
npm run seed

echo "✅ Build completed successfully!"
echo "🎯 Ready for deployment!"
