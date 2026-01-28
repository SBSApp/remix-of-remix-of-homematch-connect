import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowRight, Loader2, Camera, User, FileText } from "lucide-react";
import { DOCUMENT_OPTIONS } from "@/constants/documents";

const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "German",
  "Mandarin",
  "Portuguese",
  "Arabic",
  "Hindi",
  "Japanese",
  "Korean",
  "Italian",
  "Dutch",
  "Russian",
  "Other",
];

const StudentOnboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [documentsReady, setDocumentsReady] = useState<string[]>([]);
  
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);

      // Check if already onboarded
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profile?.onboarding_completed) {
        navigate("/listings");
        return;
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [navigate]);

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!userId) {
      toast.error("Not authenticated");
      return;
    }

    setLoading(true);

    try {
      // Upload profile photo if selected
      let photoUrl: string | null = null;
      if (profilePhotoFile) {
        const fileExt = profilePhotoFile.name.split('.').pop();
        const filePath = `${userId}/profile-photo.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("user-documents")
          .upload(filePath, profilePhotoFile, { upsert: true });

        if (uploadError) {
          console.error("Error uploading photo:", uploadError);
          toast.error("Failed to upload profile photo");
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("user-documents")
            .getPublicUrl(filePath);
          photoUrl = publicUrl;
        }
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            name: name.trim(),
            field_of_study: fieldOfStudy.trim() || null,
            languages: languages.length > 0 ? languages : null,
            bio: bio.trim() || null,
            phone_number: phoneNumber.trim() || null,
            email: email.trim() || null,
            profile_photo_url: photoUrl,
            documents_ready: documentsReady.length > 0 ? documentsReady : null,
            onboarding_completed: true,
            role: "student",
          })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase.from("profiles").insert({
          user_id: userId,
          name: name.trim(),
          field_of_study: fieldOfStudy.trim() || null,
          languages: languages.length > 0 ? languages : null,
          bio: bio.trim() || null,
          phone_number: phoneNumber.trim() || null,
          email: email.trim() || null,
          profile_photo_url: photoUrl,
          documents_ready: documentsReady.length > 0 ? documentsReady : null,
          onboarding_completed: true,
          role: "student",
        });

        if (error) throw error;
      }

      toast.success("Profile created successfully!");
      navigate("/terms");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-1">
            Tell us about yourself to help find your perfect home
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-card-foreground">Basic Information</h2>

            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfilePhoto(URL.createObjectURL(file));
                      setProfilePhotoFile(file);
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/60 transition-colors"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">Add a profile photo</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldOfStudy">Field of Study / Degree</Label>
              <Input
                id="fieldOfStudy"
                placeholder="e.g. Computer Science, MBA"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Languages You Speak</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      languages.includes(lang)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-accent/30"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell landlords a bit about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-card-foreground">Contact Details</h2>
            <p className="text-sm text-muted-foreground">
              These details will be visible to agents so they can reach you
            </p>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="e.g. +31 6 12345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Documents Ready Card */}
          <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">Documents Ready</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Select the documents you have ready to share with agents. The more you have, the better your chances!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DOCUMENT_OPTIONS.map((doc) => (
                <div key={doc} className="flex items-center space-x-3">
                  <Checkbox
                    id={`onboard-${doc}`}
                    checked={documentsReady.includes(doc)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setDocumentsReady((prev) => [...prev, doc]);
                      } else {
                        setDocumentsReady((prev) => prev.filter((d) => d !== doc));
                      }
                    }}
                  />
                  <label
                    htmlFor={`onboard-${doc}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {doc}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Complete Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StudentOnboarding;
