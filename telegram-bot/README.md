# TutorSG Telegram Bot

A comprehensive Telegram bot for the TutorSG tuition platform that allows tutors to browse jobs, receive personalized alerts, and apply to tuition opportunities directly from Telegram.

## Features

### 🔐 Account Management
- **Link Account**: Connect your TutorSG web account to Telegram
- **Profile View**: View your tutor profile and settings
- **Secure Authentication**: Email-based account linking

### 🔍 Job Discovery
- **Browse Jobs**: View all open tuition opportunities
- **Smart Search**: Search jobs by subject, level, and location
- **Auto-Delete**: Job listings auto-delete after 10 minutes for privacy
- **Quick Apply**: Apply to jobs with one tap

### 🔔 Smart Alerts
- **Personalized Notifications**: Receive alerts for jobs matching your preferences
- **Automated Checks**: Hourly job scanning (configurable)
- **Preference-Based Filtering**: Only get relevant opportunities

### ⚙️ Preferences Management
- **Subject Selection**: Choose subjects you can teach
- **Level Selection**: Select education levels (Primary, Secondary, JC, etc.)
- **Location Preferences**: Set preferred teaching locations
- **Rate Settings**: Define your hourly rate range

## Architecture

```
telegram-bot/
├── src/
│   ├── handlers/          # Command and action handlers
│   │   ├── start.handler.ts
│   │   ├── auth.handler.ts
│   │   ├── jobs.handler.ts
│   │   ├── preferences.handler.ts
│   │   └── notifications.handler.ts
│   ├── services/          # Business logic services
│   │   ├── database.service.ts
│   │   └── alert.service.ts
│   ├── utils/             # Utility functions
│   │   ├── formatters.ts
│   │   └── keyboards.ts
│   ├── types/             # TypeScript type definitions
│   │   └── context.ts
│   ├── config.ts          # Configuration management
│   ├── db.ts              # Database connection
│   └── index.ts           # Main entry point
├── migrations/            # Database migrations
│   └── add_telegram_fields.sql
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Neon or local)
- Telegram Bot Token from [@BotFather](https://t.me/botfather)
- Existing TutorSG web application

### 2. Create Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow the instructions
3. Choose a name and username for your bot
4. Save the **Bot Token** provided by BotFather
5. Configure your bot:
   ```
   /setdescription - Set bot description
   /setabouttext - Set about text
   /setuserpic - Upload bot profile picture
   /setcommands - Set bot commands (see below)
   ```

### 3. Set Bot Commands (Optional)

Send this to BotFather using `/setcommands`:

```
start - Start the bot
help - Show help message
link - Link your TutorSG account
unlink - Unlink your account
profile - View your profile
jobs - Browse all open jobs
search - Search jobs with filters
apply - Apply for a job
myapplications - View your applications
preferences - Manage job preferences
notifications - Toggle notifications
```

### 4. Database Migration

Run the migration to add Telegram fields to your database:

```bash
# If using Neon, connect via psql or use Neon's SQL Editor
psql $DATABASE_URL -f migrations/add_telegram_fields.sql

# Or run directly in Neon SQL Editor:
# Copy and paste the contents of migrations/add_telegram_fields.sql
```

### 5. Install Dependencies

```bash
cd telegram-bot
npm install
```

### 6. Environment Configuration

Create a `.env` file in the `telegram-bot` directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Telegram Bot Token (from BotFather)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Database URL (same as your main app)
DATABASE_URL=postgresql://user:password@host/database

# Web App URL (for deep links)
WEB_APP_URL=http://localhost:3000

# Admin Telegram IDs (comma-separated)
# Get your Telegram ID from @userinfobot
ADMIN_TELEGRAM_IDS=123456789

# Job Alert Schedule (cron format)
# Default: every hour at minute 0
JOB_ALERT_CRON=0 * * * *

# Auto-delete timeout (milliseconds)
# Default: 10 minutes
AUTO_DELETE_TIMEOUT=600000
```

### 7. Development

Start the bot in development mode with auto-reload:

```bash
npm run dev
```

### 8. Production

Build and run in production:

```bash
npm run build
npm start
```

## Database Schema Changes

The bot adds these fields to the `tutors` table:

| Field | Type | Description |
|-------|------|-------------|
| `telegram_id` | TEXT (UNIQUE) | Telegram user ID |
| `telegram_username` | TEXT | Telegram username (optional) |
| `notifications_enabled` | BOOLEAN | Whether job alerts are enabled |

## Usage Guide

### For Tutors

#### Getting Started
1. Start the bot: `/start`
2. Link your account: `/link your@email.com`
3. Set preferences: `/preferences`
4. Enable notifications: `/notifications`

#### Browsing Jobs
- View all jobs: `/jobs` or 🔍 Browse Jobs button
- Search jobs: `/search subject:Math level:Secondary`
- Apply to job: Click "Apply Now" on any job listing
- View applications: `/myapplications`

#### Managing Preferences
1. Use `/preferences` command
2. Select what to update (Subjects, Levels, Locations, Rate)
3. Toggle selections and click Done
4. Preferences are saved automatically

#### Notifications
- Toggle: `/notifications` or 🔔 Notifications button
- Test: Admins can use `/test_alert` to send a test notification
- Alerts are sent hourly based on your preferences

### For Administrators

#### Admin Commands
- `/test_alert` - Send test alert to yourself
- `/trigger_alerts` - Manually trigger alert check for all tutors

#### Configuration
- Modify `JOB_ALERT_CRON` in `.env` to change alert frequency
- Add your Telegram ID to `ADMIN_TELEGRAM_IDS` for admin access

## Deployment

### Deploy to Production Server

1. **Clone repository on server**
   ```bash
   git clone <your-repo>
   cd telegram-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

4. **Run database migration**
   ```bash
   psql $DATABASE_URL -f migrations/add_telegram_fields.sql
   ```

5. **Build and start**
   ```bash
   npm run build
   npm start
   ```

### Using Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start bot
pm2 start dist/index.js --name tutorsg-bot

# Auto-restart on server reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs tutorsg-bot

# Restart after updates
pm2 restart tutorsg-bot
```

### Using Docker (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t tutorsg-bot .
docker run -d --env-file .env --name tutorsg-bot tutorsg-bot
```

## Troubleshooting

### Bot not responding
- Check if bot is running: `pm2 status`
- View logs: `pm2 logs tutorsg-bot`
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check network connectivity

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check if migration was run successfully
- Ensure database is accessible from bot server

### Notifications not working
1. Verify cron schedule is correct
2. Check logs for alert service errors
3. Ensure tutors have:
   - Linked their accounts
   - Enabled notifications
   - Set preferences

### Jobs not matching
- Check tutor preferences are set
- Verify job data has correct subjects/levels/locations
- Check case sensitivity in matching logic

## API Integration

The bot uses your existing TutorSG database and shares the same schema. No additional API endpoints are required as it connects directly to PostgreSQL using Drizzle ORM.

### Shared Components
- Database schema: `../shared/schema.ts`
- Database connection: Uses same Neon PostgreSQL
- Data models: Drizzle ORM with type safety

## Security Considerations

1. **Bot Token**: Keep `TELEGRAM_BOT_TOKEN` secret
2. **Database**: Use read-replica for production if possible
3. **Rate Limiting**: Telegram has built-in rate limits
4. **Input Validation**: All user inputs are validated
5. **SQL Injection**: Protected by Drizzle ORM parameterized queries

## Performance

- **Polling**: Uses long polling for real-time updates
- **Session Storage**: In-memory sessions (use Redis for production)
- **Database Queries**: Optimized with indexes on `telegram_id`
- **Alert Frequency**: Configurable via `JOB_ALERT_CRON`

## Future Enhancements

- [ ] Job recommendations using ML
- [ ] Group chat support for tutor communities
- [ ] Payment integration via Telegram Payments
- [ ] Parent-side bot for posting jobs
- [ ] Multi-language support (English, Chinese, Malay)
- [ ] Analytics dashboard for admins
- [ ] Push notifications for application status updates

## Support

For issues and questions:
- Check logs: `pm2 logs tutorsg-bot`
- Review documentation
- Contact platform administrators

## License

Same as TutorSG main application
