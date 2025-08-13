#!/bin/bash

# Debug script to check server status

echo "🔍 Checking server status..."
echo ""

echo "1️⃣ Checking if Nginx is running:"
systemctl status nginx | head -n 5
echo ""

echo "2️⃣ Checking Nginx sites enabled:"
ls -la /etc/nginx/sites-enabled/
echo ""

echo "3️⃣ Checking if application directory exists:"
ls -la /var/www/
echo ""

echo "4️⃣ Checking if PM2 is installed:"
which pm2 || echo "PM2 not installed"
echo ""

echo "5️⃣ Checking Node.js version:"
node --version || echo "Node.js not installed"
echo ""

echo "6️⃣ Checking running processes on port 5001:"
netstat -tlnp | grep 5001 || echo "Nothing running on port 5001"
echo ""

echo "7️⃣ Checking PM2 processes:"
pm2 list || echo "PM2 not running or not installed"
echo ""

echo "8️⃣ Checking Nginx error log (last 10 lines):"
tail -n 10 /var/log/nginx/error.log
echo ""

echo "9️⃣ Checking default Nginx config:"
cat /etc/nginx/sites-enabled/default 2>/dev/null || echo "No default site"