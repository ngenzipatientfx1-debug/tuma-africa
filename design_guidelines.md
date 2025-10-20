# Design Guidelines: Tuma-Africa Link Cargo

## Design Approach

**Reference-Based Strategy** drawing inspiration from:
- **Shopify/Stripe**: Clean, trustworthy e-commerce patterns with emphasis on transaction clarity
- **Airbnb**: International trust-building through warm, approachable design
- **Linear**: Modern, purposeful micro-interactions and crisp typography
- **AfterShip**: Clean tracking interfaces with clear status communication

**Core Principles:**
1. **Trust through Clarity**: Every interaction should reduce anxiety about international shopping
2. **Warmth with Professionalism**: African-inspired warmth balanced with e-commerce credibility
3. **Guided Simplicity**: Complex processes made effortless through thoughtful UI

---

## Color Palette

### Light Mode
- **Primary Brand**: 24 85% 45% (Deep warm orange - African sunset inspired)
- **Primary Hover**: 24 85% 40%
- **Secondary**: 200 25% 30% (Grounded slate for professionalism)
- **Success**: 142 76% 36% (Trust indicators, completed orders)
- **Warning**: 38 92% 50% (Attention for pending actions)
- **Background**: 40 15% 98% (Warm white, not stark)
- **Surface**: 0 0% 100%
- **Text Primary**: 220 15% 15%
- **Text Secondary**: 220 10% 45%

### Dark Mode
- **Primary Brand**: 24 75% 55%
- **Background**: 220 15% 10%
- **Surface**: 220 12% 14%
- **Text Primary**: 40 10% 95%
- **Text Secondary**: 220 8% 70%

---

## Typography

**Font Stack:**
- **Primary**: "Inter" (Google Fonts) - Clean, professional, excellent readability
- **Display/Headings**: "Plus Jakarta Sans" (Google Fonts) - Friendly, modern warmth
- **Monospace**: "JetBrains Mono" (for order numbers, tracking codes)

**Scale:**
- Hero H1: text-6xl font-bold (Plus Jakarta Sans)
- Section H2: text-4xl font-semibold
- Card H3: text-2xl font-semibold
- Body: text-base (16px)
- Small/Meta: text-sm (14px)
- Micro/Labels: text-xs (12px)

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16, 20** for consistency
- Component padding: p-4 to p-6
- Section spacing: py-16 to py-24
- Card gaps: gap-6 to gap-8
- Button padding: px-6 py-3

**Container Strategy:**
- Max-width: max-w-7xl for main content
- Product grids: max-w-screen-2xl
- Forms: max-w-2xl
- Responsive breakpoints: Standard Tailwind (sm, md, lg, xl, 2xl)

---

## Component Library

### Navigation
**Header**: Sticky top navigation with logo left, main nav center, auth/cart right. Background: surface color with subtle border-b. Height: h-16. Include cart icon with item count badge.

**Mobile**: Hamburger menu with slide-in drawer, full-height overlay navigation.

### Hero Section
**Landing Page Hero**: Full-width section with h-[600px], two-column layout (60/40 split). Left: Large heading, value proposition, dual CTAs (primary "Start Shopping" + secondary "How It Works"). Right: High-quality hero image showing package delivery or happy customer receiving goods. Background: gradient from primary/10 to secondary/5.

### Product Cards
**Grid Layout**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4, gap-6
**Card Design**: White surface, rounded-xl, border subtle, hover:shadow-lg transition. Product image with aspect-square, price prominent in primary color, merchant badge, "Add to Cart" button on hover overlay.

### Shopping Cart
**Sidebar Drawer**: Slide-in from right, w-96, fixed height with scrollable items. Each item: thumbnail, title, price, quantity stepper, remove button. Sticky footer with subtotal and "Checkout" CTA.

### Order Tracking
**Status Timeline**: Vertical stepper with icons for each stage (Submitted → Purchased → In Transit → Delivered). Active stage in primary color, completed in success, upcoming in muted. Include estimated dates and expandable details for each stage.

### Forms
**Input Fields**: Rounded-lg borders, focus:ring-2 focus:ring-primary/20, background surface color in dark mode. Labels: text-sm font-medium mb-2. Error states: border-red-500 with text-sm text-red-600 message.

**Shipping Address Form**: Two-column layout for city/postal, full-width for street address. Include country selector with flags.

### Buttons
**Primary**: bg-primary text-white rounded-lg px-6 py-3 font-semibold hover:bg-primary-hover transition-all
**Secondary**: variant="outline" with border-2 border-primary text-primary
**On Images**: When buttons are on hero images, apply backdrop-blur-sm bg-white/90 dark:bg-surface/90

### Dashboard Cards
**Stats Cards**: Grid of 2x2 or 4-column for key metrics (Orders Pending, In Transit, Total Spent, etc.). Icon left, number large, label small, subtle background color per metric type.

**Order History Table**: Striped rows, sticky header, sortable columns. Each row: Order ID (monospace), date, status badge, items count, total, action button.

### Badges & Tags
**Status Badges**: Rounded-full px-3 py-1 text-xs font-medium with color-coded backgrounds (success for delivered, warning for pending, blue for in-transit, primary for processing).

### Modals & Overlays
**Product Detail Modal**: Large centered modal with image gallery left, details right. Close button top-right. Max-w-5xl, rounded-2xl.

---

## Images

**Hero Image**: Professional photography of African customer happily receiving package or browsing products on mobile. Warm, authentic, diverse representation. Position: right side of hero, rounded-xl with subtle shadow.

**Product Images**: Placeholder images from Chinese e-commerce sites (actual integration will pull real images). Aspect-ratio: square, object-cover.

**Trust Indicators**: Small icons/badges for secure payment, verified merchants, tracked shipping in footer or about section.

**Empty States**: Friendly illustrations for empty cart, no orders yet. Style: Minimalist line art in brand colors.

---

## Animations (Minimal & Purposeful)

Use **Framer Motion** sparingly:
- Page transitions: Subtle fade-in (0.3s)
- Cart drawer: Slide-in from right (0.4s ease-out)
- Product cards: Hover lift (translateY -4px) with shadow increase
- Status changes: Gentle pulse on status badge update
- Loading states: Skeleton screens, not spinners

**No**: Parallax, scroll-triggered animations, auto-playing carousels.

---

## Key Pages Layout

**Landing Page**: Hero → How It Works (3-step process with icons) → Popular Products Grid → Trust Section (testimonials, stats) → CTA Section → Footer

**Product Search**: Sticky filter sidebar left (categories, price range), product grid right with pagination

**Checkout Flow**: Multi-step indicator top, single-column form, order summary sidebar right (sticky)

**User Dashboard**: Sidebar navigation left, main content area with tab navigation for Orders/Profile/Settings

**Order Detail**: Breadcrumb → Order summary card → Tracking timeline → Item list → Actions (contact support, download invoice)