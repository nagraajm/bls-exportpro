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

echo "🔧 Manually checking and fixing Nginx configuration..."

echo "📄 Viewing current Nginx proxy configuration..."
run_ssh_command "grep -A 10 -B 5 'location /api' /etc/nginx/sites-available/default"

echo "📝 Manually editing Nginx config to use correct port..."
run_ssh_command "cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup"

echo "✏️ Creating new Nginx configuration with correct port..."
run_ssh_command "cat > /tmp/nginx_fix.py << 'EOF'
import re

with open('/etc/nginx/sites-available/default', 'r') as f:
    content = f.read()

# Replace port 6543 with 5001 in proxy_pass directives
content = re.sub(r'proxy_pass\s+http://localhost:6543', 'proxy_pass http://localhost:5001', content)

with open('/etc/nginx/sites-available/default', 'w') as f:
    f.write(content)

print('Nginx configuration updated successfully')
EOF"

run_ssh_command "python3 /tmp/nginx_fix.py"

echo "🔍 Verifying the configuration change..."
run_ssh_command "grep -A 5 -B 5 'proxy_pass' /etc/nginx/sites-available/default"

echo "✅ Testing and reloading Nginx..."
run_ssh_command "nginx -t && systemctl reload nginx"

echo "🌍 Final test of public endpoints..."
echo
echo "Public Health Check:"
curl -s https://blsexport.nmdevai.com/health
echo
echo "Public Brand Registrations:"
curl -s https://blsexport.nmdevai.com/api/brand-registrations | head -300

echo "🎉 Nginx configuration should now be fixed!"