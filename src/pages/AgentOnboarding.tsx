import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Upload, Check, X, Loader2, Camera, User } from "lucide-react";

const DOCUMENT_TYPES = [
  { id: "passport", label: "Passport / ID" },
  { id: "agent_license", label: "Agent License" },
];

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

const AgentOnboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [realEstateGroup, setRealEstateGroup] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { file: File; uploading: boolean; uploaded: boolean }>>({});
  
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth?role=agent");
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
        navigate("/leads");
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

  const handleFileSelect = (docType: string, file: File) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [docType]: { file, uploading: false, uploaded: false },
    }));
  };

  const removeFile = (docType: string) => {
    setUploadedDocs((prev) => {
      const newDocs = { ...prev };
      delete newDocs[docType];
      return newDocs;
    });
  };

  const uploadDocuments = async () => {
    if (!userId) return;

    for (const [docType, docData] of Object.entries(uploadedDocs)) {
      if (docData.uploaded) continue;

      setUploadedDocs((prev) => ({
        ...prev,
        [docType]: { ...prev[docType], uploading: true },
      }));

      const fileExt = docData.file.name.split(".").pop();
      const filePath = `${userId}/${docType}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("user-documents")
        .upload(filePath, docData.file, { upsert: true });

      if (uploadError) {
        toast.error(`Failed to upload ${docType}`);
        setUploadedDocs((prev) => ({
          ...prev,
          [docType]: { ...prev[docType], uploading: false },
        }));
        continue;
      }

      // Save document reference to database
      const { error: dbError } = await supabase.from("user_documents").insert({
        user_id: userId,
        document_type: docType,
        file_name: docData.file.name,
        file_path: filePath,
      });

      if (dbError) {
        console.error("Error saving document reference:", dbError);
      }

      setUploadedDocs((prev) => ({
        ...prev,
        [docType]: { ...prev[docType], uploading: false, uploaded: true },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!userId) {
      toast.error("Not authenticated");
      return;
    }

    setLoading(true);

    try {
      // Upload any selected documents
      await uploadDocuments();

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
            real_estate_group: realEstateGroup.trim() || null,
            languages: languages.length > 0 ? languages : null,
            profile_photo_url: photoUrl,
            onboarding_completed: true,
            role: "agent",
          })
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase.from("profiles").insert({
          user_id: userId,
          name: name.trim(),
          real_estate_group: realEstateGroup.trim() || null,
          languages: languages.length > 0 ? languages : null,
          profile_photo_url: photoUrl,
          onboarding_completed: true,
          role: "agent",
        });

        if (error) throw error;
      }

      toast.success("Profile created successfully!");
      navigate("/leads");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipDocuments = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name before continuing");
      return;
    }
    
    setUploadedDocs({});
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(fakeEvent);
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
          <h1 className="text-2xl font-bold text-foreground">Set Up Your Agent Profile</h1>
          <p className="text-muted-foreground mt-1">
            Complete your profile to start managing listings
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
              <Label htmlFor="realEstateGroup">Real Estate Group / Agency</Label>
              <Input
                id="realEstateGroup"
                placeholder="e.g. Amsterdam Real Estate Group"
                value={realEstateGroup}
                onChange={(e) => setRealEstateGroup(e.target.value)}
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
          </div>

          {/* Documents Card */}
          <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Verification Documents</h2>
              <p className="text-sm text-muted-foreground">
                Optional - helps build trust with students
              </p>
            </div>

            <div className="space-y-3">
              {DOCUMENT_TYPES.map((docType) => {
                const uploaded = uploadedDocs[docType.id];
                return (
                  <div
                    key={docType.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                  >
                    <span className="text-sm font-medium text-card-foreground">
                      {docType.label}
                    </span>
                    {uploaded ? (
                      <div className="flex items-center gap-2">
                        {uploaded.uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : uploaded.uploaded ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <>
                            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                              {uploaded.file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(docType.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(docType.id, file);
                          }}
                        />
                        <div className="flex items-center gap-1 text-primary text-sm hover:underline">
                          <Upload className="w-4 h-4" />
                          Upload
                        </div>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
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
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkipDocuments}
              disabled={loading}
              className="text-muted-foreground"
            >
              Skip documents for now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentOnboarding;