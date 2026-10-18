-- Add updated_at column to announcements table if it doesn't exist
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
