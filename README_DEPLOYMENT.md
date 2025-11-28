# Deployment Summary - DarulQuran Backend

## Your Setup
- **Server OS**: CentOS
- **Backend URL**: `https://api.darulquranfoundation.org`
- **Frontend URL**: `http://darulquranfoundation.org/`

## Files Created for Deployment

1. **`ecosystem.config.js`** - PM2 process manager configuration
2. **`nginx.conf`** - Nginx reverse proxy config (already configured for your domain)
3. **`deploy.sh`** - Automated deployment script
4. **`DEPLOYMENT_CENTOS.md`** - Complete CentOS deployment guide
5. **`CENTOS_QUICK_START.md`** - Quick reference commands
6. **`env.production.example`** - Production environment template (with your domain)

## Quick Start

1. **Read the guide**: `CENTOS_QUICK_START.md` for quick commands
2. **Full guide**: `DEPLOYMENT_CENTOS.md` for detailed instructions
3. **Follow the steps** in order

## Before You Start

### DNS Configuration Required

Make sure these DNS records are set up:

```
Type: A
Name: api.darulquranfoundation.org
Value: [Your VPS IP Address]
TTL: 3600 (or default)

Type: A
Name: darulquranfoundation.org
Value: [Your VPS IP Address]
TTL: 3600 (or default)
```

### What You'll Need

1. **VPS Access**: SSH credentials to your CentOS server
2. **MongoDB**: Either local installation or MongoDB Atlas connection string
3. **SSLCommerz Credentials**: Your production payment gateway credentials
4. **SMTP Credentials**: For sending emails (optional)

## Deployment Steps Overview

1. ✅ Install Node.js, PM2, Nginx, Certbot
2. ✅ Setup MongoDB (local or Atlas)
3. ✅ Upload your code to `/var/www/darunquran-backend`
4. ✅ Configure `.env` file with production values
5. ✅ Build and start with PM2
6. ✅ Configure Nginx reverse proxy
7. ✅ Setup SSL certificate
8. ✅ Seed database (first time only)

## Key Configuration Points

### Environment Variables (.env)

```env
NODE_ENV=production
BASE_URL=https://api.darulquranfoundation.org
FRONTEND_URL=http://darulquranfoundation.org
CORS_ORIGIN=http://darulquranfoundation.org,https://darulquranfoundation.org
BACKEND_URL=https://api.darulquranfoundation.org
```

### Nginx Configuration

- File location: `/etc/nginx/conf.d/darunquran-backend.conf`
- Already configured for: `api.darulquranfoundation.org`
- SSL will be auto-configured by Certbot

### PM2 Configuration

- Process name: `darunquran-backend`
- Runs on: `http://localhost:5000`
- Logs: `./logs/pm2-*.log`

## After Deployment

1. **Test the API**:
   ```bash
   curl https://api.darulquranfoundation.org/health
   ```

2. **Change default admin password** (if seeded)

3. **Monitor logs**:
   ```bash
   pm2 logs darunquran-backend
   ```

4. **Check status**:
   ```bash
   pm2 status
   ```

## Troubleshooting

See `DEPLOYMENT_CENTOS.md` for detailed troubleshooting section.

Common issues:
- **502 Bad Gateway**: Check if backend is running (`pm2 status`)
- **SSL Issues**: Verify DNS is pointing to VPS IP
- **Database Connection**: Check MongoDB is running and MONGO_URI is correct

## Support

If you need help:
1. Check the logs: `pm2 logs darunquran-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify all services: `pm2 status`, `sudo systemctl status nginx`, `sudo systemctl status mongod`

## Next Steps After Deployment

- [ ] Set up automated backups
- [ ] Configure monitoring (PM2 Plus, etc.)
- [ ] Set up log rotation
- [ ] Test all API endpoints
- [ ] Update frontend to use new API URL
- [ ] Set up staging environment (optional)

