-- Add latitude and longitude columns to listings for map functionality
ALTER TABLE public.listings 
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision;