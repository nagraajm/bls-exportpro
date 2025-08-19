#!/bin/bash

echo "🚀 Final BLS Export Deployment Script"
echo "====================================="

# Navigate to app directory
cd /var/www/blsexport

# Copy PM2 config
echo "📝 Setting up PM2 configuration..."
cp /tmp/pm2-ecosystem.config.js ./pm2.config.js

# Setup Nginx configuration
echo "🌐 Configuring Nginx..."
cp /tmp/nginx-config.conf /etc/nginx/sites-available/blsexport.nmdevai.com
ln -sf /etc/nginx/sites-available/blsexport.nmdevai.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Start backend with PM2
echo "🔄 Starting backend application..."
cd backend
pm2 delete bls-export-backend 2>/dev/null || true
pm2 start ../pm2.config.js
pm2 save
pm2 startup

# Setup SSL certificate
echo "🔒 Setting up SSL certificate..."
certbot --nginx -d blsexport.nmdevai.com --non-interactive --agree-tos --email nagaraj.mantha@gmail.com

# Enable firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Final status check
echo "🔍 Checking application status..."
pm2 status
systemctl status nginx

echo ""
echo "✅ Deployment completed!"
echo "🌍 Your application should be available at: https://blsexport.nmdevai.com"
echo "🔧 Backend API: https://blsexport.nmdevai.com/api"
echo "💓 Health check: https://blsexport.nmdevai.com/health"
echo ""
echo "📊 To monitor the application:"
echo "   pm2 logs bls-export-backend"
echo "   pm2 monit"