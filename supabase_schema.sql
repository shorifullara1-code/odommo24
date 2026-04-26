-- Supabase Database Schema for Adomyo 24
-- Run this in the Supabase SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  userId TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'member', -- 'admin' or 'member'
  profile_image TEXT,
  bio TEXT,
  father_name TEXT,
  mother_name TEXT,
  present_address TEXT,
  permanent_address TEXT,
  blood_group TEXT,
  dob DATE,
  profession TEXT,
  educational_qualification TEXT,
  nid_number TEXT,
  emergency_contact TEXT,
  member_id_number TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- 'pending' or 'approved'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Notices Table
CREATE TABLE IF NOT EXISTS notices (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Events Table
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Donations Table
CREATE TABLE IF NOT EXISTS donations (
  id BIGSERIAL PRIMARY KEY,
  donor_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  message TEXT,
  phone_email TEXT,
  fund_type TEXT, -- e.g., 'General', 'Education'
  payment_method TEXT, -- e.g., 'bKash', 'Nagad'
  donor_type TEXT, -- 'member' or 'guest'
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Committee Members Table
CREATE TABLE IF NOT EXISTS committee_members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  userId TEXT, -- Connected userId for synchronization
  password TEXT, -- Hashed password for committee member login
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Products Table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  image_url TEXT,
  category TEXT,
  stock_status TEXT DEFAULT 'available', -- 'available' or 'out_of_stock'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - Optional but recommended
-- For simplicity in a prototype, you can keep them public or add specific policies:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public profiles are viewable by everyone." ON users FOR SELECT USING (true);
