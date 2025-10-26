#!/bin/bash

# ===========================================
# Connect Tuma-Africa to Supabase
# ===========================================

set -e

echo "🚀 Tuma-Africa - Supabase Connection Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env exists
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ Error: .env file not found${NC}"
  echo "Please create .env file first"
  exit 1
fi

echo "📋 Instructions:"
echo "1. Go to https://supabase.com"
echo "2. Create a new project (or use existing)"
echo "3. Go to Settings → Database"
echo "4. Copy the 'Connection string' (URI format)"
echo ""
echo "Your connection string should look like:"
echo "postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
echo ""

read -p "Enter your Supabase DATABASE_URL: " SUPABASE_URL

if [ -z "$SUPABASE_URL" ]; then
  echo -e "${RED}❌ Error: DATABASE_URL cannot be empty${NC}"
  exit 1
fi

# Validate it looks like a PostgreSQL URL
if [[ ! $SUPABASE_URL =~ ^postgresql:// ]]; then
  echo -e "${RED}❌ Error: Invalid connection string${NC}"
  echo "Should start with: postgresql://"
  exit 1
fi

echo ""
echo "🔄 Updating .env file..."

# Backup current .env
cp .env .env.backup
echo -e "${GREEN}✓${NC} Backed up .env to .env.backup"

# Update DATABASE_URL
sed -i.tmp "s|^DATABASE_URL=.*|DATABASE_URL=$SUPABASE_URL|" .env
rm -f .env.tmp

echo -e "${GREEN}✓${NC} Updated DATABASE_URL in .env"

echo ""
echo "🗄️  Migrating database schema to Supabase..."

# Push schema to Supabase
if npm run db:push; then
  echo -e "${GREEN}✓${NC} Database schema migrated successfully"
else
  echo -e "${RED}❌ Schema migration failed${NC}"
  echo "Restoring backup..."
  mv .env.backup .env
  exit 1
fi

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
  echo ""
  echo "🔄 Restarting application..."
  
  if pm2 restart tuma-africa 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Application restarted"
  else
    echo -e "${YELLOW}⚠${NC}  Could not restart with PM2"
    echo "Start manually with: pm2 start ecosystem.config.cjs"
  fi
else
  echo ""
  echo -e "${YELLOW}⚠${NC}  PM2 not found. Please restart your application manually."
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Supabase Connection Complete!${NC}"
echo "=========================================="
echo ""
echo "📊 Next Steps:"
echo "1. Test connection:  curl http://localhost:5000"
echo "2. View logs:        pm2 logs tuma-africa"
echo "3. Check database:   Visit Supabase Dashboard → Table Editor"
echo ""
echo "🔍 Verify your tables in Supabase:"
echo "   - users"
echo "   - orders"
echo "   - messages"
echo "   - order_status_history"
echo "   - and more..."
echo ""
echo "📚 Documentation: SUPABASE-SETUP.md"
echo ""
echo "🎉 Your app is now connected to Supabase!"
echo ""
