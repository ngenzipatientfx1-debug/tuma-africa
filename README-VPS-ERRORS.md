# 🔧 VPS Error Fixed - What Was Wrong

## The Problem

You were getting this error:

```
Error: Cannot find module '/var/www/tuma-africa/server/dist/server.js'
```

And this one:

```
Error: Cannot find module '/var/www/tuma-africa/dist/server.js'
```

---

## ❌ What You Were Doing Wrong

```bash
node dist/server.js          # ❌ This file doesn't exist
node server/dist/server.js   # ❌ This path is wrong
```

---

## ✅ The Correct Way

```bash
node dist/index.js           # ✅ This is the correct file!
```

**OR even better:**

```bash
pm2 start ecosystem.config.cjs   # ✅ Best for production
```

---

## Why This Happened

When you run `npm run build`, it compiles your TypeScript code:

**Input (source code):**
- `server/index.ts` ← Your TypeScript file

**Output (built code):**
- `dist/index.js` ← The JavaScript file to run

The filename is `index.js`, **NOT** `server.js`!

---

## Your File Structure

```
/var/www/tuma-africa/
│
├── server/              ← Source code (DON'T RUN)
│   ├── index.ts         ← TypeScript source
│   ├── auth.ts
│   └── routes.ts
│
├── dist/                ← Built code (RUN THIS!)
│   ├── index.js         ← ⭐ Run this file!
│   └── public/          ← Frontend files
│
└── ecosystem.config.cjs ← PM2 config (correct path already set)
```

---

## The Fix - 3 Easy Ways

### Option 1: Automatic Setup (EASIEST)

```bash
cd /var/www/tuma-africa
sudo bash setup-vps.sh
```

This does EVERYTHING for you! ✨

---

### Option 2: Manual Setup (5 steps)

```bash
# 1. Create environment file
cp .env.example .env
nano .env  # Add your database credentials

# 2. Create upload folders
mkdir -p uploads/{screenshots,verification,chat,videos,hero,companies,social}

# 3. Build the app
npm run build

# 4. Set up database
npm run db:push

# 5. Start with PM2
pm2 start ecosystem.config.cjs
```

---

### Option 3: Quick Test (for testing only)

```bash
cd /var/www/tuma-africa

# Create minimal .env
cat > .env <<EOF
DATABASE_URL=postgresql://user:pass@localhost:5432/tuma_africa
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NODE_ENV=production
PORT=5000
EOF

# Run directly
node dist/index.js
```

---

## What You Need BEFORE Running

### 1. Environment Variables (.env file)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/tuma_africa
JWT_SECRET=your-random-secret-here
SESSION_SECRET=your-random-secret-here
NODE_ENV=production
PORT=5000
```

### 2. PostgreSQL Database

```bash
sudo -u postgres psql
CREATE DATABASE tuma_africa;
CREATE USER tuma_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tuma_africa TO tuma_user;
\q
```

### 3. Upload Directories

```bash
mkdir -p uploads/{screenshots,verification,chat,videos,hero,companies,social}
```

---

## Common Errors & Solutions

### Error: "Cannot find module dist/server.js"

**Problem:** Wrong filename

**Solution:** Use `dist/index.js`

```bash
# Wrong:
node dist/server.js

# Correct:
node dist/index.js
```

---

### Error: "DATABASE_URL must be set"

**Problem:** Missing `.env` file

**Solution:** Create `.env` file

```bash
cp .env.example .env
nano .env
# Add your database credentials
```

---

### Error: "Port 5000 already in use"

**Problem:** Another process is using port 5000

**Solution:** Kill the process or use different port

```bash
# Find what's using port 5000
sudo lsof -i :5000

# Kill it (replace PID)
sudo kill -9 PID

# Or change port in .env
```

---

## Quick Commands Reference

```bash
# Build the application
npm run build

# Run with Node (testing)
node dist/index.js

# Run with PM2 (production)
pm2 start ecosystem.config.cjs

# View logs
pm2 logs tuma-africa

# Restart
pm2 restart tuma-africa

# Stop
pm2 stop tuma-africa

# Check status
pm2 list
```

---

## Files Created to Help You

I've created these helpful files for your VPS setup:

1. **RUNME-ON-VPS.md** ← **START HERE!** Quick guide
2. **setup-vps.sh** ← Automated setup script
3. **VPS-SETUP-GUIDE.md** ← Complete detailed guide
4. **DEPLOYMENT.md** ← Full deployment docs
5. **.env.example** ← Environment template
6. **ecosystem.config.cjs** ← PM2 config (already correct!)

---

## The Bottom Line

### ❌ DON'T DO THIS:
```bash
node dist/server.js
node server/dist/server.js
cd server && node dist/server.js
```

### ✅ DO THIS:
```bash
# Option 1: Automatic
sudo bash setup-vps.sh

# Option 2: PM2 (recommended)
pm2 start ecosystem.config.cjs

# Option 3: Direct (for testing)
node dist/index.js
```

---

## Need Help?

1. **Quick setup:** Run `sudo bash setup-vps.sh`
2. **Read guide:** Open `RUNME-ON-VPS.md`
3. **Check logs:** Run `pm2 logs tuma-africa`
4. **Full docs:** See `VPS-SETUP-GUIDE.md`

---

## Summary

**The file you need is:**
```
dist/index.js
```

**NOT:**
```
dist/server.js  ❌
```

**Best way to run:**
```bash
pm2 start ecosystem.config.cjs  ✅
```

That's it! 🎉
