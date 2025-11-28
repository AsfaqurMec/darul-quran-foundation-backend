# Deployment Guide for DarulQuran Backend - CentOS

This guide is specifically for **CentOS** servers. Your backend will be deployed at:
- **Domain**: `api.darulquranfoundation.org`
- **Frontend**: `http://darulquranfoundation.org/`

## Prerequisites

Before starting, ensure you have:

1. **VPS Server** with:
   - CentOS 7/8/9
   - Root or sudo access
   - At least 1GB RAM (2GB+ recommended)
   - Public IP address

2. **Domain Configuration**:
   - `api.darulquranfoundation.org` DNS A record pointing to your VPS IP
   - `darulquranfoundation.org` DNS A record pointing to your VPS IP (for frontend)

3. **MongoDB Database**:
   - MongoDB installed on VPS, OR
   - MongoDB Atlas cloud database (recommended for production)

## Step 1: Initial Server Setup

### 1.1 Connect to Your VPS

```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

### 1.2 Update System Packages

```bash
# For CentOS 7
sudo yum update -y

# For CentOS 8/9 or Rocky Linux
sudo dnf update -y
```

### 1.3 Install EPEL Repository

```bash
# CentOS 7
sudo yum install -y epel-release

# CentOS 8/9
sudo dnf install -y epel-release
```

### 1.4 Install Node.js 18.x

```bash
# Install NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Install Node.js
# CentOS 7
sudo yum install -y nodejs

# CentOS 8/9
sudo dnf install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.5 Install MongoDB

**Option A: Install MongoDB Community Edition**

```bash
# Create MongoDB repository file
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo <<EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF

# Install MongoDB
# CentOS 7
sudo yum install -y mongodb-org

# CentOS 8/9
sudo dnf install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Option B: MongoDB Atlas (Recommended) - You're Using This!**

**Your MongoDB Atlas Connection:**
```
mongodb+srv://flexsoftr_db_user:rvkp8faZvFLRRGG3@cluster0.udnt2wx.mongodb.net/darunquran?retryWrites=true&w=majority
```

**Important Setup Steps:**

1. **Whitelist Your VPS IP:**
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Add your VPS IP address
   - Or temporarily allow `0.0.0.0/0` for testing (less secure)

2. **Verify Database User:**
   - Go to MongoDB Atlas → Database Access
   - Ensure `flexsoftr_db_user` has read/write permissions
   - The database `darunquran` will be created automatically on first connection

3. **Connection String Format:**
   - Make sure to include `/darunquran` (database name) before the `?`
   - Add `retryWrites=true&w=majority` for better reliability
   - No spaces after `MONGO_URI=`

### 1.6 Install Nginx

```bash
# CentOS 7
sudo yum install -y nginx

# CentOS 8/9
sudo dnf install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.7 Install PM2

```bash
sudo npm install -g pm2
```

### 1.8 Install Git

```bash
# CentOS 7
sudo yum install -y git

# CentOS 8/9
sudo dnf install -y git
```

### 1.9 Install Certbot (for SSL)

```bash
# CentOS 7
sudo yum install -y certbot python3-certbot-nginx

# CentOS 8/9
sudo dnf install -y certbot python3-certbot-nginx
```

### 1.10 Configure Firewall (firewalld)

```bash
# Start and enable firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow SSH
sudo firewall-cmd --permanent --add-service=ssh

# Allow HTTP and HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Allow backend port (if needed)
sudo firewall-cmd --permanent --add-port=5000/tcp

# Reload firewall
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-all
```

## Step 2: Setup MongoDB

### Option A: Local MongoDB

```bash
# MongoDB should already be running from Step 1.5
# Verify it's running
sudo systemctl status mongod

# Create database user (optional but recommended)
mongosh
use admin
db.createUser({
  user: "darunquran_admin",
  pwd: "your_secure_password",
  roles: [{ role: "readWrite", db: "darunquran" }]
})
exit
```

### Option B: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your VPS IP address (or 0.0.0.0/0 for all IPs - less secure)
5. Get your connection string

## Step 3: Deploy Application

### 3.1 Create Project Directory

```bash
sudo mkdir -p /var/www/darunquran-backend
sudo chown -R $USER:$USER /var/www/darunquran-backend
cd /var/www/darunquran-backend
```

### 3.2 Upload Your Code

**Option A: Using Git (Recommended)**

```bash
# Clone your repository
git clone https://github.com/yourusername/darunquran-backend.git .

# Or if you have a private repo, use SSH
git clone git@github.com:yourusername/darunquran-backend.git .
```

**Option B: Using SCP (from your local machine)**

```bash
# From your local machine
scp -r /path/to/darunquran-backend/* user@your-vps-ip:/var/www/darunquran-backend/
```

**Option C: Using SFTP**

Use FileZilla or similar SFTP client to upload files.

### 3.3 Install Dependencies

```bash
cd /var/www/darunquran-backend
npm ci --production
```

### 3.4 Create Production Environment File

```bash
cp env.production.example .env
nano .env
```

Update the `.env` file with your production values:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
BASE_URL=https://api.darulquranfoundation.org
FRONTEND_URL=http://darulquranfoundation.org

# Database - MongoDB Atlas
# IMPORTANT: Include /darunquran before the ? to specify database name
MONGO_URI=mongodb+srv://flexsoftr_db_user:rvkp8faZvFLRRGG3@cluster0.udnt2wx.mongodb.net/darunquran?retryWrites=true&w=majority

# JWT Secrets (IMPORTANT: Generate strong random strings)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET=your-super-secret-access-token-key-min-32-chars-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-min-32-chars-change-this

# Token Expiration
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

# CORS Configuration
CORS_ORIGIN=http://darulquranfoundation.org,https://darulquranfoundation.org

# File Upload
UPLOAD_DIR=./uploads

# SSLCommerz Payment Gateway
SSLCOMMERZ_STORE_ID=your_production_store_id
SSLCOMMERZ_STORE_PASSWORD=your_production_store_password
SSLCOMMERZ_IS_LIVE=true

# Member Application Settings
MEMBER_PAYMENT_SESSION_TTL_HOURS=24
MEMBER_PAYMENT_DOC_MAX_SIZE=5242880
MEMBER_PAYMENT_DOC_ALLOWED_TYPES=pdf,jpg,jpeg,png

# Password Hashing
SALT_ROUNDS=12

# SMTP Configuration (for emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Backend URL (for file serving)
BACKEND_URL=https://api.darulquranfoundation.org

# Database Seeding (set to false after initial setup)
SEED_ADMIN=true
SEED_ADMIN_NAME=Admin User
SEED_ADMIN_EMAIL=admin@darunquran.com
SEED_ADMIN_PASSWORD=ChangeThisPasswordImmediately
SEED_SAMPLE_USERS=false
```

**Generate secure JWT secrets:**

```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.5 Build the Application

```bash
npm run build
```

### 3.6 Create Uploads Directory

```bash
mkdir -p uploads
chmod 775 uploads
```

## Step 4: Setup PM2 Process Manager

### 4.1 Start Application with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

The last command will output a command to run with sudo. Copy and run it.

**Example output:**
```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your-username --hp /home/your-username
```

### 4.2 Verify Application is Running

```bash
pm2 status
pm2 logs darunquran-backend
```

Test the health endpoint:

```bash
curl http://localhost:5000/health
```

## Step 5: Setup Nginx Reverse Proxy

### 5.1 Configure Nginx

**Note:** CentOS uses `/etc/nginx/conf.d/` instead of `sites-available/sites-enabled`

```bash
sudo nano /etc/nginx/conf.d/darunquran-backend.conf
```

Copy the contents from `nginx.conf` file. It's already configured for your domain.

### 5.2 Test and Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5.3 Setup SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d api.darulquranfoundation.org
```

Follow the prompts. Certbot will automatically configure SSL.

**Auto-renewal is already set up by certbot, but verify:**

```bash
sudo certbot renew --dry-run
```

## Step 6: Seed Database (First Time Only)

```bash
cd /var/www/darunquran-backend
npm run seed
```

**⚠️ IMPORTANT:** Change the default admin password immediately after first login!

## Step 7: Verify Deployment

1. **Check Health Endpoint:**
   ```bash
   curl https://api.darulquranfoundation.org/health
   ```

2. **Test API Endpoint:**
   ```bash
   curl https://api.darulquranfoundation.org/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'
   ```

3. **Check Logs:**
   ```bash
   pm2 logs darunquran-backend
   sudo tail -f /var/log/nginx/darunquran-backend-error.log
   ```

## Step 8: Automated Deployment (Optional)

You can use the provided `deploy.sh` script for future deployments:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Maintenance Commands

### View Application Logs

```bash
pm2 logs darunquran-backend
pm2 logs darunquran-backend --lines 100  # Last 100 lines
```

### Restart Application

```bash
pm2 restart darunquran-backend
```

### Stop Application

```bash
pm2 stop darunquran-backend
```

### Update Application

```bash
cd /var/www/darunquran-backend
git pull
npm ci --production
npm run build
pm2 restart darunquran-backend
```

### Monitor Application

```bash
pm2 monit
```

### Check Services Status

```bash
sudo systemctl status nginx
sudo systemctl status mongod
sudo systemctl status firewalld
```

## Security Checklist

- [ ] Changed default admin password
- [ ] Using strong JWT secrets (32+ characters)
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured (firewalld)
- [ ] MongoDB authentication enabled (if local)
- [ ] Regular backups configured
- [ ] Environment variables secured (.env file permissions: 600)
- [ ] CORS configured with specific origins
- [ ] Rate limiting enabled
- [ ] File upload size limits configured

## Backup Strategy

### Manual Backup

```bash
# Backup database (local MongoDB)
mongodump --uri="mongodb://localhost:27017/darunquran" --out=/var/backups/mongodb-$(date +%Y%m%d)

# Backup application files
tar -czf /var/backups/darunquran-backend-$(date +%Y%m%d).tar.gz /var/www/darunquran-backend
```

### Automated Backup (Cron)

```bash
sudo crontab -e
```

Add:
```cron
0 2 * * * mongodump --uri="mongodb://localhost:27017/darunquran" --out=/var/backups/mongodb-$(date +\%Y\%m\%d)
0 3 * * * tar -czf /var/backups/darunquran-backend-$(date +\%Y\%m\%d).tar.gz /var/www/darunquran-backend
```

## Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs darunquran-backend --err

# Check if port is in use
sudo netstat -tlnp | grep 5000
# or
sudo ss -tlnp | grep 5000

# Check environment variables
pm2 env darunquran-backend
```

### Database connection issues

```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/darunquran"

# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Nginx 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs darunquran-backend

# Test backend directly
curl http://localhost:5000/health

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Test SSL
openssl s_client -connect api.darulquranfoundation.org:443
```

### Firewall Issues

```bash
# Check firewall status
sudo firewall-cmd --list-all

# Check if ports are open
sudo firewall-cmd --list-ports
sudo firewall-cmd --list-services

# Temporarily disable firewall for testing (NOT recommended for production)
sudo systemctl stop firewalld
```

## CentOS-Specific Notes

1. **Package Manager**: Use `yum` (CentOS 7) or `dnf` (CentOS 8/9)
2. **Firewall**: Use `firewalld` instead of `ufw`
3. **Nginx Config**: Use `/etc/nginx/conf.d/` instead of `sites-available/sites-enabled`
4. **Service Management**: Use `systemctl` (same as Ubuntu)

## Next Steps

- Set up monitoring (PM2 Plus, New Relic, etc.)
- Configure automated backups
- Set up log rotation
- Configure CDN for static files (if needed)
- Set up staging environment
- Configure CI/CD pipeline

