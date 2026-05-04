
-- 1) Restrict self-insert on user_roles to non-privileged roles only
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;

CREATE POLICY "Users can insert their own role during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('student'::public.app_role, 'agent'::public.app_role)
);

-- Prevent updates/deletes on user_roles by users (no policies = denied, but be explicit by not adding any)

-- 2) Tighten agent access to student profiles via leads using a SECURITY INVOKER view
-- Replace the broad policy with one that still allows the row match,
-- but expose a safe view to the application for agent->student lookups.

-- Keep the existing policy but narrow it: agents only see rows where a lead exists (already the case).
-- We additionally create a restricted view exposing only safe columns.
CREATE OR REPLACE VIEW public.student_lead_profiles
WITH (security_invoker = true) AS
SELECT
  p.user_id,
  p.name,
  p.bio,
  p.field_of_study,
  p.languages,
  p.profile_photo_url,
  p.documents_ready
FROM public.profiles p
WHERE p.role = 'student';

GRANT SELECT ON public.student_lead_profiles TO authenticated;

-- 3) Remove the broad policy that exposed full profile rows (email, phone, etc.) to agents.
-- Agents should use the student_lead_profiles view instead, which respects RLS via security_invoker.
-- To allow the view to return rows for agents, we add a narrower policy that still covers the view's
-- SELECT but the application code should query the view (which only selects safe columns).
DROP POLICY IF EXISTS "Agents can view student profiles from leads" ON public.profiles;

CREATE POLICY "Agents can view linked student profiles (limited via view)"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.leads
    WHERE leads.student_id = profiles.user_id
      AND leads.agent_id = auth.uid()
  )
);
-- NOTE: This policy still permits row access; the safe column projection is enforced by
-- using the public.student_lead_profiles view in application code instead of selecting
-- from profiles directly. Future improvement: column-level GRANTs to revoke sensitive
-- columns from authenticated role for non-owner rows.
