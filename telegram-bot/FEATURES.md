# TutorSG Telegram Bot - Feature Documentation

## Complete Feature List

### 🔐 Account Management

#### `/start` - Welcome & Introduction
- Shows welcome message with bot overview
- Detects if user is already linked
- Provides quick start instructions
- Shows main menu keyboard

#### `/link <email>` - Link TutorSG Account
- Links Telegram account to existing TutorSG tutor profile
- Validates email format
- Checks for existing registrations
- Prevents duplicate linkages
- Auto-enables notifications
- **Security**: Email-based verification, one Telegram per account

#### `/unlink` - Disconnect Account
- Removes Telegram linkage from tutor profile
- Confirmation dialog before unlinking
- Disables all notifications
- Clears session data
- Allows re-linking later

#### `/profile` - View Profile
- Displays complete tutor profile
- Shows current preferences (subjects, levels, locations)
- Shows hourly rate range
- Shows notification status
- Shows account status (Active/Pending/Suspended)

---

### 🔍 Job Discovery & Search

#### `/jobs` - Browse All Open Jobs
- Lists all currently open tuition opportunities
- Shows first 5 jobs with full details
- Each job includes:
  - Subject and education level
  - Hourly rate or monthly budget
  - Location with optional map link
  - Schedule and lessons per week
  - Gender preference (if any)
  - Job ID for reference
  - Posted date
- **Auto-delete**: Messages deleted after 10 minutes
- Action buttons: Apply, Forward, Details

#### `/search` - Smart Job Search
- **Syntax**: `/search subject:Math level:Secondary location:North`
- **Filters**:
  - `subject:` - Search by subject (e.g., Math, English, Science)
  - `level:` - Search by education level (e.g., Primary, JC)
  - `location:` - Search by area (e.g., North, Jurong)
- Supports multiple filters combined
- Shows condensed list followed by detailed view
- Displays up to 3 detailed results
- **Auto-delete**: Results deleted after 10 minutes
- Case-insensitive matching

#### Job Action Buttons

**Apply Now** ✅
- One-tap application submission
- Requires linked account
- Checks for duplicate applications
- Shows success confirmation
- Updates button to "Already Applied"

**Forward to Friend** 📤
- Share job with other Telegram users
- Includes full job details
- Helps build tutor community
- No account required to view forwarded jobs

**More Details** 🔍
- Shows extended job information
- Displays in separate message (not auto-deleted)
- Useful for saving job details

---

### 📝 Application Management

#### `/myapplications` - View Applications
- Lists all your job applications
- Shows for each application:
  - Job ID (clickable to view details)
  - Application status (Applied, Accepted, Rejected)
  - Application date
- Sorted by most recent first
- Empty state message if no applications

#### `/apply` - Quick Apply (via button)
- Instant application to any job
- Validates tutor account linkage
- Prevents duplicate applications
- Records application timestamp
- Sends confirmation message with job ID

---

### ⚙️ Preferences Management

#### `/preferences` - Manage Job Preferences
Interactive preference editor with inline keyboards:

**📚 Subjects**
- Multi-select from 14 common subjects:
  - Mathematics, English, Science
  - Physics, Chemistry, Biology
  - Chinese, Malay, Tamil
  - History, Geography, Literature
  - Economics, Accounting
- Toggle multiple subjects
- Visual checkmarks for selected items
- Saved immediately on "Done"

**🎓 Education Levels**
- Multi-select from all levels:
  - Primary 1-3, Primary 4-6
  - Secondary 1-2, Secondary 3-4, Secondary 5
  - JC 1-2, IB
  - University, Adult learners
- Select multiple levels
- Clear visual indicators
- Instant save

**📍 Locations**
- Select preferred teaching areas:
  - Regions: North, South, East, West, Central
  - Specific areas: Jurong, Woodlands, Tampines, Bedok, etc.
  - Online teaching option
- Multiple location support
- Helps match jobs near you

**💰 Hourly Rate Range**
- Set minimum and maximum rates
- Format: `min-max` (e.g., `30-80` for $30-$80/hour)
- Validates min < max
- Used for future rate filtering
- Stored as JSON in database

#### How It Works
1. Select preference type (Subject/Level/Location/Rate)
2. Toggle selections (multi-select supported)
3. Click "Done" to save
4. Preferences immediately active for job alerts
5. Edit anytime by running `/preferences` again

---

### 🔔 Notification System

#### `/notifications` - Toggle Alerts
- Shows current notification status (ON/OFF)
- One-tap toggle button
- Immediately enables/disables alerts
- Visual feedback (🔔 or 🔕)
- Confirmation message

#### Automated Job Alerts
**How It Works**:
1. Bot checks for new jobs hourly (configurable)
2. Compares each new job against tutor preferences
3. Sends personalized alerts to matching tutors
4. Includes up to 5 jobs per alert

**Matching Algorithm**:
- **Subjects**: Job subject matches any of tutor's subjects
- **Levels**: Job level matches any of tutor's levels
- **Locations**: Job location matches any of tutor's locations
- **All criteria must match** (AND logic)
- Empty preferences = receive all jobs

**Alert Format**:
```
🔔 New Job Alert!

We found 3 new jobs matching your preferences:

[Job 1 with Apply/Forward buttons]
[Job 2 with Apply/Forward buttons]
[Job 3 with Apply/Forward buttons]
```

**Frequency**:
- Default: Every hour (cron: `0 * * * *`)
- Configurable in `.env`
- Only sends if new jobs found
- Prevents duplicate alerts

---

### 🎯 Smart Features

#### Auto-Delete Messages
- Job search results auto-delete after 10 minutes
- Mimics Nanyang Tuition Bot behavior
- Keeps chat clean
- Privacy protection
- Countdown notification shown

#### Session Management
- In-memory session storage
- Tracks user state (linking, preferences editing)
- Preserves context across interactions
- Auto-clears on completion
- Session per user

#### Inline Keyboards
- Interactive buttons for all actions
- Real-time updates (checkboxes toggle)
- Prevents message spam
- Better UX than text commands
- Mobile-friendly

#### Duplicate Prevention
- Can't apply to same job twice
- One Telegram account per tutor
- Prevents accidental double-applications
- Clear feedback when already applied

---

### 👨‍💼 Admin Features

#### `/test_alert` - Send Test Alert (Admins Only)
- Manually trigger alert to yourself
- Tests notification system
- Shows jobs matching your preferences
- Useful for debugging
- Requires admin Telegram ID in config

#### `/trigger_alerts` - Manual Alert Check (Admins Only)
- Manually runs the job alert checker
- Sends alerts to all matching tutors
- Useful for testing or forcing updates
- Shows completion status
- Admin-only command

#### Admin Configuration
Add your Telegram ID to `.env`:
```env
ADMIN_TELEGRAM_IDS=123456789,987654321
```

Get your ID from [@userinfobot](https://t.me/userinfobot)

---

### 📱 User Interface

#### Main Menu Keyboard
Persistent keyboard with quick access:
- 🔍 Browse Jobs
- ⚙️ Preferences
- 📝 My Applications
- 👤 Profile
- 🔔 Notifications
- ❓ Help

#### Message Formatting
- **HTML formatting** for rich text
- **Bold** for headers and emphasis
- **Code blocks** for IDs and technical info
- **Links** for maps and references
- **Emojis** for visual clarity

#### Error Handling
- Clear error messages
- Helpful suggestions
- Fallback to safe state
- Logs errors for debugging
- User-friendly language

---

### 🔒 Security & Privacy

#### Account Security
- Email verification for linking
- No password storage in bot
- Telegram ID as unique identifier
- Can unlink anytime
- Session-based state management

#### Data Privacy
- Only stores necessary data
- Auto-deletes temporary messages
- No message history stored
- Complies with Telegram's privacy policy
- Secure database connections (SSL)

#### Rate Limiting
- Telegram's built-in rate limits
- Prevents spam
- 100ms delay between alert messages
- Graceful degradation

---

### 🚀 Performance Features

#### Database Optimization
- Indexed queries on `telegram_id`
- Efficient filtering with Drizzle ORM
- Connection pooling
- Parameterized queries (SQL injection safe)

#### Caching
- In-memory session storage
- Reduces database queries
- Fast response times

#### Scalability
- Stateless design (easy to scale horizontally)
- Cron-based alerts (decoupled from bot)
- Can switch to webhooks for high traffic

---

### 📊 Analytics (Future)

Potential metrics to track:
- Total users linked
- Daily active users
- Applications submitted
- Alert open rates
- Popular subjects/locations
- Bot command usage

---

### 🛠️ Developer Features

#### Logging
- Console logs for all major events
- Error tracking and stack traces
- Alert job execution logs
- Database query logging

#### Environment Configuration
- All settings via `.env` file
- Easy deployment across environments
- Secure credential management

#### Extensibility
- Modular handler structure
- Easy to add new commands
- Service-based architecture
- TypeScript for type safety

---

## Command Summary

| Command | Description | Auth Required |
|---------|-------------|---------------|
| `/start` | Start bot & show welcome | No |
| `/help` | Show help message | No |
| `/link <email>` | Link TutorSG account | No |
| `/unlink` | Disconnect account | Yes |
| `/profile` | View your profile | Yes |
| `/jobs` | Browse all jobs | No |
| `/search <filters>` | Search with filters | No |
| `/apply` | Apply to job (via button) | Yes |
| `/myapplications` | View your applications | Yes |
| `/preferences` | Manage preferences | Yes |
| `/notifications` | Toggle notifications | Yes |
| `/test_alert` | Test alert (admin) | Admin |
| `/trigger_alerts` | Manual alert check (admin) | Admin |

---

## Workflow Examples

### First-Time User
1. `/start` - See welcome message
2. `/link john@example.com` - Link account
3. `/preferences` - Set subjects, levels, locations
4. `/notifications` - Ensure alerts are ON
5. Wait for job alerts or browse with `/jobs`

### Applying to a Job
1. Receive alert or browse `/jobs`
2. Review job details
3. Click "Apply Now" button
4. Receive confirmation
5. Check `/myapplications` for status

### Updating Preferences
1. `/preferences` - Open preference menu
2. Select "Subjects" → Toggle new subjects
3. Select "Locations" → Add more areas
4. Click "Done" on each section
5. New preferences active immediately

---

This bot provides a complete tuition job discovery and application experience, optimized for mobile use on Telegram! 🎓
