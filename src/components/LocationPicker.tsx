import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2 } from "lucide-react";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Barcelona center coordinates
const BARCELONA_CENTER: [number, number] = [41.3851, 2.1734];
const BARCELONA_BOUNDS = {
  north: 41.47,
  south: 41.32,
  east: 2.23,
  west: 2.05,
};

interface LocationPickerProps {
  value?: { lat: number; lng: number; address: string };
  onChange: (location: { lat: number; lng: number; address: string }) => void;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      // Check if click is within Barcelona bounds
      if (
        lat >= BARCELONA_BOUNDS.south &&
        lat <= BARCELONA_BOUNDS.north &&
        lng >= BARCELONA_BOUNDS.west &&
        lng <= BARCELONA_BOUNDS.east
      ) {
        onLocationSelect(lat, lng);
      }
    },
  });
  return null;
}

// Component to handle map center changes
function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  
  return null;
}

const LocationPicker = ({ value, onChange }: LocationPickerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    value ? [value.lat, value.lng] : null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    value ? [value.lat, value.lng] : BARCELONA_CENTER
  );
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ", Barcelona, Spain"
        )}&limit=5&bounded=1&viewbox=${BARCELONA_BOUNDS.west},${BARCELONA_BOUNDS.north},${BARCELONA_BOUNDS.east},${BARCELONA_BOUNDS.south}`
      );
      const data: SearchResult[] = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMarkerPosition([lat, lng]);
    setMapCenter([lat, lng]);
    setSearchQuery(result.display_name);
    setShowResults(false);
    onChange({ lat, lng, address: result.display_name });
  };

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    
    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSearchQuery(address);
      onChange({ lat, lng, address });
    } catch {
      const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSearchQuery(address);
      onChange({ lat, lng, address });
    }
  }, [onChange]);

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative" ref={searchRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for an address in Barcelona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button type="button" onClick={handleSearch} disabled={searching}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleResultSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors border-b border-border last:border-b-0"
              >
                <p className="text-sm text-foreground line-clamp-2">{result.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-[300px] rounded-lg overflow-hidden border border-border">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          <MapCenterController center={mapCenter} />
          {markerPosition && <Marker position={markerPosition} />}
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground">
        Click on the map or search for an address to set the property location
      </p>
    </div>
  );
};

export default LocationPicker;
