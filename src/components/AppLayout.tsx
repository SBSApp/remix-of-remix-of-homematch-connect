import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  userType: "student" | "agent";
}

const AppLayout = ({ children, userType }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar userType={userType} />
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
