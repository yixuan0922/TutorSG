import { Telegraf } from 'telegraf';
import type { BotContext } from '../types/context.js';
import { databaseService } from '../services/database.service.js';
import { getWelcomeMessage, getHelpMessage } from '../utils/formatters.js';
import { getMainMenuKeyboard } from '../utils/keyboards.js';

export function registerStartHandlers(bot: Telegraf<BotContext>) {
  // /start command
  bot.command('start', async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
      // Check if user is already linked
      const tutor = await databaseService.getTutorByTelegramId(telegramId);

      if (tutor) {
        ctx.session.tutor = tutor;
        await ctx.reply(
          getWelcomeMessage(tutor.name),
          {
            parse_mode: 'HTML',
            ...getMainMenuKeyboard(),
          }
        );
      } else {
        await ctx.reply(
          getWelcomeMessage(),
          {
            parse_mode: 'HTML',
          }
        );

        // Prompt to link account
        await ctx.reply(
          `🔗 To get started, please link your TutorSG account using:\n\n/link your@email.com\n\nExample: /link john@example.com`,
          { parse_mode: 'HTML' }
        );
      }
    } catch (error) {
      console.error('Error in /start command:', error);
      await ctx.reply('❌ An error occurred. Please try again later.');
    }
  });

  // /help command
  bot.command('help', async (ctx) => {
    await ctx.reply(getHelpMessage(), { parse_mode: 'HTML' });
  });

  // Handle main menu buttons
  bot.hears('❓ Help', async (ctx) => {
    await ctx.reply(getHelpMessage(), { parse_mode: 'HTML' });
  });
}
