# 🚀 Hostinger VPS Deployment Guide - منصة ابراج التعليمية

Complete step-by-step guide to deploy your learning platform on Hostinger VPS.

---

## 📋 Prerequisites

### What You'll Need:
1. **Hostinger VPS Plan** (KVM 2 or higher recommended)
   - 2+ CPU cores
   - 8GB+ RAM
   - Ubuntu 22.04 LTS (recommended OS)

2. **Domain Name** (optional but recommended)
   - Example: `abraj-platform.com`

3. **Third-Party Services:**
   - **Resend API Key** (for password reset emails) - FREE tier available
   - **Object Storage** (for images):
     - DigitalOcean Spaces (~$5/month)
     - OR AWS S3 (~$5-10/month)
     - OR Cloudinary (~FREE tier available)

4. **SSH Client** (to connect to your VPS)
   - Windows: PuTTY or Windows Terminal
   - Mac/Linux: Built-in Terminal

---

## 🔧 Part 1: VPS Initial Setup

### Step 1: Access Your VPS

1. Log into Hostinger control panel
2. Go to VPS section
3. Note your VPS IP address (e.g., `123.45.67.89`)
4. Get your root password from Hostinger

**Connect via SSH:**
```bash
ssh root@YOUR_VPS_IP
# Enter password when prompted
```

---

### Step 2: Update System

```bash
# Update package lists
apt update

# Upgrade installed packages
apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential
```

---

### Step 3: Install Node.js 20.x

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js and npm
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x
```

---

### Step 4: Install PostgreSQL 16

```bash
# Add PostgreSQL repository
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Add repository key
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# Update and install PostgreSQL
apt update
apt install -y postgresql-16 postgresql-contrib-16

# Start PostgreSQL service
systemctl start postgresql
systemctl enable postgresql

# Verify installation
psql --version  # Should show PostgreSQL 16.x
```

---

### Step 5: Configure PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user (run these commands in PostgreSQL prompt)
CREATE DATABASE abraj_platform;
CREATE USER abraj_user WITH ENCRYPTED PASSWORD 'YOUR_SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE abraj_platform TO abraj_user;

# Exit PostgreSQL
\q
```

**Configure PostgreSQL for remote connections (optional):**
```bash
# Edit postgresql.conf
nano /etc/postgresql/16/main/postgresql.conf

# Find and change:
listen_addresses = 'localhost'  # Keep as localhost for security

# Edit pg_hba.conf
nano /etc/postgresql/16/main/pg_hba.conf

# Add this line for local connections:
local   all             abraj_user                             md5

# Restart PostgreSQL
systemctl restart postgresql
```

---

### Step 6: Install Nginx (Web Server)

```bash
# Install Nginx
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Verify installation
nginx -v
```

---

### Step 7: Install PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version
```

---

## 📦 Part 2: Application Deployment

### Step 8: Create Application User

```bash
# Create dedicated user for security
adduser abraj
# Set password when prompted

# Add user to sudo group (optional)
usermod -aG sudo abraj

# Switch to application user
su - abraj
```

---

### Step 9: Clone Your Application

**Option A: From GitHub (Recommended)**

First, push your code to GitHub:
```bash
# On your local machine (Replit)
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/YOUR_USERNAME/abraj-platform.git
git push -u origin main
```

Then on VPS:
```bash
# Clone repository
cd /home/abraj
git clone https://github.com/YOUR_USERNAME/abraj-platform.git
cd abraj-platform
```

**Option B: Upload via SFTP**

Use FileZilla or WinSCP to upload your project files to `/home/abraj/abraj-platform`

---

### Step 10: Configure Environment Variables

```bash
# Create .env file
nano .env
```

**Add the following (replace with your actual values):**

```env
# Database Configuration
DATABASE_URL=postgresql://abraj_user:YOUR_SECURE_PASSWORD_HERE@localhost:5432/abraj_platform
PGHOST=localhost
PGPORT=5432
PGUSER=abraj_user
PGPASSWORD=YOUR_SECURE_PASSWORD_HERE
PGDATABASE=abraj_platform

# Application
NODE_ENV=production
PORT=3000
SESSION_SECRET=GENERATE_A_LONG_RANDOM_STRING_HERE

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Object Storage (DigitalOcean Spaces example)
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=abraj-platform
DO_SPACES_KEY=your_spaces_key_here
DO_SPACES_SECRET=your_spaces_secret_here
DO_SPACES_REGION=nyc3

# OR if using AWS S3:
# AWS_S3_BUCKET=abraj-platform
# AWS_ACCESS_KEY_ID=your_aws_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret
# AWS_REGION=us-east-1

# OR if using Cloudinary:
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### Step 11: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Build the application
npm run build
```

---

### Step 12: Set Up Database Schema

```bash
# Run database migrations
npm run db:push

# Verify database tables were created
PGPASSWORD=YOUR_SECURE_PASSWORD_HERE psql -h localhost -U abraj_user -d abraj_platform -c "\dt"
```

---

### Step 13: Start Application with PM2

```bash
# Start application
pm2 start npm --name "abraj-platform" -- run start

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the command it gives you (run as root)

# Check application status
pm2 status
pm2 logs abraj-platform
```

---

## 🌐 Part 3: Nginx Configuration

### Step 14: Configure Nginx Reverse Proxy

```bash
# Switch back to root user
exit  # Exit from abraj user

# Create Nginx configuration
nano /etc/nginx/sites-available/abraj-platform
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;  # e.g., abraj-platform.com or 123.45.67.89

    # Increase client body size for file uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Save and enable configuration:**

```bash
# Create symbolic link to enable site
ln -s /etc/nginx/sites-available/abraj-platform /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

---

### Step 15: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'

# Enable firewall
ufw enable

# Check firewall status
ufw status
```

---

## 🔒 Part 4: SSL Certificate (HTTPS)

### Step 16: Install Certbot (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)

# Test auto-renewal
certbot renew --dry-run
```

**Your site should now be accessible at `https://yourdomain.com`**

---

## ☁️ Part 5: Object Storage Setup

### Option A: DigitalOcean Spaces

1. **Create Spaces Bucket:**
   - Go to DigitalOcean → Spaces
   - Create new Space (e.g., `abraj-platform`)
   - Choose region (e.g., NYC3)
   - Set permissions to "Private"

2. **Generate API Keys:**
   - Spaces → API → Generate New Key
   - Save Access Key and Secret Key

3. **Update Application Code:**
   
You'll need to modify the object storage implementation. Create this file:

```bash
nano server/storage/spaces.ts
```

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const spacesClient = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
});

export async function uploadToSpaces(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await spacesClient.send(
    new PutObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    })
  );

  return `${process.env.DO_SPACES_ENDPOINT}/${process.env.DO_SPACES_BUCKET}/${key}`;
}

export async function deleteFromSpaces(key: string): Promise<void> {
  await spacesClient.send(
    new DeleteObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: key,
    })
  );
}
```

**Install AWS SDK:**
```bash
npm install @aws-sdk/client-s3
```

---

### Option B: AWS S3 (Similar to Spaces)

1. Create S3 bucket in AWS Console
2. Set bucket policy for public read access
3. Generate IAM credentials
4. Similar code as above but with AWS endpoints

---

### Option C: Cloudinary (Easiest for Images)

1. **Sign up at cloudinary.com** (FREE tier: 25GB storage)

2. **Get credentials:**
   - Cloud name
   - API Key
   - API Secret

3. **Install Cloudinary SDK:**
```bash
npm install cloudinary
```

4. **Update storage code** to use Cloudinary API

---

## 🎯 Part 6: Final Steps

### Step 17: Create Initial Superadmin Account

```bash
# Connect to database
PGPASSWORD=YOUR_SECURE_PASSWORD_HERE psql -h localhost -U abraj_user -d abraj_platform

# Insert superadmin user
INSERT INTO users (email, password, full_name, role) 
VALUES (
  'admin@abraj.edu',
  '$2b$10$HASH_GENERATED_PASSWORD_HERE',
  'Super Admin',
  'superadmin'
);

# Exit
\q
```

**To generate password hash:**
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_ADMIN_PASSWORD', 10, (err, hash) => console.log(hash));"
```

---

### Step 18: Test Your Application

1. **Open browser and visit:** `https://yourdomain.com`
2. **Test login** with superadmin credentials
3. **Create a teacher account**
4. **Upload a course**
5. **Test video playback**
6. **Test quiz submission**

---

### Step 19: Set Up Automated Backups

```bash
# Create backup script
nano /home/abraj/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/abraj/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD=YOUR_SECURE_PASSWORD_HERE pg_dump -h localhost -U abraj_user -d abraj_platform > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make script executable
chmod +x /home/abraj/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /home/abraj/backup.sh >> /home/abraj/backup.log 2>&1
```

---

### Step 20: Monitor Your Application

```bash
# View application logs
pm2 logs abraj-platform

# View Nginx access logs
tail -f /var/log/nginx/access.log

# View Nginx error logs
tail -f /var/log/nginx/error.log

# Monitor system resources
htop
```

---

## 🔄 Updating Your Application

When you need to update your app:

```bash
# SSH into VPS
ssh abraj@YOUR_VPS_IP

# Navigate to application directory
cd /home/abraj/abraj-platform

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild application
npm run build

# Run database migrations if needed
npm run db:push

# Restart application
pm2 restart abraj-platform

# Check logs
pm2 logs abraj-platform
```

---

## ⚠️ Important Security Notes

1. **Never commit `.env` file to GitHub**
2. **Use strong passwords** for database and admin accounts
3. **Keep system updated:** `apt update && apt upgrade` monthly
4. **Monitor logs** for suspicious activity
5. **Enable fail2ban** to prevent brute force attacks:
   ```bash
   apt install -y fail2ban
   systemctl enable fail2ban
   systemctl start fail2ban
   ```

---

## 📞 Troubleshooting

### Application won't start:
```bash
pm2 logs abraj-platform --lines 100
```

### Database connection errors:
```bash
# Test database connection
PGPASSWORD=YOUR_PASSWORD psql -h localhost -U abraj_user -d abraj_platform -c "SELECT 1;"
```

### Nginx errors:
```bash
nginx -t  # Test configuration
systemctl status nginx  # Check service status
```

### Port already in use:
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 PID
```

---

## 💰 Estimated Monthly Costs

- **VPS Hosting**: $10.99/month (KVM 2)
- **DigitalOcean Spaces**: $5/month
- **Domain**: ~$1/month ($12/year)
- **Resend Email**: FREE (up to 3,000 emails/month)

**Total: ~$17/month + your time for maintenance**

---

## ✅ Deployment Checklist

- [ ] VPS purchased and accessible
- [ ] Ubuntu installed and updated
- [ ] Node.js 20.x installed
- [ ] PostgreSQL 16 installed and configured
- [ ] Nginx installed and configured
- [ ] Application code deployed
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Database schema created
- [ ] PM2 process manager set up
- [ ] SSL certificate installed
- [ ] Object storage configured
- [ ] Superadmin account created
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Domain pointing to VPS
- [ ] Application tested and working

---

## 🎉 Congratulations!

Your منصة ابراج التعليمية platform is now live on Hostinger!

**Access your platform at:** `https://yourdomain.com`

---

## 📚 Additional Resources

- [Hostinger VPS Documentation](https://support.hostinger.com/en/collections/1748974-vps)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

**Need Help?** Common issues and solutions are documented in the Troubleshooting section above.
