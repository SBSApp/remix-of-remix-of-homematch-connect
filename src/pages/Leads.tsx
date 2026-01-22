import BottomNav from "@/components/BottomNav";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLeads, useAgentListings } from "@/hooks/useListings";
import { Loader2, User, Mail, Phone, BookOpen, MessageSquare, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import FilterBar from "@/components/FilterBar";

const Leads = () => {
  const navigate = useNavigate();
  const { leads, loading } = useLeads();
  const { listings: agentListings } = useAgentListings();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showListingDialog, setShowListingDialog] = useState(false);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);

  const handleFilterClick = (filter: string) => {
    if (filter === "Listing") {
      setShowListingDialog(true);
      return;
    }
    
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleListingToggle = (listingId: string) => {
    setSelectedListings(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleListingsSubmit = () => {
    setActiveFilters(prev => {
      const filtered = prev.filter(f => !f.startsWith("Listing:"));
      if (selectedListings.length > 0) {
        return [...filtered, `Listing: ${selectedListings.length} selected`];
      }
      return filtered;
    });
    setShowListingDialog(false);
  };

  const hasActiveFilters = activeFilters.length > 0 || selectedListings.length > 0;

  const handleClearFilters = () => {
    setActiveFilters([]);
    setSelectedListings([]);
  };

  const filteredLeads = leads.filter(lead => {
    if (selectedListings.length > 0) {
      if (!selectedListings.includes(lead.listing_id)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <FilterBar 
          filters={["Listing"]} 
          onFilterClick={handleFilterClick}
          activeFilters={activeFilters}
          onClearFilters={handleClearFilters}
          showClearButton={hasActiveFilters}
        />
        
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredLeads.length > 0 ? (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-elevated transition-shadow"
                  onClick={() => navigate(`/student/${lead.student_id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {lead.profiles?.profile_photo_url ? (
                        <img 
                          src={lead.profiles.profile_photo_url} 
                          alt={lead.profiles?.name || "Student"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-card-foreground">
                          {lead.profiles?.name || "Student"}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Interested in: {lead.listings?.title || "Unknown listing"}
                      </p>
                      
                      {lead.profiles?.field_of_study && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{lead.profiles.field_of_study}</span>
                        </div>
                      )}
                      
                      {lead.profiles?.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${lead.profiles.email}`} className="text-primary hover:underline">
                            {lead.profiles.email}
                          </a>
                        </div>
                      )}
                      
                      {lead.profiles?.phone_number && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${lead.profiles.phone_number}`} className="text-primary hover:underline">
                            {lead.profiles.phone_number}
                          </a>
                        </div>
                      )}

                      {lead.profiles?.bio && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p className="line-clamp-3">{lead.profiles.bio}</p>
                          </div>
                        </div>
                      )}

                      {lead.profiles?.languages && lead.profiles.languages.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {lead.profiles.languages.map((lang: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No leads yet</h3>
              <p className="text-muted-foreground text-sm">When students express interest in your listings, they'll appear here</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav userType="agent" />

      <Dialog open={showListingDialog} onOpenChange={setShowListingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter by Listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {agentListings.length > 0 ? (
              agentListings.map((listing) => (
                <div key={listing.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={listing.id}
                    checked={selectedListings.includes(listing.id)}
                    onCheckedChange={() => handleListingToggle(listing.id)}
                  />
                  <label
                    htmlFor={listing.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {listing.title}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No listings yet</p>
            )}
            <Button onClick={handleListingsSubmit} className="w-full mt-4">
              Apply Filter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
