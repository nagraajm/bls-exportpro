# BLS ExportPro - Render Deployment Guide

## 🚀 Quick Deployment

### Option 1: Blueprint Deployment (Recommended)
1. Fork this repository to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file
6. Click "Apply" to deploy all services

### Option 2: Manual Deployment

#### Backend Deployment
1. Create a new **Web Service** in Render
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `bls-exportpro-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd bls-exportpro/backend && npm install && npm run build`
   - **Start Command**: `cd bls-exportpro/backend && npm start`
   - **Root Directory**: `bls-exportpro/backend`

#### Frontend Deployment
1. Create a new **Static Site** in Render
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `bls-exportpro-frontend`
   - **Build Command**: `cd bls-exportpro/frontend && npm install && npm run build`
   - **Publish Directory**: `bls-exportpro/frontend/dist`
   - **Root Directory**: `bls-exportpro/frontend`

## 🔧 Environment Variables

### Backend Environment Variables
```bash
NODE_ENV=production
PORT=5001
API_PREFIX=/api
DATABASE_URL=sqlite:///data/database.sqlite
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### Frontend Environment Variables
```bash
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
VITE_APP_NAME=BLS ExportPro
```

## 📁 File Structure
```
bls-exportpro/
├── backend/
│   ├── src/
│   ├── package.json
│   ├── build.sh
│   └── dist/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── build.sh
│   └── dist/
├── render.yaml
└── DEPLOYMENT_GUIDE.md
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json
   - Verify TypeScript compilation

2. **Database Issues**
   - SQLite database is automatically created
   - Check file permissions for data directory
   - Ensure disk space is available

3. **CORS Errors**
   - Update CORS_ORIGIN in backend environment variables
   - Ensure frontend URL is correct

4. **API Connection Issues**
   - Verify VITE_API_BASE_URL in frontend
   - Check backend service is running
   - Ensure API_PREFIX is correctly set

### Debug Commands
```bash
# Check backend logs
render logs bls-exportpro-backend

# Check frontend logs
render logs bls-exportpro-frontend

# Restart services
render restart bls-exportpro-backend
render restart bls-exportpro-frontend
```

## 🔐 Security Considerations

1. **JWT Secret**: Generate a strong JWT secret
2. **CORS**: Configure CORS properly for production
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **HTTPS**: Render provides HTTPS by default

## 📊 Monitoring

- Use Render's built-in monitoring
- Check application logs regularly
- Monitor database performance
- Set up alerts for service failures

## 🔄 Updates

To update your deployment:
1. Push changes to your GitHub repository
2. Render will automatically rebuild and deploy
3. Monitor the deployment logs for any issues

## 📞 Support

If you encounter issues:
1. Check Render's documentation
2. Review application logs
3. Verify environment variables
4. Test locally before deploying

## 🎯 Post-Deployment Checklist

- [ ] Backend service is running
- [ ] Frontend is accessible
- [ ] API endpoints are working
- [ ] Database is initialized
- [ ] File uploads work
- [ ] Excel import/export functions
- [ ] Authentication works
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] SSL certificate is active