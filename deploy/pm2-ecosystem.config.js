module.exports = {
  apps: [{
    name: 'bls-export-backend',
    script: './dist/index.js',
    cwd: '/var/www/blsexport/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 6543
    },
    log_file: '/var/log/pm2/bls-export-backend.log',
    out_file: '/var/log/pm2/bls-export-backend-out.log',
    error_file: '/var/log/pm2/bls-export-backend-error.log',
    merge_logs: true,
    time: true,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s',
    max_memory_restart: '500M',
    restart_delay: 5000
  }]
};