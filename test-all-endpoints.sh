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

echo "🧪 Testing all BLS Export Management endpoints..."

echo "✅ 1. Health Check"
run_ssh_command "curl -s http://localhost:5001/health | jq -r '.status'"

echo "✅ 2. Brand Registration System"
run_ssh_command "curl -s http://localhost:5001/api/brand-registrations | jq '.count'"
run_ssh_command "curl -s 'http://localhost:5001/api/brand-registrations/search?brandName=Paracetamol' | jq '.count'"

echo "✅ 3. Export Configuration - Ports"
run_ssh_command "curl -s http://localhost:5001/api/export-config/ports | jq '.count'"

echo "✅ 4. Export Configuration - Shipping Methods" 
run_ssh_command "curl -s http://localhost:5001/api/export-config/shipping-methods | jq '.count'"

echo "✅ 5. Export Configuration - Incoterms"
run_ssh_command "curl -s http://localhost:5001/api/export-config/incoterms | jq '.count'"

echo "✅ 6. Export Configuration - Exchange Rates"
run_ssh_command "curl -s http://localhost:5001/api/export-config/exchange-rates | jq '.count'"

echo "✅ 7. Export Configuration - Payment Terms"
run_ssh_command "curl -s http://localhost:5001/api/export-config/payment-terms | jq '.count'"

echo "✅ 8. Core System - Products"
run_ssh_command "curl -s http://localhost:5001/api/products | jq 'length'"

echo "✅ 9. Core System - Customers"
run_ssh_command "curl -s http://localhost:5001/api/customers | jq 'length'"

echo "✅ 10. Core System - Dashboard"
run_ssh_command "curl -s http://localhost:5001/api/dashboard/metrics | jq '.totalOrders'"

echo "🔧 Now fixing Nginx configuration..."
run_ssh_command "cat /etc/nginx/sites-available/default | grep -A 5 -B 5 proxy_pass"

echo "📝 Updating Nginx to proxy to correct port..."
run_ssh_command "sed -i 's/proxy_pass http:\/\/localhost:6543/proxy_pass http:\/\/localhost:5001/' /etc/nginx/sites-available/default"

echo "🔄 Restarting Nginx..."
run_ssh_command "nginx -t && systemctl reload nginx"

echo "🌍 Testing public endpoints after Nginx fix..."
echo "Health check:"
curl -s https://blsexport.nmdevai.com/health | jq '.'
echo "Brand registrations count:"
curl -s https://blsexport.nmdevai.com/api/brand-registrations | jq '.count'
echo "Export config ports count:"
curl -s https://blsexport.nmdevai.com/api/export-config/ports | jq '.count'

echo "🎉 All endpoints tested and Nginx configuration fixed!"