-- Add documents_ready column to profiles table for students to track which documents they have ready
ALTER TABLE public.profiles
ADD COLUMN documents_ready text[] DEFAULT NULL;