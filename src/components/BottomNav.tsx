import { Home, User, Heart, MessageCircle, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  userType: "student" | "agent";
}

const BottomNav = ({ userType }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-elevated">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        <button
          onClick={() => navigate(userType === "student" ? "/listings" : "/leads")}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full transition-colors",
            isActive(userType === "student" ? "/listings" : "/leads")
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Home</span>
        </button>

        <button
          onClick={() => navigate(userType === "student" ? "/profile" : "/agent-profile")}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full transition-colors",
            isActive(userType === "student" ? "/profile" : "/agent-profile")
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Profile</span>
        </button>

        {userType === "agent" ? (
          <button
            onClick={() => navigate("/add-listing")}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              isActive("/add-listing") ? "text-primary-foreground" : "text-primary-foreground"
            )}
          >
            <div className="w-10 h-10 mb-0.5 flex items-center justify-center rounded-full bg-primary shadow-md">
              <span className="text-2xl font-light leading-none">+</span>
            </div>
            <span className="text-xs font-medium text-primary">Add</span>
          </button>
        ) : (
          <button
            onClick={() => navigate("/saved")}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              isActive("/saved") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Heart className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Saved</span>
          </button>
        )}

        <div
          className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground/50 cursor-not-allowed"
        >
          <MessageCircle className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Chat</span>
        </div>

        <button
          onClick={() => navigate(`/faqs?userType=${userType}`)}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full transition-colors",
            location.pathname === "/faqs" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Menu className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">More</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
