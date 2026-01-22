import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, UserCheck } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-foreground">HomeMatch</h1>
          <p className="text-muted-foreground mt-1">Find your perfect home</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        <div className="bg-card rounded-xl shadow-card p-6 mb-4 text-center">
          <h2 className="text-xl font-semibold text-card-foreground mb-2">
            Welcome!
          </h2>
          <p className="text-muted-foreground mb-6">
            Choose how you'd like to use HomeMatch to get started.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/auth?role=student")}
              className="w-full bg-accent/30 hover:bg-accent/50 border border-border rounded-lg p-4 transition-colors flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <span className="text-base font-medium text-card-foreground block">
                  I am a student
                </span>
                <span className="text-sm text-muted-foreground">
                  Looking for a place to rent
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate("/auth?role=agent")}
              className="w-full bg-accent/30 hover:bg-accent/50 border border-border rounded-lg p-4 transition-colors flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <span className="text-base font-medium text-card-foreground block">
                  I am an agent
                </span>
                <span className="text-sm text-muted-foreground">
                  Managing property listings
                </span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Welcome;
