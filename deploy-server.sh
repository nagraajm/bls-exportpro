#!/bin/bash

# BLS Export Server Deployment Script
set -e

SERVER_IP="157.180.18.119"
SSH_KEY="/Users/nagarajm/Work/OS/bls-exportpro/deploy/ssh_files/nagaraj-m1"
SSH_PASSPHRASE="hetznerbls"

echo "🚀 Starting BLS Export Server Deployment..."

# Function to run SSH commands with automatic passphrase handling
run_ssh_command() {
    local command=$1
    echo "📡 Executing on server: $command"
    
    expect -c "
        spawn ssh -i $SSH_KEY root@$SERVER_IP \"$command\"
        expect {
            \"Enter passphrase\" {
                send \"$SSH_PASSPHRASE\r\"
                exp_continue
            }
            \"Are you sure you want to continue connecting\" {
                send \"yes\r\"
                exp_continue
            }
            eof
        }
    "
}

# Function to copy files to server
copy_to_server() {
    local src=$1
    local dest=$2
    echo "📁 Copying $src to server:$dest"
    
    expect -c "
        spawn scp -i $SSH_KEY -r $src root@$SERVER_IP:$dest
        expect {
            \"Enter passphrase\" {
                send \"$SSH_PASSPHRASE\r\"
                exp_continue
            }
            \"Are you sure you want to continue connecting\" {
                send \"yes\r\"
                exp_continue
            }
            eof
        }
    "
}

echo "✅ 1. Testing server connection..."
run_ssh_command "echo 'Connection successful'; pwd; whoami"

echo "✅ 2. Pulling latest changes from main branch..."
run_ssh_command "cd /var/www/blsexport && git status && git fetch origin && git checkout main && git pull origin main"

echo "✅ 3. Installing TypeScript dependencies..."
run_ssh_command "cd /var/www/blsexport/backend && npm install --save-dev @types/express @types/cors @types/morgan @types/compression @types/helmet @types/bcryptjs @types/jsonwebtoken @types/multer @types/sqlite3 @types/pdfkit"

echo "✅ 4. Building backend and copying templates..."
run_ssh_command "cd /var/www/blsexport/backend && npm run build && cp -r src/templates dist/"

echo "✅ 5. Creating missing data files..."
run_ssh_command "cd /var/www/blsexport && mkdir -p data && echo '[]' > data/product-pricing.json"

echo "✅ 6. Seeding database with new data..."
run_ssh_command "cd /var/www/blsexport/backend && npm run seed"

echo "✅ 7. Building frontend for production..."
run_ssh_command "cd /var/www/blsexport/frontend && npm install && npx vite build --mode production"

echo "✅ 8. Restarting PM2 processes..."
run_ssh_command "pm2 restart bls-export-backend"

echo "✅ 9. Testing deployed application..."
sleep 5
run_ssh_command "curl -s http://localhost:5001/health | jq ."
run_ssh_command "curl -s http://localhost:5001/api/brand-registrations | jq length"

echo "🎉 Deployment completed successfully!"
echo "🌍 Application available at: https://blsexport.nmdevai.com"