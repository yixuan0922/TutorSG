#!/bin/bash

# TutorSG Telegram Bot - Database Migration Script
# This script adds the necessary Telegram fields to the tutors table

echo "🔧 TutorSG Telegram Bot - Database Migration"
echo "=============================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with DATABASE_URL"
    echo "Example: cp .env.example .env"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set in .env file"
    exit 1
fi

echo "📊 Database: ${DATABASE_URL%%@*}@***"
echo ""
echo "This will add the following fields to the tutors table:"
echo "  - telegram_id (TEXT, UNIQUE)"
echo "  - telegram_username (TEXT)"
echo "  - notifications_enabled (BOOLEAN)"
echo ""

read -p "Continue with migration? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "🚀 Running migration..."
echo ""

# Run the migration
psql "$DATABASE_URL" -f migrations/add_telegram_fields.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Install dependencies: npm install"
    echo "  2. Add TELEGRAM_BOT_TOKEN to .env"
    echo "  3. Start the bot: npm run dev"
    echo ""
else
    echo ""
    echo "❌ Migration failed!"
    echo "Please check the error message above"
    echo ""
    exit 1
fi
