/**
 * PM2 Ecosystem Config — Lihiket Tutoring Platform
 *
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup   (auto-start on server reboot)
 *
 * Monitor:
 *   pm2 status
 *   pm2 logs lihiket-api
 *   pm2 monit
 */
module.exports = {
  apps: [
    {
      name:        'lihiket-api',
      script:      'src/server.js',
      cwd:         './server',

      // Cluster mode: 1 process per CPU core for maximum throughput
      instances:   'max',
      exec_mode:   'cluster',

      // Auto-restart on crash
      autorestart: true,
      watch:       false,          // do NOT watch in production
      max_memory_restart: '512M',  // restart if RAM usage exceeds 512 MB

      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT:     5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT:     5000,
      },

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file:      './logs/pm2-error.log',
      out_file:        './logs/pm2-out.log',
      merge_logs:      true,

      // Graceful shutdown — wait for active requests before killing
      kill_timeout:    5000,
      wait_ready:      true,
      listen_timeout:  10000,
    },
  ],
};
