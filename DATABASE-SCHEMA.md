# 🗄️ Tuma-Africa Database Schema

## Overview

Your database currently has **10 tables** with **1 user** and **1 order**.

---

## 📊 Database Tables

### 1. **users** (User Accounts)
Stores all user accounts with 4 roles: user, employee, admin, super_admin

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| email | varchar | User email |
| first_name | varchar | First name |
| last_name | varchar | Last name |
| phone | varchar | Phone number |
| **role** | varchar | `user`, `employee`, `admin`, `super_admin` |
| **verification_status** | varchar | `pending`, `verified`, `rejected` |
| id_photo_path | varchar | Path to ID photo |
| selfie_path | varchar | Path to selfie photo |
| profile_image_url | varchar | Profile picture URL |
| created_at | timestamp | Account creation date |
| updated_at | timestamp | Last update |

**Current Data:** 1 user

---

### 2. **orders** (Product Orders)
All customer orders from Chinese e-commerce sites

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| user_id | varchar | Foreign key to users |
| product_name | text | Name of product |
| product_link | text | URL to product |
| screenshot_path | text | Product screenshot |
| quantity | integer | Quantity ordered |
| variation | text | Product variation/options |
| specifications | text | Product specifications |
| shipping_address | text | Delivery address |
| notes | text | Customer notes |
| **status** | varchar | Order approval status |
| **order_stage** | varchar | 4-stage tracking (see below) |
| estimated_cost | numeric | Estimated price |
| tracking_number | varchar | Shipment tracking # |
| approved_by | varchar | Admin who approved |
| declined_by | varchar | Admin who declined |
| decline_reason | text | Reason for rejection |
| assigned_employee_id | varchar | Assigned employee |
| internal_notes | text | Admin/employee notes |
| created_at | timestamp | Order creation |
| updated_at | timestamp | Last update |

**Current Data:** 1 order

**Order Stages:**
1. `purchased` - Purchased from China
2. `warehouse` - In warehouse
3. `shipping` - In ship/airplane
4. `in_country` - Arrived in Rwanda

---

### 3. **order_status_history** (Order Timeline)
Tracks all status changes for audit trail

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| order_id | varchar | Foreign key to orders |
| stage | varchar | New stage/status |
| note | text | Change notes |
| updated_by | varchar | User who made change |
| created_at | timestamp | When change occurred |

---

### 4. **messages** (Chat System)
Customer support messaging

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| order_id | varchar | Related order (optional) |
| sender_id | varchar | Message sender |
| receiver_id | varchar | Message receiver |
| content | text | Message text |
| media_type | varchar | `text`, `image`, `video`, `audio` |
| media_path | text | Path to media file |
| conversation_type | varchar | `user_order`, `general`, etc. |
| is_read | boolean | Read status |
| created_at | timestamp | Message timestamp |

**Current Data:** 0 messages

---

### 5. **hero_content** (Landing Page Hero)
Dynamic hero section content

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| media_type | varchar | `image` or `video` |
| media_path | text | Path to media file |
| heading | text | Main heading |
| subheading | text | Subtitle |
| button_text | text | CTA button text |
| button_link | text | CTA button URL |
| is_active | boolean | Visibility status |
| display_order | integer | Sort order |
| created_at | timestamp | Creation date |
| updated_at | timestamp | Last update |

---

### 6. **companies** (Partner Companies)
Companies displayed on landing page

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| name | varchar | Company name |
| logo_path | text | Logo image path |
| url | text | Company website |
| display_order | integer | Sort order |
| is_active | boolean | Visibility status |
| created_at | timestamp | Creation date |

---

### 7. **social_media_links** (Social Media)
Social media links in footer

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| platform | varchar | Platform name |
| icon_path | text | Icon image path |
| url | text | Social media URL |
| display_order | integer | Sort order |
| is_active | boolean | Visibility status |
| created_at | timestamp | Creation date |

---

### 8. **about_us** (About Page Content)
About page content management

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| heading | text | Section heading |
| content | text | Section content |
| media_type | varchar | `image` or `video` |
| media_path | text | Path to media file |
| updated_at | timestamp | Last update |

---

### 9. **terms_policy** (Terms & Privacy)
Terms of service and privacy policy

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| type | varchar | `terms` or `privacy` |
| title | text | Document title |
| content | text | Document content |
| updated_at | timestamp | Last update |

---

### 10. **sessions** (User Sessions)
Session management for authentication

| Column | Type | Description |
|--------|------|-------------|
| sid | varchar | Session ID (primary key) |
| sess | jsonb | Session data |
| expire | timestamp | Expiration time |

---

## 🔑 User Roles & Permissions

### User Roles
1. **user** - Regular customers (default)
   - Place orders
   - Upload verification
   - Track orders
   - Chat with support

2. **employee** - Staff members
   - View assigned orders
   - Update order status
   - Respond to messages
   - View customer information

3. **admin** - Administrators
   - Approve/reject orders
   - Assign employees
   - Manage all orders
   - Access admin dashboard
   - Update order stages

4. **super_admin** - Super administrators
   - All admin permissions
   - Manage users
   - Promote/demote roles
   - Access all features
   - System configuration

---

## 📈 Current Database Statistics

```
Total Tables:    10
Total Users:     1
Total Orders:    1
Total Messages:  0
```

---

## 🔄 Order Workflow

### 1. Customer Actions
- Customer places order (status: `submitted`)
- Upload product screenshot
- Add shipping address

### 2. Admin Review
- Admin approves/rejects order
- If approved: order_stage = `purchased`

### 3. Order Tracking (4 Stages)
1. **Purchased** - Bought from Chinese site
2. **Warehouse** - Arrived at warehouse
3. **Shipping** - On ship/airplane to Rwanda
4. **In Country** - Arrived in Rwanda, ready for delivery

### 4. History Tracking
Every status change is logged in `order_status_history`

---

## 🔐 Verification System

Users must verify their identity:
1. Upload ID photo (`id_photo_path`)
2. Upload selfie (`selfie_path`)
3. Admin reviews (`verification_status`)
   - `pending` - Awaiting review
   - `verified` - Approved
   - `rejected` - Declined

---

## 💬 Messaging System

- Order-specific conversations
- General support messages
- Image/video/audio support
- Read receipts
- Bilingual support (English/Kinyarwanda)

---

## 🛠️ Database Queries for VPS

### View all users
```sql
SELECT id, email, first_name, last_name, role, verification_status 
FROM users;
```

### View all orders
```sql
SELECT id, user_id, product_name, order_stage, status, created_at 
FROM orders 
ORDER BY created_at DESC;
```

### View order history
```sql
SELECT oh.*, o.product_name 
FROM order_status_history oh
JOIN orders o ON oh.order_id = o.id
ORDER BY oh.created_at DESC;
```

### View pending verifications
```sql
SELECT id, email, first_name, last_name, verification_status 
FROM users 
WHERE verification_status = 'pending';
```

### View unread messages
```sql
SELECT m.*, u.first_name, u.last_name 
FROM messages m
JOIN users u ON m.sender_id = u.id
WHERE is_read = false
ORDER BY created_at DESC;
```

---

## 🗄️ Database Management Commands

```bash
# Connect to database
psql -U tuma_user -d tuma_africa

# Backup database
pg_dump -U tuma_user tuma_africa > backup_$(date +%Y%m%d).sql

# Restore database
psql -U tuma_user tuma_africa < backup_20250126.sql

# Update schema after code changes
npm run db:push
```

---

## 📊 Schema Source File

The database schema is defined in:
```
shared/schema.ts
```

Any changes to the database structure must be made in this file, then run:
```bash
npm run db:push
```

---

**Last Updated:** October 26, 2025
