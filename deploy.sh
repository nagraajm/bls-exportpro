#!/bin/bash

# BLS ExportPro Render Deployment Script
echo "🚀 BLS ExportPro - Render Deployment Script"
echo "=============================================="

# Check if git is configured
if ! git config --global user.name > /dev/null 2>&1; then
    echo "❌ Git not configured. Please run:"
    echo "   git config --global user.name 'Your Name'"
    echo "   git config --global user.email 'your.email@example.com'"
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found. Please ensure it exists in the root directory."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please initialize git:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

echo "✅ Pre-deployment checks passed!"
echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Deploy to Render'"
echo "   git push origin main"
echo ""
echo "2. Go to Render Dashboard: https://dashboard.render.com"
echo "3. Click 'New +' → 'Blueprint'"
echo "4. Connect your GitHub repository"
echo "5. Render will detect render.yaml automatically"
echo "6. Click 'Apply' to deploy"
echo ""
echo "🎯 Your services will be deployed as:"
echo "   - Backend: bls-exportpro-backend"
echo "   - Frontend: bls-exportpro-frontend"
echo "   - Redis: bls-exportpro-redis (optional)"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "🔧 Environment Variables to set in Render:"
echo "   Backend:"
echo "   - NODE_ENV=production"
echo "   - JWT_SECRET=your-secret-key"
echo "   - CORS_ORIGIN=https://your-frontend-url.onrender.com"
echo ""
echo "   Frontend:"
echo "   - VITE_API_BASE_URL=https://your-backend-url.onrender.com/api"
echo ""
echo "✅ Ready for deployment!"