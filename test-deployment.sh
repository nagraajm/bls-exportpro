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

echo "🔧 Fixing git ownership and pulling latest changes..."
run_ssh_command "cd /var/www/blsexport && git config --global --add safe.directory /var/www/blsexport && git status"
run_ssh_command "cd /var/www/blsexport && git fetch origin && git checkout main && git pull origin main"

echo "🧪 Testing application endpoints..."
run_ssh_command "curl -s http://localhost:5001/health"
run_ssh_command "curl -s http://localhost:5001/api/brand-registrations"
run_ssh_command "curl -s http://localhost:5001/api/export-config/ports"
run_ssh_command "curl -s http://localhost:5001/api/products"

echo "🌍 Testing public URL..."
curl -s https://blsexport.nmdevai.com/health
curl -s https://blsexport.nmdevai.com/api/brand-registrations

echo "✅ Testing completed!"