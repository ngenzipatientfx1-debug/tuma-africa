# 🚀 Connect Tuma-Africa to Supabase

## Overview

Supabase provides hosted PostgreSQL, which is perfect for your VPS deployment. Your application already uses PostgreSQL, so switching to Supabase is just a connection string change!

---

## 📋 What You'll Get

- ✅ Hosted PostgreSQL database (no local setup needed)
- ✅ Automatic backups
- ✅ Dashboard for database management
- ✅ Better scalability
- ✅ No need to manage PostgreSQL on your VPS
- ✅ Connection pooling built-in

---

## 🔧 Setup Steps

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click **"New Project"**
4. Fill in:
   - **Name:** `tuma-africa`
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to Rwanda (e.g., `eu-central-1` or `ap-southeast-1`)
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup

---

### Step 2: Get Your Connection String

1. In your Supabase project dashboard
2. Click **"Settings"** (gear icon, bottom left)
3. Go to **"Database"**
4. Scroll to **"Connection string"**
5. Select **"URI"** tab
6. Copy the connection string (looks like this):

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Important:** Replace `[YOUR-PASSWORD]` with the actual password you created!

---

### Step 3: Update Your VPS Environment

On your VPS, update the `.env` file:

```bash
cd /var/www/tuma-africa
nano .env
```

Replace the `DATABASE_URL` with your Supabase connection string:

```env
# OLD (local PostgreSQL):
# DATABASE_URL=postgresql://tuma_user:password@localhost:5432/tuma_africa

# NEW (Supabase):
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

### Step 4: Migrate Your Database Schema

```bash
cd /var/www/tuma-africa

# Push your schema to Supabase
npm run db:push

# This will create all your tables on Supabase
```

---

### Step 5: (Optional) Migrate Existing Data

If you have existing data you want to move:

```bash
# 1. Export from local database
pg_dump -U tuma_user -d tuma_africa --data-only > data_export.sql

# 2. Import to Supabase (get connection details from Supabase dashboard)
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" < data_export.sql
```

---

### Step 6: Restart Your Application

```bash
cd /var/www/tuma-africa

# Restart with PM2
pm2 restart tuma-africa

# View logs to confirm connection
pm2 logs tuma-africa
```

You should see: `serving on port 5000` with no database errors!

---

## 🎯 Alternative: Direct Connection (Non-Pooled)

For simpler setups, you can use the direct connection:

1. In Supabase Dashboard → Settings → Database
2. Under "Connection string", select **"Session mode"**
3. Copy the connection string (port 5432 instead of 6543)

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**When to use:**
- ✅ Pooled (port 6543): For production with many connections
- ✅ Direct (port 5432): For simpler setup, smaller apps

---

## 📊 View Your Data in Supabase

After migration:

1. Go to Supabase Dashboard
2. Click **"Table Editor"** (left sidebar)
3. You'll see all your tables:
   - users
   - orders
   - messages
   - order_status_history
   - hero_content
   - companies
   - social_media_links
   - about_us
   - terms_policy
   - sessions

You can browse, edit, and manage data directly in the dashboard!

---

## 🔒 Security Best Practices

### 1. Use Environment Variables (Already doing this ✅)

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@...
```

### 2. Enable Row Level Security (Optional)

If you want extra security, enable RLS in Supabase:

1. Go to **Table Editor**
2. Select a table (e.g., `users`)
3. Click **"RLS disabled"** → Enable RLS
4. Add policies for your application

**Note:** Since you're using server-side authentication, RLS is optional.

### 3. Rotate Database Password Regularly

In Supabase Dashboard:
1. Settings → Database
2. Click "Reset database password"
3. Update your `.env` file

---

## 🚀 Quick Setup Script

For faster setup, use this script:

```bash
#!/bin/bash

# Get Supabase connection string from user
echo "Enter your Supabase DATABASE_URL:"
read SUPABASE_URL

# Update .env
cd /var/www/tuma-africa
sed -i "s|DATABASE_URL=.*|DATABASE_URL=$SUPABASE_URL|" .env

# Migrate schema
npm run db:push

# Restart app
pm2 restart tuma-africa

echo "✅ Connected to Supabase!"
echo "Check logs: pm2 logs tuma-africa"
```

Save as `connect-supabase.sh` and run:
```bash
chmod +x connect-supabase.sh
./connect-supabase.sh
```

---

## 🧪 Test the Connection

```bash
# Test database connection
cd /var/www/tuma-africa

# Create a test file
cat > test-db.js <<'EOF'
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase!');
    
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log('Users count:', result.rows[0].count);
    
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

test();
EOF

# Run test
node test-db.js

# Clean up
rm test-db.js
```

---

## 📈 Supabase vs Local PostgreSQL

| Feature | Local PostgreSQL | Supabase |
|---------|------------------|----------|
| Setup | Manual installation | Cloud-hosted |
| Backups | Manual | Automatic |
| Scaling | Manual | Automatic |
| Dashboard | pgAdmin | Built-in UI |
| Cost | Free (your server) | Free tier available |
| Maintenance | You manage | Managed for you |

---

## 💰 Supabase Pricing

**Free Tier:**
- ✅ 500 MB database space
- ✅ Unlimited API requests
- ✅ Up to 50,000 monthly active users
- ✅ Perfect for starting out!

**Pro Tier ($25/month):**
- 8 GB database space
- Daily backups
- 100,000 monthly active users
- Priority support

See: [https://supabase.com/pricing](https://supabase.com/pricing)

---

## 🔄 Switching Back to Local PostgreSQL

If needed, just update `.env`:

```env
DATABASE_URL=postgresql://tuma_user:password@localhost:5432/tuma_africa
```

Then restart:
```bash
pm2 restart tuma-africa
```

---

## ❓ Troubleshooting

### Error: "Connection refused"

**Check:**
1. Connection string is correct
2. Password doesn't contain special characters (URL encode if needed)
3. Supabase project is active

**Fix:** Copy connection string again from Supabase dashboard

---

### Error: "SSL connection required"

**Fix:** Add `?sslmode=require` to connection string:
```env
DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

---

### Error: "Too many connections"

**Fix:** Use pooled connection (port 6543 instead of 5432)

---

## 📚 Additional Supabase Features

Once connected, you can explore:

1. **SQL Editor** - Run custom queries
2. **Table Editor** - View/edit data visually
3. **Auth** - Add Supabase Auth (optional, you have your own)
4. **Storage** - File storage (for product images)
5. **Functions** - Serverless functions
6. **Realtime** - Real-time subscriptions

---

## ✅ Summary

**To connect to Supabase:**

1. Create Supabase project
2. Copy connection string
3. Update `.env` with Supabase URL
4. Run `npm run db:push`
5. Restart app: `pm2 restart tuma-africa`

**Benefits:**
- ✅ No PostgreSQL management on VPS
- ✅ Automatic backups
- ✅ Easy scaling
- ✅ Web dashboard
- ✅ Free tier available

---

## 🎉 Next Steps

After connecting to Supabase:

1. ✅ Test the connection
2. ✅ Migrate existing data (if any)
3. ✅ Configure backups in Supabase
4. ✅ Explore the Table Editor
5. ✅ Consider using Supabase Storage for uploads

**Need help?** Just ask! 🚀
