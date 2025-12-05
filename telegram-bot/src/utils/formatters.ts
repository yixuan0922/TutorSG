import type { Job, Tutor } from '../../../shared/schema.js';

/**
 * Format a job posting for Telegram message
 */
export function formatJobMessage(job: Job, includeApplyButton: boolean = true): string {
  const lines = [
    `📚 <b>${job.subject}</b> | ${job.level}`,
    ``,
    `💰 Rate: ${job.rate}`,
    `📍 Location: ${job.location}`,
  ];

  if (job.schedule) {
    lines.push(`🗓 Schedule: ${job.schedule}`);
  }

  if (job.lessonsPerWeek) {
    lines.push(`📅 Lessons: ${job.lessonsPerWeek}x per week`);
  }

  if (job.genderPref) {
    lines.push(`👤 Preference: ${job.genderPref} tutor`);
  }

  if (job.specialRequests) {
    lines.push(``);
    lines.push(`⭐ <b>Special Requirements:</b>`);
    lines.push(`${job.specialRequests}`);
  }

  if (job.mapUrl) {
    lines.push(`🗺 <a href="${job.mapUrl}">View on Map</a>`);
  }

  lines.push(``);
  lines.push(`🆔 Job ID: <code>${job.id}</code>`);

  const date = new Date(job.createdAt);
  lines.push(`📅 Posted: ${date.toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })}`);

  return lines.join('\n');
}

/**
 * Format tutor profile summary
 */
export function formatTutorProfile(tutor: Tutor): string {
  const lines = [
    `👤 <b>${tutor.name}</b>`,
    ``,
    `📧 Email: ${tutor.email}`,
    `📱 Mobile: ${tutor.mobile}`,
  ];

  if (tutor.subjects.length > 0) {
    lines.push(`📚 Subjects: ${tutor.subjects.join(', ')}`);
  }

  if (tutor.levels.length > 0) {
    lines.push(`🎓 Levels: ${tutor.levels.join(', ')}`);
  }

  if (tutor.locations.length > 0) {
    lines.push(`📍 Locations: ${tutor.locations.join(', ')}`);
  }

  if (tutor.hourlyRates) {
    lines.push(`💰 Rate: $${tutor.hourlyRates.min} - $${tutor.hourlyRates.max}/hr`);
  }

  if (tutor.experienceYears) {
    lines.push(`⏱ Experience: ${tutor.experienceYears} years`);
  }

  lines.push(``);
  lines.push(`🔔 Notifications: ${tutor.notificationsEnabled ? 'ON ✅' : 'OFF ❌'}`);
  lines.push(`📊 Status: ${tutor.status}`);

  return lines.join('\n');
}

/**
 * Format job list (condensed view)
 */
export function formatJobList(jobs: Job[]): string {
  if (jobs.length === 0) {
    return '❌ No matching jobs found.';
  }

  const lines = [`📋 <b>Found ${jobs.length} job(s):</b>`, ``];

  jobs.slice(0, 20).forEach((job, index) => {
    lines.push(
      `${index + 1}. ${job.subject} (${job.level}) - ${job.location}`,
      `   💰 ${job.rate}`,
      `   🆔 <code>${job.id}</code>`,
      ``
    );
  });

  if (jobs.length > 20) {
    lines.push(`... and ${jobs.length - 20} more jobs`);
  }

  return lines.join('\n');
}

/**
 * Create welcome message
 */
export function getWelcomeMessage(tutorName?: string): string {
  const greeting = tutorName ? `Hello ${tutorName}! 👋` : 'Welcome to TutorSG! 👋';

  return `${greeting}

I'm your personal tuition job assistant. I can help you:

🔍 <b>Search Jobs</b> - Find tuition opportunities
🔔 <b>Get Alerts</b> - Receive job notifications based on your preferences
📝 <b>Quick Apply</b> - Apply to jobs instantly
⚙️ <b>Manage Settings</b> - Update your preferences

<b>Getting Started:</b>
1️⃣ Link your account using /link
2️⃣ Set up your job preferences
3️⃣ Start receiving personalized job alerts!

Use the menu below or type /help to see all commands.`;
}

/**
 * Format help message
 */
export function getHelpMessage(): string {
  return `<b>📖 Available Commands:</b>

<b>🔐 Account</b>
/start - Start the bot
/link - Link your TutorSG account
/profile - View your profile
/unlink - Unlink your account

<b>🔍 Jobs</b>
/jobs - Browse all open jobs
/search - Search jobs with filters
/apply - Apply for a job
/myapplications - View your applications

<b>⚙️ Settings</b>
/preferences - Manage job preferences
/notifications - Toggle notifications ON/OFF
/help - Show this help message

<b>💡 Tips:</b>
• Set your preferences to get relevant job alerts
• Jobs are posted daily by parents and admins
• Apply quickly to increase your chances!

Need assistance? Contact our support team.`;
}

/**
 * Escape special characters for Telegram HTML
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Truncate text to max length
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format tutor profile for application confirmation
 */
export function formatTutorApplicationProfile(tutor: Tutor): string {
  const lines = [
    `<b>📋 Your Application Profile:</b>`,
    ``,
    `👤 <b>Name:</b> ${tutor.name}`,
    `📱 <b>Contact:</b> ${tutor.mobile}`,
  ];

  if (tutor.subjects.length > 0) {
    lines.push(`📚 <b>Subjects:</b> ${tutor.subjects.join(', ')}`);
  }

  if (tutor.levels.length > 0) {
    lines.push(`🎓 <b>Levels:</b> ${tutor.levels.join(', ')}`);
  }

  if (tutor.experienceYears) {
    lines.push(`⏱ <b>Experience:</b> ${tutor.experienceYears} years`);
  }

  if (tutor.education) {
    lines.push(`🎓 <b>Education:</b> ${tutor.education}`);
  }

  if (tutor.hourlyRates) {
    lines.push(`💰 <b>Rate:</b> $${tutor.hourlyRates.min} - $${tutor.hourlyRates.max}/hr`);
  }

  if (tutor.introduction) {
    lines.push(``);
    lines.push(`<b>About Me:</b>`);
    lines.push(truncate(tutor.introduction, 200));
  }

  return lines.join('\n');
}
