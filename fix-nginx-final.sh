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
    " 2>/dev/null
}

echo "🔧 Fixing Nginx configuration properly..."

echo "📄 Checking current Nginx configuration..."
run_ssh_command "grep -n proxy_pass /etc/nginx/sites-available/default"

echo "📝 Fixing proxy_pass port configuration..."
run_ssh_command "sed -i 's/proxy_pass http:\/\/localhost:6543;/proxy_pass http:\/\/localhost:5001;/' /etc/nginx/sites-available/default"

echo "🔍 Verifying the change..."
run_ssh_command "grep -n proxy_pass /etc/nginx/sites-available/default"

echo "✅ Testing Nginx configuration..."
run_ssh_command "nginx -t"

echo "🔄 Reloading Nginx..."
run_ssh_command "systemctl reload nginx"

echo "🧪 Testing all endpoints without jq..."
echo
echo "1. Health Check:"
run_ssh_command "curl -s http://localhost:5001/health"

echo
echo "2. Brand registrations:"
run_ssh_command "curl -s http://localhost:5001/api/brand-registrations | head -100"

echo
echo "3. Export config - Ports:"
run_ssh_command "curl -s http://localhost:5001/api/export-config/ports | head -100"

echo
echo "4. Export config - Shipping methods:"
run_ssh_command "curl -s http://localhost:5001/api/export-config/shipping-methods | head -100"

echo
echo "5. Export config - Payment terms:"
run_ssh_command "curl -s http://localhost:5001/api/export-config/payment-terms | head -100"

echo "🌍 Testing public endpoints..."
echo
echo "Public Health Check:"
curl -s https://blsexport.nmdevai.com/health

echo
echo "Public Brand Registrations:"
curl -s https://blsexport.nmdevai.com/api/brand-registrations | head -200

echo "✅ All tests completed!"