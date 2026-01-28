import { useNavigate } from "react-router-dom";
import { UserCheck, Building, GraduationCap, ShieldCheck, Ban, Zap } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  const stats = [
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Verified Users",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Ban,
      value: "0",
      label: "Scams or Fakes",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: Zap,
      value: "24–48h",
      label: "Faster Matching",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="max-w-lg text-center relative z-10">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Building className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">Fidii - Housing</h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Connecting international students with verified real estate agents through a <span className="text-primary font-semibold">safe</span>, <span className="text-primary font-semibold">transparent</span>, and <span className="text-primary font-semibold">easy-to-use</span> experience.
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Selection */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-primary">Fidii - Housing</h1>
            <p className="text-muted-foreground mt-2 leading-relaxed">Connecting international students with verified real estate agents through a <span className="text-primary font-semibold">safe</span>, <span className="text-primary font-semibold">transparent</span>, and <span className="text-primary font-semibold">easy-to-use</span> experience.</p>
            
            {/* Mobile Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl p-3 border border-border/50 shadow-sm"
                >
                  <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
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
