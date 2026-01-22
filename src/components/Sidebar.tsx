import { Home, User, Heart, MessageCircle, Menu, Plus, Building } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userType: "student" | "agent";
}

const Sidebar = ({ userType }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const studentNavItems = [
    { path: "/listings", icon: Home, label: "Browse" },
    { path: "/saved", icon: Heart, label: "Saved" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/faqs", icon: Menu, label: "FAQs" },
  ];

  const agentNavItems = [
    { path: "/leads", icon: Home, label: "Leads" },
    { path: "/manage-listings", icon: Building, label: "Listings" },
    { path: "/add-listing", icon: Plus, label: "Add Listing" },
    { path: "/agent-profile", icon: User, label: "Profile" },
    { path: "/faqs", icon: Menu, label: "FAQs" },
  ];

  const navItems = userType === "student" ? studentNavItems : agentNavItems;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border shadow-sm z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 
          className="text-2xl font-bold text-primary cursor-pointer"
          onClick={() => navigate("/")}
        >
          Fidii
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {userType === "student" ? "Find your home" : "Manage properties"}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path + (item.path === "/faqs" ? `?userType=${userType}` : ""))}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Chat - Coming Soon */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3 text-muted-foreground/50 cursor-not-allowed">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Chat</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full ml-auto">Soon</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
