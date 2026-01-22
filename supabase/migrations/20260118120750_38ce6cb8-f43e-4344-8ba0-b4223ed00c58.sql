-- Add foreign key from listings to profiles for agent info
ALTER TABLE public.listings
ADD CONSTRAINT listings_agent_profile_fkey
FOREIGN KEY (agent_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add foreign key from leads to profiles for student info
ALTER TABLE public.leads
ADD CONSTRAINT leads_student_profile_fkey
FOREIGN KEY (student_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;