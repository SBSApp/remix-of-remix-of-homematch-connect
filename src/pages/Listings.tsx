import BottomNav from "@/components/BottomNav";
import FilterSheet, { FilterState } from "@/components/FilterSheet";
import ListingCard from "@/components/ListingCard";
import { useState, useEffect } from "react";
import { useListings } from "@/hooks/useListings";
import { Loader2 } from "lucide-react";

const Listings = () => {
  const { listings, loading } = useListings();
  const [filters, setFilters] = useState<FilterState>({
    minBudget: "",
    maxBudget: "",
    billsIncluded: false,
    minSize: "",
    maxSize: "",
    neighborhoods: [],
    stayLength: "",
    furnishing: "",
    propertyType: [],
    bedrooms: "",
    bathrooms: "",
    roommates: "",
    amenities: [],
    petsAllowed: false,
    moveInDate: "",
    nearUniversity: false,
    publicTransport: false,
  });

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      minBudget: "",
      maxBudget: "",
      billsIncluded: false,
      minSize: "",
      maxSize: "",
      neighborhoods: [],
      stayLength: "",
      furnishing: "",
      propertyType: [],
      bedrooms: "",
      bathrooms: "",
      roommates: "",
      amenities: [],
      petsAllowed: false,
      moveInDate: "",
      nearUniversity: false,
      publicTransport: false,
    });
  };

  // Extract numeric price from string like "€850/month"
  const extractPrice = (priceStr: string): number => {
    const match = priceStr.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(",", "")) : 0;
  };

  // Extract numeric size from string like "45m²"
  const extractSize = (sizeStr: string): number => {
    const match = sizeStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Filter listings based on current filters
  const filteredListings = listings.filter((listing) => {
    const listingPrice = extractPrice(listing.price);
    const listingSize = extractSize(listing.size);

    // Budget filter
    if (filters.minBudget && listingPrice < parseInt(filters.minBudget)) {
      return false;
    }
    if (filters.maxBudget && listingPrice > parseInt(filters.maxBudget)) {
      return false;
    }

    // Size filter
    if (filters.minSize && listingSize < parseInt(filters.minSize)) {
      return false;
    }
    if (filters.maxSize && listingSize > parseInt(filters.maxSize)) {
      return false;
    }

    // Neighborhood filter
    if (filters.neighborhoods.length > 0) {
      const locationLower = listing.location.toLowerCase();
      const neighborhoodLower = listing.neighborhood?.toLowerCase() || "";
      const matchesNeighborhood = filters.neighborhoods.some(
        (neighborhood) => 
          locationLower.includes(neighborhood.toLowerCase()) ||
          neighborhoodLower.includes(neighborhood.toLowerCase())
      );
      if (!matchesNeighborhood) {
        return false;
      }
    }

    // Stay length filter
    if (filters.stayLength) {
      if (filters.stayLength === "Short Term (3-11 mo)") {
        if (listing.stay_type !== "Short Term" && listing.stay_type !== "Either") {
          return false;
        }
      } else if (filters.stayLength === "Long Term (1+ year)") {
        if (listing.stay_type !== "Long Term" && listing.stay_type !== "Either") {
          return false;
        }
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Listings</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <FilterSheet 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
        
        {/* Map placeholder */}
        <div className="px-4 pt-4">
          <div className="aspect-video w-full rounded-xl bg-muted border border-border flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-sm font-medium">Map View</p>
              <p className="text-xs">Coming soon</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
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
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No listings found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your filters to see more results</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav userType="student" />
    </div>
  );
};

export default Listings;
