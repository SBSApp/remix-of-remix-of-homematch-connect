import { useParams, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MapPin, Ruler, Calendar, User, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { expressInterest, useSavedListingsDB } from "@/hooks/useListings";
import { toast } from "sonner";

interface ListingWithAgent {
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
  profiles?: {
    name: string | null;
    real_estate_group: string | null;
  };
}

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingWithAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isSaved, toggleSaved } = useSavedListingsDB();
  const [isListingSaved, setIsListingSaved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching listing:", error);
      } else if (data) {
        // Fetch agent profile separately
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name, real_estate_group")
          .eq("user_id", data.agent_id)
          .maybeSingle();
        
        setListing({
          ...data,
          profiles: profileData || undefined
        });
      }
      setLoading(false);
    };

    fetchListing();
  }, [id]);

  useEffect(() => {
    if (id) {
      setIsListingSaved(isSaved(id));
    }
  }, [id, isSaved]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const handleHeartClick = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    const success = await toggleSaved(id);
    if (success) {
      setIsListingSaved(!isListingSaved);
    }
  };

  const handleInterest = async () => {
    if (!listing) return;
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    
    setIsSubmitting(true);
    const success = await expressInterest(listing.id, listing.agent_id);
    if (success) {
      setIsListingSaved(true);
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Listing not found</h1>
          <Button onClick={() => navigate("/listings")}>Back to Listings</Button>
        </div>
      </div>
    );
  }

  const getStayTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "Short Term":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      case "Long Term":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "Either":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground flex-1 truncate">{listing.title}</h1>
          <Button variant="ghost" size="icon" onClick={handleHeartClick}>
            <Heart
              className={`w-5 h-5 ${isListingSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
          </Button>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Main Image */}
        <div className="relative">
          <img
            src={listing.photos?.[0] || "/placeholder.svg"}
            alt={listing.title}
            className="w-full h-64 object-cover"
          />
          {listing.stay_type && (
            <Badge className={`absolute bottom-4 left-4 ${getStayTypeBadgeStyle(listing.stay_type)}`}>
              {listing.stay_type}
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Price & Location */}
          <div className="bg-card rounded-xl shadow-card p-4">
            <p className="text-primary font-bold text-2xl mb-2">{listing.price}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{listing.location}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-card rounded-xl shadow-card p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <Ruler className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-sm font-medium text-card-foreground">{listing.size}</p>
                <p className="text-xs text-muted-foreground">Size</p>
              </div>
              <div>
                <Calendar className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-sm font-medium text-card-foreground">{listing.stay_type || "Flexible"}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">About this property</h3>
            <p className="text-muted-foreground">{listing.description}</p>
          </div>

          {/* Features/Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="bg-card rounded-xl shadow-card p-4">
              <h3 className="text-lg font-semibold text-card-foreground mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Agent Info */}
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="text-lg font-semibold text-card-foreground mb-3">Listed by</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{listing.profiles?.name || "Agent"}</p>
                <p className="text-sm text-muted-foreground">{listing.profiles?.real_estate_group || "Independent Agent"}</p>
              </div>
            </div>
          </div>

          {/* Get in Contact */}
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Get in Contact</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Let the agent know you are interested in this listing so they can contact you directly.
            </p>
            <Button className="w-full" onClick={handleInterest} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "I'm interested!"
              )}
            </Button>
          </div>
        </div>
      </div>

      <BottomNav userType="student" />
    </div>
  );
};

export default ListingDetail;
