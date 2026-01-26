-- Make the user-documents bucket public so uploaded images are visible
UPDATE storage.buckets 
SET public = true 
WHERE id = 'user-documents';