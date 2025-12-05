# TutorSG Telegram Bot - Architecture Documentation

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Telegram Platform                        │
│                    (User Interface Layer)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Telegram Bot API
                           │ (Long Polling / Webhook)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TutorSG Telegram Bot                          │
│                      (Application Layer)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │   Telegraf  │  │   Handlers   │  │   Services          │   │
│  │  Framework  │→ │  - Auth      │→ │  - DatabaseService  │   │
│  │             │  │  - Jobs      │  │  - AlertService     │   │
│  │  Session    │  │  - Prefs     │  │                     │   │
│  │  Management │  │  - Notifs    │  │  Utilities          │   │
│  │             │  │  - Start     │  │  - Formatters       │   │
│  │  Middleware │  │              │  │  - Keyboards        │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
│                           │                    │                │
│                           │                    │                │
│  ┌────────────────────────┼────────────────────┘                │
│  │         Cron Scheduler (node-cron)                           │
│  │         ├─ Check new jobs every hour                         │
│  │         ├─ Match with tutor preferences                      │
│  │         └─ Send personalized alerts                          │
│  └──────────────────────────────────────────────────────────────│
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Drizzle ORM
                           │ (Type-safe queries)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database (Neon)                      │
│                      (Data Layer)                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌────────┐  ┌──────────────┐  ┌───────────────┐│
│  │  tutors  │  │  jobs  │  │ applications │  │ job_requests  ││
│  │          │  │        │  │              │  │               ││
│  │ +telegram│  │ +open  │  │ +tutor_id    │  │ +parent_info  ││
│  │  _id     │  │        │  │ +job_id      │  │               ││
│  │ +notif   │  │        │  │              │  │               ││
│  └──────────┘  └────────┘  └──────────────┘  └───────────────┘│
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ Shared Schema
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TutorSG Web Application                       │
│                  (Express + React Frontend)                      │
│  - Tutor registration                                            │
│  - Job posting (admin)                                           │
│  - Profile management                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Architecture

### 1. Handler Layer
**Purpose**: Process user commands and actions

```
src/handlers/
├── start.handler.ts       → /start, /help commands
├── auth.handler.ts        → /link, /unlink, /profile
├── jobs.handler.ts        → /jobs, /search, /apply
├── preferences.handler.ts → /preferences, preference editing
└── notifications.handler.ts → /notifications toggle
```

**Pattern**: Command Pattern
- Each handler registers specific commands/actions
- Handlers are stateless
- Context (session) passed to each handler

### 2. Service Layer
**Purpose**: Business logic and data operations

```
src/services/
├── database.service.ts    → Database CRUD operations
└── alert.service.ts       → Cron-based job alerts
```

**Pattern**: Service Pattern
- Encapsulates business logic
- Provides clean API for handlers
- Handles data transformation

### 3. Utility Layer
**Purpose**: Reusable helper functions

```
src/utils/
├── formatters.ts          → Message formatting, job cards
└── keyboards.ts           → Inline keyboards, buttons
```

**Pattern**: Utility/Helper Pattern
- Pure functions
- No side effects
- Reusable across handlers

---

## 🔄 Data Flow

### User Command Flow
```
User sends /jobs
    ↓
Telegraf receives update
    ↓
Session middleware (load session)
    ↓
Handler: jobs.handler.ts
    ↓
Service: databaseService.getOpenJobs()
    ↓
Database query via Drizzle ORM
    ↓
PostgreSQL returns jobs
    ↓
Formatter: formatJobMessage(job)
    ↓
Keyboard: getJobActionButtons(jobId)
    ↓
Send message to user with auto-delete timer
    ↓
Session middleware (save session)
```

### Job Alert Flow
```
Cron triggers (every hour)
    ↓
AlertService.checkAndSendAlerts()
    ↓
Get jobs from last hour
    ↓
Get all tutors with notifications ON
    ↓
For each tutor:
    ├─ Get matching jobs based on preferences
    ├─ If matches found:
    │   ├─ Format job messages
    │   └─ Send via bot.telegram.sendMessage()
    └─ Add delay (100ms) to avoid rate limits
    ↓
Log completion
```

### Preference Update Flow
```
User clicks "Subjects" button
    ↓
Handler: preferences.handler.ts
    ↓
Load current selections from session
    ↓
Display subject keyboard with checkmarks
    ↓
User toggles subjects
    ↓
Update session (temporary storage)
    ↓
User clicks "Done"
    ↓
Service: databaseService.updateTutorPreferences()
    ↓
Save to database
    ↓
Clear session.selectedPreferences
    ↓
Show success message
```

---

## 🗄️ Database Schema

### Tutors Table (Updated)
```sql
CREATE TABLE tutors (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,

  -- Existing fields
  subjects TEXT[] DEFAULT ARRAY[]::TEXT[],
  levels TEXT[] DEFAULT ARRAY[]::TEXT[],
  locations TEXT[] DEFAULT ARRAY[]::TEXT[],
  hourly_rates JSON,

  -- NEW: Telegram integration fields
  telegram_id TEXT UNIQUE,              -- Links to Telegram user
  telegram_username TEXT,                -- Optional username
  notifications_enabled BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tutors_telegram_id ON tutors(telegram_id);
CREATE INDEX idx_tutors_notifications ON tutors(notifications_enabled)
  WHERE notifications_enabled = true;
```

### Jobs Table
```sql
CREATE TABLE jobs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  level TEXT NOT NULL,
  rate TEXT NOT NULL,
  location TEXT NOT NULL,
  gender_pref TEXT,
  schedule TEXT,
  lessons_per_week INTEGER,
  status TEXT DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Applications Table
```sql
CREATE TABLE applications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id VARCHAR REFERENCES tutors(id),
  job_id VARCHAR REFERENCES jobs(id),
  status TEXT DEFAULT 'Applied',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Session Management

### Session Structure
```typescript
interface SessionData {
  tutor?: Tutor;                    // Cached tutor profile
  linkingEmail?: string;            // Email during link process
  awaitingInput?: {                 // Awaiting user text input
    type: 'email' | 'rate';
    data?: any;
  };
  selectedPreferences?: {           // Temporary preference edits
    subjects?: string[];
    levels?: string[];
    locations?: string[];
  };
}
```

### Session Storage
- **Development**: In-memory (default)
- **Production**: Redis recommended for scaling
- **Lifetime**: Until bot restart (in-memory)
- **Per-user**: Isolated by Telegram user ID

---

## ⚡ Performance Optimizations

### 1. Database Indexing
```sql
-- Fast lookups by Telegram ID
CREATE INDEX idx_tutors_telegram_id ON tutors(telegram_id);

-- Fast filtering for alert job
CREATE INDEX idx_tutors_notifications ON tutors(notifications_enabled)
  WHERE notifications_enabled = true;
```

### 2. Query Optimization
```typescript
// Only fetch needed fields
.select({
  id: tutors.id,
  telegramId: tutors.telegramId,
  subjects: tutors.subjects,
  levels: tutors.levels,
  locations: tutors.locations,
})

// Use WHERE clauses efficiently
.where(
  and(
    eq(tutors.notificationsEnabled, true),
    isNotNull(tutors.telegramId)
  )
)
```

### 3. Message Throttling
```typescript
// Delay between bulk messages
await new Promise(resolve => setTimeout(resolve, 100));
```

### 4. Auto-Delete Queue
```typescript
// Track messages for deletion
const messageDeleteQueue = new Map<number, NodeJS.Timeout>();

// Schedule deletion
setTimeout(() => {
  ctx.telegram.deleteMessage(chatId, messageId);
}, config.autoDeleteTimeout);
```

---

## 🔒 Security Architecture

### Authentication
```
User                  Bot                Database
  |                    |                     |
  |--- /link email --->|                     |
  |                    |--- Check email ---->|
  |                    |<--- Tutor found ----|
  |                    |                     |
  |                    |--- Link telegram -->|
  |<--- Confirmed -----|                     |
```

### Authorization Checks
```typescript
// Require linked account
const tutor = await databaseService.getTutorByTelegramId(telegramId);
if (!tutor) {
  return ctx.reply('Please link your account first');
}

// Admin-only commands
if (!config.telegram.adminIds.includes(telegramId)) {
  return ctx.reply('Admin only');
}
```

### Data Protection
- No passwords stored in bot
- Telegram ID is unique identifier
- Database uses SSL/TLS (Neon)
- Parameterized queries (SQL injection safe)
- Environment variables for secrets

---

## 📊 Scalability Considerations

### Current Architecture (Up to 1,000 tutors)
- ✅ Single bot instance
- ✅ In-memory sessions
- ✅ Long polling
- ✅ Direct database connection

### Medium Scale (1,000 - 10,000 tutors)
- 🔄 Switch to webhooks
- 🔄 Add Redis for sessions
- 🔄 Database connection pooling
- 🔄 Separate alert worker

### Large Scale (10,000+ tutors)
- 🔄 Multiple bot instances (load balancing)
- 🔄 Job queue (Bull/BullMQ)
- 🔄 Database read replicas
- 🔄 CDN for media files
- 🔄 Monitoring & alerting (Datadog, Sentry)

---

## 🧩 Design Patterns Used

### 1. Command Pattern
Handlers process specific commands independently.

### 2. Service Pattern
Business logic separated from handlers.

### 3. Singleton Pattern
```typescript
export const databaseService = new DatabaseService();
```

### 4. Factory Pattern
```typescript
function getMainMenuKeyboard() {
  return Markup.keyboard([...]);
}
```

### 5. Strategy Pattern
Different formatters for different message types.

---

## 🔄 State Management

### Bot State
```typescript
// Global state
const alertService = new AlertService(bot);
const messageDeleteQueue = new Map();

// Per-user state (session)
ctx.session.tutor = ...;
ctx.session.selectedPreferences = ...;
```

### Session Lifecycle
```
User sends command
    ↓
Load session (if exists)
    ↓
Process command (may modify session)
    ↓
Save session
    ↓
Respond to user
```

---

## 🎯 Error Handling Strategy

### Levels of Error Handling

**1. Handler Level**
```typescript
try {
  await processCommand();
} catch (error) {
  console.error('Error in handler:', error);
  await ctx.reply('An error occurred');
}
```

**2. Service Level**
```typescript
async getTutorByTelegramId(id: string) {
  try {
    return await db.select()...;
  } catch (error) {
    console.error('Database error:', error);
    throw error; // Re-throw for handler
  }
}
```

**3. Global Level**
```typescript
bot.catch((err, ctx) => {
  console.error('Unhandled error:', err);
  ctx.reply('Unexpected error').catch(console.error);
});
```

---

## 📈 Monitoring Points

### Application Metrics
- Bot uptime
- Commands processed per minute
- Active sessions count
- Error rate
- Response time

### Business Metrics
- Total linked tutors
- Jobs browsed per day
- Applications submitted
- Alert open rate
- Notification engagement

### Infrastructure Metrics
- Memory usage
- CPU usage
- Database connections
- Network latency

---

## 🔧 Configuration Management

### Environment-Based Config
```typescript
export const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    adminIds: process.env.ADMIN_TELEGRAM_IDS?.split(','),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  cron: {
    jobAlertSchedule: process.env.JOB_ALERT_CRON,
  },
};
```

### Validation
```typescript
if (!config.telegram.botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN required');
}
```

---

## 🚀 Deployment Architecture

### Development
```
Local Machine
    ├─ npm run dev (tsx watch)
    ├─ In-memory sessions
    ├─ Console logging
    └─ Long polling
```

### Production (PM2)
```
Server (VPS/Cloud)
    ├─ PM2 process manager
    ├─ Auto-restart on failure
    ├─ Log rotation
    ├─ Clustering (optional)
    └─ Monitoring dashboard
```

### Production (Docker)
```
Container
    ├─ Node.js 18 Alpine
    ├─ Built TypeScript
    ├─ Environment variables
    └─ Health checks
```

---

## 🧪 Testing Strategy (Future)

### Unit Tests
- Service methods
- Formatter functions
- Keyboard generators

### Integration Tests
- Database operations
- Alert matching logic
- Cron scheduling

### E2E Tests
- Command flows
- Preference updates
- Application process

---

## 📚 Technology Decisions

### Why Telegraf?
- ✅ Most popular Telegram framework for Node.js
- ✅ TypeScript support
- ✅ Middleware system
- ✅ Active community

### Why Drizzle ORM?
- ✅ Type-safe queries
- ✅ Already used in main app
- ✅ Performance (no runtime overhead)
- ✅ Excellent TypeScript integration

### Why node-cron?
- ✅ Simple and lightweight
- ✅ Cron syntax (familiar)
- ✅ No external dependencies
- ✅ Works in-process

### Why Long Polling?
- ✅ Easier to set up
- ✅ No webhook endpoint needed
- ✅ Works behind NAT/firewall
- ✅ Good for low-medium traffic

---

This architecture provides a solid foundation that's easy to understand, maintain, and scale! 🏗️
