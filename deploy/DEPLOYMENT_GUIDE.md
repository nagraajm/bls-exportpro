# BLS ExportPro Production Deployment Guide

Complete guide for deploying BLS ExportPro to Hetzner server with subdomain blsexport.nmdevai.com

## 📋 Overview

This guide will help you:
- Create subdomain `blsexport.nmdevai.com` on GoDaddy
- Deploy BLS ExportPro to your Hetzner server
- Configure Nginx, SSL, and process management
- Monitor and maintain your production application

**Server Configuration:**
- Frontend: https://blsexport.nmdevai.com (served by Nginx)
- Backend API: https://blsexport.nmdevai.com/api (port 6543)
- SSL: Automatic Let's Encrypt certificate
- Process Manager: PM2 for backend service

---

## 🌐 Step 1: Create Subdomain in GoDaddy

### A. Login to GoDaddy Account
1. Go to https://godaddy.com
2. Sign in with your credentials
3. Navigate to "My Products" → "All Products & Services"

### B. Access DNS Management
1. Find your domain `nmdevai.com`
2. Click "DNS" button next to the domain
3. You'll see the DNS Management page

### C. Add Subdomain Record
1. Click "Add Record" button
2. Select record type: **A Record**
3. Fill in the details:
   - **Host**: `blsexport`
   - **Points to**: `[Your Hetzner Server IP]`
   - **TTL**: `600` (10 minutes)
4. Click "Save"

### D. Verify DNS Propagation
Wait 5-10 minutes, then test:
```bash
# On your local machine
nslookup blsexport.nmdevai.com
# Should return your server IP
```

---

## 📁 Step 2: Prepare Deployment Files

All necessary files are already created in the `/deploy` directory:
- `server-setup.sh` - Initial server configuration
- `nginx-config.conf` - Nginx reverse proxy setup
- `pm2-ecosystem.config.js` - Process management
- `production.env` - Production environment variables
- `deploy-final.sh` - Final deployment automation

---

## 🍎 Step 3: Mac Deployment (Using FileZilla)

### A. Install FileZilla
1. Download from https://filezilla-project.org/
2. Install and open FileZilla

### B. Connect to Your Server
1. **Host**: Your Hetzner server IP
2. **Username**: `root`
3. **Password**: Leave blank
4. **Port**: `22`
5. **Protocol**: `SFTP - SSH File Transfer Protocol`
6. **Key file**: Browse to your Hetzner private key file
7. Click "Quickconnect"

### C. Upload Deployment Files
1. **Local side**: Navigate to `bls-exportpro/deploy` folder
2. **Remote side**: Navigate to `/tmp` folder
3. Select and drag these files to server:
   - `server-setup.sh`
   - `nginx-config.conf`
   - `pm2-ecosystem.config.js`
   - `production.env`
   - `deploy-final.sh`

### D. Execute Deployment
Open Terminal and connect to your server:
```bash
# Connect to server
ssh -i /path/to/your/key.pem root@your-server-ip

# Make scripts executable
chmod +x /tmp/server-setup.sh /tmp/deploy-final.sh

# Run initial setup (takes 5-10 minutes)
/tmp/server-setup.sh

# Run final deployment
/tmp/deploy-final.sh
```

---

## 🖥️ Step 4: Windows Deployment (Using SCP)

### A. Prerequisites
- **SSH Client**: PuTTY or PowerShell
- **File Transfer**: WinSCP or Command Prompt with SCP
- **SSH Key**: Your Hetzner private key file

### B. Connect to Server
**Using PowerShell:**
```powershell
ssh -i "C:\path\to\your\hetzner-key.pem" root@your-server-ip
```

**Using PuTTY:**
1. Open PuTTY
2. Enter server IP in "Host Name"
3. Go to Connection → SSH → Auth → Credentials
4. Browse and select your private key (.ppk format)
5. Click "Open"

### C. Transfer Files

**Using WinSCP:**
1. Download and install WinSCP
2. Create new connection:
   - Protocol: SFTP
   - Host name: your-server-ip
   - User name: root
   - Private key: Browse to your .ppk key file
3. Connect to server
4. Local: Navigate to `C:\path\to\bls-exportpro\deploy`
5. Remote: Navigate to `/tmp`
6. Drag and drop all deployment files

**Using Command Prompt:**
```cmd
cd C:\path\to\bls-exportpro\deploy

scp -i "C:\path\to\your\hetzner-key.pem" server-setup.sh root@your-server-ip:/tmp/
scp -i "C:\path\to\your\hetzner-key.pem" nginx-config.conf root@your-server-ip:/tmp/
scp -i "C:\path\to\your\hetzner-key.pem" pm2-ecosystem.config.js root@your-server-ip:/tmp/
scp -i "C:\path\to\your\hetzner-key.pem" production.env root@your-server-ip:/tmp/
scp -i "C:\path\to\your\hetzner-key.pem" deploy-final.sh root@your-server-ip:/tmp/
```

### D. Execute Deployment
```bash
# Make scripts executable
chmod +x /tmp/server-setup.sh /tmp/deploy-final.sh

# Run initial setup
/tmp/server-setup.sh

# Run final deployment
/tmp/deploy-final.sh
```

---

## 🔧 Step 5: What the Deployment Does

### Initial Setup (`server-setup.sh`)
- Updates system packages
- Installs Node.js, npm, Nginx, PM2, Certbot
- Clones your repository from GitHub
- Builds backend and frontend applications
- Creates production environment configuration
- Seeds database with sample data
- Sets proper file permissions

### Final Deployment (`deploy-final.sh`)
- Configures PM2 process management
- Sets up Nginx reverse proxy
- Starts backend application
- Installs SSL certificate (Let's Encrypt)
- Configures firewall rules
- Performs health checks

---

## ✅ Step 6: Verification

### A. Check Application Status
```bash
# Check PM2 processes
pm2 status

# Check Nginx status
systemctl status nginx

# Check application logs
pm2 logs bls-export-backend

# Test API health
curl https://blsexport.nmdevai.com/health
```

### B. Access Your Application
- **Frontend**: https://blsexport.nmdevai.com
- **Backend API**: https://blsexport.nmdevai.com/api
- **Health Check**: https://blsexport.nmdevai.com/health

---

## 🔍 Step 7: Monitoring & Maintenance

### Application Monitoring
```bash
# Real-time monitoring dashboard
pm2 monit

# View application logs
pm2 logs bls-export-backend --lines 50

# Restart application
pm2 restart bls-export-backend

# Reload application (zero downtime)
pm2 reload bls-export-backend
```

### System Health Checks
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check system load
htop

# Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### SSL Certificate Management
```bash
# Check certificate status
certbot certificates

# Renew certificates (automatic via cron)
certbot renew --dry-run

# Manual certificate renewal
certbot renew
```

---

## 🚨 Troubleshooting

### Common Issues

**1. Application Not Accessible**
```bash
# Check if services are running
pm2 status
systemctl status nginx

# Check firewall
ufw status

# Test local connectivity
curl http://localhost:6543/health
```

**2. SSL Certificate Issues**
```bash
# Check certificate status
certbot certificates

# Manually request certificate
certbot --nginx -d blsexport.nmdevai.com
```

**3. Database Issues**
```bash
# Check database file
ls -la /var/www/blsexport/backend/data/

# Re-seed database if needed
cd /var/www/blsexport/backend
npm run seed
```

**4. Build Failures**
```bash
# Check build logs
cd /var/www/blsexport/backend
npm run build

cd /var/www/blsexport/frontend  
npm run build
```

### Performance Optimization

**PM2 Configuration**
```bash
# Update PM2 with more instances
pm2 scale bls-export-backend 2

# Set up PM2 log rotation
pm2 install pm2-logrotate
```

**Nginx Optimization**
```bash
# Test Nginx configuration
nginx -t

# Reload Nginx configuration
systemctl reload nginx
```

---

## 🔄 Step 8: Updates & Redeployment

### Code Updates
```bash
# Connect to server
ssh -i /path/to/your/key.pem root@your-server-ip

# Navigate to application directory
cd /var/www/blsexport

# Pull latest changes
git pull origin main

# Rebuild backend
cd backend
npm install --production
npm run build

# Rebuild frontend
cd ../frontend
npm install
npm run build

# Restart application
pm2 restart bls-export-backend
```

### Database Updates
```bash
# If database schema changes
cd /var/www/blsexport/backend
npm run seed
```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- **Weekly**: Check application logs and performance
- **Monthly**: Review SSL certificates and system updates
- **Quarterly**: Database cleanup and optimization

### Key Log Locations
- **Application**: `/var/log/pm2/bls-export-backend.log`
- **Nginx Access**: `/var/log/nginx/access.log`
- **Nginx Error**: `/var/log/nginx/error.log`
- **System**: `/var/log/syslog`

### Emergency Contacts
- **Server Provider**: Hetzner Support
- **Domain Provider**: GoDaddy Support
- **SSL Provider**: Let's Encrypt (automatic)

---

## 🎉 Deployment Complete!

Your BLS ExportPro application is now:
- ✅ Accessible at https://blsexport.nmdevai.com
- ✅ SSL secured with automatic renewal
- ✅ Process managed with PM2
- ✅ Load balanced with Nginx
- ✅ Monitored and logged

**Next Steps:**
1. Test all application features
2. Set up regular backups
3. Configure monitoring alerts
4. Train team on maintenance procedures

---

*Generated for BLS ExportPro - Pharmaceutical Export Management System*
*Last Updated: January 2025*