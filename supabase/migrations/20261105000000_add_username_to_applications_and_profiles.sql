-- Migration: Add username to membership_applications and profiles
-- Enables member login via username as an alternative to email

ALTER TABLE public.membership_applications ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Index for fast lookup during login identifier resolution
CREATE INDEX IF NOT EXISTS idx_membership_applications_username ON public.membership_applications(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(LOWER(username));

