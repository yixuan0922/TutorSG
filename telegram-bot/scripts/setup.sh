#!/bin/bash

# TutorSG Telegram Bot - Setup Script
# Automates the initial setup process

echo "🤖 TutorSG Telegram Bot - Setup Wizard"
echo "======================================="
echo ""

# Step 1: Check Node.js
echo "📦 Step 1: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required (found: $(node -v))"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Step 3: Setup environment
echo "⚙️  Step 3: Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file"
else
    echo "ℹ️  .env file already exists"
fi
echo ""

# Step 4: Configure Telegram Bot
echo "🤖 Step 4: Telegram Bot Configuration"
echo ""
echo "You need to create a Telegram bot with @BotFather"
echo ""
echo "Quick steps:"
echo "  1. Open Telegram and search for @BotFather"
echo "  2. Send /newbot"
echo "  3. Follow instructions to create your bot"
echo "  4. Copy the bot token"
echo ""

read -p "Do you have a bot token? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your bot token: " BOT_TOKEN

    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|TELEGRAM_BOT_TOKEN=.*|TELEGRAM_BOT_TOKEN=$BOT_TOKEN|" .env
    else
        # Linux
        sed -i "s|TELEGRAM_BOT_TOKEN=.*|TELEGRAM_BOT_TOKEN=$BOT_TOKEN|" .env
    fi

    echo "✅ Bot token saved to .env"
else
    echo "⚠️  Please add your bot token to .env file manually"
    echo "   TELEGRAM_BOT_TOKEN=your_token_here"
fi
echo ""

# Step 5: Database configuration
echo "🗄️  Step 5: Database Configuration"
echo ""
echo "Checking DATABASE_URL in .env..."

export $(cat .env | grep DATABASE_URL | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not found in .env"
    echo "Please add your database connection string to .env"
    echo ""
    echo "Example:"
    echo "  DATABASE_URL=postgresql://user:pass@host/database"
    echo ""
    read -p "Enter DATABASE_URL (or press Enter to skip): " DB_URL

    if [ ! -z "$DB_URL" ]; then
        echo "DATABASE_URL=$DB_URL" >> .env
        echo "✅ DATABASE_URL saved"
    else
        echo "⚠️  Skipped - remember to add DATABASE_URL manually"
    fi
else
    echo "✅ DATABASE_URL found in .env"
fi
echo ""

# Step 6: Run migration
echo "🔧 Step 6: Database Migration"
echo ""

export $(cat .env | grep DATABASE_URL | xargs)

if [ ! -z "$DATABASE_URL" ]; then
    read -p "Run database migration now? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./scripts/migrate.sh
    else
        echo "⚠️  Skipped migration - run manually later:"
        echo "   ./scripts/migrate.sh"
    fi
else
    echo "⚠️  DATABASE_URL not configured - skipping migration"
    echo "Run migration after adding DATABASE_URL:"
    echo "   ./scripts/migrate.sh"
fi
echo ""

# Step 7: Get Telegram ID (optional)
echo "👤 Step 7: Admin Configuration (Optional)"
echo ""
echo "To use admin commands, you need your Telegram ID"
echo ""
echo "Get your Telegram ID:"
echo "  1. Search for @userinfobot on Telegram"
echo "  2. Send /start"
echo "  3. Copy your ID number"
echo ""

read -p "Enter your Telegram ID (or press Enter to skip): " TELEGRAM_ID

if [ ! -z "$TELEGRAM_ID" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|ADMIN_TELEGRAM_IDS=.*|ADMIN_TELEGRAM_IDS=$TELEGRAM_ID|" .env
    else
        sed -i "s|ADMIN_TELEGRAM_IDS=.*|ADMIN_TELEGRAM_IDS=$TELEGRAM_ID|" .env
    fi
    echo "✅ Admin ID saved"
else
    echo "⚠️  Skipped - you can add this later in .env"
fi
echo ""

# Summary
echo "════════════════════════════════════════"
echo "✨ Setup Complete!"
echo "════════════════════════════════════════"
echo ""
echo "Next Steps:"
echo ""
echo "  1. Review your .env configuration:"
echo "     nano .env"
echo ""
echo "  2. Start the bot in development mode:"
echo "     npm run dev"
echo ""
echo "  3. Test your bot on Telegram:"
echo "     Search for your bot and send /start"
echo ""
echo "  4. Link your tutor account:"
echo "     /link your@email.com"
echo ""
echo "📖 For more information, see:"
echo "   - QUICKSTART.md - Quick start guide"
echo "   - README.md - Full documentation"
echo "   - DEPLOYMENT.md - Production deployment"
echo ""
echo "Need help? Check the documentation or contact support."
echo ""
