#!/bin/bash

# Simple SSH connection test script

echo "🔐 Testing SSH Connection to Hetzner Server"
echo "==========================================="
echo ""

SERVER_IP="157.180.18.119"

# Setup SSH agent
echo "Setting up SSH agent..."
eval "$(ssh-agent -s)" >/dev/null 2>&1

# Add SSH key with passphrase
echo "Adding SSH key to agent..."
expect -c "
spawn ssh-add /Users/nagarajm/Work/OS/bls-exportpro/deploy/ssh_files/nagaraj-m1
expect \"Enter passphrase\"
send \"hetznerbls\r\"
expect eof
" >/dev/null 2>&1

# Test connection
echo "Testing SSH connection to $SERVER_IP..."
if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@$SERVER_IP "echo 'SSH connection successful! Server is ready for deployment.'" 2>/dev/null; then
    echo "✅ SSH connection successful!"
    echo "✅ Server is ready for deployment!"
    echo ""
    echo "You can now run the deployment script:"
    echo "./deploy-with-setup.sh"
else
    echo "❌ SSH connection failed!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Login to Hetzner Console: https://console.hetzner.cloud/"
    echo "2. Open your server console"
    echo "3. Run these commands:"
    echo ""
    echo "   mkdir -p ~/.ssh"
    echo "   chmod 700 ~/.ssh"
    echo "   echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCqF8gmTf8Wbo+lqjySd8hJIHzmktt4aoww2aljCtWxwlCuZa4bu0JzbBaj84gjjAuxrM5pkIb+3DjZWSKZZUn0HbHuMUXznGEGeBfyN69C7ktwZuw/Bb/uNd3oeZ+y0Ivlu6+wOZpR+aaOH3x7z1AC8bvrxsmm7SfAfWhwh3Y3S3D0uExtE9D7A0K3J1rEGwVFFkEbe3MzhB8XnXW2xgRKHjEBuw4dxHi7DFWZSPMJ5+fcVwLEqbrNx0hlxGsptQmDS4SUL5hsXV+3Fa201sz4cJhvXcKbOzk7Wx46Ffi3aCr77E41p3F13n3ST8Q7az1yVpc4R2RVjcr6upW1RKDkI4pxQvoRjWHqgmPFaOZPtVB9LCkaDYluO6gy4dGgHCmvD6BWZbV10eec226nSRc7pOUBRDQS73odtsPZ6GuC19gVuONSSyuzMiVC6Ghn1wQ/q+dUVsMNo6fpSJ86vNdvOpPMFmF21+sVOqSYDuJqUA6Epuxh/+qnoGOLcmkP8/UW3wBuDZfegAutfbWGWMrdOYtxM/pwknw7p4IlzjK6I41R4f11h52YllLVIs227k63tJhuQcCh/HQT0K9RpWkgpdRFl7ZIhFrHvuJTsNUOctsHq+FSrnSVlNigBokgB9gsL9YW/aMOusuWs+qZwpARfeO18DtqDXV/Xc30hXWwww== nagaraj.mantha@gmail.com' >> ~/.ssh/authorized_keys"
    echo "   chmod 600 ~/.ssh/authorized_keys"
    echo ""
    echo "4. Then run this script again to test the connection"
fi