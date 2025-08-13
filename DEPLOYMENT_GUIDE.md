# BLS ExportPro Deployment Guide

## Server Details
- IP: 95.217.220.97
- Application URL: http://95.217.220.97
- API URL: http://95.217.220.97:5001/api

## Manual Deployment Steps

### 1. Connect to your server
```bash
ssh -i ~/nagaraj-mac-m1 root@95.217.220.97
```

If the above doesn't work, make sure your public key is added to the server:
```bash
# On your local machine, copy your public key:
cat ~/nagaraj-mac-m1.pub

# Then add it to the server's ~/.ssh/authorized_keys file
```

### 2. Once connected to the server, run these commands:

#### Install System Dependencies
```bash
# Update system
apt-get update -y
apt-get upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install Git, Nginx, and build tools
apt-get install -y git nginx build-essential

# Install PM2 globally
npm install -g pm2
```

#### Clone and Setup the Application
```bash
# Create application directory
mkdir -p /var/www
cd /var/www

# Clone the repository
git clone https://github.com/nagraajm/bls-exportpro.git
cd bls-exportpro
```

#### Setup Backend
```bash
# Navigate to backend
cd bls-exportpro/backend

# Install dependencies
npm install

# Build the backend
npm run build

# Create and configure .env file
cp .env.example .env
nano .env
```

Update the .env file with:
```
PORT=5001
NODE_ENV=production
CORS_ORIGIN=http://95.217.220.97
JWT_SECRET=your-secure-secret-key-here
API_PREFIX=/api
UPLOAD_DIR=./uploads
DATA_DIR=./data
CURRENCY_API_KEY=your-api-key
```

#### Setup Frontend
```bash
# Navigate to frontend
cd ../frontend

# Update the API URL in src/services/api.ts
sed -i "s|http://localhost:5001|http://95.217.220.97:5001|g" src/services/api.ts

# Install dependencies
npm install

# Build the frontend
npm run build
```

#### Start Backend with PM2
```bash
# Go back to backend directory
cd ../backend

# Start the backend
pm2 start dist/index.js --name bls-backend

# Save PM2 configuration
pm2 save
pm2 startup systemd -u root --hp /root
```

#### Configure Nginx
```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/bls-exportpro
```

Add this configuration:
```nginx
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

    # Upload files
    location /uploads {
        alias /var/www/bls-exportpro/bls-exportpro/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
# Enable the site
ln -s /etc/nginx/sites-available/bls-exportpro /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### Configure Firewall
```bash
# Allow necessary ports
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### 3. Seed Initial Data (Optional)
```bash
cd /var/www/bls-exportpro/bls-exportpro/backend
npm run seed
```

### 4. Check Services
```bash
# Check PM2 status
pm2 status

# Check Nginx status
systemctl status nginx

# View backend logs
pm2 logs bls-backend
```

## Access the Application

- Frontend: http://95.217.220.97
- Backend API: http://95.217.220.97:5001/api
- Health Check: http://95.217.220.97:5001/health

## Default Login Credentials
- Email: admin@blspharma.com
- Password: admin123

## Troubleshooting

### If backend fails to start:
```bash
# Check logs
pm2 logs bls-backend

# Restart backend
pm2 restart bls-backend
```

### If frontend shows connection errors:
1. Check if backend is running: `pm2 status`
2. Check Nginx configuration: `nginx -t`
3. Check firewall: `ufw status`

### To update the application:
```bash
cd /var/www/bls-exportpro
git pull origin main

# Rebuild backend
cd bls-exportpro/backend
npm install
npm run build
pm2 restart bls-backend

# Rebuild frontend
cd ../frontend
npm install
npm run build
```

## SSL Certificate (Optional)
To add HTTPS support:
```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```