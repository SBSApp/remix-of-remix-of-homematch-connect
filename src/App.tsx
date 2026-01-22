import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Welcome from "./pages/Welcome";
import Listings from "./pages/Listings";
import Leads from "./pages/Leads";
import Profile from "./pages/Profile";
import AgentProfile from "./pages/AgentProfile";
import Saved from "./pages/Saved";
import AddListing from "./pages/AddListing";
import ManageListings from "./pages/ManageListings";
import FAQs from "./pages/FAQs";
import NotFound from "./pages/NotFound";
import StudentProfile from "./pages/StudentProfile";
import ListingDetail from "./pages/ListingDetail";
import Auth from "./pages/Auth";
import StudentOnboarding from "./pages/StudentOnboarding";
import AgentOnboarding from "./pages/AgentOnboarding";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Always redirect to welcome page on app load
    if (location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/student-onboarding" element={<StudentOnboarding />} />
      <Route path="/agent-onboarding" element={<AgentOnboarding />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
      <Route path="/leads" element={<Leads />} />
      <Route path="/student/:id" element={<StudentProfile />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/agent-profile" element={<AgentProfile />} />
      <Route path="/saved" element={<Saved />} />
      <Route path="/add-listing" element={<AddListing />} />
      <Route path="/manage-listings" element={<ManageListings />} />
      <Route path="/faqs" element={<FAQs />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
