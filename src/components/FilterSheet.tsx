import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  SlidersHorizontal, 
  X, 
  Euro, 
  Ruler, 
  MapPin, 
  Clock, 
  Sofa, 
  Users, 
  Wifi, 
  PawPrint,
  Calendar,
  GraduationCap,
  Building,
  Bike,
  Bed,
  Bath
} from "lucide-react";

export interface FilterState {
  minBudget: string;
  maxBudget: string;
  billsIncluded: boolean;
  minSize: string;
  maxSize: string;
  neighborhoods: string[];
  stayLength: string;
  furnishing: string;
  propertyType: string[];
  bedrooms: string;
  bathrooms: string;
  roommates: string;
  amenities: string[];
  petsAllowed: boolean;
  moveInDate: string;
  nearUniversity: boolean;
  publicTransport: boolean;
}

interface FilterSheetProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const propertyTypes = ["Studio", "Apartment", "Shared Room", "Private Room", "House"];
const amenitiesList = ["WiFi Included", "Laundry", "Dishwasher", "Elevator", "Heating", "A/C", "Pet Friendly"];
const roommateOptions = ["Living Alone", "1 Roommate", "2-3 Roommates", "4+ Roommates"];
const bedroomOptions = ["Studio", "1", "2", "3", "4+"];
const bathroomOptions = ["1", "2", "3+"];

const FilterSheet = ({ filters, onFiltersChange, onClearFilters }: FilterSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [neighborhoodInput, setNeighborhoodInput] = useState("");

  const hasActiveFilters = 
    filters.minBudget !== "" || 
    filters.maxBudget !== "" || 
    filters.minSize !== "" || 
    filters.maxSize !== "" ||
    filters.neighborhoods.length > 0 ||
    filters.stayLength !== "" ||
    filters.furnishing !== "" ||
    filters.propertyType.length > 0 ||
    filters.roommates !== "" ||
    filters.amenities.length > 0 ||
    filters.petsAllowed ||
    filters.moveInDate !== "" ||
    filters.nearUniversity ||
    filters.publicTransport;

  const activeFilterCount = [
    filters.minBudget || filters.maxBudget ? 1 : 0,
    filters.minSize || filters.maxSize ? 1 : 0,
    filters.neighborhoods.length > 0 ? 1 : 0,
    filters.stayLength ? 1 : 0,
    filters.furnishing ? 1 : 0,
    filters.propertyType.length,
    filters.roommates ? 1 : 0,
    filters.amenities.length,
    filters.petsAllowed ? 1 : 0,
    filters.moveInDate ? 1 : 0,
    filters.nearUniversity ? 1 : 0,
    filters.publicTransport ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleOpen = (open: boolean) => {
    if (open) {
      setLocalFilters(filters);
    }
    setIsOpen(open);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const addNeighborhood = () => {
    if (neighborhoodInput.trim() && !localFilters.neighborhoods.includes(neighborhoodInput.trim())) {
      setLocalFilters(prev => ({
        ...prev,
        neighborhoods: [...prev.neighborhoods, neighborhoodInput.trim()]
      }));
      setNeighborhoodInput("");
    }
  };

  const removeNeighborhood = (neighborhood: string) => {
    setLocalFilters(prev => ({
      ...prev,
      neighborhoods: prev.neighborhoods.filter(n => n !== neighborhood)
    }));
  };

  const togglePropertyType = (type: string) => {
    setLocalFilters(prev => ({
      ...prev,
      propertyType: prev.propertyType.includes(type)
        ? prev.propertyType.filter(t => t !== type)
        : [...prev.propertyType, type]
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setLocalFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <Sheet open={isOpen} onOpenChange={handleOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-1 justify-between h-12 rounded-xl border-2"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </div>
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-2 rounded-full px-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] max-h-[85vh] max-w-md mx-auto rounded-t-2xl p-0 flex flex-col">
              <SheetHeader className="p-4 pb-3 border-b border-border shrink-0">
                <SheetTitle className="text-xl">Filters</SheetTitle>
                <SheetDescription>
                  Find your perfect student accommodation
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Budget Range */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-primary" />
                    <Label className="text-base font-semibold">Budget (€/month)</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Minimum</Label>
                      <Input
                        type="number"
                        placeholder="300"
                        value={localFilters.minBudget}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Maximum</Label>
                      <Input
                        type="number"
                        placeholder="1500"
                        value={localFilters.maxBudget}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <Button
                    variant={localFilters.billsIncluded ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setLocalFilters(prev => ({ ...prev, billsIncluded: !prev.billsIncluded }))}
                  >
                    Bills Included
                  </Button>
                </div>

                {/* Property Type */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    <Label className="text-base font-semibold">Property Type</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map((type) => (
                      <Button
                        key={type}
                        variant={localFilters.propertyType.includes(type) ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => togglePropertyType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-primary" />
                    <Label className="text-base font-semibold">Bedrooms</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bedroomOptions.map((option) => (
                      <Button
                        key={option}
                        variant={localFilters.bedrooms === option ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setLocalFilters(prev => ({ 
                          ...prev, 
                          bedrooms: prev.bedrooms === option ? "" : option 
                        }))}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Bath className="w-4 h-4 text-primary" />
                    <Label className="text-base font-semibold">Bathrooms</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bathroomOptions.map((option) => (
                      <Button
                        key={option}
                        variant={localFilters.bathrooms === option ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setLocalFilters(prev => ({ 
                          ...prev, 
                          bathrooms: prev.bathrooms === option ? "" : option 
                        }))}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Roommates */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <Label className="text-base font-semibold">Living Situation</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {roommateOptions.map((option) => (
                      <Button
                        key={option}
                        variant={localFilters.roommates === option ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setLocalFilters(prev => ({ 
                          ...prev, 
                          roommates: prev.roommates === option ? "" : option 
                        }))}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Size Range */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-primary" />
                    <Label className="text-base font-semibold">Size (m²)</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Minimum</Label>
                      <Input
                        type="number"
                        placeholder="15"
                        value={localFilters.minSize}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, minSize: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Maximum</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={localFilters.maxSize}
                        onChange={(e) => setLocalFilters(prev => ({ ...prev, maxSize: e.target.value }))}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Stay Length */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <Label className="text-base font-semibold">Stay Length</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Short Term (3-11 mo)", "Long Term (1+ year)", "Either"].map((length) => (
                      <Button
                        key={length}
                        variant={localFilters.stayLength === length ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setLocalFilters(prev => ({ 
                          ...prev, 
                          stayLength: prev.stayLength === length ? "" : length 
                        }))}
                      >
                        {length}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Move-in Date */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <Label className="text-base font-semibold">Move-in Date</Label>
                  </div>
                  <Input
                    type="date"
                    value={localFilters.moveInDate}
                    onChange={(e) => setLocalFilters(prev => ({ ...prev, moveInDate: e.target.value }))}
                    className="h-11"
                  />
                </div>

                {/* Furnishing */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sofa className="w-4 h-4 text-primary" />
                    <Label className="text-base font-semibold">Furnishing</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Furnished", "Semi-furnished", "Unfurnished"].map((type) => (
                      <Button
                        key={type}
                        variant={localFilters.furnishing === type ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setLocalFilters(prev => ({ 
                          ...prev, 
                          furnishing: prev.furnishing === type ? "" : type 
                        }))}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Neighborhoods */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <Label className="text-base font-semibold">Neighborhoods</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. City Center, Jordaan..."
                      value={neighborhoodInput}
                      onChange={(e) => setNeighborhoodInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addNeighborhood();
                        }
                      }}
                      className="h-11"
                    />
                    <Button onClick={addNeighborhood} className="h-11 px-4">Add</Button>
                  </div>
                  {localFilters.neighborhoods.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {localFilters.neighborhoods.map((neighborhood) => (
                        <Badge 
                          key={neighborhood} 
                          variant="secondary" 
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full"
                        >
                          {neighborhood}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeNeighborhood(neighborhood)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-primary" />
                    <Label className="text-base font-semibold">Amenities</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((amenity) => (
                      <Button
                        key={amenity}
                        variant={localFilters.amenities.includes(amenity) ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => toggleAmenity(amenity)}
                      >
                        {amenity}
                      </Button>
                    ))}
                  </div>
                </div>

              </div>

              <SheetFooter className="flex gap-3 p-4 border-t border-border sticky bottom-0 bg-background">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl"
                  onClick={() => {
                    const emptyFilters: FilterState = {
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
                    };
                    setLocalFilters(emptyFilters);
                  }}
                >
                  Clear All
                </Button>
                <Button 
                  className="flex-1 h-12 rounded-xl"
                  onClick={handleApply}
                >
                  Apply Filters
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {(filters.minBudget || filters.maxBudget) && (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                €{filters.minBudget || "0"} - €{filters.maxBudget || "∞"}
              </Badge>
            )}
            {filters.propertyType.map(type => (
              <Badge key={type} variant="secondary" className="rounded-full px-3 py-1">
                {type}
              </Badge>
            ))}
            {filters.roommates && (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {filters.roommates}
              </Badge>
            )}
            {filters.stayLength && (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {filters.stayLength}
              </Badge>
            )}
            {filters.furnishing && (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {filters.furnishing}
              </Badge>
            )}
            {filters.neighborhoods.map(n => (
              <Badge key={n} variant="secondary" className="rounded-full px-3 py-1">
                {n}
              </Badge>
            ))}
            {filters.petsAllowed && (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Pets OK
              </Badge>
            )}
            {filters.nearUniversity && (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Near University
              </Badge>
            )}
            {filters.publicTransport && (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Near Transit
              </Badge>
            )}
            {filters.moveInDate && (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                From {filters.moveInDate}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSheet;
