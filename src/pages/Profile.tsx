import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, X, Check, Camera, User, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DOCUMENT_OPTIONS } from "@/constants/documents";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [languages, setLanguages] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [documentsReady, setDocumentsReady] = useState<string[]>([]);

  // Temp values for editing
  const [tempName, setTempName] = useState(name);
  const [tempFieldOfStudy, setTempFieldOfStudy] = useState(fieldOfStudy);
  const [tempLanguages, setTempLanguages] = useState(languages);
  const [tempBio, setTempBio] = useState(bio);
  const [tempPhoneNumber, setTempPhoneNumber] = useState(phoneNumber);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempProfilePhoto, setTempProfilePhoto] = useState<string | null>(profilePhoto);
  const [tempProfilePhotoFile, setTempProfilePhotoFile] = useState<File | null>(null);
  const [tempDocumentsReady, setTempDocumentsReady] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setFieldOfStudy(profile.field_of_study || "");
          setLanguages(profile.languages?.join(", ") || "");
          setBio(profile.bio || "");
          setPhoneNumber(profile.phone_number || "");
          setEmail(profile.email || "");
          setProfilePhoto(profile.profile_photo_url || null);
          setDocumentsReady(profile.documents_ready || []);
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
    setTempFieldOfStudy(fieldOfStudy);
    setTempLanguages(languages);
    setTempBio(bio);
    setTempPhoneNumber(phoneNumber);
    setTempEmail(email);
    setTempProfilePhoto(profilePhoto);
    setTempProfilePhotoFile(null);
    setTempDocumentsReady(documentsReady);
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
          field_of_study: tempFieldOfStudy,
          languages: languagesArray,
          bio: tempBio,
          phone_number: tempPhoneNumber,
          email: tempEmail,
          profile_photo_url: photoUrl,
          documents_ready: tempDocumentsReady.length > 0 ? tempDocumentsReady : null,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to save profile");
        return;
      }

      setName(tempName);
      setFieldOfStudy(tempFieldOfStudy);
      setLanguages(tempLanguages);
      setBio(tempBio);
      setPhoneNumber(tempPhoneNumber);
      setEmail(tempEmail);
      setProfilePhoto(photoUrl);
      setDocumentsReady(tempDocumentsReady);
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
    <AppLayout userType="student">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-4 py-4 lg:px-8 lg:py-6 flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Profile</h1>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCancel} disabled={saving}>
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
              <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
                <Check className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleEdit}>
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-4xl">
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
                    <Label htmlFor="fieldOfStudy" className="text-xs">Field of Study / Degree</Label>
                    <Input
                      id="fieldOfStudy"
                      value={tempFieldOfStudy}
                      onChange={(e) => setTempFieldOfStudy(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="languages" className="text-xs">Languages</Label>
                    <Input
                      id="languages"
                      value={tempLanguages}
                      onChange={(e) => setTempLanguages(e.target.value)}
                      placeholder="e.g. English, Dutch"
                      className="h-9"
                    />
                  </div>
                  
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-card-foreground mb-1">
                    {name || "Your Name"}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    {fieldOfStudy || "Your Field of Study"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Languages: {languages || "Not set"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-4">
          <h3 className="text-lg font-semibold text-card-foreground mb-3">
            Bio
          </h3>
          {isEditing ? (
            <Textarea
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
              placeholder="Tell agents about yourself, your study, and what you're looking for..."
              className="min-h-32 resize-none"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {bio || "No bio added yet."}
            </p>
          )}
        </div>

        {/* Contact Details Section */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-4">
          <h3 className="text-lg font-semibold text-card-foreground mb-3">
            Contact Details
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="phoneNumber" className="text-xs">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={tempPhoneNumber}
                  onChange={(e) => setTempPhoneNumber(e.target.value)}
                  placeholder="e.g. +31 6 12345678"
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="h-9"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Phone:</span>
                <span className="text-card-foreground">{phoneNumber || "Not set"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-card-foreground">{email || "Not set"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Documents Ready Section */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-card-foreground">
              Documents Ready
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Select the documents you have ready to share with agents. The more documents you have, the better your chances!
          </p>
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENT_OPTIONS.map((doc) => (
                <div key={doc} className="flex items-center space-x-3">
                  <Checkbox
                    id={`doc-${doc}`}
                    checked={tempDocumentsReady.includes(doc)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTempDocumentsReady((prev) => [...prev, doc]);
                      } else {
                        setTempDocumentsReady((prev) => prev.filter((d) => d !== doc));
                      }
                    }}
                  />
                  <label
                    htmlFor={`doc-${doc}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {doc}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {documentsReady.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {documentsReady.map((doc) => (
                    <span
                      key={doc}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                    >
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      {doc}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents selected yet.</p>
              )}
            </div>
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

export default Profile;