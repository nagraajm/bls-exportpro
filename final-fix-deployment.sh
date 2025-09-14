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

echo "🔍 Checking directory structure..."
run_ssh_command "ls -la /var/www/blsexport/bls-exportpro/"
run_ssh_command "ls -la /var/www/blsexport/bls-exportpro/backend/"

echo "🔨 Rebuilding backend..."
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && pwd && ls -la"
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && npm run build"
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && ls -la dist/"

echo "📂 Creating data directory with all files..."
run_ssh_command "mkdir -p /var/www/blsexport/data && cp -r /var/www/blsexport/bls-exportpro/backend/data/* /var/www/blsexport/data/ 2>/dev/null || true"
run_ssh_command "echo '[]' > /var/www/blsexport/data/product-pricing.json"

echo "🚀 Starting PM2 with correct path..."
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && pm2 start dist/index.js --name bls-export-backend --env production"

echo "📋 PM2 status..."
run_ssh_command "pm2 list"

echo "🧪 Final testing..."
run_ssh_command "sleep 5 && curl -s http://localhost:5001/health"
run_ssh_command "curl -s http://localhost:5001/api/brand-registrations"

echo "🌍 Testing public endpoints..."
echo "Health check:"
curl -s https://blsexport.nmdevai.com/health
echo
echo "Brand registrations:"
curl -s https://blsexport.nmdevai.com/api/brand-registrations
echo
echo "Export config ports:"
curl -s https://blsexport.nmdevai.com/api/export-config/ports

echo "✅ Final deployment test completed!"