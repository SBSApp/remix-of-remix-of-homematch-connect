import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  userType: "student" | "agent";
}

const AppLayout = ({ children, userType }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar userType={userType} />
      </div>
      
      {/* Main content - full width on mobile, offset on desktop */}
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        {children}
      </main>
      
      {/* Mobile Bottom Nav - hidden on desktop */}
      <div className="lg:hidden">
        <BottomNav userType={userType} />
      </div>
    </div>
  );
};

export default AppLayout;
