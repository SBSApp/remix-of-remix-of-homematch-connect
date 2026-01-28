import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Home, UserCheck } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
});

type UserRole = "student" | "agent";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") as UserRole | null;
  
  const [isLogin, setIsLogin] = useState(!roleParam);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(roleParam);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user && event === "SIGNED_IN") {
          // Check if user needs onboarding or terms - defer this call
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("onboarding_completed, terms_accepted")
              .eq("user_id", session.user.id)
              .maybeSingle();

            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .maybeSingle();

            if (!profile?.onboarding_completed && roleData?.role === "student") {
              navigate("/student-onboarding");
            } else if (!profile?.onboarding_completed && roleData?.role === "agent") {
              navigate("/agent-onboarding");
            } else if (!profile?.terms_accepted) {
              navigate("/terms");
            } else if (roleData?.role === "agent") {
              navigate("/leads");
            } else if (roleData?.role === "student") {
              navigate("/listings");
            } else {
              navigate("/");
            }
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // User already logged in, redirect based on role, onboarding, and terms status
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_completed, terms_accepted")
            .eq("user_id", session.user.id)
            .maybeSingle();

          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (!profile?.onboarding_completed && roleData?.role === "student") {
            navigate("/student-onboarding");
          } else if (!profile?.onboarding_completed && roleData?.role === "agent") {
            navigate("/agent-onboarding");
          } else if (!profile?.terms_accepted) {
            navigate("/terms");
          } else if (roleData?.role === "agent") {
            navigate("/leads");
          } else if (roleData?.role === "student") {
            navigate("/listings");
          } else {
            navigate("/");
          }
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Welcome back!");
      } else {
        if (!selectedRole) {
          toast.error("Please select whether you are a student or an agent");
          return;
        }

        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please log in instead.");
          } else {
            toast.error(error.message);
          }
          return;
        }

        // Insert user role after successful signup
        if (data.user) {
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: data.user.id, role: selectedRole });

          if (roleError) {
            console.error("Error saving role:", roleError);
          }
        }

        toast.success("Account created successfully!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {isLogin ? "Welcome Back" : `Sign Up as ${selectedRole === "agent" ? "Agent" : "Student"}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isLogin
              ? "Sign in to continue to Fidii"
              : selectedRole === "agent" 
                ? "Create your agent account to manage listings"
                : "Create your student account to find housing"}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        <div className="bg-card rounded-xl shadow-card p-6">
          {!isLogin && (
            <div className="mb-6">
              <Label className="mb-3 block">I am a...</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("student")}
                  className={`p-4 rounded-lg border transition-colors flex flex-col items-center gap-2 ${
                    selectedRole === "student"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent/30"
                  }`}
                >
                  <Home className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("agent")}
                  className={`p-4 rounded-lg border transition-colors flex flex-col items-center gap-2 ${
                    selectedRole === "agent"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent/30"
                  }`}
                >
                  <UserCheck className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">Agent</span>
                </button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-primary font-medium hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
