-- Tuma-Africa Link Cargo Database Migration for VPS
-- Run this on your fresh PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table with password field for JWT authentication
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  phone VARCHAR,
  profile_image_url VARCHAR,
  role VARCHAR NOT NULL DEFAULT 'user',
  verification_status VARCHAR NOT NULL DEFAULT 'pending',
  id_photo_path VARCHAR,
  selfie_path VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  product_link TEXT NOT NULL,
  product_name TEXT NOT NULL,
  screenshot_path TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  variation TEXT,
  specifications TEXT,
  notes TEXT,
  shipping_address TEXT NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending',
  order_stage VARCHAR,
  approved_by VARCHAR REFERENCES users(id),
  declined_by VARCHAR REFERENCES users(id),
  decline_reason TEXT,
  assigned_employee_id VARCHAR REFERENCES users(id),
  estimated_cost DECIMAL(10, 2),
  tracking_number VARCHAR,
  internal_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR NOT NULL REFERENCES orders(id),
  stage VARCHAR NOT NULL,
  note TEXT,
  updated_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id VARCHAR NOT NULL REFERENCES users(id),
  receiver_id VARCHAR REFERENCES users(id),
  order_id VARCHAR REFERENCES orders(id),
  message_text TEXT,
  media_type VARCHAR,
  media_path VARCHAR,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Homepage content tables

CREATE TABLE IF NOT EXISTS hero_content (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT NOT NULL,
  subheading TEXT,
  image_url VARCHAR,
  video_url VARCHAR,
  button_text VARCHAR,
  button_link VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about_us (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  mission TEXT,
  vision TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  logo_url VARCHAR,
  website_url VARCHAR,
  description TEXT,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_media_links (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  icon_name VARCHAR,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS terms_policy (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert default admin user (password: Admin123!)
-- Note: This is a hashed password using bcrypt
INSERT INTO users (email, password, first_name, last_name, role, verification_status)
VALUES ('admin@tuma-africa.com', '$2a$10$rGZxEKvQ8wB7YvHZxKzXfuMJ9kN8qH8YxQKZxJ8wB7YvHZxKzXfuM', 'Admin', 'User', 'super_admin', 'verified')
ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tuma_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tuma_user;
