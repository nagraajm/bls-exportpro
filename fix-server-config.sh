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

echo "🔧 Fixing server configuration..."

echo "📊 Checking current .env configuration..."
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && cat .env"

echo "📝 Updating .env for production..."
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && cat > .env << 'EOF'
PORT=5001
NODE_ENV=production
CORS_ORIGIN=https://blsexport.nmdevai.com
JWT_SECRET=bls-export-production-jwt-secret-2025
API_PREFIX=/api
UPLOAD_DIR=./uploads
DATA_DIR=./data
EOF"

echo "🗄️ Setting up SQLite database..."
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && cp data/pharma.db ./pharma.db"
run_ssh_command "cd /var/www/blsexport/bls-exportpro/backend && ls -la pharma.db"

echo "🔄 Restarting PM2..."
run_ssh_command "pm2 restart bls-export-backend"
run_ssh_command "pm2 logs bls-export-backend --lines 15"

echo "🧪 Testing with correct port..."
run_ssh_command "sleep 5 && curl -s http://localhost:5001/health"
run_ssh_command "curl -s http://localhost:5001/api/brand-registrations"
run_ssh_command "curl -s http://localhost:5001/api/export-config/ports"

echo "🌐 Testing public endpoints..."
echo "Health check:"
curl -s https://blsexport.nmdevai.com/health | head -20
echo
echo "Brand registrations:"
curl -s https://blsexport.nmdevai.com/api/brand-registrations | head -20
echo
echo "Export config ports:"
curl -s https://blsexport.nmdevai.com/api/export-config/ports | head -20

echo "✅ Server configuration completed!"