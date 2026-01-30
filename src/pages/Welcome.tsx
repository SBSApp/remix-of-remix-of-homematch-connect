import { useNavigate } from "react-router-dom";
import { UserCheck, Building, GraduationCap, ShieldCheck, Ban, Zap, ArrowRight } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  const stats = [
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Verified Users",
    },
    {
      icon: Ban,
      value: "No",
      label: "Scams or Fakes",
    },
    {
      icon: Zap,
      value: "24–48h",
      label: "Faster Matching",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-4xl">
        {/* Main Card */}
        <div className="bg-card rounded-3xl shadow-2xl shadow-black/10 border border-border/50 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Left - Branding */}
            <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-8 lg:p-12 flex flex-col justify-center">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                  <Building className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Fidii</h1>
                  <p className="text-sm text-muted-foreground font-medium -mt-1">Housing</p>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-muted-foreground leading-relaxed mb-8">
                Connecting international students with verified real estate agents through a{" "}
                <span className="text-primary font-semibold">safe</span>,{" "}
                <span className="text-primary font-semibold">transparent</span>, and{" "}
                <span className="text-primary font-semibold">easy-to-use</span> experience.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Selection */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Welcome to Fidii!
                </h2>
                <p className="text-muted-foreground">
                  Choose how you'd like to get started
                </p>
              </div>

              <div className="space-y-4">
                {/* Student Button */}
                <button
                  onClick={() => navigate("/auth?role=student")}
                  className="group w-full bg-primary hover:bg-primary/90 rounded-2xl p-5 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-base font-semibold text-primary-foreground block">
                        I'm a Student
                      </span>
                      <span className="text-sm text-primary-foreground/70">
                        Looking for a place to rent
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary-foreground/70 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Agent Button */}
                <button
                  onClick={() => navigate("/auth?role=agent")}
                  className="group w-full bg-muted hover:bg-muted/80 border border-border rounded-2xl p-5 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-base font-semibold text-foreground block">
                        I'm an Agent
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Managing property listings
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-8">
                By continuing, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
