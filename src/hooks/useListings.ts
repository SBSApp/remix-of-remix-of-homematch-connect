import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Listing {
  id: string;
  agent_id: string;
  title: string;
  description: string | null;
  price: string;
  location: string;
  neighborhood: string | null;
  size: string;
  stay_type: string | null;
  amenities: string[] | null;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
  latitude: number | null;
  longitude: number | null;
}

export const useListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to load listings");
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return { listings, loading, refetch: fetchListings };
};

export const useAgentListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgentListings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("agent_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching agent listings:", error);
      toast.error("Failed to load your listings");
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const deleteListing = async (id: string) => {
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing");
      return false;
    }
    
    setListings(prev => prev.filter(l => l.id !== id));
    return true;
  };

  useEffect(() => {
    fetchAgentListings();
  }, []);

  return { listings, loading, refetch: fetchAgentListings, deleteListing };
};

export const useSavedListingsDB = () => {
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedListings = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("saved_listings")
      .select(`
        listing_id,
        listings (*)
      `)
      .eq("student_id", user.id);

    if (error) {
      console.error("Error fetching saved listings:", error);
    } else {
      const ids = data?.map(d => d.listing_id) || [];
      const listings = data?.map(d => d.listings as unknown as Listing).filter(Boolean) || [];
      setSavedListingIds(ids);
      setSavedListings(listings);
    }
    setLoading(false);
  };

  const saveListing = async (listingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to save listings");
      return false;
    }

    const { error } = await supabase
      .from("saved_listings")
      .insert({ student_id: user.id, listing_id: listingId });

    if (error) {
      if (error.code === "23505") {
        // Already saved
        return true;
      }
      console.error("Error saving listing:", error);
      toast.error("Failed to save listing");
      return false;
    }

    setSavedListingIds(prev => [...prev, listingId]);
    return true;
  };

  const unsaveListing = async (listingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("saved_listings")
      .delete()
      .eq("student_id", user.id)
      .eq("listing_id", listingId);

    if (error) {
      console.error("Error unsaving listing:", error);
      toast.error("Failed to remove from saved");
      return false;
    }

    setSavedListingIds(prev => prev.filter(id => id !== listingId));
    setSavedListings(prev => prev.filter(l => l.id !== listingId));
    return true;
  };

  const isSaved = (listingId: string) => savedListingIds.includes(listingId);

  const toggleSaved = async (listingId: string) => {
    if (isSaved(listingId)) {
      return unsaveListing(listingId);
    } else {
      return saveListing(listingId);
    }
  };

  useEffect(() => {
    fetchSavedListings();
  }, []);

  return { savedListings, savedListingIds, loading, isSaved, toggleSaved, saveListing, refetch: fetchSavedListings };
};

export const useLeads = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("leads")
      .select(`
        id,
        created_at,
        listing_id,
        student_id,
        listings (title)
      `)
      .eq("agent_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching leads:", error);
      setLoading(false);
      return;
    }

    // Fetch profiles for each lead
    const leadsWithProfiles = await Promise.all(
      (data || []).map(async (lead) => {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name, email, phone_number, field_of_study, bio, profile_photo_url, languages, documents_ready")
          .eq("user_id", lead.student_id)
          .maybeSingle();
        
        return {
          ...lead,
          profiles: profileData
        };
      })
    );

    setLeads(leadsWithProfiles);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return { leads, loading, refetch: fetchLeads };
};

export const expressInterest = async (listingId: string, agentId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error("Please sign in to express interest");
    return false;
  }

  // First, save the listing
  await supabase
    .from("saved_listings")
    .upsert({ student_id: user.id, listing_id: listingId }, { onConflict: "student_id,listing_id" });

  // Then, create the lead
  const { error } = await supabase
    .from("leads")
    .insert({ 
      student_id: user.id, 
      listing_id: listingId,
      agent_id: agentId 
    });

  if (error) {
    if (error.code === "23505") {
      toast.info("You've already expressed interest in this listing");
      return true;
    }
    console.error("Error expressing interest:", error);
    toast.error("Failed to express interest");
    return false;
  }

  toast.success("Your interest has been sent to the agent!");
  return true;
};
