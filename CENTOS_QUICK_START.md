# Quick Deployment Guide - CentOS

## Your Configuration
- **OS**: CentOS
- **Backend Domain**: `api.darulquranfoundation.org`
- **Frontend Domain**: `http://darulquranfoundation.org/`

## Quick Start Commands

### 1. Update System & Install Prerequisites

```bash
# Update system
sudo yum update -y  # CentOS 7
# OR
sudo dnf update -y  # CentOS 8/9

# Install EPEL
sudo yum install -y epel-release  # CentOS 7
# OR
sudo dnf install -y epel-release  # CentOS 8/9

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs  # CentOS 7
# OR
sudo dnf install -y nodejs  # CentOS 8/9

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo yum install -y nginx  # CentOS 7
# OR
sudo dnf install -y nginx  # CentOS 8/9

# Install Certbot
sudo yum install -y certbot python3-certbot-nginx  # CentOS 7
# OR
sudo dnf install -y certbot python3-certbot-nginx  # CentOS 8/9

# Install Git
sudo yum install -y git  # CentOS 7
# OR
sudo dnf install -y git  # CentOS 8/9
```

### 2. Setup MongoDB

**You're using MongoDB Atlas** - No local installation needed!

**Important:** Make sure your VPS IP is whitelisted in MongoDB Atlas:
1. Go to MongoDB Atlas → Network Access
2. Add your VPS IP address
3. Or temporarily allow `0.0.0.0/0` for testing (less secure)

**Connection String Format:**
Your connection string should include the database name:
```env
MONGO_URI=mongodb+srv://flexsoftr_db_user:rvkp8faZvFLRRGG3@cluster0.udnt2wx.mongodb.net/darunquran?retryWrites=true&w=majority
```

Note: Added `/darunquran` before the `?` to specify the database name.

### 3. Configure Firewall

```bash
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 4. Deploy Application

```bash
# Create project directory
sudo mkdir -p /var/www/darunquran-backend
sudo chown -R $USER:$USER /var/www/darunquran-backend
cd /var/www/darunquran-backend

# Upload your code (via Git, SCP, or SFTP)
# Then:
npm ci --production
npm run build

# Create .env file
cp env.production.example .env
nano .env  # Edit with your values

# Generate JWT secrets
node -e "console.log('ACCESS:', require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('REFRESH:', require('crypto').randomBytes(32).toString('hex'))"

# Create uploads directory
mkdir -p uploads
chmod 775 uploads
```

### 5. Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Run the command it outputs with sudo
```

### 6. Configure Nginx

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/conf.d/darunquran-backend.conf

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Setup SSL

```bash
# Make sure DNS is pointing to your VPS IP first!
sudo certbot --nginx -d api.darulquranfoundation.org
```

### 8. Seed Database (First Time)

```bash
cd /var/www/darunquran-backend
npm run seed
```

### 9. Verify

```bash
# Test health endpoint
curl https://api.darulquranfoundation.org/health

# Check logs
pm2 logs darunquran-backend
```

## Important .env Settings

Make sure these are set correctly in your `.env`:

```env
NODE_ENV=production
BASE_URL=https://api.darulquranfoundation.org
FRONTEND_URL=http://darulquranfoundation.org
CORS_ORIGIN=http://darulquranfoundation.org,https://darulquranfoundation.org
BACKEND_URL=https://api.darulquranfoundation.org
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_generated_secret_32_chars_min
JWT_REFRESH_SECRET=your_generated_secret_32_chars_min
```

## Common Issues

**Port 5000 in use:**
```bash
sudo netstat -tlnp | grep 5000
# Kill process or change PORT in .env
```

**Nginx 502:**
```bash
pm2 status
pm2 logs darunquran-backend
curl http://localhost:5000/health
```

**SSL Certificate:**
- Ensure DNS A record for `api.darulquranfoundation.org` points to VPS IP
- Check firewall allows ports 80 and 443

## Full Documentation

See `DEPLOYMENT_CENTOS.md` for detailed step-by-step guide.

