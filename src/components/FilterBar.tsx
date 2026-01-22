import { Button } from "@/components/ui/button";

interface FilterBarProps {
  filters: string[];
  onFilterClick?: (filter: string) => void;
  activeFilters?: string[];
  onClearFilters?: () => void;
  showClearButton?: boolean;
}

const FilterBar = ({ 
  filters, 
  onFilterClick, 
  activeFilters = [],
  onClearFilters,
  showClearButton = false
}: FilterBarProps) => {
  // Check if a filter is active by looking for exact match or prefix match
  const isFilterActive = (filter: string) => {
    if (activeFilters.includes(filter)) return true;
    // Check for prefix matches like "Listing:" for "Listing" filter
    const prefixMap: Record<string, string> = {
      "Listing": "Listing:",
      "Documents": "Doc:",
      "Language": "Language:",
      "Response Time": "Response:"
    };
    const prefix = prefixMap[filter];
    if (prefix) {
      return activeFilters.some(f => f.startsWith(prefix));
    }
    return false;
  };

  return (
    <div className="bg-card p-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        {showClearButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground text-sm h-auto py-1"
          >
            Clear filters
          </Button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const isActive = isFilterActive(filter);
          return (
            <Button
              key={filter}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`whitespace-nowrap rounded-full ${
                isActive 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : ""
              }`}
              onClick={() => onFilterClick?.(filter)}
            >
              {filter}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterBar;
