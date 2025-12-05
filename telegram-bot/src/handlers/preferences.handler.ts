import { Telegraf } from 'telegraf';
import type { BotContext } from '../types/context.js';
import { databaseService } from '../services/database.service.js';
import {
  getPreferenceTypeKeyboard,
  getSubjectKeyboard,
  getLevelKeyboard,
  getLocationKeyboard,
} from '../utils/keyboards.js';

export function registerPreferencesHandlers(bot: Telegraf<BotContext>) {
  // /preferences command
  bot.command('preferences', async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
      const tutor = await databaseService.getTutorByTelegramId(telegramId);

      if (!tutor) {
        await ctx.reply('❌ Please link your account first using /link');
        return;
      }

      // Initialize session preferences
      ctx.session.selectedPreferences = {
        subjects: [...(tutor.subjects || [])],
        levels: [...(tutor.levels || [])],
        locations: [...(tutor.locations || [])],
      };

      await ctx.reply(
        `⚙️ <b>Manage Your Job Preferences</b>\n\n` +
        `Current settings:\n` +
        `📚 Subjects: ${tutor.subjects.length > 0 ? tutor.subjects.join(', ') : 'None'}\n` +
        `🎓 Levels: ${tutor.levels.length > 0 ? tutor.levels.join(', ') : 'None'}\n` +
        `📍 Locations: ${tutor.locations.length > 0 ? tutor.locations.join(', ') : 'None'}\n` +
        `💰 Hourly Rate: ${tutor.hourlyRates ? `$${tutor.hourlyRates.min}-$${tutor.hourlyRates.max}` : 'Not set'}\n\n` +
        `Select what you'd like to update:`,
        {
          parse_mode: 'HTML',
          ...getPreferenceTypeKeyboard(),
        }
      );
    } catch (error) {
      console.error('Error in /preferences:', error);
      await ctx.reply('❌ An error occurred. Please try again later.');
    }
  });

  // Preference type selection
  bot.action('pref_subjects', async (ctx) => {
    const selectedSubjects = ctx.session.selectedPreferences?.subjects || [];

    await ctx.editMessageText(
      `📚 <b>Select Subjects</b>\n\n` +
      `Choose the subjects you can teach.\n` +
      `Currently selected: ${selectedSubjects.length > 0 ? selectedSubjects.join(', ') : 'None'}`,
      {
        parse_mode: 'HTML',
        ...getSubjectKeyboard(selectedSubjects),
      }
    );
    await ctx.answerCbQuery();
  });

  bot.action('pref_levels', async (ctx) => {
    const selectedLevels = ctx.session.selectedPreferences?.levels || [];

    await ctx.editMessageText(
      `🎓 <b>Select Education Levels</b>\n\n` +
      `Choose the levels you can teach.\n` +
      `Currently selected: ${selectedLevels.length > 0 ? selectedLevels.join(', ') : 'None'}`,
      {
        parse_mode: 'HTML',
        ...getLevelKeyboard(selectedLevels),
      }
    );
    await ctx.answerCbQuery();
  });

  bot.action('pref_locations', async (ctx) => {
    const selectedLocations = ctx.session.selectedPreferences?.locations || [];

    await ctx.editMessageText(
      `📍 <b>Select Preferred Locations</b>\n\n` +
      `Choose areas where you'd like to teach.\n` +
      `Currently selected: ${selectedLocations.length > 0 ? selectedLocations.join(', ') : 'None'}`,
      {
        parse_mode: 'HTML',
        ...getLocationKeyboard(selectedLocations),
      }
    );
    await ctx.answerCbQuery();
  });

  bot.action('pref_rate', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `💰 <b>Set Hourly Rate Range</b>\n\n` +
      `Please send your preferred hourly rate range in this format:\n\n` +
      `<code>min-max</code>\n\n` +
      `Example: <code>30-80</code> (for $30-$80/hour)`,
      { parse_mode: 'HTML' }
    );

    ctx.session.awaitingInput = { type: 'rate' };
  });

  // Handle subject selection
  bot.action(/^subject_(.+)$/, async (ctx) => {
    const action = ctx.match[1];

    if (action === 'done') {
      const subjects = ctx.session.selectedPreferences?.subjects || [];
      const telegramId = ctx.from.id.toString();

      await databaseService.updateTutorPreferences(telegramId, { subjects });

      await ctx.editMessageText(
        `✅ Subjects updated!\n\n` +
        `Selected: ${subjects.length > 0 ? subjects.join(', ') : 'None'}\n\n` +
        `What else would you like to update?`,
        {
          parse_mode: 'HTML',
          ...getPreferenceTypeKeyboard(),
        }
      );
      await ctx.answerCbQuery('✅ Subjects saved');
      return;
    }

    // Toggle subject selection
    if (!ctx.session.selectedPreferences) {
      ctx.session.selectedPreferences = { subjects: [], levels: [], locations: [] };
    }

    const subjects = ctx.session.selectedPreferences.subjects || [];
    const index = subjects.indexOf(action);

    if (index > -1) {
      subjects.splice(index, 1);
    } else {
      subjects.push(action);
    }

    ctx.session.selectedPreferences.subjects = subjects;

    await ctx.editMessageReplyMarkup(
      getSubjectKeyboard(subjects).reply_markup
    );
    await ctx.answerCbQuery();
  });

  // Handle level selection
  bot.action(/^level_(.+)$/, async (ctx) => {
    const action = ctx.match[1];

    if (action === 'done') {
      const levels = ctx.session.selectedPreferences?.levels || [];
      const telegramId = ctx.from.id.toString();

      await databaseService.updateTutorPreferences(telegramId, { levels });

      await ctx.editMessageText(
        `✅ Levels updated!\n\n` +
        `Selected: ${levels.length > 0 ? levels.join(', ') : 'None'}\n\n` +
        `What else would you like to update?`,
        {
          parse_mode: 'HTML',
          ...getPreferenceTypeKeyboard(),
        }
      );
      await ctx.answerCbQuery('✅ Levels saved');
      return;
    }

    // Toggle level selection
    if (!ctx.session.selectedPreferences) {
      ctx.session.selectedPreferences = { subjects: [], levels: [], locations: [] };
    }

    const levels = ctx.session.selectedPreferences.levels || [];
    const index = levels.indexOf(action);

    if (index > -1) {
      levels.splice(index, 1);
    } else {
      levels.push(action);
    }

    ctx.session.selectedPreferences.levels = levels;

    await ctx.editMessageReplyMarkup(
      getLevelKeyboard(levels).reply_markup
    );
    await ctx.answerCbQuery();
  });

  // Handle location selection
  bot.action(/^location_(.+)$/, async (ctx) => {
    const action = ctx.match[1];

    if (action === 'done') {
      const locations = ctx.session.selectedPreferences?.locations || [];
      const telegramId = ctx.from.id.toString();

      await databaseService.updateTutorPreferences(telegramId, { locations });

      await ctx.editMessageText(
        `✅ Locations updated!\n\n` +
        `Selected: ${locations.length > 0 ? locations.join(', ') : 'None'}\n\n` +
        `What else would you like to update?`,
        {
          parse_mode: 'HTML',
          ...getPreferenceTypeKeyboard(),
        }
      );
      await ctx.answerCbQuery('✅ Locations saved');
      return;
    }

    // Toggle location selection
    if (!ctx.session.selectedPreferences) {
      ctx.session.selectedPreferences = { subjects: [], levels: [], locations: [] };
    }

    const locations = ctx.session.selectedPreferences.locations || [];
    const index = locations.indexOf(action);

    if (index > -1) {
      locations.splice(index, 1);
    } else {
      locations.push(action);
    }

    ctx.session.selectedPreferences.locations = locations;

    await ctx.editMessageReplyMarkup(
      getLocationKeyboard(locations).reply_markup
    );
    await ctx.answerCbQuery();
  });

  // Preference done
  bot.action('pref_done', async (ctx) => {
    await ctx.editMessageText(
      `✅ <b>Preferences Updated!</b>\n\n` +
      `Your job alert preferences have been saved.\n\n` +
      `You'll now receive notifications for jobs matching your criteria.\n\n` +
      `Use /preferences anytime to update them.`,
      { parse_mode: 'HTML' }
    );
    await ctx.answerCbQuery('✅ All done!');

    // Clear session
    ctx.session.selectedPreferences = undefined;
  });

  // Handle rate input
  bot.on('text', async (ctx, next) => {
    if (ctx.session.awaitingInput?.type === 'rate') {
      const text = ctx.message.text;
      const match = text.match(/^(\d+)-(\d+)$/);

      if (!match) {
        await ctx.reply(
          `❌ Invalid format. Please use: <code>min-max</code>\n\n` +
          `Example: <code>30-80</code>`,
          { parse_mode: 'HTML' }
        );
        return;
      }

      const min = parseInt(match[1]);
      const max = parseInt(match[2]);

      if (min >= max) {
        await ctx.reply('❌ Minimum rate must be less than maximum rate.');
        return;
      }

      const telegramId = ctx.from.id.toString();
      await databaseService.updateTutorPreferences(telegramId, {
        hourlyRates: { min, max },
      });

      await ctx.reply(
        `✅ <b>Hourly Rate Updated!</b>\n\n` +
        `Your preferred rate: $${min} - $${max}/hour\n\n` +
        `Use /preferences to update other settings.`,
        { parse_mode: 'HTML' }
      );

      ctx.session.awaitingInput = undefined;
      return;
    }

    return next();
  });

  // Handle menu button
  bot.hears('⚙️ Preferences', async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
      const tutor = await databaseService.getTutorByTelegramId(telegramId);

      if (!tutor) {
        await ctx.reply('❌ Please link your account first using /link');
        return;
      }

      // Initialize session preferences
      ctx.session.selectedPreferences = {
        subjects: [...(tutor.subjects || [])],
        levels: [...(tutor.levels || [])],
        locations: [...(tutor.locations || [])],
      };

      await ctx.reply(
        `⚙️ <b>Manage Your Job Preferences</b>\n\n` +
        `Current settings:\n` +
        `📚 Subjects: ${tutor.subjects.length > 0 ? tutor.subjects.join(', ') : 'None'}\n` +
        `🎓 Levels: ${tutor.levels.length > 0 ? tutor.levels.join(', ') : 'None'}\n` +
        `📍 Locations: ${tutor.locations.length > 0 ? tutor.locations.join(', ') : 'None'}\n` +
        `💰 Hourly Rate: ${tutor.hourlyRates ? `$${tutor.hourlyRates.min}-$${tutor.hourlyRates.max}` : 'Not set'}\n\n` +
        `Select what you'd like to update:`,
        {
          parse_mode: 'HTML',
          ...getPreferenceTypeKeyboard(),
        }
      );
    } catch (error) {
      console.error('Error in Preferences button:', error);
      await ctx.reply('❌ An error occurred. Please try again later.');
    }
  });
}
