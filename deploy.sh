#!/bin/bash

###############################################################################
# Deployment Script for DarulQuran Backend
# 
# This script automates the deployment process on your VPS
# 
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
#
# Prerequisites:
#   - Node.js 18+ installed
#   - PM2 installed globally (npm install -g pm2)
#   - MongoDB installed and running
#   - Nginx installed (optional, for reverse proxy)
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="darunquran-backend"
PROJECT_DIR="/var/www/${PROJECT_NAME}"
BACKUP_DIR="/var/backups/${PROJECT_NAME}"
LOG_DIR="${PROJECT_DIR}/logs"

echo -e "${GREEN}🚀 Starting deployment for ${PROJECT_NAME}...${NC}"

# Check if running as root (for some operations)
if [ "$EUID" -eq 0 ]; then 
   echo -e "${YELLOW}⚠️  Running as root. Some commands may need sudo.${NC}"
fi

# Create necessary directories
echo -e "${GREEN}📁 Creating directories...${NC}"
sudo mkdir -p "${PROJECT_DIR}"
sudo mkdir -p "${BACKUP_DIR}"
sudo mkdir -p "${LOG_DIR}"
sudo mkdir -p "${PROJECT_DIR}/uploads"

# Navigate to project directory
cd "${PROJECT_DIR}"

# Backup existing deployment (if exists)
if [ -d "${PROJECT_DIR}/dist" ]; then
    echo -e "${GREEN}💾 Creating backup...${NC}"
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    sudo tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" "${PROJECT_DIR}" 2>/dev/null || true
    echo -e "${GREEN}✅ Backup created: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz${NC}"
fi

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo -e "${GREEN}📥 Pulling latest code...${NC}"
    git pull origin main || git pull origin master
else
    echo -e "${YELLOW}⚠️  Not a git repository. Skipping git pull.${NC}"
    echo -e "${YELLOW}   Make sure to upload your code manually.${NC}"
fi

# Install/Update dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm ci --production

# Build the project
echo -e "${GREEN}🔨 Building TypeScript...${NC}"
npm run build

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}   Please create .env file with production configuration.${NC}"
    echo -e "${YELLOW}   You can copy from env.example.txt${NC}"
    exit 1
fi

# Set proper permissions
echo -e "${GREEN}🔐 Setting permissions...${NC}"
sudo chown -R $USER:$USER "${PROJECT_DIR}"
chmod -R 755 "${PROJECT_DIR}"
chmod -R 775 "${PROJECT_DIR}/uploads"
chmod 600 "${PROJECT_DIR}/.env"

# Restart application with PM2
echo -e "${GREEN}🔄 Restarting application...${NC}"
if pm2 list | grep -q "${PROJECT_NAME}"; then
    pm2 restart ecosystem.config.js
    echo -e "${GREEN}✅ Application restarted${NC}"
else
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    echo -e "${GREEN}✅ Application started${NC}"
fi

# Show PM2 status
echo -e "${GREEN}📊 Application status:${NC}"
pm2 status

# Test the application
echo -e "${GREEN}🧪 Testing application...${NC}"
sleep 3
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed! Check logs: pm2 logs ${PROJECT_NAME}${NC}"
    exit 1
fi

# Reload Nginx (if installed)
if command -v nginx &> /dev/null; then
    echo -e "${GREEN}🔄 Reloading Nginx...${NC}"
    sudo nginx -t && sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}📝 View logs: pm2 logs ${PROJECT_NAME}${NC}"
echo -e "${GREEN}📊 Monitor: pm2 monit${NC}"

