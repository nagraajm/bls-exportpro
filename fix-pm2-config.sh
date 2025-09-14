#!/bin/bash

SERVER_IP="157.180.18.119"
SSH_KEY="/Users/nagarajm/Work/OS/bls-exportpro/deploy/ssh_files/nagaraj-m1"
SSH_PASSPHRASE="hetznerbls"

run_ssh_command() {
    local command=$1
    echo "📡 $command"
    
    expect -c "
        spawn ssh -i $SSH_KEY root@$SERVER_IP \"$command\"
        expect {
            \"Enter passphrase\" {
                send \"$SSH_PASSPHRASE\r\"
                exp_continue
            }
            eof
        }
    "
}

echo "🔧 Checking and fixing PM2 configuration..."
run_ssh_command "pm2 show bls-export-backend"

echo "🔨 Fixing PM2 directory and config..."
run_ssh_command "pm2 delete bls-export-backend"

echo "📁 Creating data directory at correct path..."
run_ssh_command "mkdir -p /var/www/blsexport/data && echo '[]' > /var/www/blsexport/data/product-pricing.json"

echo "🚀 Starting PM2 with correct configuration..."
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && pm2 start dist/index.js --name bls-export-backend --env production"

echo "📊 Checking PM2 status..."
run_ssh_command "pm2 list"

echo "🧪 Testing endpoints with correct port..."
run_ssh_command "sleep 3 && curl -s http://localhost:5001/health"
run_ssh_command "curl -s http://localhost:5001/api/brand-registrations"

echo "✅ PM2 configuration fixed!"