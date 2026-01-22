import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, User, Clock, Mail, Phone, BookOpen, Globe, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";

interface StudentProfileData {
  user_id: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  field_of_study: string | null;
  bio: string | null;
  languages: string[] | null;
  profile_photo_url: string | null;
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
        // First verify this is a lead belonging to the current agent
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        // Fetch the student profile - RLS will only allow if agent has a lead from this student
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, name, email, phone_number, field_of_study, bio, languages, profile_photo_url")
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-card shadow-sm">
          <div className="max-w-lg mx-auto px-4 py-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center pt-20">
          <p className="text-muted-foreground">{error || "Student not found"}</p>
          <Button variant="outline" onClick={() => navigate("/leads")} className="mt-4">
            Return to Leads
          </Button>
        </div>
        <BottomNav userType="agent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Leads</span>
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {/* Profile Header */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {student.profile_photo_url ? (
                <img 
                  src={student.profile_photo_url} 
                  alt={student.name || "Student"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-card-foreground">
                {student.name || "Student"}
              </h1>
              {student.field_of_study && (
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{student.field_of_study}</span>
                </div>
              )}
            </div>
          </div>
          
          {student.languages && student.languages.length > 0 && (
            <div className="mb-4">
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

        {/* About */}
        {student.bio && (
          <div className="bg-card rounded-xl shadow-card p-6 mb-4">
            <h2 className="text-lg font-semibold text-card-foreground mb-3">About</h2>
            <p className="text-card-foreground leading-relaxed">{student.bio}</p>
          </div>
        )}

        {/* Contact */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-4">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Contact Information</h2>
          <div className="space-y-3">
            {student.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <a href={`mailto:${student.email}`} className="text-primary hover:underline">
                  {student.email}
                </a>
              </div>
            )}
            {student.phone_number && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <a href={`tel:${student.phone_number}`} className="text-primary hover:underline">
                  {student.phone_number}
                </a>
              </div>
            )}
            {!student.email && !student.phone_number && (
              <p className="text-muted-foreground text-sm">No contact information available</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {student.email && (
            <Button className="flex-1" variant="outline" asChild>
              <a href={`mailto:${student.email}`}>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </a>
            </Button>
          )}
          {student.phone_number && (
            <Button className="flex-1" asChild>
              <a href={`tel:${student.phone_number}`}>
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </a>
            </Button>
          )}
        </div>
      </div>

      <BottomNav userType="agent" />
    </div>
  );
};

export default StudentProfile;