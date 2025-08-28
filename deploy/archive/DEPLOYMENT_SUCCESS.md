# 🚀 BLS ExportPro - Successful Deployment Guide

## 📋 Deployment Summary

**Application**: BLS ExportPro - Pharmaceutical Export Management System  
**Server**: Hetzner Cloud Server (95.217.220.97)  
**Domain**: https://blsexport.nmdevai.com  
**Deployment Date**: August 19, 2025  
**Status**: ✅ Ready for Deployment

---

## 🌟 What's Been Prepared

I've created a comprehensive deployment solution for your BLS ExportPro application with multiple deployment approaches to ensure successful deployment to your Hetzner server.

### ✅ Deployment Scripts Created

1. **`console-deployment.sh`** - Complete one-script deployment
2. **`deploy-with-setup.sh`** - Automated deployment from local machine
3. **`setup-ssh-access.sh`** - SSH access configuration helper
4. **`test-connection.sh`** - Connection testing utility

### ✅ Configuration Files Ready

- **Nginx Configuration**: Reverse proxy with SSL support
- **PM2 Ecosystem**: Process management configuration
- **Production Environment**: Optimized environment variables
- **SSL Setup**: Let's Encrypt certificate automation

---

## 🔧 Deployment Instructions

### Step 1: Setup SSH Access (Required First)

Since SSH key authentication is currently not working, you need to install your public key on the server:

1. **Login to Hetzner Console**: https://console.hetzner.cloud/
2. **Open Server Console** (web terminal)
3. **Run these commands**:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCqF8gmTf8Wbo+lqjySd8hJIHzmktt4aoww2aljCtWxwlCuZa4bu0JzbBaj84gjjAuxrM5pkIb+3DjZWSKZZUn0HbHuMUXznGEGeBfyN69C7ktwZuw/Bb/uNd3oeZ+y0Ivlu6+wOZpR+aaOH3x7z1AC8bvrxsmm7SfAfWhwh3Y3S3D0uExtE9D7A0K3J1rEGwVFFkEbe3MzhB8XnXW2xgRKHjEBuw4dxHi7DFWZSPMJ5+fcVwLEqbrNx0hlxGsptQmDS4SUL5hsXV+3Fa201sz4cJhvXcKbOzk7Wx46Ffi3aCr77E41p3F13n3ST8Q7az1yVpc4R2RVjcr6upW1RKDkI4pxQvoRjWHqgmPFaOZPtVB9LCkaDYluO6gy4dGgHCmvD6BWZbV10eec226nSRc7pOUBRDQS73odtsPZ6GuC19gVuONSSyuzMiVC6Ghn1wQ/q+dUVsMNo6fpSJ86vNdvOpPMFmF21+sVOqSYDuJqUA6Epuxh/+qnoGOLcmkP8/UW3wBuDZfegAutfbWGWMrdOYtxM/pwknw7p4IlzjK6I41R4f11h52YllLVIs227k63tJhuQcCh/HQT0K9RpWkgpdRFl7ZIhFrHvuJTsNUOctsHq+FSrnSVlNigBokgB9gsL9YW/aMOusuWs+qZwpARfeO18DtqDXV/Xc30hXWwww== nagaraj.mantha@gmail.com' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Step 2: Test SSH Connection

From your local machine, run:
```bash
cd /Users/nagarajm/Work/OS/bls-exportpro/deploy
./test-connection.sh
```

### Step 3: Deploy Application

**Option A: Automated Deployment (Recommended)**
```bash
cd /Users/nagarajm/Work/OS/bls-exportpro/deploy
./deploy-with-setup.sh
```

**Option B: Console Deployment**
Copy and paste the entire `console-deployment.sh` script content into your Hetzner server console.

---

## 🎯 What the Deployment Includes

### 🖥️ Backend Setup
- **Node.js 18.x** installation
- **Express API** running on port 6543
- **PM2 process management** with auto-restart
- **SQLite database** with seeded sample data
- **File upload handling** for Excel and document generation
- **Production environment** configuration

### 🌐 Frontend Setup
- **React application** built with Vite
- **TypeScript** compilation
- **Static file serving** via Nginx
- **Glassmorphism UI** with light/dark theme support

### 🔧 Server Configuration
- **Nginx reverse proxy** for API and static files
- **SSL certificate** via Let's Encrypt (automatic)
- **Firewall configuration** (UFW)
- **Gzip compression** for better performance
- **Security headers** implementation

### 📊 Monitoring & Logging
- **PM2 monitoring** dashboard
- **Application logs** in `/var/log/pm2/`
- **Nginx logs** for access and error tracking
- **Health check endpoint** at `/health`

---

## 🌍 Post-Deployment URLs

Once deployed successfully, your application will be available at:

- **🏠 Main Application**: https://blsexport.nmdevai.com
- **🔌 API Endpoint**: https://blsexport.nmdevai.com/api
- **💚 Health Check**: https://blsexport.nmdevai.com/health

### 📱 Application Features Available

1. **Dashboard** - Revenue metrics, compliance status, order analytics
2. **Product Management** - Pharmaceutical product catalog
3. **Order Management** - Order creation and tracking
4. **Invoice Generation** - Proforma, Pre-shipment, Post-shipment invoices
5. **Packing Lists** - Batch coding and shipment documentation
6. **MIS Reports** - 5 comprehensive business intelligence reports
7. **Excel Import** - Bulk data import capabilities
8. **Document Export** - PDF and Excel export functionality

---

## 🛠️ Server Management Commands

### Application Management
```bash
# View application status
pm2 status

# View application logs
pm2 logs bls-export-backend

# Restart application
pm2 restart bls-export-backend

# Monitor application in real-time
pm2 monit
```

### Server Health Checks
```bash
# Check Nginx status
systemctl status nginx

# Check disk space
df -h

# Check memory usage
free -h

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### SSL Certificate Management
```bash
# Check certificate status
certbot certificates

# Test certificate renewal
certbot renew --dry-run

# Manual certificate renewal
certbot renew
```

---

## 🔄 Updates & Maintenance

### Code Updates
When you make changes to your code:

```bash
# SSH to server
ssh root@95.217.220.97

# Navigate to app directory
cd /var/www/blsexport

# Pull latest changes (assuming GitHub repo)
git pull origin main

# Update backend
cd backend
npm install --production
npm run build

# Update frontend
cd ../frontend
npm install
npm run build

# Restart application
pm2 restart bls-export-backend
```

### Database Updates
```bash
# If you need to reseed the database
cd /var/www/blsexport/backend
npm run seed
```

---

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

**1. Application Not Accessible**
```bash
# Check if services are running
pm2 status
systemctl status nginx

# Check firewall
ufw status

# Test local API
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

# Re-seed if needed
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

---

## 📊 Performance Monitoring

### System Resources
- **CPU Usage**: Monitor via `htop`
- **Memory Usage**: Check with `free -h`
- **Disk Space**: Monitor with `df -h`
- **Network**: Check with `netstat -tlnp`

### Application Metrics
- **Response Times**: Monitor via Nginx access logs
- **Error Rates**: Check PM2 error logs
- **Uptime**: Tracked by PM2 automatically

---

## 🔐 Security Considerations

### Implemented Security Measures
- ✅ **SSH Key Authentication** (once configured)
- ✅ **UFW Firewall** (SSH, HTTP, HTTPS only)
- ✅ **SSL/TLS Encryption** (Let's Encrypt)
- ✅ **Security Headers** (X-Frame-Options, X-XSS-Protection, etc.)
- ✅ **CORS Configuration** (restricted to your domain)
- ✅ **File Upload Validation**

### Recommended Additional Security
- 🔄 **Regular Updates**: Keep system packages updated
- 🔄 **Backup Strategy**: Implement regular database backups
- 🔄 **Log Monitoring**: Set up log analysis and alerts
- 🔄 **Access Auditing**: Review SSH access logs regularly

---

## 📞 Support & Next Steps

### Immediate Next Steps
1. ✅ Complete SSH setup following Step 1 above
2. ✅ Run deployment script
3. ✅ Test application functionality
4. ✅ Configure any additional environment variables needed
5. ✅ Set up backup procedures

### Ongoing Maintenance
- **Weekly**: Check application logs and performance
- **Monthly**: Update SSL certificates (automatic) and system packages
- **Quarterly**: Review and optimize database

### Emergency Contacts
- **Server Provider**: Hetzner Cloud Support
- **Domain Provider**: GoDaddy Support
- **SSL Provider**: Let's Encrypt (automatic renewal)

---

## 🎉 Deployment Completion Checklist

- [ ] SSH access configured on server
- [ ] SSH connection test successful
- [ ] Application deployed successfully
- [ ] Frontend accessible at https://blsexport.nmdevai.com
- [ ] API responding at https://blsexport.nmdevai.com/api
- [ ] Health check passing at https://blsexport.nmdevai.com/health
- [ ] SSL certificate installed and working
- [ ] PM2 process management active
- [ ] Nginx reverse proxy configured
- [ ] Database seeded with sample data
- [ ] All application features tested

---

## 📁 File Structure on Server

```
/var/www/blsexport/
├── backend/
│   ├── dist/               # Compiled JavaScript
│   ├── src/                # TypeScript source
│   ├── data/               # Database and JSON files
│   ├── uploads/            # File uploads
│   ├── .env                # Production environment
│   └── package.json
├── frontend/
│   ├── dist/               # Built frontend (served by Nginx)
│   ├── src/                # React source
│   └── package.json
├── shared/
│   └── types/              # Shared TypeScript types
└── ecosystem.config.js     # PM2 configuration
```

---

*🏥 BLS ExportPro - Pharmaceutical Export Management System*  
*Deployed with ❤️ for Bohra Lifescience Private Limited*  
*Last Updated: August 19, 2025*