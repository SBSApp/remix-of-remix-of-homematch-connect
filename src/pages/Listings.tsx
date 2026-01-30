import AppLayout from "@/components/AppLayout";
import FilterSheet, { FilterState } from "@/components/FilterSheet";
import ListingCard from "@/components/ListingCard";
import ListingsMap from "@/components/ListingsMap";
import { useState } from "react";
import { useListings } from "@/hooks/useListings";
import { Loader2, Grid, List, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

const Listings = () => {
  const { listings, loading } = useListings();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
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

  const extractPrice = (priceStr: string): number => {
    const match = priceStr.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(",", "")) : 0;
  };

  const extractSize = (sizeStr: string): number => {
    const match = sizeStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const filteredListings = listings.filter((listing) => {
    const listingPrice = extractPrice(listing.price);
    const listingSize = extractSize(listing.size);

    if (filters.minBudget && listingPrice < parseInt(filters.minBudget)) return false;
    if (filters.maxBudget && listingPrice > parseInt(filters.maxBudget)) return false;
    if (filters.minSize && listingSize < parseInt(filters.minSize)) return false;
    if (filters.maxSize && listingSize > parseInt(filters.maxSize)) return false;

    if (filters.neighborhoods.length > 0) {
      const locationLower = listing.location.toLowerCase();
      const neighborhoodLower = listing.neighborhood?.toLowerCase() || "";
      const matchesNeighborhood = filters.neighborhoods.some(
        (neighborhood) =>
          locationLower.includes(neighborhood.toLowerCase()) ||
          neighborhoodLower.includes(neighborhood.toLowerCase())
      );
      if (!matchesNeighborhood) return false;
    }

    if (filters.stayLength) {
      if (filters.stayLength === "Short Term (3-11 mo)") {
        if (listing.stay_type !== "Short Term" && listing.stay_type !== "Either") return false;
      } else if (filters.stayLength === "Long Term (1+ year)") {
        if (listing.stay_type !== "Long Term" && listing.stay_type !== "Either") return false;
      }
    }

    return true;
  });

  return (
    <AppLayout userType="student">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-4 py-4 lg:px-8 lg:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Browse Listings</h1>
              <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                {filteredListings.length} properties available
              </p>
            </div>
            <div className="flex items-center gap-3 lg:gap-4">
              <FilterSheet
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
              <div className="flex items-center gap-1 lg:gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                  className="h-9 w-9 lg:h-10 lg:w-10"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  title="List view"
                  className="h-9 w-9 lg:h-10 lg:w-10"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("map")}
                  title="Map view"
                  className="h-9 w-9 lg:h-10 lg:w-10"
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-8">
        {/* Map View */}
        {viewMode === "map" ? (
          <ListingsMap listings={filteredListings} className="h-[calc(100vh-200px)]" />
        ) : (
          <>
            {/* Mini Map - hidden on mobile in grid/list view for cleaner UX */}
            <div className="mb-6 lg:mb-8 hidden sm:block">
              <ListingsMap listings={filteredListings} className="h-[250px] lg:h-[300px]" />
            </div>

            {/* Listings */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : filteredListings.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                    : "space-y-4 max-w-3xl"
                }
              >
                {filteredListings.map((listing) => (
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
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No listings found</h3>
                <p className="text-muted-foreground">Try adjusting your filters to see more results</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Listings;
