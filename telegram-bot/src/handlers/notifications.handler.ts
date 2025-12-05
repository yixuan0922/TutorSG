import { Telegraf } from 'telegraf';
import type { BotContext } from '../types/context.js';
import { databaseService } from '../services/database.service.js';
import { getNotificationToggleKeyboard } from '../utils/keyboards.js';

export function registerNotificationsHandlers(bot: Telegraf<BotContext>) {
  // /notifications command
  bot.command('notifications', async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
      const tutor = await databaseService.getTutorByTelegramId(telegramId);

      if (!tutor) {
        await ctx.reply('❌ Please link your account first using /link');
        return;
      }

      const status = tutor.notificationsEnabled ? 'ON ✅' : 'OFF ❌';

      await ctx.reply(
        `🔔 <b>Job Notifications</b>\n\n` +
        `Current status: <b>${status}</b>\n\n` +
        `${tutor.notificationsEnabled
          ? 'You are receiving job alerts based on your preferences.'
          : 'Job alerts are currently disabled. Enable them to receive personalized job notifications.'
        }`,
        {
          parse_mode: 'HTML',
          ...getNotificationToggleKeyboard(tutor.notificationsEnabled),
        }
      );
    } catch (error) {
      console.error('Error in /notifications:', error);
      await ctx.reply('❌ An error occurred. Please try again later.');
    }
  });

  // Toggle notifications
  bot.action(/^toggle_notifications_(.+)$/, async (ctx) => {
    const enabled = ctx.match[1] === 'true';
    const telegramId = ctx.from.id.toString();

    try {
      await databaseService.updateNotificationSettings(telegramId, enabled);

      await ctx.editMessageText(
        `${enabled ? '🔔' : '🔕'} <b>Notifications ${enabled ? 'Enabled' : 'Disabled'}</b>\n\n` +
        `${enabled
          ? 'You will now receive job alerts matching your preferences!'
          : 'You will no longer receive job alerts.'
        }`,
        { parse_mode: 'HTML' }
      );

      await ctx.answerCbQuery(
        enabled ? '✅ Notifications enabled' : '❌ Notifications disabled'
      );
    } catch (error) {
      console.error('Error toggling notifications:', error);
      await ctx.answerCbQuery('❌ Error updating settings');
    }
  });

  // Handle menu button
  bot.hears('🔔 Notifications', async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
      const tutor = await databaseService.getTutorByTelegramId(telegramId);

      if (!tutor) {
        await ctx.reply('❌ Please link your account first using /link');
        return;
      }

      const status = tutor.notificationsEnabled ? 'ON ✅' : 'OFF ❌';

      await ctx.reply(
        `🔔 <b>Job Notifications</b>\n\n` +
        `Current status: <b>${status}</b>\n\n` +
        `${tutor.notificationsEnabled
          ? 'You are receiving job alerts based on your preferences.'
          : 'Job alerts are currently disabled. Enable them to receive personalized job notifications.'
        }`,
        {
          parse_mode: 'HTML',
          ...getNotificationToggleKeyboard(tutor.notificationsEnabled),
        }
      );
    } catch (error) {
      console.error('Error in Notifications button:', error);
      await ctx.reply('❌ An error occurred. Please try again later.');
    }
  });
}
