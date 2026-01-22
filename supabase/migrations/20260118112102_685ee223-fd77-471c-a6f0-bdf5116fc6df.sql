-- Add agent-specific fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS real_estate_group TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;