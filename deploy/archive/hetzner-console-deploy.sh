#!/bin/bash

# BLS ExportPro - Hetzner Console Deployment Script
# Copy and paste this entire script into your Hetzner server console

set -e  # Exit on any error

echo "🚀 BLS ExportPro - Hetzner Console Deployment"
echo "=============================================="
echo "Starting deployment at $(date)"
echo ""

# Configuration
DOMAIN="blsexport.nmdevai.com"
REPO_URL="https://github.com/nagraajm/bls-exportpro.git"
APP_DIR="/var/www/blsexport"
BACKEND_PORT="6543"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "This script must be run as root"
    echo "Run: sudo bash this-script.sh"
    exit 1
fi

log "🔐 Setting up SSH key access..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCqF8gmTf8Wbo+lqjySd8hJIHzmktt4aoww2aljCtWxwlCuZa4bu0JzbBaj84gjjAuxrM5pkIb+3DjZWSKZZUn0HbHuMUXznGEGeBfyN69C7ktwZuw/Bb/uNd3oeZ+y0Ivlu6+wOZpR+aaOH3x7z1AC8bvrxsmm7SfAfWhwh3Y3S3D0uExtE9D7A0K3J1rEGwVFFkEbe3MzhB8XnXW2xgRKHjEBuw4dxHi7DFWZSPMJ5+fcVwLEqbrNx0hlxGsptQmDS4SUL5hsXV+3Fa201sz4cJhvXcKbOzk7Wx46Ffi3aCr77E41p3F13n3ST8Q7az1yVpc4R2RVjcr6upW1RKDkI4pxQvoRjWHqgmPFaOZPtVB9LCkaDYluO6gy4dGgHCmvD6BWZbV10eec226nSRc7pOUBRDQS73odtsPZ6GuC19gVuONSSyuzMiVC6Ghn1wQ/q+dUVsMNo6fpSJ86vNdvOpPMFmF21+sVOqSYDuJqUA6Epuxh/+qnoGOLcmkP8/UW3wBuDZfegAutfbWGWMrdOYtxM/pwknw7p4IlzjK6I41R4f11h52YllLVIs227k63tJhuQcCh/HQT0K9RpWkgpdRFl7ZIhFrHvuJTsNUOctsHq+FSrnSVlNigBokgB9gsL9YW/aMOusuWs+qZwpARfeO18DtqDXV/Xc30hXWwww== nagaraj.mantha@gmail.com' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
log "✅ SSH key access configured"

log "📦 Updating system packages..."
apt update && apt upgrade -y
log "✅ System updated"

log "🔧 Installing dependencies..."
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install other dependencies
apt-get install -y nginx git curl certbot python3-certbot-nginx ufw build-essential

# Install PM2 globally
npm install -g pm2
log "✅ Dependencies installed"

log "📥 Cloning repository..."
# Remove existing directory if it exists
rm -rf $APP_DIR

# Clone repository
git clone $REPO_URL $APP_DIR
cd $APP_DIR
log "✅ Repository cloned"

log "🔨 Setting up backend..."
cd $APP_DIR/backend

# Install dependencies
npm install --production

# Create production environment file
cat > .env << 'EOF'
PORT=6543
NODE_ENV=production
CORS_ORIGIN=https://blsexport.nmdevai.com
JWT_SECRET=BLS-ExportPro-Super-Secret-Key-2025-Change-This
API_PREFIX=/api
UPLOAD_DIR=./uploads
DATA_DIR=./data
CURRENCY_API_KEY=your-api-key
DB_FILE=./data/pharma.db
EOF

# Build backend
npm run build

# Create data directories
mkdir -p data uploads/excel uploads/invoices uploads/packing-lists uploads/purchase-orders uploads/temp

# Seed database
npm run seed
log "✅ Backend setup completed"

log "🎨 Setting up frontend..."
cd $APP_DIR/frontend
npm install
npm run build
log "✅ Frontend setup completed"

log "⚙️ Configuring PM2..."
cd $APP_DIR

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bls-export-backend',
    script: './backend/dist/index.js',
    cwd: '/var/www/blsexport',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 6543
    },
    error_file: '/var/log/pm2/bls-export-backend-error.log',
    out_file: '/var/log/pm2/bls-export-backend-out.log',
    log_file: '/var/log/pm2/bls-export-backend.log',
    time: true,
    autorestart: true,
    max_restarts: 5,
    restart_delay: 1000
  }]
};
EOF

# Create PM2 log directory
mkdir -p /var/log/pm2

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
log "✅ PM2 configured and application started"

log "🌐 Configuring Nginx..."
# Create Nginx configuration
cat > /etc/nginx/sites-available/blsexport << 'EOF'
server {
    listen 80;
    server_name blsexport.nmdevai.com;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;
    
    # Gzip compression
    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # API proxy
    location /api {
        proxy_pass http://localhost:6543;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:6543/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files (frontend)
    location / {
        root /var/www/blsexport/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # File uploads
    client_max_body_size 50M;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/blsexport /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx
log "✅ Nginx configured"

log "🔒 Setting up SSL certificate..."
# Setup firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Get SSL certificate
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@nmdevai.com --redirect

# Setup automatic renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
log "✅ SSL certificate configured"

log "🔍 Performing health checks..."
# Check PM2 status
echo "PM2 Status:"
pm2 status

# Check Nginx status
echo ""
echo "Nginx Status:"
systemctl status nginx --no-pager -l

# Test local API
echo ""
echo "Testing local API..."
sleep 5
if curl -s http://localhost:6543/health > /dev/null; then
    log "✅ Backend health check passed"
else
    error "❌ Backend health check failed"
fi

# Test domain
echo ""
echo "Testing domain..."
if curl -s http://$DOMAIN > /dev/null; then
    log "✅ Domain health check passed"
else
    warning "⚠️ Domain health check failed (may be DNS propagation delay)"
fi

echo ""
echo "🎉 Deployment Completed Successfully!"
echo "====================================="
echo ""
echo "✅ Application URL: https://$DOMAIN"
echo "✅ API Endpoint: https://$DOMAIN/api"
echo "✅ Health Check: https://$DOMAIN/health"
echo ""
echo "📊 Current Status:"
echo "🔧 PM2 Processes:"
pm2 list
echo ""
echo "🌐 Nginx Status:"
systemctl is-active nginx
echo ""
echo "🔒 SSL Certificate:"
certbot certificates 2>/dev/null | grep -A 2 '$DOMAIN' || echo 'Certificate setup completed'
echo ""
echo "📋 Useful Commands:"
echo "- View logs: pm2 logs bls-export-backend"
echo "- Restart app: pm2 restart bls-export-backend"
echo "- Check Nginx: systemctl status nginx"
echo "- Renew SSL: certbot renew"
echo ""
echo "🔧 File Locations:"
echo "- App Directory: $APP_DIR"
echo "- Nginx Config: /etc/nginx/sites-available/blsexport"
echo "- PM2 Config: $APP_DIR/ecosystem.config.js"
echo "- Logs: /var/log/pm2/"
echo ""
echo "🔗 Your BLS ExportPro application is now live!"
echo "Visit: https://$DOMAIN"
echo ""
echo "Deployment completed at $(date)"