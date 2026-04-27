-- 1. Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  email TEXT,
  total_amount NUMERIC DEFAULT 0,
  items JSONB,
  status TEXT DEFAULT 'pending', 
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create products table if missing
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  image_url TEXT,
  category TEXT,
  stock_status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add is_active column to notices if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notices' AND column_name = 'is_active') THEN
        ALTER TABLE notices ADD COLUMN is_active INTEGER DEFAULT 1;
    END IF;
END $$;

-- 4. Add is_active to committee_members if missing 
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'committee_members' AND column_name = 'is_active') THEN
        ALTER TABLE committee_members ADD COLUMN is_active INTEGER DEFAULT 1;
    END IF;
END $$;

-- 5. Add Performance Indexes (speeds up query loading significantly)
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_notices_is_active ON notices(is_active);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date DESC);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
