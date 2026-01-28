import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";

const TermsOfService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);

      // Check if already accepted terms
      const { data: profile } = await supabase
        .from("profiles")
        .select("terms_accepted")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profile?.terms_accepted) {
        // Already accepted, redirect based on role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (roleData?.role === "agent") {
          navigate("/leads");
        } else {
          navigate("/listings");
        }
        return;
      }

      // Get user role for redirect after acceptance
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setUserRole(roleData?.role || null);
      setCheckingAuth(false);
    };

    checkAuth();
  }, [navigate]);

  const handleAccept = async () => {
    if (!accepted) {
      toast.error("Please accept the terms and conditions to continue");
      return;
    }

    if (!userId) {
      toast.error("Not authenticated");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Welcome to Fidii!");
      
      if (userRole === "agent") {
        navigate("/leads");
      } else {
        navigate("/listings");
      }
    } catch (error) {
      console.error("Error accepting terms:", error);
      toast.error("Failed to save your acceptance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    // Sign out and redirect to welcome page
    await supabase.auth.signOut();
    toast.info("You must accept the terms to use Fidii");
    navigate("/");
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
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
              <p className="text-muted-foreground mt-1">
                Please review and accept our terms to continue
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-card rounded-xl shadow-card p-6 space-y-6">
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4 text-sm text-muted-foreground">
              <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Fidii ("the Platform"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>

              <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
              <p>
                Fidii is a platform that connects international students with verified real estate agents 
                to facilitate the housing search process. We provide a marketplace for listings and 
                communication between parties.
              </p>

              <h2 className="text-lg font-semibold text-foreground">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and 
                for all activities that occur under your account. You agree to provide accurate and 
                complete information when creating your account.
              </p>

              <h2 className="text-lg font-semibold text-foreground">4. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Post false or misleading information</li>
                <li>Harass or discriminate against other users</li>
                <li>Use the platform for any illegal purposes</li>
                <li>Attempt to circumvent our security measures</li>
                <li>Scrape or collect data without authorization</li>
              </ul>

              <h2 className="text-lg font-semibold text-foreground">5. Listings and Transactions</h2>
              <p>
                Fidii does not guarantee the accuracy of listings posted by agents. Users are 
                responsible for verifying all information before entering into any rental agreements. 
                Fidii is not a party to any rental agreements between students and landlords.
              </p>

              <h2 className="text-lg font-semibold text-foreground">6. Privacy</h2>
              <p>
                Your use of the Platform is also governed by our Privacy Policy. By using Fidii, 
                you consent to the collection and use of your information as described in our 
                Privacy Policy.
              </p>

              <h2 className="text-lg font-semibold text-foreground">7. Intellectual Property</h2>
              <p>
                All content on the Platform, including text, graphics, logos, and software, is the 
                property of Fidii or its licensors and is protected by intellectual property laws.
              </p>

              <h2 className="text-lg font-semibold text-foreground">8. Limitation of Liability</h2>
              <p>
                Fidii shall not be liable for any indirect, incidental, special, or consequential 
                damages arising out of your use of the Platform. Our total liability shall not 
                exceed the amount you paid to use our services.
              </p>

              <h2 className="text-lg font-semibold text-foreground">9. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at any time for violation 
                of these terms or for any other reason at our sole discretion.
              </p>

              <h2 className="text-lg font-semibold text-foreground">10. Changes to Terms</h2>
              <p>
                We may modify these terms at any time. Continued use of the Platform after changes 
                constitutes acceptance of the modified terms.
              </p>

              <h2 className="text-lg font-semibold text-foreground">11. Contact</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us through 
                the Platform's support channels.
              </p>
            </div>
          </ScrollArea>

          <div className="flex items-start space-x-3 pt-4 border-t">
            <Checkbox
              id="accept-terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <label
              htmlFor="accept-terms"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              I have read and agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={loading}
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              disabled={loading || !accepted}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Accept & Continue"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
