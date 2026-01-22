import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Pencil, X, Check, Camera, User, Home } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAgentListings } from "@/hooks/useListings";

const AgentProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [realEstateGroup, setRealEstateGroup] = useState("");
  const [languages, setLanguages] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Temp values for editing
  const [tempName, setTempName] = useState(name);
  const [tempRealEstateGroup, setTempRealEstateGroup] = useState(realEstateGroup);
  const [tempLanguages, setTempLanguages] = useState(languages);
  const [tempProfilePhoto, setTempProfilePhoto] = useState<string | null>(profilePhoto);
  const [tempProfilePhotoFile, setTempProfilePhotoFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { listings: myListings, loading: listingsLoading } = useAgentListings();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setUserId(user.id);

        // Fetch profile data
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
        }

        if (profile) {
          setName(profile.name || "");
          setRealEstateGroup(profile.real_estate_group || "");
          setLanguages(profile.languages?.join(", ") || "");
          setProfilePhoto(profile.profile_photo_url || null);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleEdit = () => {
    setTempName(name);
    setTempRealEstateGroup(realEstateGroup);
    setTempLanguages(languages);
    setTempProfilePhoto(profilePhoto);
    setTempProfilePhotoFile(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    
    setSaving(true);
    try {
      let photoUrl = profilePhoto;

      // Upload new profile photo if changed
      if (tempProfilePhotoFile) {
        const fileExt = tempProfilePhotoFile.name.split('.').pop();
        const filePath = `${userId}/profile-photo.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("user-documents")
          .upload(filePath, tempProfilePhotoFile, { upsert: true });

        if (uploadError) {
          console.error("Error uploading photo:", uploadError);
          toast.error("Failed to upload photo");
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("user-documents")
            .getPublicUrl(filePath);
          photoUrl = publicUrl;
        }
      }

      const languagesArray = tempLanguages.split(",").map(l => l.trim()).filter(Boolean);

      const { error } = await supabase
        .from("profiles")
        .update({
          name: tempName,
          real_estate_group: tempRealEstateGroup,
          languages: languagesArray,
          profile_photo_url: photoUrl,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to save profile");
        return;
      }

      setName(tempName);
      setRealEstateGroup(tempRealEstateGroup);
      setLanguages(tempLanguages);
      setProfilePhoto(photoUrl);
      setIsEditing(false);
      toast.success("Profile saved successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempProfilePhoto(profilePhoto);
    setTempProfilePhotoFile(null);
    setIsEditing(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setTempProfilePhoto(imageUrl);
      setTempProfilePhotoFile(file);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AppLayout userType="agent">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-8 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCancel} disabled={saving}>
                <X className="w-3.5 h-3.5" />
                Cancel
              </Button>
              <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
                <Check className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleEdit}>
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="p-8 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-4">
          <div className="flex gap-4 items-start">
            <div className="relative">
              {(isEditing ? tempProfilePhoto : profilePhoto) ? (
                <img
                  src={isEditing ? tempProfilePhoto! : profilePhoto!}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              {isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={triggerPhotoUpload}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/60 transition-colors"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs">Name</Label>
                    <Input
                      id="name"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="group" className="text-xs">Real Estate Group</Label>
                    <Input
                      id="group"
                      value={tempRealEstateGroup}
                      onChange={(e) => setTempRealEstateGroup(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="languages" className="text-xs">Languages</Label>
                    <Input
                      id="languages"
                      value={tempLanguages}
                      onChange={(e) => setTempLanguages(e.target.value)}
                      placeholder="e.g. English, Dutch, Spanish"
                      className="h-9"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Response time: 1 hour</p>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    Verified Agent
                  </Badge>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-card-foreground mb-1">
                    {name || "Your Name"}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    {realEstateGroup || "Your Real Estate Group"}
                  </p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Response time: 1 hour</p>
                    <p>Languages: {languages || "Not set"}</p>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      Verified Agent
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* My Listings */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-4">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            My Listings
          </h3>
          {listingsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : myListings.length === 0 ? (
            <div className="text-center py-6">
              <Home className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No listings yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => navigate("/add-listing")}
              >
                Add your first listing
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myListings.slice(0, 3).map((listing) => (
                <div key={listing.id} className="flex items-center gap-3">
                  <img
                    src={listing.photos?.[0] || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-card-foreground truncate">
                      {listing.title}
                    </h4>
                    <p className="text-primary font-semibold">{listing.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {myListings.length > 0 && (
            <button 
              onClick={() => navigate("/manage-listings")}
              className="mt-4 w-full flex items-center justify-center gap-2 text-primary font-medium hover:underline"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive hover:bg-destructive/10"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate("/auth");
          }}
        >
          Sign Out
        </Button>
      </div>
    </AppLayout>
  );
};

export default AgentProfile;