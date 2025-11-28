# Quick Deployment Guide

## What I've Prepared For You

I've created all the necessary files for deploying your backend to a VPS:

1. **`ecosystem.config.js`** - PM2 configuration for process management
2. **`nginx.conf`** - Nginx reverse proxy configuration
3. **`deploy.sh`** - Automated deployment script
4. **`DEPLOYMENT.md`** - Complete step-by-step deployment guide
5. **`env.production.example`** - Production environment variables template

## Quick Start (TL;DR)

### 1. On Your VPS, Install Prerequisites

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx

# MongoDB (or use MongoDB Atlas)
sudo apt install -y mongodb-org
```

### 2. Upload Your Code

```bash
# Option A: Git
cd /var/www
sudo mkdir -p darunquran-backend
sudo chown -R $USER:$USER darunquran-backend
cd darunquran-backend
git clone https://your-repo-url.git .

# Option B: SCP (from your local machine)
scp -r . user@your-vps-ip:/var/www/darunquran-backend/
```

### 3. Configure Environment

```bash
cd /var/www/darunquran-backend
cp env.production.example .env
nano .env  # Edit with your actual values
```

**Important:** Update these in `.env`:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_ACCESS_SECRET` - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `JWT_REFRESH_SECRET` - Generate another one
- `CORS_ORIGIN` - Your frontend domain(s)
- `BASE_URL` - Your API domain (e.g., `https://api.yourdomain.com`)
- `SSLCOMMERZ_*` - Your payment gateway credentials

### 4. Build and Start

```bash
npm ci --production
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the output command
```

### 5. Setup Nginx

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/darunquran-backend

# Edit with your domain
sudo nano /etc/nginx/sites-available/darunquran-backend
# Replace: api.yourdomain.com with your actual domain

# Enable site
sudo ln -s /etc/nginx/sites-available/darunquran-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Setup SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### 7. Seed Database (First Time)

```bash
npm run seed
```

### 8. Verify

```bash
curl https://api.yourdomain.com/health
pm2 logs darunquran-backend
```

## For Future Updates

Use the deployment script:

```bash
./deploy.sh
```

Or manually:

```bash
git pull
npm ci --production
npm run build
pm2 restart darunquran-backend
```

## What I Can Help With

I can help you:

1. ✅ **Prepare all deployment files** (Done!)
2. ✅ **Guide you through the process** (See DEPLOYMENT.md)
3. ✅ **Troubleshoot issues** (Share error logs)
4. ❌ **Directly access your VPS** (For security, you'll run commands)

## Next Steps

1. Read `DEPLOYMENT.md` for detailed instructions
2. Share your VPS details (IP, OS, domain) if you want specific guidance
3. I can help customize configurations based on your setup

## Common Issues

**Port 5000 already in use:**
```bash
sudo lsof -i :5000
# Kill the process or change PORT in .env
```

**MongoDB connection failed:**
- Check MongoDB is running: `sudo systemctl status mongod`
- Verify MONGO_URI in .env
- Check firewall: `sudo ufw status`

**Nginx 502 Bad Gateway:**
- Check backend is running: `pm2 status`
- Check backend logs: `pm2 logs darunquran-backend`
- Test directly: `curl http://localhost:5000/health`

**SSL Certificate issues:**
- Ensure domain DNS points to VPS IP
- Check firewall allows ports 80 and 443
- Verify domain in nginx config matches certbot domain

## Need Help?

Share:
- Your VPS OS and version
- Domain name (if any)
- MongoDB setup (local or Atlas)
- Any error messages you're seeing

I'll help you customize the deployment for your specific setup!

