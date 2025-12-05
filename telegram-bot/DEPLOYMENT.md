# Deployment Guide

## Production Deployment Options

### Option 1: PM2 (Recommended for VPS/Cloud Servers)

#### Prerequisites
- Node.js 18+ installed
- PM2 installed globally: `npm install -g pm2`

#### Steps

1. **Clone and setup**
   ```bash
   cd /path/to/tutorSG
   cd telegram-bot
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run database migration**
   ```bash
   psql $DATABASE_URL -f migrations/add_telegram_fields.sql
   ```

5. **Start with PM2**
   ```bash
   pm2 start dist/index.js --name tutorsg-bot
   ```

6. **Configure auto-restart**
   ```bash
   pm2 startup
   pm2 save
   ```

7. **Monitor**
   ```bash
   pm2 status
   pm2 logs tutorsg-bot
   pm2 monit
   ```

#### PM2 Useful Commands
```bash
# Restart bot
pm2 restart tutorsg-bot

# Stop bot
pm2 stop tutorsg-bot

# Delete from PM2
pm2 delete tutorsg-bot

# View logs
pm2 logs tutorsg-bot --lines 100

# Monitor in real-time
pm2 monit
```

---

### Option 2: Docker

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Run bot
CMD ["node", "dist/index.js"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  telegram-bot:
    build: .
    container_name: tutorsg-bot
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    networks:
      - tutorsg-network

networks:
  tutorsg-network:
    external: true
```

#### Deploy

```bash
# Build image
docker build -t tutorsg-bot .

# Run container
docker run -d \
  --name tutorsg-bot \
  --env-file .env \
  --restart unless-stopped \
  tutorsg-bot

# View logs
docker logs -f tutorsg-bot

# Stop container
docker stop tutorsg-bot

# Restart container
docker restart tutorsg-bot
```

---

### Option 3: Systemd Service (Linux)

#### Create service file

```bash
sudo nano /etc/systemd/system/tutorsg-bot.service
```

```ini
[Unit]
Description=TutorSG Telegram Bot
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/tutorSG/telegram-bot
ExecStart=/usr/bin/node /path/to/tutorSG/telegram-bot/dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=tutorsg-bot
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

#### Enable and start

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable tutorsg-bot

# Start service
sudo systemctl start tutorsg-bot

# Check status
sudo systemctl status tutorsg-bot

# View logs
sudo journalctl -u tutorsg-bot -f
```

---

### Option 4: Cloud Platforms

#### Railway.app

1. Connect GitHub repository
2. Create new project
3. Select `telegram-bot` folder
4. Add environment variables in Railway dashboard
5. Deploy automatically on git push

#### Render.com

1. Create new Web Service
2. Connect repository
3. Set build command: `cd telegram-bot && npm install && npm run build`
4. Set start command: `cd telegram-bot && npm start`
5. Add environment variables
6. Deploy

#### Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create tutorsg-bot

# Set buildpack
heroku buildpacks:set heroku/nodejs

# Add environment variables
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set DATABASE_URL=your_database_url

# Deploy
git subtree push --prefix telegram-bot heroku main

# View logs
heroku logs --tail
```

---

## Environment Variables for Production

Ensure these are set in production:

```env
# Required
TELEGRAM_BOT_TOKEN=your_production_token
DATABASE_URL=your_production_database_url

# Recommended
WEB_APP_URL=https://your-domain.com
ADMIN_TELEGRAM_IDS=123456789,987654321
JOB_ALERT_CRON=0 * * * *
AUTO_DELETE_TIMEOUT=600000

# Optional
NODE_ENV=production
```

---

## Security Checklist

- [ ] Bot token stored securely (environment variable, not in code)
- [ ] Database URL uses SSL/TLS connection
- [ ] Admin IDs configured correctly
- [ ] Server firewall configured
- [ ] Regular backups enabled
- [ ] Monitoring and alerting set up
- [ ] Error logging configured
- [ ] Rate limiting considered

---

## Monitoring

### Health Check Endpoint (Optional)

Add to `src/index.ts`:

```typescript
import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.listen(process.env.HEALTH_PORT || 8080);
```

### Monitoring Services

- **UptimeRobot**: Monitor health endpoint
- **PM2 Plus**: Advanced monitoring for PM2
- **Sentry**: Error tracking and reporting
- **Datadog**: Full application monitoring

---

## Backup Strategy

### Database Backups

```bash
# Automated daily backup
0 2 * * * pg_dump $DATABASE_URL > /backups/tutorsg-$(date +\%Y\%m\%d).sql
```

### Configuration Backups

- Store `.env` securely (e.g., in password manager)
- Version control all code (excluding `.env`)
- Document configuration changes

---

## Scaling Considerations

### High Traffic

If you expect many tutors:

1. **Use webhook instead of polling**
   ```typescript
   // In index.ts
   bot.launch({
     webhook: {
       domain: 'https://your-domain.com',
       port: process.env.PORT || 3001,
     },
   });
   ```

2. **Add Redis for sessions**
   ```bash
   npm install @telegraf/session
   ```

3. **Use queue for job alerts**
   - Bull or BullMQ for job queues
   - Separate worker processes

4. **Database optimization**
   - Use read replicas
   - Add database indexes
   - Connection pooling

---

## Updating the Bot

```bash
# With PM2
git pull
cd telegram-bot
npm install
npm run build
pm2 restart tutorsg-bot

# With Docker
git pull
cd telegram-bot
docker build -t tutorsg-bot .
docker stop tutorsg-bot
docker rm tutorsg-bot
docker run -d --name tutorsg-bot --env-file .env tutorsg-bot

# With systemd
git pull
cd telegram-bot
npm install
npm run build
sudo systemctl restart tutorsg-bot
```

---

## Troubleshooting Production Issues

### Bot stops responding
```bash
# Check if process is running
pm2 status
# or
sudo systemctl status tutorsg-bot

# Check logs
pm2 logs tutorsg-bot --lines 100
# or
sudo journalctl -u tutorsg-bot -n 100

# Restart
pm2 restart tutorsg-bot
# or
sudo systemctl restart tutorsg-bot
```

### High memory usage
```bash
# Monitor memory
pm2 monit

# Set memory limit
pm2 start dist/index.js --name tutorsg-bot --max-memory-restart 500M
```

### Database connection issues
- Check if database is accessible
- Verify connection string
- Check connection pool settings
- Monitor active connections

---

## Performance Optimization

1. **Enable compression** for large messages
2. **Implement caching** for frequently accessed data
3. **Optimize database queries** with proper indexes
4. **Use connection pooling** for database
5. **Implement rate limiting** to avoid hitting Telegram limits
6. **Monitor and log** performance metrics

---

## Support and Maintenance

### Regular Tasks
- [ ] Monitor error logs daily
- [ ] Check bot responsiveness weekly
- [ ] Review and update dependencies monthly
- [ ] Backup configuration and data regularly
- [ ] Test critical flows after updates

### Emergency Contacts
- Telegram support: https://telegram.org/support
- Database provider support
- Server hosting support

---

Happy Deploying! 🚀
