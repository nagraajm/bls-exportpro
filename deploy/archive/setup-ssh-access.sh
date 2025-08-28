#!/bin/bash

# BLS ExportPro - SSH Access Setup Script
# This script helps set up SSH access to your Hetzner server

echo "🔐 BLS ExportPro - SSH Access Setup"
echo "================================="
echo ""

SERVER_IP="95.217.220.97"
DOMAIN="blsexport.nmdevai.com"
SSH_KEY_PATH="/Users/nagarajm/Work/OS/bls-exportpro/deploy/ssh_files/nagaraj-m1"
PUB_KEY_PATH="/Users/nagarajm/Work/OS/bls-exportpro/deploy/ssh_files/nagaraj-m1.pub"

echo "Server IP: $SERVER_IP"
echo "Domain: $DOMAIN"
echo "SSH Key: $SSH_KEY_PATH"
echo ""

# Function to test SSH connection
test_ssh_connection() {
    echo "🔄 Testing SSH connection..."
    if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@$SERVER_IP "echo 'SSH connection successful'" 2>/dev/null; then
        echo "✅ SSH connection successful!"
        return 0
    else
        echo "❌ SSH connection failed"
        return 1
    fi
}

# Function to add SSH key to agent
setup_ssh_agent() {
    echo "🔑 Setting up SSH agent..."
    
    # Start ssh-agent if not running
    if [ -z "$SSH_AUTH_SOCK" ]; then
        eval "$(ssh-agent -s)"
    fi
    
    # Add key with passphrase
    expect -c "
        spawn ssh-add $SSH_KEY_PATH
        expect \"Enter passphrase\"
        send \"hetznerbls\r\"
        expect eof
    " 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ SSH key added to agent"
    else
        echo "❌ Failed to add SSH key to agent"
        return 1
    fi
}

# Function to copy SSH key to server (requires password)
copy_ssh_key_to_server() {
    echo "📋 Copying SSH key to server..."
    echo "You'll need to enter your server root password when prompted."
    echo ""
    
    # Create .ssh directory on server
    ssh-copy-id -i $PUB_KEY_PATH root@$SERVER_IP
    
    if [ $? -eq 0 ]; then
        echo "✅ SSH key copied to server successfully"
        return 0
    else
        echo "❌ Failed to copy SSH key to server"
        return 1
    fi
}

# Function to manually install SSH key
manual_ssh_key_setup() {
    echo "📝 Manual SSH Key Setup Instructions"
    echo "===================================="
    echo ""
    echo "If automated setup fails, follow these steps:"
    echo ""
    echo "1. Login to your Hetzner server console (web interface)"
    echo "2. Open a terminal/console session"
    echo "3. Run the following commands:"
    echo ""
    echo "   mkdir -p ~/.ssh"
    echo "   chmod 700 ~/.ssh"
    echo "   echo '$(cat $PUB_KEY_PATH)' >> ~/.ssh/authorized_keys"
    echo "   chmod 600 ~/.ssh/authorized_keys"
    echo ""
    echo "4. Test SSH connection from your local machine"
    echo ""
    echo "Your public key content:"
    echo "========================"
    cat $PUB_KEY_PATH
    echo ""
    echo "========================"
}

# Main execution
echo "Starting SSH setup process..."
echo ""

# Setup SSH agent
setup_ssh_agent

# Test current connection
if test_ssh_connection; then
    echo "🎉 SSH is already working! Proceeding with deployment..."
    exit 0
fi

echo ""
echo "SSH connection failed. Attempting to set up SSH key access..."
echo ""

# Try to copy SSH key using password
echo "Option 1: Automatic SSH key installation"
echo "========================================="
echo "This will attempt to copy your SSH key to the server."
echo "You'll need your server root password."
echo ""
read -p "Do you have the root password and want to try automatic setup? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if copy_ssh_key_to_server; then
        echo ""
        echo "Testing connection after key installation..."
        if test_ssh_connection; then
            echo "🎉 SSH setup successful! You can now proceed with deployment."
            exit 0
        fi
    fi
fi

echo ""
echo "Option 2: Manual SSH key installation"
echo "====================================="
manual_ssh_key_setup

echo ""
echo "After setting up SSH access manually, run this script again to test the connection."
echo "Once SSH is working, you can proceed with the deployment using deploy-final.sh"