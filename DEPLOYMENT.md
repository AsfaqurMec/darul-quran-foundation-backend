# Deployment Guide for DarulQuran Backend

This guide will help you deploy the DarulQuran backend to your VPS server.

## Prerequisites

Before starting, ensure you have:

1. **VPS Server** with:
   - Ubuntu 20.04+ or similar Linux distribution
   - Root or sudo access
   - At least 1GB RAM (2GB+ recommended)
   - Public IP address

2. **Domain Name** (optional but recommended)
   - Pointed to your VPS IP address
   - SSL certificate (Let's Encrypt recommended)

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
sudo apt update
sudo apt upgrade -y
```

### 1.3 Install Required Software

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB (if hosting locally)
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install Nginx (for reverse proxy)
sudo apt install -y nginx

# Install PM2 (Node.js process manager)
sudo npm install -g pm2

# Install Git (if not already installed)
sudo apt install -y git

# Install Certbot (for SSL certificates)
sudo apt install -y certbot python3-certbot-nginx
```

### 1.4 Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 5000/tcp  # Backend port (if not using nginx)
sudo ufw enable
sudo ufw status
```

## Step 2: Setup MongoDB

### Option A: Local MongoDB

```bash
# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

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
4. Whitelist your VPS IP address
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
cp env.example.txt .env
nano .env
```

Update the `.env` file with your production values:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Database
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/darunquran
# OR for MongoDB Atlas:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/darunquran?retryWrites=true&w=majority

# JWT Secrets (IMPORTANT: Generate strong random strings)
JWT_ACCESS_SECRET=your-super-secret-access-token-key-min-32-chars-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-min-32-chars-change-this

# Token Expiration
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

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
BACKEND_URL=https://api.yourdomain.com
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

```bash
sudo nano /etc/nginx/sites-available/darunquran-backend
```

Copy the contents from `nginx.conf` file and update:
- Replace `api.yourdomain.com` with your actual domain
- Update SSL certificate paths if using Let's Encrypt
- Update uploads path if different

### 5.2 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/darunquran-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5.3 Setup SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d api.yourdomain.com
```

Follow the prompts. Certbot will automatically configure SSL.

## Step 6: Seed Database (First Time Only)

```bash
cd /var/www/darunquran-backend
npm run seed
```

**⚠️ IMPORTANT:** Change the default admin password immediately after first login!

## Step 7: Verify Deployment

1. **Check Health Endpoint:**
   ```bash
   curl https://api.yourdomain.com/health
   ```

2. **Test API Endpoint:**
   ```bash
   curl https://api.yourdomain.com/api/v1/auth/register \
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

Or set up a CI/CD pipeline with GitHub Actions, GitLab CI, etc.

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

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t
```

## Security Checklist

- [ ] Changed default admin password
- [ ] Using strong JWT secrets (32+ characters)
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured (UFW)
- [ ] MongoDB authentication enabled (if local)
- [ ] Regular backups configured
- [ ] Environment variables secured (.env file permissions: 600)
- [ ] CORS configured with specific origins (not *)
- [ ] Rate limiting enabled
- [ ] File upload size limits configured

## Backup Strategy

### Manual Backup

```bash
# Backup database
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
sudo lsof -i :5000

# Check environment variables
pm2 env darunquran-backend
```

### Database connection issues

```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/darunquran"

# Check MongoDB status
sudo systemctl status mongod
```

### Nginx 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs darunquran-backend

# Test backend directly
curl http://localhost:5000/health
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

## Support

If you encounter issues:

1. Check application logs: `pm2 logs darunquran-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/darunquran-backend-error.log`
3. Check system logs: `sudo journalctl -u nginx -f`
4. Verify environment variables are set correctly
5. Ensure all services are running: `pm2 status`, `sudo systemctl status mongod`, `sudo systemctl status nginx`

## Next Steps

- Set up monitoring (PM2 Plus, New Relic, etc.)
- Configure automated backups
- Set up log rotation
- Configure CDN for static files (if needed)
- Set up staging environment
- Configure CI/CD pipeline

