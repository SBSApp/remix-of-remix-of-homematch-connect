-- Add phone_number and email columns to profiles table for contact details
ALTER TABLE public.profiles 
ADD COLUMN phone_number text,
ADD COLUMN email text;