-- Remove unused SECURITY DEFINER functions that bypass RLS
-- These functions are not used in application code and allow any user to query other users' roles

DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_user_role(uuid);