import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLeads, useAgentListings } from "@/hooks/useListings";
import { Loader2, User, Mail, Phone, BookOpen, MessageSquare, ChevronRight, Filter, FileText, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DOCUMENT_OPTIONS } from "@/constants/documents";

const Leads = () => {
  const navigate = useNavigate();
  const { leads, loading } = useLeads();
  const { listings: agentListings } = useAgentListings();
  const [showListingDialog, setShowListingDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const handleListingToggle = (listingId: string) => {
    setSelectedListings((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleDocumentToggle = (doc: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(doc)
        ? prev.filter((d) => d !== doc)
        : [...prev, doc]
    );
  };

  const handleClearFilters = () => {
    setSelectedListings([]);
    setSelectedDocuments([]);
  };

  const activeFilterCount = selectedListings.length + selectedDocuments.length;

  const filteredLeads = leads.filter((lead) => {
    // Filter by listing
    if (selectedListings.length > 0) {
      if (!selectedListings.includes(lead.listing_id)) {
        return false;
      }
    }
    // Filter by documents - student must have ALL selected documents
    if (selectedDocuments.length > 0) {
      const studentDocs = lead.profiles?.documents_ready || [];
      const hasAllDocs = selectedDocuments.every((doc) => studentDocs.includes(doc));
      if (!hasAllDocs) {
        return false;
      }
    }
    return true;
  });

  return (
    <AppLayout userType="agent">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-4 py-4 lg:px-8 lg:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Leads</h1>
              <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                {filteredLeads.length} interested students
              </p>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setShowListingDialog(true)}
                className="gap-2 text-sm"
                size="sm"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">By</span> Listing
                {selectedListings.length > 0 && (
                  <Badge variant="default" className="ml-1">
                    {selectedListings.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDocumentDialog(true)}
                className="gap-2 text-sm"
                size="sm"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">By</span> Documents
                {selectedDocuments.length > 0 && (
                  <Badge variant="default" className="ml-1">
                    {selectedDocuments.length}
                  </Badge>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <Button variant="ghost" onClick={handleClearFilters} size="sm">
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="bg-card rounded-xl shadow-card p-6 cursor-pointer hover:shadow-elevated transition-shadow"
                onClick={() => navigate(`/student/${lead.student_id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {lead.profiles?.profile_photo_url ? (
                      <img
                        src={lead.profiles.profile_photo_url}
                        alt={lead.profiles?.name || "Student"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-card-foreground">
                        {lead.profiles?.name || "Student"}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
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
                        <a
                          href={`mailto:${lead.profiles.email}`}
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lead.profiles.email}
                        </a>
                      </div>
                    )}

                    {lead.profiles?.phone_number && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Phone className="w-4 h-4" />
                        <a
                          href={`tel:${lead.profiles.phone_number}`}
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lead.profiles.phone_number}
                        </a>
                      </div>
                    )}

                    {lead.profiles?.bio && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p className="line-clamp-2">{lead.profiles.bio}</p>
                        </div>
                      </div>
                    )}

                    {lead.profiles?.languages && lead.profiles.languages.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {lead.profiles.languages.map((lang: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {lead.profiles?.documents_ready && lead.profiles.documents_ready.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{lead.profiles.documents_ready.length} documents ready</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {lead.profiles.documents_ready.slice(0, 3).map((doc: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              {doc}
                            </span>
                          ))}
                          {lead.profiles.documents_ready.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{lead.profiles.documents_ready.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No leads yet</h3>
            <p className="text-muted-foreground">
              When students express interest in your listings, they'll appear here
            </p>
          </div>
        )}
      </div>

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
            <Button
              onClick={() => setShowListingDialog(false)}
              className="w-full mt-4"
            >
              Apply Filter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter by Documents Ready</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Show only students who have these documents ready:
          </p>
          <div className="space-y-3 py-4 max-h-80 overflow-y-auto">
            {DOCUMENT_OPTIONS.map((doc) => (
              <div key={doc} className="flex items-center space-x-3">
                <Checkbox
                  id={`filter-${doc}`}
                  checked={selectedDocuments.includes(doc)}
                  onCheckedChange={() => handleDocumentToggle(doc)}
                />
                <label
                  htmlFor={`filter-${doc}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {doc}
                </label>
              </div>
            ))}
            <Button
              onClick={() => setShowDocumentDialog(false)}
              className="w-full mt-4"
            >
              Apply Filter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Leads;
