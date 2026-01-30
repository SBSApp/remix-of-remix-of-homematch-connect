import { useNavigate } from "react-router-dom";
import { UserCheck, Building, GraduationCap, ShieldCheck, Ban, Zap, ArrowRight } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  const stats = [
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Verified Users",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Ban,
      value: "0",
      label: "Scams or Fakes",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      icon: Zap,
      value: "24–48h",
      label: "Faster Matching",
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-accent/20" />
        
        {/* Decorative elements */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-end w-full pr-16 pl-12">
          <div className="max-w-xl">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/25">
                <Building className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Fidii
                </h1>
                <p className="text-muted-foreground font-medium -mt-1">Housing</p>
              </div>
            </div>

            {/* Tagline */}
            <h2 className="text-3xl font-semibold text-foreground leading-tight mb-4">
              Find Your Perfect Home,{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Without the Hassle
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              Connecting international students with verified real estate agents through a{" "}
              <span className="text-primary font-medium">safe</span>,{" "}
              <span className="text-primary font-medium">transparent</span>, and{" "}
              <span className="text-primary font-medium">easy-to-use</span> experience.
            </p>

            {/* Stats */}
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-4 p-4 bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 hover:bg-card/80 hover:border-border transition-all duration-300 hover:translate-x-2"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Selection */}
      <div className="flex-1 flex flex-col justify-center lg:pl-16 p-6 lg:p-12">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile header */}
          <div className="lg:hidden mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <Building className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Fidii</h1>
                <p className="text-sm text-muted-foreground -mt-0.5">Housing</p>
              </div>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              Connecting international students with verified real estate agents through a{" "}
              <span className="text-primary font-medium">safe</span>,{" "}
              <span className="text-primary font-medium">transparent</span>, and{" "}
              <span className="text-primary font-medium">easy-to-use</span> experience.
            </p>

            {/* Mobile Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-3 bg-card rounded-xl border border-border/50"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-2 shadow-md`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Selection Card */}
          <div className="bg-card rounded-3xl shadow-2xl shadow-black/5 border border-border/50 p-8 lg:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
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
                className="group w-full relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 hover:from-primary/20 hover:via-primary/10 hover:to-accent/20 border border-primary/20 hover:border-primary/40 rounded-2xl p-6 transition-all duration-300"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-lg font-semibold text-foreground block">
                      I'm a Student
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Looking for a place to rent
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Agent Button */}
              <button
                onClick={() => navigate("/auth?role=agent")}
                className="group w-full relative overflow-hidden bg-muted/50 hover:bg-muted border border-border hover:border-border/80 rounded-2xl p-6 transition-all duration-300"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary-foreground/10 to-secondary-foreground/5 border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors duration-300">
                    <UserCheck className="w-7 h-7 text-foreground/70 group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-lg font-semibold text-foreground block">
                      I'm an Agent
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Managing property listings
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </button>
            </div>
          </div>

          {/* Footer text */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
