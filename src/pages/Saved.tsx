import AppLayout from "@/components/AppLayout";
import ListingCard from "@/components/ListingCard";
import { useSavedListingsDB } from "@/hooks/useListings";
import { Loader2 } from "lucide-react";

const Saved = () => {
  const { savedListings, loading } = useSavedListingsDB();

  return (
    <AppLayout userType="student">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Saved Listings</h1>
          <p className="text-muted-foreground mt-1">
            {savedListings.length} saved properties
          </p>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : savedListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {savedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                image={listing.photos?.[0] || "/placeholder.svg"}
                title={listing.title}
                price={listing.price}
                location={listing.location}
                size={listing.size}
                description={listing.description || ""}
                stayType={listing.stay_type || undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No saved listings yet</h3>
            <p className="text-muted-foreground">Click the heart on listings you like to save them here</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Saved;
