# ⚡ Quick VPS Setup - Start Here!

## The Problem You Had:

```bash
❌ node dist/server.js     # This file doesn't exist!
✅ node dist/index.js       # This is the correct file!
```

**Why?** The build creates `dist/index.js`, not `dist/server.js`

---

## 🚀 Automated Setup (Easiest Way)

### Option 1: Run the Setup Script

```bash
# 1. Go to project directory
cd /var/www/tuma-africa

# 2. Make script executable
chmod +x setup-vps.sh

# 3. Run the setup script
sudo bash setup-vps.sh
```

**This will:**
- ✅ Create `.env` file with strong secrets
- ✅ Set up database
- ✅ Create upload directories
- ✅ Install dependencies
- ✅ Build the application
- ✅ Start with PM2
- ✅ Configure auto-start

**Then your app will be running!** 🎉

---

## 🔧 Manual Setup (If you prefer)

### Step 1: Create .env File

```bash
cd /var/www/tuma-africa

# Copy example file
cp .env.example .env

# Edit it
nano .env
```

**Add these (replace with your values):**

```env
DATABASE_URL=postgresql://tuma_user:YOUR_PASSWORD@localhost:5432/tuma_africa
JWT_SECRET=GENERATE_RANDOM_32_CHARS
SESSION_SECRET=GENERATE_RANDOM_32_CHARS
NODE_ENV=production
PORT=5000
```

**Generate strong secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Step 2: Create Upload Folders

```bash
cd /var/www/tuma-africa
mkdir -p uploads/{screenshots,verification,chat,videos,hero,companies,social}
chmod -R 755 uploads
```

---

### Step 3: Build & Run

```bash
# Build the app
npm run build

# Push database schema
npm run db:push

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## 🎯 Common Commands

```bash
# View logs
pm2 logs tuma-africa

# Restart app
pm2 restart tuma-africa

# Stop app
pm2 stop tuma-africa

# Check status
pm2 list

# Rebuild after code changes
npm run build
pm2 restart tuma-africa
```

---

## ✅ Verify It's Working

```bash
# Check if app is running
pm2 list

# Test locally
curl http://localhost:5000

# View logs
pm2 logs tuma-africa
```

You should see:
```
serving on port 5000
```

---

## 🌐 Access Your App

- **Locally:** `http://localhost:5000`
- **From browser:** `http://YOUR_SERVER_IP:5000`
- **After Nginx setup:** `https://your-domain.com`

---

## 🔥 Quick Troubleshooting

### "Cannot find module dist/server.js"
**Fix:** Use `dist/index.js` instead!
```bash
node dist/index.js
# Or with PM2:
pm2 start ecosystem.config.cjs
```

### "DATABASE_URL must be set"
**Fix:** Create `.env` file (see Step 1 above)

### "Port 5000 already in use"
**Fix:** 
```bash
# Kill existing process
sudo lsof -i :5000
sudo kill -9 PID

# Or change port in .env
```

### "Database connection failed"
**Fix:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql
sudo systemctl start postgresql

# Verify credentials in .env
```

---

## 📚 Full Documentation

For detailed instructions, see:
- **VPS-SETUP-GUIDE.md** - Complete setup guide
- **DEPLOYMENT.md** - Full deployment documentation
- **VPS-QUICKSTART.md** - 10-minute quick start
- **FIXES-APPLIED.md** - All fixes that were applied

---

## 🎉 That's It!

Choose your method:
1. **Automated:** `sudo bash setup-vps.sh` (recommended)
2. **Manual:** Follow steps above

Your application will be running at `http://YOUR_SERVER_IP:5000`

**Next:** Configure Nginx and add SSL (see VPS-SETUP-GUIDE.md)

---

## Need Help?

```bash
# Check application logs
pm2 logs tuma-africa

# Check PM2 status
pm2 list

# Check environment variables
cat .env

# Check if database is running
sudo systemctl status postgresql
```

---

**Remember:** The file is `dist/index.js`, not `dist/server.js`! 🎯
