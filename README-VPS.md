# Tuma-Africa Link Cargo - Full-Stack Application

A comprehensive proxy-shopping platform connecting African buyers with Chinese e-commerce sites.

## 🚀 Features

- **4 Role-Based Dashboards**: User, Employee, Admin, Super Admin
- **User Verification System**: ID + selfie upload with admin approval
- **4-Stage Order Tracking**: China → Warehouse → Ship → Rwanda
- **Bilingual Support**: English and Kinyarwanda
- **Photo Compressor**: Compress images from ≤15MB to 100-150KB
- **Real-time Messaging**: Text, images, and video support
- **Order Management**: Full approval workflow with employee assignment

---

## 📁 Project Structure

```
tuma-africa/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useAuth.tsx          # For Replit (current)
│   │   │   └── useAuthVPS.tsx       # For VPS deployment
│   │   └── lib/             # Utilities and helpers
│       └── src/lib/api.ts           # JWT API client for VPS
├── server/                   # Backend Express application
│   ├── auth.ts              # JWT authentication (VPS)
│   ├── replitAuth.ts        # Replit Auth (current)
│   ├── routes.ts            # API endpoints
│   ├── routes/
│   │   └── auth.routes.ts   # Auth routes for VPS
│   ├── storage.ts           # Database operations
│   └── index.ts             # Server entry point
├── shared/                   # Shared types and schemas
│   └── schema.ts            # Database schema (Drizzle ORM)
├── uploads/                  # File uploads directory
├── dist/                     # Build output
│   ├── public/              # Frontend build
│   └── index.js             # Backend build
├── .env                      # Environment variables (create from .env.example)
├── .env.example             # Environment variables template
├── ecosystem.config.cjs      # PM2 configuration for VPS
├── DATABASE_MIGRATION_VPS.sql # Database setup for VPS
├── DEPLOYMENT.md            # Complete VPS deployment guide
├── VPS-QUICKSTART.md        # Quick 10-minute VPS setup
└── README-VPS.md            # This file
```

---

## 🎯 Two Deployment Options

### Option 1: Current Setup (Replit - Already Working)

The app currently uses **Replit Auth** and runs on Replit platform.

**To run locally on Replit:**
```bash
npm install
npm run dev
```

Replit automatically handles:
- Authentication (OIDC)
- Environment variables
- Database (PostgreSQL)
- File uploads

### Option 2: VPS Deployment (Standard Hosting)

For deploying to **any Ubuntu VPS** (Hostinger, DigitalOcean, AWS, etc.):

1. **Switch to JWT Authentication:**
   - Frontend uses `useAuthVPS.tsx` instead of `useAuth.tsx`
   - Backend uses `auth.ts` instead of `replitAuth.ts`
   - See migration instructions below

2. **Follow deployment guides:**
   - Quick: `VPS-QUICKSTART.md` (10 minutes)
   - Complete: `DEPLOYMENT.md` (full documentation)

---

## 🔄 Migrating from Replit to VPS

### Step 1: Update Frontend Auth Hook

In `client/src/App.tsx`:

```typescript
// Change this:
import { useAuth } from "@/hooks/useAuth";

// To this:
import { useAuth } from "@/hooks/useAuthVPS";
```

### Step 2: Update Landing Page

In `client/src/pages/new-landing.tsx`:

```typescript
// Change login redirect from:
<a href="/api/login">Login</a>

// To:
<a href="/auth">Login</a>
```

And update `App.tsx` routes:

```typescript
// Add auth page route:
import AuthPage from "@/pages/auth-page";

// In Router:
{!isAuthenticated ? (
  <>
    <Route path="/" component={NewLanding} />
    <Route path="/auth" component={AuthPage} />
  </>
) : (
  // ... dashboard routes
)}
```

### Step 3: Update Server Routes

In `server/routes.ts`, the auth routes are already configured for VPS! Just make sure you're using the JWT middleware.

### Step 4: Add Password Field to Database

Run the migration:

```bash
# On your VPS
psql -U tuma_user -d tuma_africa < DATABASE_MIGRATION_VPS.sql
```

Or use Drizzle:

```bash
npm run db:push
```

---

## 🛠️ Technologies Used

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + Shadcn UI
- TanStack Query (data fetching)
- Wouter (routing)
- Framer Motion (animations)
- Zod (validation)

### Backend
- Node.js + Express + TypeScript
- Drizzle ORM (database)
- PostgreSQL (database)
- JWT authentication (VPS) / Replit Auth (Replit)
- Multer (file uploads)
- Sharp (image processing)

### Deployment
- PM2 (process manager)
- Nginx (reverse proxy)
- Let's Encrypt (SSL)

---

## 📦 Build Commands

```bash
# Install dependencies
npm install

# Development (Replit)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database migrations
npm run db:push

# Run with PM2 (VPS)
pm2 start ecosystem.config.cjs
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

### Required for Both Replit and VPS:
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=5000
```

### Replit-Specific (current setup):
```env
REPLIT_DOMAINS=your-repl-name.replit.app
REPL_ID=your-repl-id
SESSION_SECRET=random-string
```

### VPS-Specific (for deployment):
```env
NODE_ENV=production
JWT_SECRET=random-string-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
```

---

## 📱 API Endpoints

### Authentication (VPS)
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### Orders
- `POST /api/orders` - Create new order (requires verification)
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order

### Verification
- `POST /api/verification/upload` - Upload ID and selfie

### Admin Routes
- `GET /api/admin/users` - Get all users
- `GET /api/admin/verification/pending` - Get pending verifications
- `POST /api/admin/users/:id/verify` - Approve/reject verification
- `PATCH /api/super-admin/users/:id/role` - Update user role

See `server/routes.ts` for complete API documentation.

---

## 🔒 Security

- Passwords hashed with bcrypt (cost factor 10)
- JWT tokens with configurable expiration
- Role-based access control
- File upload size limits enforced
- SQL injection protection (Drizzle ORM)
- XSS protection (React escaping)

---

## 📊 User Roles

1. **User** (`user`)
   - Place orders
   - Track shipments
   - Upload verification documents
   - Chat with support

2. **Employee** (`employee`)
   - View assigned orders
   - Approve/decline orders
   - Update tracking stages
   - Chat with users and admins

3. **Admin** (`admin`)
   - Verify user documents
   - View all orders
   - Manage employees
   - Access analytics

4. **Super Admin** (`super_admin`)
   - All admin permissions
   - Manage homepage content
   - Assign user roles
   - System configuration

---

## 🚀 Quick Start - VPS Deployment

```bash
# 1. Clone repository
git clone <your-repo-url>
cd tuma-africa

# 2. Install dependencies
npm install

# 3. Setup database
sudo -u postgres psql < DATABASE_MIGRATION_VPS.sql

# 4. Configure environment
cp .env.example .env
nano .env  # Update with your values

# 5. Build application
npm run build

# 6. Start with PM2
pm2 start ecosystem.config.cjs
pm2 save

# 7. Configure Nginx (see DEPLOYMENT.md)
```

See **VPS-QUICKSTART.md** for step-by-step guide.

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Support

For deployment help or issues:
1. Check `DEPLOYMENT.md` for detailed documentation
2. Review `VPS-QUICKSTART.md` for quick setup
3. Check application logs: `pm2 logs tuma-africa`

---

## 🌍 Live Demo

- **Replit**: [Your Replit URL]
- **Production**: [Your VPS Domain]

---

**Built with ❤️ for Africa Link Cargo**
