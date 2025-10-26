#!/bin/bash

# ===========================================
# Tuma-Africa Link Cargo - VPS Setup Script
# ===========================================
# This script automates the VPS setup process
# Run as: sudo bash setup-vps.sh
# ===========================================

set -e  # Exit on any error

echo "🚀 Tuma-Africa Link Cargo - VPS Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}❌ Please run as root: sudo bash setup-vps.sh${NC}"
  exit 1
fi

echo -e "${GREEN}✓${NC} Running as root"

# ===========================================
# 1. Check if in correct directory
# ===========================================
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: package.json not found${NC}"
  echo "Please run this script from /var/www/tuma-africa directory"
  exit 1
fi

echo -e "${GREEN}✓${NC} In correct directory: $(pwd)"

# ===========================================
# 2. Create .env file if it doesn't exist
# ===========================================
if [ ! -f ".env" ]; then
  echo ""
  echo "📝 Creating .env file..."
  
  # Generate random secrets
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  
  echo "🔑 Generated random secrets"
  
  # Prompt for database credentials
  echo ""
  echo "Please enter PostgreSQL database credentials:"
  read -p "Database name [tuma_africa]: " DB_NAME
  DB_NAME=${DB_NAME:-tuma_africa}
  
  read -p "Database user [tuma_user]: " DB_USER
  DB_USER=${DB_USER:-tuma_user}
  
  read -sp "Database password: " DB_PASS
  echo ""
  
  read -p "Database host [localhost]: " DB_HOST
  DB_HOST=${DB_HOST:-localhost}
  
  read -p "Database port [5432]: " DB_PORT
  DB_PORT=${DB_PORT:-5432}
  
  # Create .env file
  cat > .env <<EOF
# Tuma-Africa Link Cargo - Environment Configuration
# Generated: $(date)

# DATABASE
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# AUTHENTICATION SECRETS
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
JWT_EXPIRES_IN=7d

# APPLICATION
NODE_ENV=production
PORT=5000
EOF
  
  chmod 600 .env
  echo -e "${GREEN}✓${NC} Created .env file with secure permissions"
else
  echo -e "${YELLOW}⚠${NC}  .env file already exists, skipping..."
fi

# ===========================================
# 3. Create upload directories
# ===========================================
echo ""
echo "📁 Creating upload directories..."

mkdir -p uploads/screenshots
mkdir -p uploads/verification
mkdir -p uploads/chat
mkdir -p uploads/videos
mkdir -p uploads/hero
mkdir -p uploads/companies
mkdir -p uploads/social

chmod -R 755 uploads

echo -e "${GREEN}✓${NC} Upload directories created"

# ===========================================
# 4. Install dependencies
# ===========================================
echo ""
echo "📦 Installing dependencies..."

if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed${NC}"
  echo "Please install Node.js 18+ first"
  exit 1
fi

npm install

echo -e "${GREEN}✓${NC} Dependencies installed"

# ===========================================
# 5. Build the application
# ===========================================
echo ""
echo "🔨 Building application..."

npm run build

if [ ! -f "dist/index.js" ]; then
  echo -e "${RED}❌ Build failed: dist/index.js not found${NC}"
  exit 1
fi

echo -e "${GREEN}✓${NC} Application built successfully"

# ===========================================
# 6. Set up database
# ===========================================
echo ""
echo "🗄️  Setting up database..."

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
  echo -e "${YELLOW}⚠${NC}  PostgreSQL is not running, attempting to start..."
  systemctl start postgresql
fi

# Run database migrations
npm run db:push

echo -e "${GREEN}✓${NC} Database schema created"

# ===========================================
# 7. Install and configure PM2
# ===========================================
echo ""
echo "⚙️  Setting up PM2..."

if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
  echo -e "${GREEN}✓${NC} PM2 installed"
else
  echo -e "${GREEN}✓${NC} PM2 already installed"
fi

# Start the application with PM2
pm2 delete tuma-africa 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo -e "${GREEN}✓${NC} Application started with PM2"

# ===========================================
# 8. Configure PM2 startup
# ===========================================
echo ""
echo "🔄 Configuring auto-start on reboot..."

pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo -e "${GREEN}✓${NC} PM2 startup configured"

# ===========================================
# 9. Test the application
# ===========================================
echo ""
echo "🧪 Testing application..."

sleep 3  # Wait for app to start

if curl -s http://localhost:5000 > /dev/null; then
  echo -e "${GREEN}✓${NC} Application is responding"
else
  echo -e "${YELLOW}⚠${NC}  Application may not be responding yet"
  echo "Check logs with: pm2 logs tuma-africa"
fi

# ===========================================
# Summary
# ===========================================
echo ""
echo "======================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "======================================"
echo ""
echo "Application Status:"
pm2 list
echo ""
echo "📋 Next Steps:"
echo "1. View logs:         pm2 logs tuma-africa"
echo "2. Restart app:       pm2 restart tuma-africa"
echo "3. Stop app:          pm2 stop tuma-africa"
echo "4. Test locally:      curl http://localhost:5000"
echo ""
echo "🌐 Configure Nginx:"
echo "   See VPS-SETUP-GUIDE.md for Nginx configuration"
echo ""
echo "🔒 Add SSL Certificate:"
echo "   sudo certbot --nginx -d your-domain.com"
echo ""
echo "📖 Full Documentation:"
echo "   - VPS-SETUP-GUIDE.md"
echo "   - DEPLOYMENT.md"
echo "   - VPS-QUICKSTART.md"
echo ""
echo "🎉 Your Tuma-Africa Link Cargo is ready!"
echo ""
