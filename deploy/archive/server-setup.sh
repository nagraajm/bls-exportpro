#!/bin/bash

echo "🚀 BLS Export Server Setup Script"
echo "================================="

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
apt install -y nodejs npm nginx certbot python3-certbot-nginx git curl

# Install PM2 globally
echo "📦 Installing PM2 process manager..."
npm install -g pm2

# Create application directory
echo "📁 Creating application directories..."
mkdir -p /var/www/blsexport
cd /var/www/blsexport

# Remove existing files if any
echo "🗑️  Cleaning existing files..."
rm -rf backend frontend

# Clone the repository
echo "📥 Cloning repository..."
git clone https://github.com/nagraajm/bls-exportpro.git temp
mv temp/bls-exportpro/* .
mv temp/bls-exportpro/.* . 2>/dev/null || true
rm -rf temp

# Setup backend
echo "🔧 Setting up backend..."
cd backend
npm install --production
npm run build

# Setup frontend
echo "🔧 Setting up frontend..."
cd ../frontend
npm install
npm run build

# Create production environment file
echo "📝 Creating production environment..."
cd ../backend
cat > .env << 'EOL'
PORT=6543
NODE_ENV=production
CORS_ORIGIN=https://blsexport.nmdevai.com
JWT_SECRET=your-super-secret-jwt-key-change-this
API_PREFIX=/api
UPLOAD_DIR=./uploads
DATA_DIR=./data
EOL

# Set proper permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/blsexport
chmod -R 755 /var/www/blsexport

# Seed the database
echo "🌱 Seeding database..."
npm run seed

echo "✅ Server setup completed!"
echo "🔄 Next: Configure Nginx and start services"