# Quick Start Guide - TutorSG Telegram Bot

Get your Telegram bot up and running in 5 minutes!

## ⚡ Quick Setup

### Step 1: Create Your Bot (2 minutes)

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send: `/newbot`
3. Name your bot: `TutorSG Jobs Bot`
4. Choose username: `TutorSGJobsBot` (must end with 'bot')
5. **Copy the bot token** - you'll need it next!

### Step 2: Configure Environment (1 minute)

```bash
cd telegram-bot
cp .env.example .env
```

Edit `.env` and add your bot token:
```env
TELEGRAM_BOT_TOKEN=paste_your_token_here
DATABASE_URL=copy_from_main_app_env
```

### Step 3: Setup Database (1 minute)

Run the migration to add Telegram fields:

**Option A - Using psql:**
```bash
psql $DATABASE_URL -f migrations/add_telegram_fields.sql
```

**Option B - Using Neon Dashboard:**
1. Go to [Neon Console](https://console.neon.tech)
2. Open SQL Editor
3. Copy/paste contents of `migrations/add_telegram_fields.sql`
4. Click "Run"

### Step 4: Install & Run (1 minute)

```bash
npm install
npm run dev
```

That's it! 🎉

## ✅ Testing Your Bot

### 1. Find Your Bot
Search for your bot username in Telegram (e.g., `@TutorSGJobsBot`)

### 2. Start Conversation
Send: `/start`

You should see the welcome message!

### 3. Link Your Account
```
/link your@email.com
```
Use the email you registered with on TutorSG website.

### 4. Browse Jobs
Click "🔍 Browse Jobs" or send `/jobs`

## 🔧 Common Issues

### "Bot not responding"
- Check if `npm run dev` is running
- Verify bot token is correct in `.env`

### "No account found"
- Make sure you're registered on the TutorSG website first
- Use the exact email from your registration
- Check for typos

### "Database connection error"
- Copy `DATABASE_URL` from your main app's `.env` file
- Ensure migration was run successfully

## 📱 Get Your Telegram ID (for admin features)

1. Search for [@userinfobot](https://t.me/userinfobot) on Telegram
2. Send `/start`
3. Copy your ID number
4. Add to `.env`: `ADMIN_TELEGRAM_IDS=your_id_here`

## 🚀 Next Steps

1. **Set Preferences**: `/preferences` - Choose subjects, levels, locations
2. **Enable Alerts**: `/notifications` - Turn on job notifications
3. **Test Alerts**: `/test_alert` (if you added your admin ID)
4. **Browse Jobs**: `/jobs` - See all available tuition jobs
5. **Apply to Jobs**: Click "Apply Now" on any job listing

## 🎯 Pro Tips

- Set your preferences first to get relevant job alerts
- Enable notifications to receive hourly job updates
- Use `/search` with filters to find specific jobs
- Job listings auto-delete after 10 minutes for privacy
- Forward job listings to friends using the "Forward" button

## 🆘 Need Help?

Check the full [README.md](./README.md) for:
- Detailed feature documentation
- Deployment instructions
- Troubleshooting guide
- API documentation

---

**Congratulations!** Your Telegram bot is now live. Tutors can start linking their accounts and receiving job alerts! 🎓
