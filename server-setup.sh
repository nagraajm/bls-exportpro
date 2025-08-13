#!/bin/bash

# BLS ExportPro Server Setup Script
# Run this script on your server as root

set -e  # Exit on error

echo "🚀 Starting BLS ExportPro deployment..."

# Update system
echo "📦 Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Install required packages
echo "📦 Installing Git, Nginx, and build tools..."
apt-get install -y git nginx build-essential

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Create web directory
echo "📁 Setting up application directory..."
mkdir -p /var/www
cd /var/www

# Clone repository
if [ -d "bls-exportpro" ]; then
    echo "📥 Repository already exists, pulling latest changes..."
    cd bls-exportpro
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/nagraajm/bls-exportpro.git
    cd bls-exportpro
fi

# Setup Backend
echo "🔧 Setting up backend..."
cd bls-exportpro/backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Build backend
echo "🔨 Building backend..."
npm run build

# Setup environment
echo "⚙️ Configuring environment..."
cat > .env << EOL
PORT=5001
NODE_ENV=production
CORS_ORIGIN=http://95.217.220.97,https://95.217.220.97
JWT_SECRET=$(openssl rand -base64 32)
API_PREFIX=/api
UPLOAD_DIR=./uploads
DATA_DIR=./data
CURRENCY_API_KEY=your-api-key
EOL

# Create upload directories
mkdir -p uploads/excel uploads/invoices uploads/packing-lists uploads/purchase-orders uploads/temp

# Setup Frontend
echo "🔧 Setting up frontend..."
cd ../frontend

# Update API URL for both HTTP and HTTPS
echo "⚙️ Updating frontend configuration..."
cat > src/services/api.ts << 'EOL'
import axios from 'axios';

const protocol = window.location.protocol;
const host = window.location.hostname;
const API_BASE_URL = `${protocol}//${host}:5001/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
EOL

# Install and build frontend
echo "📦 Installing frontend dependencies..."
npm install

echo "🔨 Building frontend..."
npm run build

# Start backend with PM2
echo "🚀 Starting backend with PM2..."
cd ../backend
pm2 stop bls-backend 2>/dev/null || true
pm2 delete bls-backend 2>/dev/null || true
pm2 start dist/index.js --name bls-backend
pm2 save
pm2 startup systemd -u root --hp /root

# Configure Nginx
echo "⚙️ Configuring Nginx..."
cat > /etc/nginx/sites-available/bls-exportpro << 'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name 95.217.220.97;

    # Frontend
    location / {
        root /var/www/bls-exportpro/bls-exportpro/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
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
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5001/health;
    }

    # Static uploads
    location /uploads {
        alias /var/www/bls-exportpro/bls-exportpro/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

# Enable site and remove default
ln -sf /etc/nginx/sites-available/bls-exportpro /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
echo "🔧 Testing Nginx configuration..."
nginx -t
systemctl reload nginx

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5001/tcp
echo "y" | ufw enable

# Seed initial data
echo "🌱 Seeding initial data..."
cd /var/www/bls-exportpro/bls-exportpro/backend
npm run seed || echo "Seeding skipped or failed"

# Install Certbot for SSL
echo "🔒 Installing Certbot for SSL..."
apt-get install -y snapd
snap install core
snap refresh core
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

echo "✅ Deployment complete!"
echo ""
echo "📱 Your application is now available at:"
echo "   http://95.217.220.97"
echo ""
echo "🔐 To enable HTTPS (after pointing a domain), run:"
echo "   certbot --nginx -d yourdomain.com"
echo ""
echo "📊 Check status:"
echo "   PM2 Status: pm2 status"
echo "   PM2 Logs: pm2 logs bls-backend"
echo "   Nginx Status: systemctl status nginx"
echo ""
echo "🔑 Default login:"
echo "   Email: admin@blspharma.com"
echo "   Password: admin123"