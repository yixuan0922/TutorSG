import cron from 'node-cron';
import { Telegraf } from 'telegraf';
import type { BotContext } from '../types/context.js';
import { databaseService } from './database.service.js';
import { formatJobMessage } from '../utils/formatters.js';
import { getJobActionButtons } from '../utils/keyboards.js';
import { config } from '../config.js';

export class AlertService {
  private bot: Telegraf<BotContext>;
  private cronJob: cron.ScheduledTask | null = null;
  private lastCheckedTime: Date;

  constructor(bot: Telegraf<BotContext>) {
    this.bot = bot;
    this.lastCheckedTime = new Date();
  }

  /**
   * Start the job alert cron service
   */
  start() {
    console.log(`📅 Starting job alert service with schedule: ${config.cron.jobAlertSchedule}`);

    this.cronJob = cron.schedule(config.cron.jobAlertSchedule, async () => {
      await this.checkAndSendAlerts();
    });

    console.log('✅ Job alert service started');
  }

  /**
   * Stop the cron service
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('⏹ Job alert service stopped');
    }
  }

  /**
   * Check for new jobs and send alerts to matching tutors
   */
  async checkAndSendAlerts() {
    try {
      console.log('🔍 Checking for new jobs to alert tutors...');

      // Calculate time since last check (with 5 minute buffer to ensure we don't miss jobs)
      const now = new Date();
      const timeSinceLastCheck = (now.getTime() - this.lastCheckedTime.getTime()) / (1000 * 60 * 60); // hours
      const hoursToCheck = Math.max(1, Math.ceil(timeSinceLastCheck) + 0.1);

      // Get new jobs posted since last check
      const newJobs = await databaseService.getRecentJobs(hoursToCheck);

      if (newJobs.length === 0) {
        console.log('📭 No new jobs found');
        this.lastCheckedTime = now;
        return;
      }

      console.log(`📬 Found ${newJobs.length} new job(s)`);

      // Get all tutors with notifications enabled
      const tutors = await databaseService.getTutorsWithNotifications();

      if (tutors.length === 0) {
        console.log('👥 No tutors with notifications enabled');
        this.lastCheckedTime = now;
        return;
      }

      console.log(`👥 Checking ${tutors.length} tutor(s) for matches...`);

      let alertsSent = 0;

      // For each tutor, find matching jobs
      for (const tutor of tutors) {
        if (!tutor.telegramId) continue;

        const matchingJobs = await databaseService.getMatchingJobs(tutor);
        const newMatchingJobs = matchingJobs.filter(job =>
          newJobs.some(newJob => newJob.id === job.id)
        );

        if (newMatchingJobs.length === 0) continue;

        // Send alert to tutor
        try {
          await this.sendJobAlert(tutor.telegramId, newMatchingJobs);
          alertsSent++;
          console.log(`✅ Sent ${newMatchingJobs.length} job alert(s) to ${tutor.name}`);
        } catch (error) {
          console.error(`❌ Failed to send alert to ${tutor.name}:`, error);
        }
      }

      console.log(`✨ Job alert check complete. Sent alerts to ${alertsSent} tutor(s)`);
      this.lastCheckedTime = now;
    } catch (error) {
      console.error('❌ Error in checkAndSendAlerts:', error);
    }
  }

  /**
   * Send job alerts to a specific tutor
   */
  private async sendJobAlert(telegramId: string, jobs: any[]) {
    if (jobs.length === 0) return;

    const chatId = parseInt(telegramId);

    // Send header message
    await this.bot.telegram.sendMessage(
      chatId,
      `🔔 <b>New Job Alert!</b>\n\n` +
      `We found ${jobs.length} new job${jobs.length > 1 ? 's' : ''} matching your preferences:`,
      { parse_mode: 'HTML' }
    );

    // Send each job
    for (const job of jobs.slice(0, 5)) { // Limit to 5 jobs per alert
      const hasApplied = await databaseService.hasApplied(
        (await databaseService.getTutorByTelegramId(telegramId))?.id || '',
        job.id
      );

      await this.bot.telegram.sendMessage(
        chatId,
        formatJobMessage(job),
        {
          parse_mode: 'HTML',
          ...getJobActionButtons(job.id, hasApplied),
        }
      );

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (jobs.length > 5) {
      await this.bot.telegram.sendMessage(
        chatId,
        `... and ${jobs.length - 5} more job(s).\n\nUse /jobs to see all available jobs.`,
        { parse_mode: 'HTML' }
      );
    }
  }

  /**
   * Manually trigger alert check (for testing)
   */
  async triggerManualCheck() {
    console.log('🔄 Manual alert check triggered');
    await this.checkAndSendAlerts();
  }

  /**
   * Send a test alert to a specific tutor
   */
  async sendTestAlert(telegramId: string) {
    try {
      const tutor = await databaseService.getTutorByTelegramId(telegramId);
      if (!tutor) {
        throw new Error('Tutor not found');
      }

      const matchingJobs = await databaseService.getMatchingJobs(tutor);

      if (matchingJobs.length === 0) {
        await this.bot.telegram.sendMessage(
          parseInt(telegramId),
          `🔍 No jobs currently match your preferences.\n\n` +
          `Try updating your preferences with /preferences to receive more job alerts.`
        );
        return;
      }

      await this.sendJobAlert(telegramId, matchingJobs.slice(0, 3));
      console.log(`✅ Test alert sent to ${tutor.name}`);
    } catch (error) {
      console.error('❌ Error sending test alert:', error);
      throw error;
    }
  }
}
