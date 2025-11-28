# Production Environment Setup Guide

## Your MongoDB Atlas Connection

You already have a MongoDB Atlas connection string. Here's how to use it correctly in production:

### Current Connection String
```
mongodb+srv://flexsoftr_db_user:rvkp8faZvFLRRGG3@cluster0.udnt2wx.mongodb.net/?appName=Cluster0
```

### Corrected Format for Production

**Important:** You need to:
1. Add the database name (`/darunquran`) before the `?`
2. Add connection options for better reliability
3. Remove any spaces after `MONGO_URI=`

### Correct .env Format

```env
MONGO_URI=mongodb+srv://flexsoftr_db_user:rvkp8faZvFLRRGG3@cluster0.udnt2wx.mongodb.net/darunquran?retryWrites=true&w=majority
```

**Key changes:**
- Added `/darunquran` (database name) before the `?`
- Added `retryWrites=true&w=majority` for better connection handling
- No space after `MONGO_URI=`

## Complete Production .env Template

Here's your complete production `.env` file with all required values:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
BASE_URL=https://api.darulquranfoundation.org
FRONTEND_URL=http://darulquranfoundation.org

# Database - MongoDB Atlas
MONGO_URI=mongodb+srv://flexsoftr_db_user:rvkp8faZvFLRRGG3@cluster0.udnt2wx.mongodb.net/darunquran?retryWrites=true&w=majority

# JWT Secrets (IMPORTANT: Generate strong random 32+ character strings)
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

# SSLCommerz Payment Gateway (Production)
SSLCOMMERZ_STORE_ID=your_production_store_id
SSLCOMMERZ_STORE_PASSWORD=your_production_store_password
SSLCOMMERZ_IS_LIVE=true

# Member Application Settings
MEMBER_PAYMENT_SESSION_TTL_HOURS=24
MEMBER_PAYMENT_DOC_MAX_SIZE=5242880
MEMBER_PAYMENT_DOC_ALLOWED_TYPES=pdf,jpg,jpeg,png

# Password Hashing
SALT_ROUNDS=12

# SMTP Configuration (for sending emails - optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Backend URL (for generating file URLs)
BACKEND_URL=https://api.darulquranfoundation.org

# Database Seeding (set to false after initial setup)
SEED_ADMIN=true
SEED_ADMIN_NAME=Admin User
SEED_ADMIN_EMAIL=admin@darunquran.com
SEED_ADMIN_PASSWORD=ChangeThisPasswordImmediately
SEED_SAMPLE_USERS=false
```

## MongoDB Atlas Configuration Checklist

Before deploying, make sure:

1. **Network Access**: Your VPS IP is whitelisted in MongoDB Atlas
   - Go to MongoDB Atlas → Network Access
   - Add your VPS IP address
   - Or temporarily allow `0.0.0.0/0` (less secure, for testing)

2. **Database User**: The user `flexsoftr_db_user` has proper permissions
   - Should have read/write access to the `darunquran` database

3. **Database Name**: The database `darunquran` exists in your cluster
   - If it doesn't exist, MongoDB will create it automatically on first connection

4. **Connection String**: Use the format above with `/darunquran` included

## Testing the Connection

You can test the MongoDB connection from your VPS:

```bash
# Install MongoDB shell (optional, for testing)
# CentOS 7
sudo yum install -y mongodb-org-shell

# Test connection
mongosh "mongodb+srv://flexsoftr_db_user:rvkp8faZvFLRRGG3@cluster0.udnt2wx.mongodb.net/darunquran?retryWrites=true&w=majority"
```

Or test from your Node.js application:

```bash
cd /var/www/darunquran-backend
node -e "require('mongoose').connect('mongodb+srv://flexsoftr_db_user:rvkp8faZvFLRRGG3@cluster0.udnt2wx.mongodb.net/darunquran?retryWrites=true&w=majority').then(() => console.log('Connected!')).catch(e => console.error(e))"
```

## Common Issues

### Issue: "MongoServerError: bad auth"
- **Solution**: Check username and password in connection string
- Verify user exists in MongoDB Atlas

### Issue: "MongoServerSelectionError: connection timed out"
- **Solution**: Whitelist your VPS IP in MongoDB Atlas Network Access
- Check firewall settings on VPS

### Issue: "MongooseError: The `uri` parameter to `openUri()` must be a string"
- **Solution**: Check for spaces in `.env` file after `MONGO_URI=`
- Ensure no quotes around the connection string

### Issue: Database not found
- **Solution**: MongoDB will create the database automatically on first connection
- Or create it manually in MongoDB Atlas

## Security Notes

1. **Never commit `.env` file** to Git
2. **Use strong passwords** for MongoDB Atlas users
3. **Whitelist specific IPs** instead of `0.0.0.0/0` in production
4. **Rotate credentials** periodically
5. **Use environment-specific users** (different users for dev/prod)

## Next Steps

1. Update your `.env` file with the corrected `MONGO_URI`
2. Generate JWT secrets (see commands above)
3. Configure other environment variables
4. Test the connection before deploying
5. Proceed with deployment steps

