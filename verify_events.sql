-- Ensure events table has required columns for details and location
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'description') THEN
        ALTER TABLE events ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'location') THEN
        ALTER TABLE events ADD COLUMN location TEXT;
    END IF;
END $$;
