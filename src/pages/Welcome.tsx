import { useNavigate } from "react-router-dom";
import { Home, UserCheck, Building, GraduationCap } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Building className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">Fidii</h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Connecting international students with verified real estate agents through a <span className="text-primary font-semibold">safe</span>, <span className="text-primary font-semibold">transparent</span>, and <span className="text-primary font-semibold">easy-to-use</span> experience. We make renting abroad simple, reliable, and stress-free for everyone involved.
          </p>
        </div>
      </div>

      {/* Right side - Selection */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-primary">Fidii</h1>
            <p className="text-muted-foreground mt-2 leading-relaxed">Connecting international students with verified real estate agents through a <span className="text-primary font-semibold">safe</span>, <span className="text-primary font-semibold">transparent</span>, and <span className="text-primary font-semibold">easy-to-use</span> experience.</p>
          </div>

          <div className="bg-card rounded-2xl shadow-elevated p-8">
            <h2 className="text-2xl font-semibold text-card-foreground mb-2 text-center">
              Welcome to Fidii!
            </h2>
            <p className="text-muted-foreground mb-8 text-center">
              Choose how you'd like to use Fidii
            </p>

            <div className="space-y-4">
              <button
                onClick={() => navigate("/auth?role=student")}
                className="w-full bg-gradient-to-r from-primary/10 to-accent/30 hover:from-primary/20 hover:to-accent/40 border border-border rounded-xl p-6 transition-all flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-lg font-semibold text-card-foreground block">
                    I'm a Student
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Looking for a place to rent
                  </span>
                </div>
              </button>

              <button
                onClick={() => navigate("/auth?role=agent")}
                className="w-full bg-gradient-to-r from-secondary to-muted hover:from-secondary/80 hover:to-muted/80 border border-border rounded-xl p-6 transition-all flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <UserCheck className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-lg font-semibold text-card-foreground block">
                    I'm an Agent
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Managing property listings
                  </span>
                </div>
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
