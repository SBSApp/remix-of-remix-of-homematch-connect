
-- Revoke EXECUTE on SECURITY DEFINER functions from public/anon/authenticated.
-- These are used internally by triggers and don't need to be callable from the API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
