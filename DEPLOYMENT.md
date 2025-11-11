# Deployment Guide for Hostinger

This guide will help you deploy منصة ابراج التعليمية (Abraj Educational Platform) to Hostinger.

## Prerequisites

Before deploying, ensure you have:
- A Hostinger account with Node.js hosting
- PostgreSQL database access on Hostinger
- SSH access to your hosting environment
- Node.js 18+ installed on the server

## Deployment Steps

### 1. Prepare Environment Variables

Create a `.env` file on your server with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@hostname:port/database_name
PGHOST=your-db-host
PGPORT=5432
PGUSER=your-db-username
PGPASSWORD=your-db-password
PGDATABASE=your-db-name

# Session Secret (generate a strong random string)
SESSION_SECRET=your-very-long-random-secret-key-here

# Email Configuration (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Object Storage (if using Replit Object Storage, configure alternative like AWS S3)
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your-bucket-id
PUBLIC_OBJECT_SEARCH_PATHS=public
PRIVATE_OBJECT_DIR=.private

# Node Environment
NODE_ENV=production
PORT=5000
```

### 2. Build the Application

On your local machine, run:

```bash
npm install
npm run build
```

This creates the `dist` folder with:
- `dist/public/` - Frontend static files
- `dist/index.js` - Backend server bundle

### 3. Upload Files to Hostinger

Upload the following to your Hostinger server:

```
project-root/
├── dist/                 # Built application
├── node_modules/         # Dependencies (or run npm install on server)
├── package.json
├── package-lock.json
├── .env                 # Environment variables
└── drizzle.config.ts    # Database configuration
```

**Upload Options:**
- Use FTP/SFTP client (FileZilla, Cyberduck)
- Use Hostinger's File Manager
- Use Git deployment if available
- Use SSH and clone from repository

### 4. Install Dependencies on Server

SSH into your server and run:

```bash
cd /path/to/your/app
npm install --production
```

### 5. Set Up PostgreSQL Database

1. Create a PostgreSQL database in Hostinger control panel
2. Note the connection details (host, port, username, password, database name)
3. Update your `.env` file with these details
4. Push the database schema:

```bash
npm run db:push
```

### 6. Configure Process Manager (PM2)

Install PM2 to keep your app running:

```bash
npm install -g pm2
```

Create an ecosystem file `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'abraj-platform',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

Start the application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. Configure Nginx (Reverse Proxy)

If using Nginx, create a configuration file:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8. Set Up SSL Certificate

Use Let's Encrypt for free SSL:

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 9. Configure Firewall

Ensure ports are open:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Post-Deployment Configuration

### 1. Create Superadmin Account

After deployment, create the first superadmin account via database:

```sql
-- Hash password using bcrypt with 10 rounds
-- Example: password "admin123" → bcrypt hash

INSERT INTO users (email, full_name, password, role) 
VALUES ('admin@eduplatform.com', 'Super Admin', '$2b$10$...hash...', 'superadmin');
```

### 2. Configure Object Storage

If not using Replit Object Storage, set up alternative:

**Option A: Local File Storage**
- Create directories for uploads
- Ensure proper permissions

**Option B: AWS S3 / DigitalOcean Spaces**
- Update object storage configuration
- Install AWS SDK: `npm install aws-sdk`

### 3. Email Configuration (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Create API key
4. Add to `.env` file

### 4. Test the Platform

1. Visit your domain: `https://yourdomain.com`
2. Test login with superadmin credentials
3. Create test teacher and student accounts
4. Upload test course content
5. Test enrollment and payment workflows

## Monitoring and Maintenance

### View Logs

```bash
# PM2 logs
pm2 logs abraj-platform

# System logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Restart Application

```bash
pm2 restart abraj-platform
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild
npm run build

# Restart
pm2 restart abraj-platform
```

### Database Backups

Set up automatic backups:

```bash
# Create backup script
#!/bin/bash
pg_dump -h localhost -U username database_name > backup_$(date +%Y%m%d).sql

# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Application Won't Start

1. Check PM2 logs: `pm2 logs`
2. Verify environment variables
3. Check database connection
4. Ensure port 5000 is not in use

### Database Connection Issues

1. Verify `DATABASE_URL` in `.env`
2. Check PostgreSQL service: `sudo systemctl status postgresql`
3. Verify firewall allows database connections

### Static Files Not Loading

1. Check Nginx configuration
2. Verify `dist/public` directory exists
3. Check file permissions

### Performance Issues

1. Enable compression in Nginx
2. Use CDN for static assets
3. Optimize database queries
4. Increase server resources

## Security Checklist

- [ ] Strong `SESSION_SECRET` configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Database backups automated
- [ ] Environment variables secured
- [ ] File upload limits set
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## Support

For issues or questions:
- Check the logs first
- Review environment variables
- Verify database connection
- Contact Hostinger support for server issues

## Platform Features

The deployed platform includes:
- ✅ Full Arabic/English bilingual support
- ✅ Three-tier user system (Superadmin, Teacher, Student)
- ✅ Course management with video lessons
- ✅ Quiz system with image submissions
- ✅ Progress tracking
- ✅ Course reviews and ratings
- ✅ Q&A system for lessons
- ✅ WhatsApp integration for payments
- ✅ Notification system
- ✅ SEO-friendly Arabic URLs

**Default Login:**
- Superadmin: Create via database (see Post-Deployment Configuration)
- Teachers: Created by superadmin
- Students: Self-registration enabled

---

**منصة ابراج التعليمية** - A comprehensive Arabic-first learning platform
