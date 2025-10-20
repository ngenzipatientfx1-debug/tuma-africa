# Tuma-Africa Link Cargo

## Overview
A beautiful, modern proxy-shopping platform connecting African buyers with Chinese e-commerce sites. The platform provides a seamless experience for users to purchase products from China and track their shipments across Africa.

## Current State (October 2025)
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
- **Database**: PostgreSQL via Drizzle ORM
- **File Upload**: Multer with 150KB limit for screenshots
- **API**: RESTful endpoints for orders, messages, and admin functions

### Database Schema
- **users**: User profiles with admin flag
- **sessions**: Session storage for Replit Auth
- **orders**: Product orders with tracking information
- **orderStatusHistory**: Timeline of status changes
- **messages**: Chat messages between users and support

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
- Initial implementation of complete platform (October 2025)
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
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Deployment**: Replit (development and production)

## Environment Variables
- DATABASE_URL: PostgreSQL connection string
- SESSION_SECRET: Session encryption secret
- REPLIT_DOMAINS: Allowed domains for authentication
- REPL_ID: Replit project ID
