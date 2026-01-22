import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { useSavedListingsDB } from "@/hooks/useListings";
import { Loader2 } from "lucide-react";

const Saved = () => {
  const { savedListings, loading } = useSavedListingsDB();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Saved Listings</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : savedListings.length > 0 ? (
          savedListings.map((listing) => (
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
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">❤️</div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No saved listings yet</h3>
            <p className="text-muted-foreground text-sm">Tap the heart on listings you like to save them here</p>
          </div>
        )}
      </div>

      <BottomNav userType="student" />
    </div>
  );
};

export default Saved;
