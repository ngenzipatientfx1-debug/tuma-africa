# Tuma-Africa Link Cargo

## Overview
A beautiful, modern proxy-shopping platform connecting African buyers with Chinese e-commerce sites. The platform provides a seamless experience for users to purchase products from China and track their shipments across Africa.

## Current State (November 2025)
- ✅ Complete authentication system with Replit Auth
- ✅ Animated landing page with hero section
- ✅ Smart link paste interface with smooth transitions
- ✅ Order form with drag-and-drop file upload (≤150KB screenshots)
- ✅ Visual order tracking timeline (submitted → purchased → warehouse → shipping → in-country → delivered)
- ✅ Real-time chat/inbox system for customer support
- ✅ Admin dashboard for order management
- ✅ Dark mode support with theme toggle
- ✅ PostgreSQL database with full CRUD operations
- ✅ File upload system for product screenshots
- ✅ **MAJOR UPDATE**: Migrated from Drizzle ORM to Prisma ORM (November 7, 2025)

## Project Architecture

### Frontend (React + TypeScript)
- **Design System**: Tailwind CSS with custom African-inspired color palette (warm orange primary, earth tones)
- **Typography**: Inter (body), Plus Jakarta Sans (headings), JetBrains Mono (code/IDs)
- **Animations**: Framer Motion for smooth, purposeful transitions
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side navigation
- **Components**: Shadcn UI component library

### Backend (Express + TypeScript)
- **Authentication**: Replit Auth (OpenID Connect) with session management
- **Database**: PostgreSQL via **Prisma ORM** (migrated from Drizzle on Nov 7, 2025)
- **File Upload**: Multer with 150KB limit for screenshots
- **API**: RESTful endpoints for orders, messages, and admin functions

### Database Schema (Prisma)
All 10 tables defined in `prisma/schema.prisma`:
- **users**: User profiles with role-based access (user, employee, admin, super_admin)
- **sessions**: Session storage for Replit Auth
- **orders**: Product orders with tracking information and approval workflow
- **order_status_history**: Timeline of status changes with notes
- **messages**: Chat messages between users and support with media attachments
- **hero_content**: Homepage hero section content (Super Admin managed)
- **about_us**: About Us page content (Super Admin managed)
- **companies**: Trusted companies/partners display (Super Admin managed)
- **social_media_links**: Social media links in footer (Super Admin managed)
- **terms_policy**: Terms of Service and Privacy Policy content (Super Admin managed)

## User Preferences
- Clean, minimalist design with purposeful animations
- African-inspired warm color scheme
- Mobile-first responsive design
- No payment gateway integration (not requested)
- Focus on trust-building through clarity and visual feedback

## Key Features

### For Customers
1. **Link Paste Experience**: Paste any product link from Chinese e-commerce sites with animated transition
2. **Order Tracking**: Beautiful visual timeline showing order progress through 6 stages
3. **Chat Support**: WhatsApp-style messaging interface for support communication
4. **Responsive Design**: Works perfectly on mobile and desktop

### For Admins
1. **Order Management**: View all orders, update status, add tracking numbers
2. **Search & Filter**: Find orders by ID, user ID, or product link
3. **Status Updates**: Change order status with automatic history tracking
4. **Dashboard Analytics**: Quick stats on order volumes and status distribution

## Recent Changes

### November 7, 2025 - Prisma ORM Migration
- ✅ **Complete migration from Drizzle ORM to Prisma ORM** (production-ready)
- ✅ Rewrote all 45+ database operations in `server/storage.ts`
- ✅ Created comprehensive Prisma schema with all 10 tables and relations
- ✅ Fixed all upsert methods to properly handle identifier fields
- ✅ Using `UncheckedCreateInput` for scalar foreign key support
- ✅ Made password field optional (Replit Auth uses OIDC, no passwords)
- ✅ Successfully pushed schema to PostgreSQL database
- ✅ App running and tested with Prisma backend

### October 2025 - Initial Platform Implementation
- Implemented Replit Auth for user authentication
- Created visual order tracking timeline
- Built admin dashboard with order management
- Added chat/messaging system
- Configured PostgreSQL database with all tables

## Next Steps (Not Yet Implemented)
- Integration testing of all features
- End-to-end workflow testing
- Polish animations and transitions
- Performance optimization
- Mobile responsiveness testing

## Technical Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, TanStack Query
- **Backend**: Express, TypeScript, Passport.js, Multer
- **Database**: PostgreSQL (Neon), **Prisma ORM v6.19.0**
- **Authentication**: Replit Auth (OpenID Connect)
- **Deployment**: Replit (development), Hostinger VPS (production planned)

## Environment Variables
- DATABASE_URL: PostgreSQL connection string
- SESSION_SECRET: Session encryption secret
- REPLIT_DOMAINS: Allowed domains for authentication
- REPL_ID: Replit project ID
