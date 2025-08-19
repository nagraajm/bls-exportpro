#!/bin/bash

# BLS ExportPro - Complete Deployment Script with SSH Setup
# This script handles SSH setup and complete deployment to Hetzner server

set -e  # Exit on any error

echo "🚀 BLS ExportPro - Complete Deployment"
echo "====================================="
echo ""

# Configuration
SERVER_IP="95.217.220.97"
DOMAIN="blsexport.nmdevai.com"
SSH_KEY_PATH="/Users/nagarajm/Work/OS/bls-exportpro/deploy/ssh_files/nagaraj-m1"
PUB_KEY_PATH="/Users/nagarajm/Work/OS/bls-exportpro/deploy/ssh_files/nagaraj-m1.pub"
DEPLOY_DIR="/tmp/bls-deployment"
REPO_URL="https://github.com/nagarajmantha/bls-exportpro.git"  # Update with your actual repo URL

echo "📋 Deployment Configuration"
echo "Server IP: $SERVER_IP"
echo "Domain: $DOMAIN"
echo "SSH Key: $SSH_KEY_PATH"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to test SSH connection
test_ssh_connection() {
    log "Testing SSH connection..."
    if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@$SERVER_IP "echo 'SSH connection successful'" &>/dev/null; then
        log "✅ SSH connection successful!"
        return 0
    else
        error "❌ SSH connection failed"
        return 1
    fi
}

# Function to setup SSH agent
setup_ssh_agent() {
    log "Setting up SSH agent..."
    
    # Start ssh-agent if not running
    if [ -z "$SSH_AUTH_SOCK" ]; then
        eval "$(ssh-agent -s)"
    fi
    
    # Add key with passphrase using expect
    if command -v expect &> /dev/null; then
        expect -c "
            spawn ssh-add $SSH_KEY_PATH
            expect \"Enter passphrase\"
            send \"hetznerbls\r\"
            expect eof
        " &>/dev/null
        
        if [ $? -eq 0 ]; then
            log "✅ SSH key added to agent"
            return 0
        fi
    fi
    
    error "❌ Failed to add SSH key to agent"
    return 1
}

# Function to copy files to server
copy_files_to_server() {
    log "Copying deployment files to server..."
    
    # Create deployment directory on server
    ssh root@$SERVER_IP "mkdir -p $DEPLOY_DIR" || {
        error "Failed to create deployment directory"
        return 1
    }
    
    # Copy all deployment files
    scp /Users/nagarajm/Work/OS/bls-exportpro/deploy/server-setup.sh root@$SERVER_IP:$DEPLOY_DIR/ || return 1
    scp /Users/nagarajm/Work/OS/bls-exportpro/deploy/nginx-config.conf root@$SERVER_IP:$DEPLOY_DIR/ || return 1
    scp /Users/nagarajm/Work/OS/bls-exportpro/deploy/pm2-ecosystem.config.js root@$SERVER_IP:$DEPLOY_DIR/ || return 1
    scp /Users/nagarajm/Work/OS/bls-exportpro/deploy/production.env root@$SERVER_IP:$DEPLOY_DIR/ || return 1
    scp /Users/nagarajm/Work/OS/bls-exportpro/deploy/deploy-final.sh root@$SERVER_IP:$DEPLOY_DIR/ || return 1
    
    log "✅ Files copied successfully"
    return 0
}

# Function to run server setup
run_server_setup() {
    log "Running server setup..."
    
    ssh root@$SERVER_IP "
        cd $DEPLOY_DIR
        chmod +x server-setup.sh deploy-final.sh
        ./server-setup.sh
    " || {
        error "Server setup failed"
        return 1
    }
    
    log "✅ Server setup completed"
    return 0
}

# Function to run final deployment
run_final_deployment() {
    log "Running final deployment..."
    
    ssh root@$SERVER_IP "
        cd $DEPLOY_DIR
        ./deploy-final.sh
    " || {
        error "Final deployment failed"
        return 1
    }
    
    log "✅ Final deployment completed"
    return 0
}

# Function to verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Test health endpoint
    if curl -s -f "https://$DOMAIN/health" &>/dev/null; then
        log "✅ Health check passed"
    else
        warning "Health check failed - checking HTTP"
        if curl -s -f "http://$DOMAIN/health" &>/dev/null; then
            warning "HTTP works but HTTPS doesn't - SSL setup may be pending"
        else
            error "❌ Health check failed"
            return 1
        fi
    fi
    
    # Check PM2 status
    ssh root@$SERVER_IP "pm2 status" || {
        error "PM2 status check failed"
        return 1
    }
    
    # Check Nginx status
    ssh root@$SERVER_IP "systemctl status nginx" || {
        error "Nginx status check failed"
        return 1
    }
    
    log "✅ Deployment verification completed"
    return 0
}

# Function to show deployment results
show_results() {
    echo ""
    echo "🎉 Deployment Results"
    echo "===================="
    echo ""
    echo "✅ Application URL: https://$DOMAIN"
    echo "✅ API Endpoint: https://$DOMAIN/api"
    echo "✅ Health Check: https://$DOMAIN/health"
    echo ""
    echo "📊 Server Status:"
    ssh root@$SERVER_IP "
        echo '🔧 PM2 Processes:'
        pm2 status
        echo ''
        echo '🌐 Nginx Status:'
        systemctl is-active nginx
        echo ''
        echo '🔒 SSL Certificate:'
        certbot certificates 2>/dev/null | grep -A 2 '$DOMAIN' || echo 'Certificate setup in progress...'
    "
    echo ""
    echo "📋 Useful Commands:"
    echo "- View logs: ssh root@$SERVER_IP 'pm2 logs bls-export-backend'"
    echo "- Restart app: ssh root@$SERVER_IP 'pm2 restart bls-export-backend'"
    echo "- Check Nginx: ssh root@$SERVER_IP 'systemctl status nginx'"
    echo ""
}

# Function to handle SSH setup issues
handle_ssh_issues() {
    error "SSH connection failed. Please ensure:"
    echo ""
    echo "1. Your SSH key is properly configured on the Hetzner server"
    echo "2. The server is accessible and running"
    echo "3. You have the correct server IP address"
    echo ""
    echo "To manually set up SSH access:"
    echo "1. Login to Hetzner Console (web interface)"
    echo "2. Run these commands in the server console:"
    echo ""
    echo "   mkdir -p ~/.ssh"
    echo "   chmod 700 ~/.ssh"
    echo "   cat >> ~/.ssh/authorized_keys << 'EOF'"
    cat $PUB_KEY_PATH
    echo "   EOF"
    echo "   chmod 600 ~/.ssh/authorized_keys"
    echo ""
    echo "Then run this script again."
    exit 1
}

# Main execution
main() {
    log "Starting deployment process..."
    
    # Check prerequisites
    if [ ! -f "$SSH_KEY_PATH" ]; then
        error "SSH key not found at $SSH_KEY_PATH"
        exit 1
    fi
    
    if [ ! -f "$PUB_KEY_PATH" ]; then
        error "SSH public key not found at $PUB_KEY_PATH"
        exit 1
    fi
    
    # Setup SSH agent
    setup_ssh_agent || {
        error "Failed to setup SSH agent"
        exit 1
    }
    
    # Test SSH connection
    if ! test_ssh_connection; then
        handle_ssh_issues
    fi
    
    # Copy files to server
    copy_files_to_server || {
        error "Failed to copy files to server"
        exit 1
    }
    
    # Run server setup
    run_server_setup || {
        error "Server setup failed"
        exit 1
    }
    
    # Run final deployment
    run_final_deployment || {
        error "Final deployment failed"
        exit 1
    }
    
    # Verify deployment
    verify_deployment || {
        warning "Deployment verification had issues"
    }
    
    # Show results
    show_results
    
    log "🎉 Deployment completed successfully!"
}

# Run main function
main "$@"