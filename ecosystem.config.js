module.exports = {
  apps: [
    {
      name: 'workflow-architect-api',
      script: './apps/api/dist/index.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        // index.ts does `import 'dotenv/config'`, which loads from cwd.
        // Point it at the API's own .env regardless of where PM2 starts.
        DOTENV_CONFIG_PATH: './apps/api/.env',
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
