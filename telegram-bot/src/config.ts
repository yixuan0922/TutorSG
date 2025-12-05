import dotenv from 'dotenv';

dotenv.config();

export const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    adminIds: process.env.ADMIN_TELEGRAM_IDS?.split(',').map(id => id.trim()) || [],
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  app: {
    webAppUrl: process.env.WEB_APP_URL || 'http://localhost:3000',
    autoDeleteTimeout: parseInt(process.env.AUTO_DELETE_TIMEOUT || '600000', 10), // 10 minutes default
  },
  cron: {
    jobAlertSchedule: process.env.JOB_ALERT_CRON || '0 * * * *', // Every hour by default
  },
};

// Validate required config
if (!config.telegram.botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is required in .env file');
}

if (!config.database.url) {
  throw new Error('DATABASE_URL is required in .env file');
}
