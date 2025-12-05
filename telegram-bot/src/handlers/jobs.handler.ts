import { Telegraf } from 'telegraf';
import type { BotContext } from '../types/context.js';
import { databaseService } from '../services/database.service.js';
import { formatJobMessage, formatJobList, formatTutorApplicationProfile } from '../utils/formatters.js';
import { getJobActionButtons, getPaginationKeyboard, getApplicationConfirmKeyboard, getPersonalizedMessageKeyboard } from '../utils/keyboards.js';
import { config } from '../config.js';

// Store message IDs for auto-deletion
const messageDeleteQueue: Map<number, NodeJS.Timeout> = new Map();

/**
 * Schedule a message for auto-deletion
 */
function scheduleMessageDeletion(ctx: BotContext, messageId: number) {
  // Clear existing timeout if any
  const existingTimeout = messageDeleteQueue.get(messageId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Schedule new deletion
  const timeout = setTimeout(async () => {
    try {
      await ctx.telegram.deleteMessage(ctx.chat!.id, messageId);
      messageDeleteQueue.delete(messageId);
    } catch (error) {
      // Message might already be deleted or too old
      console.log(`Could not delete message ${messageId}`);
    }
  }, config.app.autoDeleteTimeout);

  messageDeleteQueue.set(messageId, timeout);
}

export function registerJobHandlers(bot: Telegraf<BotContext>) {
  // /jobs command - Browse all jobs
  bot.command('jobs', async (ctx) => {
    try {
      const jobs = await databaseService.getOpenJobs();

      if (jobs.length === 0) {
        await ctx.reply('📭 No open jobs available at the moment. Check back later!');
        return;
      }

      await ctx.reply(
        `📋 <b>Available Jobs (${jobs.length})</b>\n\n` +
        `Browse through all open tuition opportunities below:`,
        { parse_mode: 'HTML' }
      );

      // Send first 5 jobs with auto-delete
      const jobsToShow = jobs.slice(0, 5);
      for (const job of jobsToShow) {
        const telegramId = ctx.from?.id.toString();
        let hasApplied = false;

        if (telegramId) {
          const tutor = await databaseService.getTutorByTelegramId(telegramId);
          if (tutor) {
            hasApplied = await databaseService.hasApplied(tutor.id, job.id);
          }
        }

        const message = await ctx.reply(
          formatJobMessage(job),
          {
            parse_mode: 'HTML',
            ...getJobActionButtons(job.id, hasApplied),
          }
        );

        // Schedule auto-deletion
        scheduleMessageDeletion(ctx, message.message_id);
      }

      if (jobs.length > 5) {
        await ctx.reply(
          `... and ${jobs.length - 5} more jobs.\n\n` +
          `Use /search to find specific jobs with filters.`
        );
      }

      await ctx.reply(
        `⏱ <i>These messages will auto-delete in 10 minutes.</i>`,
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error('Error in /jobs command:', error);
      await ctx.reply('❌ An error occurred while fetching jobs. Please try again later.');
    }
  });

  // /search command - Search jobs with filters
  bot.command('search', async (ctx) => {
    await ctx.reply(
      `🔍 <b>Search Jobs</b>\n\n` +
      `You can search by:\n` +
      `• Subject (e.g., Math, English, Science)\n` +
      `• Level (e.g., Primary, Secondary, JC)\n` +
      `• Location (e.g., North, Jurong, Bishan)\n\n` +
      `<b>Usage:</b>\n` +
      `<code>/search subject:Math</code>\n` +
      `<code>/search level:Secondary location:North</code>\n` +
      `<code>/search subject:English level:Primary</code>`,
      { parse_mode: 'HTML' }
    );
  });

  // Handle search with parameters
  bot.hears(/^\/search (.+)/, async (ctx) => {
    try {
      const query = ctx.match[1];
      const filters: { subject?: string; level?: string; location?: string } = {};

      // Parse filters
      const subjectMatch = query.match(/subject:(\w+)/i);
      const levelMatch = query.match(/level:([\w\s-]+?)(?:\s|$)/i);
      const locationMatch = query.match(/location:([\w\s]+?)(?:\s|$)/i);

      if (subjectMatch) filters.subject = subjectMatch[1];
      if (levelMatch) filters.level = levelMatch[1].trim();
      if (locationMatch) filters.location = locationMatch[1].trim();

      const jobs = await databaseService.searchJobs(filters);

      if (jobs.length === 0) {
        await ctx.reply('❌ No jobs found matching your criteria. Try different filters.');
        return;
      }

      await ctx.reply(formatJobList(jobs), { parse_mode: 'HTML' });

      // Send detailed view of first 3 results
      const jobsToShow = jobs.slice(0, 3);
      for (const job of jobsToShow) {
        const telegramId = ctx.from?.id.toString();
        let hasApplied = false;

        if (telegramId) {
          const tutor = await databaseService.getTutorByTelegramId(telegramId);
          if (tutor) {
            hasApplied = await databaseService.hasApplied(tutor.id, job.id);
          }
        }

        const message = await ctx.reply(
          formatJobMessage(job),
          {
            parse_mode: 'HTML',
            ...getJobActionButtons(job.id, hasApplied),
          }
        );

        // Schedule auto-deletion
        scheduleMessageDeletion(ctx, message.message_id);
      }

      await ctx.reply(
        `⏱ <i>These messages will auto-delete in 10 minutes.</i>`,
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error('Error in search:', error);
      await ctx.reply('❌ An error occurred while searching. Please try again.');
    }
  });

  // Apply to job - Step 1: Show profile confirmation
  bot.action(/^apply_(.+)$/, async (ctx) => {
    const jobId = ctx.match[1];
    const telegramId = ctx.from.id.toString();

    try {
      const tutor = await databaseService.getTutorByTelegramId(telegramId);

      if (!tutor) {
        await ctx.answerCbQuery('❌ Please link your account first using /link');
        return;
      }

      // Check if already applied
      const hasApplied = await databaseService.hasApplied(tutor.id, jobId);
      if (hasApplied) {
        await ctx.answerCbQuery('✓ You have already applied to this job');
        return;
      }

      await ctx.answerCbQuery();

      // Get job details
      const job = await databaseService.getJobById(jobId);
      if (!job) {
        await ctx.reply('❌ Job not found');
        return;
      }

      // Show profile confirmation
      await ctx.reply(
        `<b>🎯 Applying for: ${job.subject} | ${job.level}</b>\n\n` +
        formatTutorApplicationProfile(tutor) +
        `\n\n` +
        `<i>This information will be shared with the parents. Please confirm to continue.</i>`,
        {
          parse_mode: 'HTML',
          ...getApplicationConfirmKeyboard(jobId),
        }
      );
    } catch (error) {
      console.error('Error in application step 1:', error);
      await ctx.answerCbQuery('❌ Error processing application');
    }
  });

  // Confirm application - Step 2: Show personalized message options
  bot.action(/^confirm_apply_(.+)$/, async (ctx) => {
    const jobId = ctx.match[1];

    try {
      const job = await databaseService.getJobById(jobId);
      if (!job) {
        await ctx.answerCbQuery('❌ Job not found');
        return;
      }

      await ctx.answerCbQuery();

      let messageText = `<b>✍️ Personalize Your Application</b>\n\n`;

      if (job.specialRequests) {
        messageText += `<b>⭐ Parent's Special Requirements:</b>\n`;
        messageText += `<i>"${job.specialRequests}"</i>\n\n`;
        messageText += `Would you like to write a personalized message addressing these requirements?\n\n`;
      } else {
        messageText += `Would you like to include a personalized message with your application?\n\n`;
      }

      messageText += `This can help you stand out and show parents why you're a great fit!`;

      await ctx.editMessageText(messageText, {
        parse_mode: 'HTML',
        ...getPersonalizedMessageKeyboard(jobId),
      });
    } catch (error) {
      console.error('Error in application step 2:', error);
      await ctx.answerCbQuery('❌ Error processing application');
    }
  });

  // Write personalized message
  bot.action(/^write_message_(.+)$/, async (ctx) => {
    const jobId = ctx.match[1];

    try {
      await ctx.answerCbQuery();

      // Store pending application in session
      ctx.session.pendingApplication = { jobId };
      ctx.session.awaitingInput = { type: 'application_message', data: jobId };

      await ctx.editMessageText(
        `<b>✍️ Write Your Message</b>\n\n` +
        `Please type your personalized message for the parents.\n\n` +
        `<b>Tips:</b>\n` +
        `• Address their special requirements\n` +
        `• Mention relevant experience\n` +
        `• Keep it professional yet warm\n` +
        `• Keep it under 300 characters\n\n` +
        `Type your message below:`,
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error('Error requesting message:', error);
      await ctx.answerCbQuery('❌ Error processing request');
    }
  });

  // Skip message and submit
  bot.action(/^skip_message_(.+)$/, async (ctx) => {
    const jobId = ctx.match[1];
    const telegramId = ctx.from.id.toString();

    try {
      const tutor = await databaseService.getTutorByTelegramId(telegramId);

      if (!tutor) {
        await ctx.answerCbQuery('❌ Please link your account first');
        return;
      }

      // Create application without message
      await databaseService.createApplication(tutor.id, jobId);

      await ctx.answerCbQuery('✅ Application submitted!');

      await ctx.editMessageText(
        `✅ <b>Application Submitted!</b>\n\n` +
        `Your application for Job ID: <code>${jobId}</code> has been submitted.\n\n` +
        `We'll notify parents about your interest. Good luck! 🍀`,
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error('Error submitting application:', error);
      await ctx.answerCbQuery('❌ Error submitting application');
    }
  });

  // Cancel application
  bot.action('cancel_apply', async (ctx) => {
    await ctx.answerCbQuery('❌ Application cancelled');
    await ctx.editMessageText(
      '❌ Application cancelled.\n\nYou can apply to this job anytime by clicking "Apply Now" button.',
      { parse_mode: 'HTML' }
    );

    // Clear session
    ctx.session.pendingApplication = undefined;
    ctx.session.awaitingInput = undefined;
  });

  // Already applied callback
  bot.action(/^applied_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery('✓ You have already applied to this job');
  });

  // Forward job to friend
  bot.action(/^forward_(.+)$/, async (ctx) => {
    const jobId = ctx.match[1];

    try {
      const job = await databaseService.getJobById(jobId);
      if (!job) {
        await ctx.answerCbQuery('❌ Job not found');
        return;
      }

      await ctx.answerCbQuery('📤 Preparing to forward...');

      await ctx.reply(
        `📤 <b>Forward this job to a friend:</b>\n\n` +
        `Simply forward the job message below to any Telegram user!\n\n` +
        formatJobMessage(job, false),
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error('Error forwarding job:', error);
      await ctx.answerCbQuery('❌ Error preparing forward');
    }
  });

  // Job details
  bot.action(/^details_(.+)$/, async (ctx) => {
    const jobId = ctx.match[1];

    try {
      const job = await databaseService.getJobById(jobId);
      if (!job) {
        await ctx.answerCbQuery('❌ Job not found');
        return;
      }

      await ctx.answerCbQuery();

      await ctx.reply(
        `📋 <b>Job Details</b>\n\n` +
        formatJobMessage(job, false) +
        `\n\n` +
        `To apply, click the "Apply Now" button on the original message.`,
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error('Error fetching job details:', error);
      await ctx.answerCbQuery('❌ Error fetching details');
    }
  });

  // Handle application message input
  bot.on('text', async (ctx, next) => {
    if (ctx.session.awaitingInput?.type === 'application_message') {
      const message = ctx.message.text;
      const jobId = ctx.session.pendingApplication?.jobId;

      if (!jobId) {
        await ctx.reply('❌ Session expired. Please try applying again.');
        ctx.session.awaitingInput = undefined;
        ctx.session.pendingApplication = undefined;
        return;
      }

      // Validate message length
      if (message.length > 300) {
        await ctx.reply(
          `❌ Message too long (${message.length} characters).\n\n` +
          `Please keep it under 300 characters.`,
          { parse_mode: 'HTML' }
        );
        return;
      }

      if (message.length < 10) {
        await ctx.reply(
          `❌ Message too short.\n\n` +
          `Please write at least 10 characters to make a meaningful introduction.`,
          { parse_mode: 'HTML' }
        );
        return;
      }

      try {
        const telegramId = ctx.from.id.toString();
        const tutor = await databaseService.getTutorByTelegramId(telegramId);

        if (!tutor) {
          await ctx.reply('❌ Please link your account first using /link');
          return;
        }

        // Create application with message
        await databaseService.createApplication(tutor.id, jobId, message);

        await ctx.reply(
          `✅ <b>Application Submitted!</b>\n\n` +
          `Your application for Job ID: <code>${jobId}</code> has been submitted with your personalized message.\n\n` +
          `<b>Your message:</b>\n` +
          `<i>"${message}"</i>\n\n` +
          `We'll notify parents about your interest. Good luck! 🍀`,
          { parse_mode: 'HTML' }
        );

        // Clear session
        ctx.session.awaitingInput = undefined;
        ctx.session.pendingApplication = undefined;
      } catch (error) {
        console.error('Error submitting application with message:', error);
        await ctx.reply('❌ An error occurred. Please try again.');
      }

      return;
    }

    return next();
  });

  // /myapplications command
  bot.command('myapplications', async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
      const tutor = await databaseService.getTutorByTelegramId(telegramId);

      if (!tutor) {
        await ctx.reply('❌ Please link your account first using /link');
        return;
      }

      const applications = await databaseService.getTutorApplications(tutor.id);

      if (applications.length === 0) {
        await ctx.reply(
          `📭 You haven't applied to any jobs yet.\n\n` +
          `Use /jobs to browse available opportunities!`
        );
        return;
      }

      await ctx.reply(
        `📝 <b>Your Applications (${applications.length})</b>\n\n` +
        applications.map((app, index) => {
          const date = new Date(app.createdAt);
          return `${index + 1}. Job ID: <code>${app.jobId}</code>\n` +
            `   Status: ${app.status}\n` +
            `   Applied: ${date.toLocaleDateString('en-SG')}`;
        }).join('\n\n'),
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error('Error in /myapplications:', error);
      await ctx.reply('❌ An error occurred. Please try again later.');
    }
  });

  // Handle menu buttons
  bot.hears('🔍 Browse Jobs', async (ctx) => {
    try {
      const jobs = await databaseService.getOpenJobs();

      if (jobs.length === 0) {
        await ctx.reply('📭 No open jobs available at the moment. Check back later!');
        return;
      }

      await ctx.reply(
        `📋 <b>Available Jobs (${jobs.length})</b>\n\n` +
        `Browse through all open tuition opportunities below:`,
        { parse_mode: 'HTML' }
      );

      // Send first 5 jobs with auto-delete
      const jobsToShow = jobs.slice(0, 5);
      for (const job of jobsToShow) {
        const telegramId = ctx.from?.id.toString();
        let hasApplied = false;

        if (telegramId) {
          const tutor = await databaseService.getTutorByTelegramId(telegramId);
          if (tutor) {
            hasApplied = await databaseService.hasApplied(tutor.id, job.id);
          }
        }

        const message = await ctx.reply(
          formatJobMessage(job),
          {
            parse_mode: 'HTML',
            ...getJobActionButtons(job.id, hasApplied),
          }
        );

        // Schedule auto-deletion
        scheduleMessageDeletion(ctx, message.message_id);
      }

      if (jobs.length > 5) {
        await ctx.reply(
          `... and ${jobs.length - 5} more jobs.\n\n` +
          `Use /search to find specific jobs with filters.`
        );
      }

      await ctx.reply(
        `⏱ <i>These messages will auto-delete in 10 minutes.</i>`,
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error('Error in Browse Jobs button:', error);
      await ctx.reply('❌ An error occurred while fetching jobs. Please try again later.');
    }
  });

  bot.hears('📝 My Applications', async (ctx) => {
    const telegramId = ctx.from.id.toString();

    try {
      const tutor = await databaseService.getTutorByTelegramId(telegramId);

      if (!tutor) {
        await ctx.reply('❌ Please link your account first using /link');
        return;
      }

      const applications = await databaseService.getTutorApplications(tutor.id);

      if (applications.length === 0) {
        await ctx.reply(
          `📭 You haven't applied to any jobs yet.\n\n` +
          `Use /jobs to browse available opportunities!`
        );
        return;
      }

      await ctx.reply(
        `📝 <b>Your Applications (${applications.length})</b>\n\n` +
        applications.map((app, index) => {
          const date = new Date(app.createdAt);
          return `${index + 1}. Job ID: <code>${app.jobId}</code>\n` +
            `   Status: ${app.status}\n` +
            `   Applied: ${date.toLocaleDateString('en-SG')}`;
        }).join('\n\n'),
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error('Error in My Applications button:', error);
      await ctx.reply('❌ An error occurred. Please try again later.');
    }
  });
}
