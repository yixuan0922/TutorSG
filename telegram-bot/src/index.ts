import { Telegraf, session } from 'telegraf';
import type { BotContext } from './types/context.js';
import { config } from './config.js';
import { AlertService } from './services/alert.service.js';

// Import handlers
import { registerStartHandlers } from './handlers/start.handler.js';
import { registerAuthHandlers } from './handlers/auth.handler.js';
import { registerJobHandlers } from './handlers/jobs.handler.js';
import { registerPreferencesHandlers } from './handlers/preferences.handler.js';
import { registerNotificationsHandlers } from './handlers/notifications.handler.js';

// Create bot instance
const bot = new Telegraf<BotContext>(config.telegram.botToken);

// Session middleware
bot.use(session({
  defaultSession: () => ({
    tutor: undefined,
    linkingEmail: undefined,
    awaitingInput: undefined,
    selectedPreferences: undefined,
  }),
}));

// Register all handlers
registerStartHandlers(bot);
registerAuthHandlers(bot);
registerJobHandlers(bot);
registerPreferencesHandlers(bot);
registerNotificationsHandlers(bot);

// Initialize alert service
const alertService = new AlertService(bot);

// Admin commands (for testing and management)
bot.command('test_alert', async (ctx) => {
  const telegramId = ctx.from.id.toString();

  // Check if user is admin
  if (!config.telegram.adminIds.includes(telegramId)) {
    await ctx.reply('❌ This command is only available to administrators.');
    return;
  }

  try {
    await alertService.sendTestAlert(telegramId);
    await ctx.reply('✅ Test alert sent!');
  } catch (error) {
    await ctx.reply('❌ Error sending test alert. Make sure you have linked your account.');
  }
});

bot.command('trigger_alerts', async (ctx) => {
  const telegramId = ctx.from.id.toString();

  // Check if user is admin
  if (!config.telegram.adminIds.includes(telegramId)) {
    await ctx.reply('❌ This command is only available to administrators.');
    return;
  }

  await ctx.reply('🔄 Manually triggering job alert check...');
  await alertService.triggerManualCheck();
  await ctx.reply('✅ Alert check completed!');
});

// Error handling
bot.catch((err, ctx) => {
  console.error('❌ Bot error:', err);
  ctx.reply('❌ An unexpected error occurred. Please try again later.').catch(console.error);
});

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('\n🛑 Shutting down bot...');
  alertService.stop();
  bot.stop('SIGINT');
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('\n🛑 Shutting down bot...');
  alertService.stop();
  bot.stop('SIGTERM');
  process.exit(0);
});

// Start the bot
async function start() {
  try {
    console.log('🚀 Starting TutorSG Telegram Bot...');

    // Start polling
    await bot.launch();

    console.log('✅ Bot is running!');
    console.log('📱 Bot username:', (await bot.telegram.getMe()).username);

    // Start alert service
    alertService.start();

    console.log('🎉 All systems operational!');
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

start();
