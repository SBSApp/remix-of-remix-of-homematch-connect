import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MapPin, Ruler, Calendar, User, Loader2, Home, Wifi, Car, Snowflake, Tv, Utensils } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { expressInterest, useSavedListingsDB } from "@/hooks/useListings";

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
  const [selectedPhoto, setSelectedPhoto] = useState(0);
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

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi") || lower.includes("internet")) return Wifi;
    if (lower.includes("parking") || lower.includes("car")) return Car;
    if (lower.includes("ac") || lower.includes("air") || lower.includes("heating")) return Snowflake;
    if (lower.includes("tv") || lower.includes("television")) return Tv;
    if (lower.includes("kitchen") || lower.includes("cook")) return Utensils;
    return Home;
  };

  if (loading) {
    return (
      <AppLayout userType="student">
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!listing) {
    return (
      <AppLayout userType="student">
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Listing not found</h1>
            <p className="text-muted-foreground mb-4">This property may have been removed or doesn't exist.</p>
            <Button onClick={() => navigate("/listings")}>Back to Listings</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : ["/placeholder.svg"];

  return (
    <AppLayout userType="student">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-4 py-3 lg:px-8 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg lg:text-2xl font-bold text-foreground truncate">{listing.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{listing.location}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleHeartClick}
            className="h-10 w-10 flex-shrink-0"
          >
            <Heart
              className={`w-6 h-6 ${isListingSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Photos & Details */}
          <div className="xl:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={photos[selectedPhoto]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {listing.stay_type && (
                  <Badge className={`absolute top-4 left-4 ${getStayTypeBadgeStyle(listing.stay_type)}`}>
                    {listing.stay_type}
                  </Badge>
                )}
              </div>
              {photos.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhoto(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedPhoto === index ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Ruler className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">{listing.size}</p>
                  <p className="text-sm text-muted-foreground">Size</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">{listing.stay_type || "Flexible"}</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">{listing.neighborhood || "—"}</p>
                  <p className="text-sm text-muted-foreground">Neighborhood</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">{listing.amenities?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Amenities</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">About this property</h2>
              <p className="text-muted-foreground leading-relaxed">
                {listing.description || "No description available for this property."}
              </p>
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.amenities.map((amenity, index) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="text-foreground">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Price & Contact */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">Monthly Rent</p>
                <p className="text-4xl font-bold text-primary">{listing.price}</p>
              </div>

              {/* Agent Info */}
              <div className="border-t border-border pt-6 mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Listed by</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{listing.profiles?.name || "Agent"}</p>
                    <p className="text-sm text-muted-foreground">
                      {listing.profiles?.real_estate_group || "Independent Agent"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Interested?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Let the agent know you're interested so they can contact you directly.
                </p>
                <Button className="w-full" size="lg" onClick={handleInterest} disabled={isSubmitting}>
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
        </div>
      </div>
    </AppLayout>
  );
};

export default ListingDetail;
