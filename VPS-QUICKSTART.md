# Quick Start Guide - VPS Deployment

## TL;DR - Deploy in 10 Minutes

This guide assumes you have a fresh Ubuntu VPS and want to get up and running quickly.

### 1. Install Requirements (5 minutes)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib nginx -y

# Install PM2
sudo npm install -g pm2
```

### 2. Setup Database (2 minutes)

```bash
sudo -u postgres psql -c "CREATE DATABASE tuma_africa;"
sudo -u postgres psql -c "CREATE USER tuma_user WITH ENCRYPTED PASSWORD 'ChangeMe123!';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tuma_africa TO tuma_user;"
sudo -u postgres psql -d tuma_africa -c "GRANT ALL ON SCHEMA public TO tuma_user;"
```

### 3. Deploy Application (3 minutes)

```bash
# Clone and setup
cd /var/www
sudo git clone <your-repo-url> tuma-africa
cd tuma-africa
sudo chown -R $USER:$USER .

# Install and build
npm install
npm run build

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://tuma_user:ChangeMe123!@localhost:5432/tuma_africa
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://$(curl -s ifconfig.me)
EOF

# Setup database schema
npm run db:push

# Create upload folders
mkdir -p uploads/{screenshots,verification,chat,videos,hero,companies,social}

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 4. Configure Nginx (1 minute)

```bash
sudo tee /etc/nginx/sites-available/tuma-africa > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 15M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/tuma-africa/uploads;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/tuma-africa /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Done! 🎉

Your application is now running at: `http://YOUR_SERVER_IP`

---

## Next Steps

1. **Add your domain:**
   - Point your domain DNS to your server IP
   - Update Nginx config with your domain name
   - Install SSL: `sudo certbot --nginx -d yourdomain.com`

2. **Secure your server:**
   - Change database password
   - Setup firewall: `sudo ufw allow 22,80,443/tcp && sudo ufw enable`
   - Disable root SSH login

3. **Setup backups:**
   - Database: `pg_dump` daily
   - Files: `rsync` uploads folder

See `DEPLOYMENT.md` for full documentation.
