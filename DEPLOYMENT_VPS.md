# VPS Deployment Guide for Abraj Educational Platform

## Prerequisites
- Node.js 20.x or higher
- PostgreSQL database
- PM2 installed globally (`npm install -g pm2`)

## Deployment Steps

### 1. Clone and Install
```bash
cd ~/abraj-platform/eduasaad
git pull

# Install ALL dependencies (including build tools)
npm install
```

### 2. Configure Environment
Create/update `.env` file:
```bash
nano .env
```

Add these variables:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
SESSION_SECRET=your-super-secret-random-string-here
RESEND_API_KEY=your_resend_key_or_re_dummy_key
NODE_ENV=production
PORT=3000
```

### 3. Build the Application
```bash
NODE_ENV=production npm run build
```

This creates:
- `dist/index.js` - Backend server bundle
- `dist/public/` - Frontend static files

### 4. Start with PM2
```bash
# Stop existing process if running
pm2 delete eduasaad

# Start the app
pm2 start npm --name eduasaad -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### 5. Verify Deployment
```bash
pm2 logs eduasaad --lines 20
```

Expected output:
```
✅ Using Local File Storage (uploads/ directory)
✅ Cron jobs started (daily cleanup at 2 AM)
🚀 Serving static production build from public/
X:XX:XX PM [express] serving on port 3000
```

## Important Notes

### About Dependencies
- **All dependencies stay installed** (including devDependencies like vite)
- This is normal and safe - vite is never loaded in production thanks to dynamic imports
- The production bundle is only 119KB and doesn't execute any dev code

### About File Storage
- All uploads go to `uploads/` directory
- Make sure this directory is writable: `mkdir -p uploads && chmod 755 uploads`

### About Database
- Uses standard PostgreSQL driver (pg) - works on any server
- No WebSocket connections
- No Neon-specific code

### About Email
- If RESEND_API_KEY is not set or is "re_dummy_key", emails are simulated in logs
- Password reset still works - tokens are shown in console for testing
- For production emails, get a free API key from resend.com

## Troubleshooting

### Error: "Cannot find package 'vite'"
**Solution**: Run `npm install` to install all dependencies before building

### Error: "DATABASE_URL must be set"
**Solution**: Check your `.env` file exists and PM2 is loading it

### App crashes on startup
**Solution**: 
1. Check logs: `pm2 logs eduasaad --lines 50`
2. Verify `.env` file has all required variables
3. Ensure database is accessible
4. Check uploads directory exists and is writable

### Changes not appearing
**Solution**:
```bash
git pull
npm install
NODE_ENV=production npm run build
pm2 restart eduasaad
```

## Performance Tips

1. **Enable gzip compression** in your nginx/Apache reverse proxy
2. **Set up logrotate** for PM2 logs
3. **Monitor with PM2**: `pm2 monit`
4. **Setup database backups** using pg_dump

## Security Checklist

- ✅ Change SESSION_SECRET to a random string (32+ characters)
- ✅ Use strong PostgreSQL password
- ✅ Setup firewall to only allow ports 80, 443, 22
- ✅ Setup SSL certificate (Let's Encrypt)
- ✅ Keep Node.js and npm updated
- ✅ Regular database backups
