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

echo "🔍 Checking actual build structure..."
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && find dist -name '*.js' | head -10"
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && ls -la dist/backend/src/"

echo "🚀 Starting PM2 with correct built file path..."
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && pm2 start dist/backend/src/index.js --name bls-export-backend --env production"

echo "📋 PM2 status..."
run_ssh_command "pm2 list"
run_ssh_command "pm2 logs bls-export-backend --lines 10"

echo "🧪 Testing endpoints..."
run_ssh_command "sleep 5 && curl -s http://localhost:5001/health"
run_ssh_command "curl -s http://localhost:5001/api/brand-registrations"

echo "✅ Final deployment completed!"