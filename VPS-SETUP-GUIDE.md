# 🚀 VPS Setup Guide - Tuma-Africa Link Cargo

## Quick Start (5 Minutes)

### Step 1: Create Environment File

```bash
cd /var/www/tuma-africa
nano .env
```

Copy and paste this (replace the placeholder values):

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DATABASE_URL=postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/tuma_africa

# Example: DATABASE_URL=postgresql://tuma_user:SecurePass123@localhost:5432/tuma_africa

# ===========================================
# AUTHENTICATION SECRETS (REQUIRED)
# ===========================================
JWT_SECRET=CHANGE_THIS_TO_RANDOM_STRING_MIN_32_CHARS
SESSION_SECRET=CHANGE_THIS_TO_RANDOM_STRING_MIN_32_CHARS

# ===========================================
# APPLICATION SETTINGS
# ===========================================
NODE_ENV=production
PORT=5000

# ===========================================
# OPTIONAL: SSL/TLS
# ===========================================
# REPLIT_DOMAINS=your-domain.com
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### Step 2: Generate Strong Secrets (Recommended)

```bash
# Generate JWT_SECRET
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and update your `.env` file with these values.

---

### Step 3: Set Up PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user (run these in PostgreSQL shell)
CREATE DATABASE tuma_africa;
CREATE USER tuma_user WITH PASSWORD 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE tuma_africa TO tuma_user;
\q

# Update .env with your database credentials
nano .env
```

---

### Step 4: Run Database Migration

```bash
cd /var/www/tuma-africa

# Install dependencies (if not already done)
npm install

# Push database schema
npm run db:push
```

---

### Step 5: Create Upload Directories

```bash
cd /var/www/tuma-africa

# Create all required upload folders
mkdir -p uploads/screenshots
mkdir -p uploads/verification
mkdir -p uploads/chat
mkdir -p uploads/videos
mkdir -p uploads/hero
mkdir -p uploads/companies
mkdir -p uploads/social

# Set proper permissions
chmod -R 755 uploads
```

---

### Step 6: Build the Application

```bash
cd /var/www/tuma-africa

# Build frontend and backend
npm run build
```

**Expected output:**
```
✓ Frontend built: dist/public/
✓ Backend built: dist/index.js
```

---

### Step 7: Start the Application

#### Option A: Direct Run (for testing)

```bash
cd /var/www/tuma-africa
node dist/index.js
```

You should see:
```
serving on port 5000
```

**Test it:** Open `http://YOUR_SERVER_IP:5000` in a browser

---

#### Option B: PM2 (for production - RECOMMENDED)

```bash
cd /var/www/tuma-africa

# Install PM2 globally (if not installed)
npm install -g pm2

# Start the application
pm2 start ecosystem.config.cjs

# View status
pm2 list

# View logs
pm2 logs tuma-africa

# Enable auto-start on server reboot
pm2 save
pm2 startup
# Follow the command it outputs

# Restart the app (if needed)
pm2 restart tuma-africa

# Stop the app
pm2 stop tuma-africa
```

---

## Important Files & Locations

### What to Run:
```bash
✅ node dist/index.js          # Correct
❌ node dist/server.js         # Wrong - this file doesn't exist
❌ node server/index.ts        # Wrong - TypeScript source, not runnable
```

### Directory Structure:
```
/var/www/tuma-africa/
├── .env                       ← YOU MUST CREATE THIS
├── dist/
│   ├── index.js              ← Run this with Node.js
│   └── public/               ← Frontend static files
├── uploads/                   ← Create these directories
│   ├── screenshots/
│   ├── verification/
│   ├── chat/
│   └── ...
├── server/                    ← Source code (don't run this)
├── client/                    ← Frontend source
├── ecosystem.config.cjs       ← PM2 configuration
└── package.json
```

---

## Configure Nginx (Reverse Proxy)

### Edit Nginx Config:

```bash
sudo nano /etc/nginx/sites-available/tuma-africa
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend static files
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Upload files
    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
        proxy_set_header Host $host;
    }

    # Increase upload size limit
    client_max_body_size 2M;
}
```

### Enable the site:

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/tuma-africa /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Add SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically
# Test renewal:
sudo certbot renew --dry-run
```

---

## Troubleshooting

### Error: "Cannot find module '/var/www/tuma-africa/dist/server.js'"

**Problem:** You're running the wrong file.

**Solution:** Run `node dist/index.js` instead of `node dist/server.js`

---

### Error: "DATABASE_URL must be set"

**Problem:** Missing `.env` file or DATABASE_URL not set.

**Solution:**
```bash
cd /var/www/tuma-africa
nano .env
# Add: DATABASE_URL=postgresql://user:password@localhost:5432/tuma_africa
```

---

### Error: Database connection failed

**Problem:** PostgreSQL not running or wrong credentials.

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check credentials in .env match your database
```

---

### Error: Port 5000 already in use

**Problem:** Another process is using port 5000.

**Solution:**
```bash
# Find what's using port 5000
sudo lsof -i :5000

# Kill the process (replace PID with actual process ID)
sudo kill -9 PID

# Or change port in .env:
# PORT=5001
```

---

### App stops when SSH session closes

**Problem:** Running app directly without process manager.

**Solution:** Use PM2 instead:
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

---

## Useful Commands

```bash
# View application logs
pm2 logs tuma-africa

# Restart application
pm2 restart tuma-africa

# Stop application
pm2 stop tuma-africa

# Check application status
pm2 list

# Monitor resources
pm2 monit

# Rebuild application after code changes
npm run build
pm2 restart tuma-africa

# Check database connection
psql -U tuma_user -d tuma_africa -h localhost
```

---

## Security Checklist

- [ ] Strong, random JWT_SECRET (min 32 characters)
- [ ] Strong, random SESSION_SECRET (min 32 characters)
- [ ] Strong PostgreSQL password
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] SSL certificate installed (HTTPS)
- [ ] Regular backups of database
- [ ] PM2 configured for auto-restart
- [ ] Nginx properly configured
- [ ] Upload directory permissions set correctly (755)

---

## Need Help?

1. **Check logs:** `pm2 logs tuma-africa`
2. **Check if app is running:** `pm2 list`
3. **Check database:** `psql -U tuma_user -d tuma_africa`
4. **Check Nginx:** `sudo nginx -t`
5. **Check environment:** `cat .env` (don't share this publicly!)

---

## Summary of Required Steps

```bash
# 1. Create .env file with database and secrets
nano .env

# 2. Set up PostgreSQL database
sudo -u postgres psql
CREATE DATABASE tuma_africa;

# 3. Run database migration
npm run db:push

# 4. Create upload directories
mkdir -p uploads/{screenshots,verification,chat,videos,hero,companies,social}

# 5. Build the application
npm run build

# 6. Start with PM2
pm2 start ecosystem.config.cjs
pm2 save

# 7. Configure Nginx and SSL
sudo nano /etc/nginx/sites-available/tuma-africa
sudo certbot --nginx -d your-domain.com

# Done! 🎉
```

Your application will be running at: `https://your-domain.com`
