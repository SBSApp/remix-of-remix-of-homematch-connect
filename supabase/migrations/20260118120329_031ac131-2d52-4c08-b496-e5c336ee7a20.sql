-- Create listings table for agents
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  location TEXT NOT NULL,
  neighborhood TEXT,
  size TEXT NOT NULL,
  stay_type TEXT CHECK (stay_type IN ('Short Term', 'Long Term', 'Either')),
  amenities TEXT[],
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved_listings junction table for students
CREATE TABLE public.saved_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, listing_id)
);

-- Create leads table for agents to see interested students
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(agent_id, student_id, listing_id)
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Listings policies: agents can CRUD their own, everyone can view
CREATE POLICY "Anyone can view listings" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Agents can insert their own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = agent_id);
CREATE POLICY "Agents can update their own listings" ON public.listings FOR UPDATE USING (auth.uid() = agent_id);
CREATE POLICY "Agents can delete their own listings" ON public.listings FOR DELETE USING (auth.uid() = agent_id);

-- Saved listings policies: students can CRUD their own
CREATE POLICY "Students can view their saved listings" ON public.saved_listings FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can save listings" ON public.saved_listings FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can unsave listings" ON public.saved_listings FOR DELETE USING (auth.uid() = student_id);

-- Leads policies: agents can view their leads, students can create leads
CREATE POLICY "Agents can view their leads" ON public.leads FOR SELECT USING (auth.uid() = agent_id);
CREATE POLICY "Students can express interest" ON public.leads FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can view their own leads" ON public.leads FOR SELECT USING (auth.uid() = student_id);

-- Trigger for updated_at on listings
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();