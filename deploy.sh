#!/bin/bash

# Deployment script for BLS ExportPro
# Server: 95.217.220.97

SERVER_IP="95.217.220.97"
SERVER_USER="root"  # Change this if you're using a different user
APP_DIR="/var/www/bls-exportpro"
REPO_URL="https://github.com/nagraajm/bls-exportpro.git"

echo "🚀 Starting deployment to $SERVER_IP..."

# Step 1: Connect to server and set up the application
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'

# Update system
echo "📦 Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install nginx
echo "📦 Installing Nginx..."
apt-get install -y nginx

# Install git
echo "📦 Installing Git..."
apt-get install -y git

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www
cd /var/www

# Clone or pull the repository
if [ -d "bls-exportpro" ]; then
    echo "📥 Updating existing repository..."
    cd bls-exportpro
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/nagraajm/bls-exportpro.git
    cd bls-exportpro
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd bls-exportpro/backend
npm install

# Build backend
echo "🔨 Building backend..."
npm run build

# Copy environment file
echo "⚙️ Setting up environment..."
cp .env.example .env
# Update the .env file with production settings
sed -i 's/PORT=5001/PORT=5001/g' .env
sed -i 's/NODE_ENV=development/NODE_ENV=production/g' .env
sed -i 's/CORS_ORIGIN=http:\/\/localhost:5173/CORS_ORIGIN=http:\/\/95.217.220.97/g' .env

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Update API URL in frontend
echo "⚙️ Updating frontend API configuration..."
sed -i "s|http://localhost:5001|http://95.217.220.97:5001|g" src/services/api.ts

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Set up PM2 for backend
echo "🚀 Starting backend with PM2..."
cd ../backend
pm2 delete bls-backend 2>/dev/null || true
pm2 start dist/index.js --name bls-backend

# Save PM2 configuration
pm2 save
pm2 startup systemd -u root --hp /root

# Configure Nginx
echo "⚙️ Configuring Nginx..."
cat > /etc/nginx/sites-available/bls-exportpro << 'EOF'
server {
    listen 80;
    server_name 95.217.220.97;

    # Frontend
    location / {
        root /var/www/bls-exportpro/bls-exportpro/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/bls-exportpro /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx

# Open firewall ports
echo "🔥 Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5001/tcp
ufw --force enable

echo "✅ Deployment complete!"
echo "📱 Frontend URL: http://95.217.220.97"
echo "🔌 Backend API: http://95.217.220.97:5001/api"
echo "💙 PM2 Status: pm2 status"

ENDSSH