import { Telegraf } from 'telegraf';
import type { BotContext } from '../types/context.js';
import { databaseService } from '../services/database.service.js';
import { formatTutorProfile } from '../utils/formatters.js';
import { getMainMenuKeyboard, getConfirmationKeyboard } from '../utils/keyboards.js';

export function registerAuthHandlers(bot: Telegraf<BotContext>) {
  // /link command
  bot.command('link', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const telegramUsername = ctx.from.username;

    try {
      // Check if already linked
      const existingTutor = await databaseService.getTutorByTelegramId(telegramId);

      if (existingTutor) {
        await ctx.reply(
          `✅ You are already linked as <b>${existingTutor.name}</b>\n\nUse /unlink to disconnect your account.`,
          { parse_mode: 'HTML' }
        );
        return;
      }

      // Extract email from command
      const args = ctx.message.text.split(' ').slice(1);
      const email = args[0];

      if (!email) {
        await ctx.reply(
          `📧 Please provide your registered email address:\n\n<code>/link your@email.com</code>`,
          { parse_mode: 'HTML' }
        );
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        await ctx.reply('❌ Invalid email format. Please try again with a valid email address.');
        return;
      }

      // Find tutor by email
      const tutor = await databaseService.getTutorByEmail(email);

      if (!tutor) {
        await ctx.reply(
          `❌ No account found with email: <code>${email}</code>\n\n` +
          `Please make sure:\n` +
          `1️⃣ You're registered on TutorSG website\n` +
          `2️⃣ You're using the correct email address\n\n` +
          `Don't have an account? Register at our website first!`,
          { parse_mode: 'HTML' }
        );
        return;
      }

      // Check if email is already linked to another Telegram account
      if (tutor.telegramId && tutor.telegramId !== telegramId) {
        await ctx.reply(
          `⚠️ This email is already linked to another Telegram account.\n\n` +
          `If you want to link it to this account, please unlink it from the other account first.`
        );
        return;
      }

      // Link the account
      await databaseService.linkTelegramToTutor(
        tutor.id,
        telegramId,
        telegramUsername
      );

      // Update session
      const updatedTutor = await databaseService.getTutorByTelegramId(telegramId);
      if (updatedTutor) {
        ctx.session.tutor = updatedTutor;
      }

      await ctx.reply(
        `✅ <b>Account Linked Successfully!</b>\n\n` +
        `Welcome, ${tutor.name}! 🎉\n\n` +
        `Your TutorSG account is now connected to this Telegram bot.\n\n` +
        `🔔 Job notifications are now <b>ENABLED</b>\n\n` +
        `Use /preferences to customize your job alerts.`,
        {
          parse_mode: 'HTML',
          ...getMainMenuKeyboard(),
        }
      );
    } catch (error) {
      console.error('Error in /link command:', error);
      await ctx.reply('❌ An error occurred while linking your account. Please try again later.');
    }
  });

  // /unlink command
  bot.command('unlink', async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
      const tutor = await databaseService.getTutorByTelegramId(telegramId);

      if (!tutor) {
        await ctx.reply('❌ No linked account found.');
        return;
      }

      await ctx.reply(
        `⚠️ Are you sure you want to unlink your account?\n\n` +
        `This will:\n` +
        `• Stop all job notifications\n` +
        `• Remove Telegram access to your profile\n\n` +
        `You can always link again later using /link`,
        getConfirmationKeyboard('unlink', tutor.id)
      );
    } catch (error) {
      console.error('Error in /unlink command:', error);
      await ctx.reply('❌ An error occurred. Please try again later.');
    }
  });

  // Handle unlink confirmation
  bot.action(/^confirm_unlink_(.+)$/, async (ctx) => {
    const tutorId = ctx.match[1];

    try {
      // Remove telegram linkage
      await databaseService.linkTelegramToTutor(tutorId, '', undefined);

      // Clear session
      ctx.session.tutor = undefined;

      await ctx.answerCbQuery('Account unlinked');
      await ctx.editMessageText(
        `✅ Your account has been unlinked.\n\n` +
        `You will no longer receive job notifications.\n\n` +
        `To link again, use /link your@email.com`
      );
    } catch (error) {
      console.error('Error unlinking account:', error);
      await ctx.answerCbQuery('❌ Error unlinking account');
    }
  });

  // Handle cancel unlink
  bot.action(/^cancel_unlink$/, async (ctx) => {
    await ctx.answerCbQuery('Cancelled');
    await ctx.editMessageText('❌ Unlink cancelled. Your account remains linked.');
  });

  // /profile command
  bot.command('profile', async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
      const tutor = await databaseService.getTutorByTelegramId(telegramId);

      if (!tutor) {
        await ctx.reply(
          '❌ No linked account found.\n\nPlease link your account first using /link'
        );
        return;
      }

      await ctx.reply(formatTutorProfile(tutor), { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error in /profile command:', error);
      await ctx.reply('❌ An error occurred. Please try again later.');
    }
  });

  // Handle "👤 Profile" button
  bot.hears('👤 Profile', async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
      const tutor = await databaseService.getTutorByTelegramId(telegramId);

      if (!tutor) {
        await ctx.reply(
          '❌ No linked account found.\n\nPlease link your account first using /link'
        );
        return;
      }

      await ctx.reply(formatTutorProfile(tutor), { parse_mode: 'HTML' });
    } catch (error) {
      console.error('Error in Profile button:', error);
      await ctx.reply('❌ An error occurred. Please try again later.');
    }
  });
}
