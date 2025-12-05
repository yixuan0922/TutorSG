import { Markup } from 'telegraf';

/**
 * Main menu keyboard
 */
export function getMainMenuKeyboard() {
  return Markup.keyboard([
    ['🔍 Browse Jobs', '⚙️ Preferences'],
    ['📝 My Applications', '👤 Profile'],
    ['🔔 Notifications', '❓ Help'],
  ])
    .resize()
    .persistent();
}

/**
 * Job action buttons (inline)
 */
export function getJobActionButtons(jobId: string, hasApplied: boolean = false) {
  const buttons = [];

  if (!hasApplied) {
    buttons.push(Markup.button.callback('✅ Apply Now', `apply_${jobId}`));
  } else {
    buttons.push(Markup.button.callback('✓ Already Applied', `applied_${jobId}`));
  }

  buttons.push(Markup.button.callback('📤 Forward to Friend', `forward_${jobId}`));
  buttons.push(Markup.button.callback('🔍 More Details', `details_${jobId}`));

  return Markup.inlineKeyboard([
    buttons.slice(0, 2),
    buttons.slice(2),
  ]);
}

/**
 * Confirmation keyboard
 */
export function getConfirmationKeyboard(action: string, data: string) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Yes', `confirm_${action}_${data}`),
      Markup.button.callback('❌ No', `cancel_${action}`),
    ],
  ]);
}

/**
 * Notifications toggle keyboard
 */
export function getNotificationToggleKeyboard(currentlyEnabled: boolean) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        currentlyEnabled ? '🔕 Turn OFF' : '🔔 Turn ON',
        `toggle_notifications_${!currentlyEnabled}`
      ),
    ],
  ]);
}

/**
 * Preference selection keyboard
 */
export function getPreferenceTypeKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📚 Subjects', 'pref_subjects')],
    [Markup.button.callback('🎓 Levels', 'pref_levels')],
    [Markup.button.callback('📍 Locations', 'pref_locations')],
    [Markup.button.callback('💰 Hourly Rate', 'pref_rate')],
    [Markup.button.callback('✅ Done', 'pref_done')],
  ]);
}

/**
 * Subject selection keyboard
 */
export function getSubjectKeyboard(selectedSubjects: string[] = []) {
  const subjects = [
    'Mathematics', 'English', 'Science', 'Physics', 'Chemistry',
    'Biology', 'Chinese', 'Malay', 'Tamil', 'History',
    'Geography', 'Literature', 'Economics', 'Accounting',
  ];

  const buttons = subjects.map(subject => {
    const isSelected = selectedSubjects.includes(subject);
    return [
      Markup.button.callback(
        `${isSelected ? '✅' : '⬜'} ${subject}`,
        `subject_${subject}`
      ),
    ];
  });

  buttons.push([Markup.button.callback('✅ Done', 'subject_done')]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * Level selection keyboard
 */
export function getLevelKeyboard(selectedLevels: string[] = []) {
  const levels = [
    'Primary 1-3', 'Primary 4-6', 'Secondary 1-2',
    'Secondary 3-4', 'Secondary 5', 'JC 1-2',
    'IB', 'University', 'Adult',
  ];

  const buttons = levels.map(level => {
    const isSelected = selectedLevels.includes(level);
    return [
      Markup.button.callback(
        `${isSelected ? '✅' : '⬜'} ${level}`,
        `level_${level}`
      ),
    ];
  });

  buttons.push([Markup.button.callback('✅ Done', 'level_done')]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * Location selection keyboard
 */
export function getLocationKeyboard(selectedLocations: string[] = []) {
  const locations = [
    'North', 'South', 'East', 'West', 'Central',
    'Jurong', 'Woodlands', 'Tampines', 'Bedok',
    'Clementi', 'Bishan', 'Ang Mo Kio', 'Online',
  ];

  const buttons = locations.map(location => {
    const isSelected = selectedLocations.includes(location);
    return [
      Markup.button.callback(
        `${isSelected ? '✅' : '⬜'} ${location}`,
        `location_${location}`
      ),
    ];
  });

  buttons.push([Markup.button.callback('✅ Done', 'location_done')]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * Pagination keyboard
 */
export function getPaginationKeyboard(
  currentPage: number,
  totalPages: number,
  prefix: string
) {
  const buttons = [];

  if (currentPage > 0) {
    buttons.push(Markup.button.callback('⬅️ Previous', `${prefix}_page_${currentPage - 1}`));
  }

  buttons.push(Markup.button.callback(`${currentPage + 1}/${totalPages}`, 'page_info'));

  if (currentPage < totalPages - 1) {
    buttons.push(Markup.button.callback('➡️ Next', `${prefix}_page_${currentPage + 1}`));
  }

  return Markup.inlineKeyboard([buttons]);
}

/**
 * Application confirmation keyboard
 */
export function getApplicationConfirmKeyboard(jobId: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ Confirm & Continue', `confirm_apply_${jobId}`)],
    [Markup.button.callback('❌ Cancel Application', 'cancel_apply')],
  ]);
}

/**
 * Personalized message options keyboard
 */
export function getPersonalizedMessageKeyboard(jobId: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✍️ Write Custom Message', `write_message_${jobId}`)],
    [Markup.button.callback('➡️ Skip & Submit', `skip_message_${jobId}`)],
    [Markup.button.callback('❌ Cancel', 'cancel_apply')],
  ]);
}

/**
 * Cancel/Back keyboard
 */
export function getCancelKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('❌ Cancel', 'cancel')],
  ]);
}

/**
 * Remove keyboard
 */
export function removeKeyboard() {
  return Markup.removeKeyboard();
}
