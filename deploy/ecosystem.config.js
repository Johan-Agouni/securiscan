/**
 * PM2 Ecosystem – SecuriScan Production
 *
 * Usage:
 *   pm2 startOrReload deploy/ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup   # generate systemd unit so PM2 restarts on reboot
 */

module.exports = {
  apps: [
    // ── Express API (port 4000) ────────────────────────────────────────────
    {
      name: 'securiscan-server',
      cwd: '/var/www/securiscan/server',
      script: 'dist/index.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      restart_delay: 3000,
      error_file: '/var/log/pm2/securiscan-server-error.log',
      out_file: '/var/log/pm2/securiscan-server-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },

    // ── Next.js Frontend (port 3000) ──────────────────────────────────────
    // Uses the standalone output: node .next/standalone/server.js
    {
      name: 'securiscan-client',
      cwd: '/var/www/securiscan/client/.next/standalone',
      script: 'server.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 3000,
      error_file: '/var/log/pm2/securiscan-client-error.log',
      out_file: '/var/log/pm2/securiscan-client-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
      },
    },
  ],
};
