-- Allow agents to view profiles of students who have expressed interest in their listings
CREATE POLICY "Agents can view student profiles from leads"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.leads
    WHERE leads.student_id = profiles.user_id
      AND leads.agent_id = auth.uid()
  )
);