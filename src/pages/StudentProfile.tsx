import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Phone, BookOpen, Globe, Loader2, FileCheck, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { DOCUMENT_OPTIONS } from "@/constants/documents";

interface StudentProfileData {
  user_id: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  field_of_study: string | null;
  bio: string | null;
  languages: string[] | null;
  profile_photo_url: string | null;
  documents_ready: string[] | null;
}

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!id) {
        setError("No student ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, name, email, phone_number, field_of_study, bio, languages, profile_photo_url, documents_ready")
          .eq("user_id", id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setError("Could not load student profile");
          setLoading(false);
          return;
        }

        if (!profileData) {
          setError("Student not found or you don't have access");
          setLoading(false);
          return;
        }

        setStudent(profileData);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [id]);

  if (loading) {
    return (
      <AppLayout userType="agent">
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !student) {
    return (
      <AppLayout userType="agent">
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">👤</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Student not found</h1>
            <p className="text-muted-foreground mb-4">{error || "This profile doesn't exist or you don't have access."}</p>
            <Button onClick={() => navigate("/leads")}>Back to Leads</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const documentsReady = student.documents_ready || [];
  const documentProgress = Math.round((documentsReady.length / DOCUMENT_OPTIONS.length) * 100);

  return (
    <AppLayout userType="agent">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{student.name || "Student"}</h1>
            {student.field_of_study && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>{student.field_of_study}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="xl:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {student.profile_photo_url ? (
                    <img 
                      src={student.profile_photo_url} 
                      alt={student.name || "Student"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{student.name || "Student"}</h2>
                  {student.field_of_study && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <BookOpen className="w-4 h-4" />
                      <span>{student.field_of_study}</span>
                    </div>
                  )}
                  {student.languages && student.languages.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Globe className="w-4 h-4" />
                        <span>Languages</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {student.languages.map((language) => (
                          <Badge key={language} variant="outline">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            {student.bio && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">{student.bio}</p>
              </div>
            )}

            {/* Documents Ready */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Documents Ready</h2>
                <Badge variant="secondary" className="text-sm">
                  <FileCheck className="w-4 h-4 mr-1" />
                  {documentsReady.length} of {DOCUMENT_OPTIONS.length}
                </Badge>
              </div>
              

              {documentsReady.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DOCUMENT_OPTIONS.map((doc) => {
                    const isReady = documentsReady.includes(doc);
                    return (
                      <div 
                        key={doc} 
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isReady 
                            ? "bg-primary/10 border-primary/30" 
                            : "bg-muted/30 border-border opacity-50"
                        }`}
                      >
                        <FileText className={`w-5 h-5 ${isReady ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={isReady ? "text-foreground" : "text-muted-foreground"}>{doc}</span>
                        {isReady && (
                          <FileCheck className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  This student hasn't indicated which documents they have ready.
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Contact */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
              
              <div className="space-y-4 mb-6">
                {student.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href={`mailto:${student.email}`} className="text-foreground hover:text-primary truncate block">
                        {student.email}
                      </a>
                    </div>
                  </div>
                )}
                {student.phone_number && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a href={`tel:${student.phone_number}`} className="text-foreground hover:text-primary">
                        {student.phone_number}
                      </a>
                    </div>
                  </div>
                )}
                {!student.email && !student.phone_number && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No contact information available
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {student.email && (
                  <Button className="w-full" variant="outline" asChild>
                    <a href={`mailto:${student.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                )}
                {student.phone_number && (
                  <Button className="w-full" asChild>
                    <a href={`tel:${student.phone_number}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentProfile;
