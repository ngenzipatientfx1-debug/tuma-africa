# Tuma-Africa Link Cargo - VPS Deployment Guide

## Prerequisites

- Ubuntu VPS (tested on 22.04 LTS) - Hostinger compatible
- Node.js 18+ installed
- PostgreSQL 14+ installed
- PM2 installed globally (`npm install -g pm2`)
- Nginx installed (for reverse proxy)
- Domain name (optional but recommended)

---

## 1. Server Setup

### Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install PM2

```bash
sudo npm install -g pm2
```

### Install Nginx

```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 2. Database Setup

### Create Database and User

```bash
sudo -u postgres psql
```

Then in PostgreSQL:

```sql
CREATE DATABASE tuma_africa;
CREATE USER tuma_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE tuma_africa TO tuma_user;
\c tuma_africa
GRANT ALL ON SCHEMA public TO tuma_user;
\q
```

### Run Database Migrations

The application uses Drizzle ORM. After cloning the repository:

```bash
npm run db:push
```

---

## 3. Clone and Build Application

### Clone Repository

```bash
cd /var/www
git clone <your-github-repo-url> tuma-africa
cd tuma-africa
```

### Install Dependencies

```bash
npm install
```

### Create Environment File

```bash
cp .env.example .env
nano .env
```

Update the `.env` file with your production values:

```env
NODE_ENV=production
PORT=5000

# Database - Update with your PostgreSQL credentials
DATABASE_URL=postgresql://tuma_user:your_secure_password_here@localhost:5432/tuma_africa

# Session & Authentication - Generate random strings (min 32 characters)
SESSION_SECRET=<generate-random-string-here>
JWT_SECRET=<generate-another-random-string-here>
JWT_EXPIRES_IN=7d

# Frontend URL (your domain)
FRONTEND_URL=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=2097152
UPLOAD_DIR=./uploads
```

**Generate secure random strings:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Build Application

```bash
npm run build
```

This creates:
- `dist/public/` - Frontend static files
- `dist/index.js` - Backend server

### Create Upload Directories

```bash
mkdir -p uploads/{screenshots,verification,chat,videos,hero,companies,social}
chmod -R 755 uploads
```

---

## 4. Run with PM2

### Start Application

```bash
pm2 start ecosystem.config.cjs
```

### Save PM2 Configuration

```bash
pm2 save
pm2 startup
```

Follow the command output to enable PM2 on system startup.

### Useful PM2 Commands

```bash
pm2 list                  # List all processes
pm2 logs tuma-africa      # View logs
pm2 restart tuma-africa   # Restart app
pm2 stop tuma-africa      # Stop app
pm2 delete tuma-africa    # Delete from PM2
```

---

## 5. Nginx Configuration

### Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/tuma-africa
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Client max body size for file uploads
    client_max_body_size 15M;

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

    location /uploads {
        alias /var/www/tuma-africa/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/tuma-africa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. SSL Certificate (Let's Encrypt)

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### Get Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically configure Nginx for HTTPS.

---

## 7. Firewall Setup

```bash
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp         # HTTP
sudo ufw allow 443/tcp        # HTTPS
sudo ufw enable
```

---

## 8. Deploy Updates

When you push changes to GitHub:

```bash
cd /var/www/tuma-africa
git pull origin main
npm install                    # If dependencies changed
npm run build
pm2 restart tuma-africa
```

### Automated Deployment (Optional)

Create a deploy script:

```bash
nano deploy.sh
```

```bash
#!/bin/bash
cd /var/www/tuma-africa
git pull origin main
npm install
npm run build
pm2 restart tuma-africa
echo "Deployment complete!"
```

Make it executable:

```bash
chmod +x deploy.sh
```

---

## 9. Monitoring and Logs

### View Application Logs

```bash
pm2 logs tuma-africa
```

### View Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Logs

```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## 10. Backup Strategy

### Database Backup

Create a backup script:

```bash
nano /home/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
pg_dump -U tuma_user -d tuma_africa > $BACKUP_DIR/tuma_africa_$TIMESTAMP.sql
# Keep only last 7 days
find $BACKUP_DIR -name "tuma_africa_*.sql" -mtime +7 -delete
```

Add to crontab for daily backups:

```bash
crontab -e
```

Add this line (runs daily at 2 AM):

```
0 2 * * * /home/backup-db.sh
```

### File Uploads Backup

```bash
rsync -avz /var/www/tuma-africa/uploads/ /home/backups/uploads/
```

---

## 11. Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Use strong JWT_SECRET and SESSION_SECRET
- [ ] Enable UFW firewall
- [ ] Install SSL certificate
- [ ] Set proper file permissions (uploads folder)
- [ ] Disable root SSH login
- [ ] Keep system updated (`sudo apt update && sudo apt upgrade`)
- [ ] Monitor logs regularly

---

## 12. Troubleshooting

### Application won't start

```bash
pm2 logs tuma-africa --err
```

Check for:
- Missing environment variables
- Database connection issues
- Port 5000 already in use

### Database connection failed

```bash
sudo -u postgres psql -d tuma_africa
```

Verify database exists and user has permissions.

### Nginx 502 Bad Gateway

Check if application is running:

```bash
pm2 list
curl http://localhost:5000
```

### File upload errors

Check permissions:

```bash
ls -la uploads/
chmod -R 755 uploads/
```

---

## 13. Performance Optimization

### Enable Nginx Gzip

Add to Nginx config:

```nginx
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### PM2 Cluster Mode

Edit `ecosystem.config.cjs`:

```javascript
instances: 'max',  // Use all CPU cores
```

### PostgreSQL Tuning

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Adjust based on your VPS resources:

```
shared_buffers = 256MB
effective_cache_size = 1GB
```

---

## Support

For issues or questions, check the project repository or contact support.

**Your Tuma-Africa Link Cargo application is now live!** 🚀
