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

echo "🔧 Force updating server with latest changes..."
run_ssh_command "cd /var/www/blsexport && git reset --hard HEAD && git clean -fd"
run_ssh_command "cd /var/www/blsexport && git fetch origin && git reset --hard origin/main"

echo "🔨 Rebuilding application..."
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && npm install --save-dev @types/express @types/cors @types/morgan @types/compression @types/helmet @types/bcryptjs @types/jsonwebtoken @types/multer @types/sqlite3 @types/pdfkit"
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && npm run build"
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && cp -r src/templates dist/ 2>/dev/null || true"

echo "📦 Copying new data files..."
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && mkdir -p data"
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && ls -la data/"
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && npm run seed"

echo "🔄 Restarting PM2..."
run_ssh_command "pm2 restart bls-export-backend"
run_ssh_command "pm2 logs bls-export-backend --lines 20"

echo "🧪 Testing endpoints..."
run_ssh_command "sleep 3 && curl -s http://localhost:5001/health"
run_ssh_command "curl -s http://localhost:5001/api/brand-registrations"

echo "✅ Force update completed!"