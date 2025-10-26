#!/bin/bash

# ===========================================
# Tuma-Africa - Supabase Setup Script
# Europe Region (eu-central-1)
# ===========================================

set -e

echo "🚀 Setting up Tuma-Africa with Supabase (Europe)..."
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create .env file with Supabase pooler connection
echo "📝 Creating .env file with Supabase credentials..."

cat > .env << 'EOF'
# ===========================================
# Tuma-Africa Link Cargo - Supabase Production
# Region: Europe (eu-central-1)
# ===========================================

# ===========================================
# SUPABASE DATABASE (Pooler Connection - IPv4)
# ===========================================
DATABASE_URL=postgresql://postgres.zwembeykottcmwzfpyhs:Hubert%40123irere@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

# ===========================================
# AUTHENTICATION SECRETS
# Generated: October 26, 2025
# ===========================================
SESSION_SECRET=15906d66442d70bbe85b40fa4cab3716170ab44dc08f0023db574ee7f5470be3
JWT_SECRET=af0492b800cb49f6df8b85b26a2b24c2309dcf2a3f976752dde0f8e436a1fae9
JWT_EXPIRES_IN=7d

# ===========================================
# APPLICATION SETTINGS
# ===========================================
NODE_ENV=production
PORT=5000

# ===========================================
# FILE UPLOAD SETTINGS
# ===========================================
MAX_FILE_SIZE=2097152
UPLOAD_DIR=./uploads

# ===========================================
# FRONTEND URL (for CORS)
# ===========================================
FRONTEND_URL=http://localhost:5000
EOF

echo -e "${GREEN}✓${NC} .env file created with Europe pooler connection"

# Create upload directories
echo ""
echo "📁 Creating upload directories..."
mkdir -p uploads/{screenshots,verification,chat,videos,hero,companies,social}
chmod -R 755 uploads
echo -e "${GREEN}✓${NC} Upload directories created"

# Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
  echo ""
  echo "📦 Installing dependencies..."
  npm install
  echo -e "${GREEN}✓${NC} Dependencies installed"
fi

# Build the application
echo ""
echo "🔨 Building application..."
npm run build
echo -e "${GREEN}✓${NC} Build completed"

# Push database schema to Supabase
echo ""
echo "🗄️  Pushing database schema to Supabase..."
npm run db:push
echo -e "${GREEN}✓${NC} Database schema created on Supabase"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Supabase Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "📊 Your database is now hosted on Supabase:"
echo "   Region: Europe (Frankfurt)"
echo "   Project: zwembeykottcmwzfpyhs"
echo "   Dashboard: https://zwembeykottcmwzfpyhs.supabase.co"
echo ""
echo "🎯 Next steps:"
echo "   1. Start with PM2:  pm2 start ecosystem.config.cjs"
echo "   2. Save PM2:        pm2 save"
echo "   3. Check logs:      pm2 logs tuma-africa"
echo "   4. Test app:        curl http://localhost:5000"
echo ""
echo "🌐 View your database:"
echo "   Supabase Dashboard → Table Editor"
echo "   https://supabase.com/dashboard/project/zwembeykottcmwzfpyhs"
echo ""
echo "🎉 Your app is ready to run!"
echo ""
