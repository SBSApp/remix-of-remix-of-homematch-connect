import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Barcelona center coordinates
const BARCELONA_CENTER: L.LatLngExpression = [41.3851, 2.1734];

interface Listing {
  id: string;
  title: string;
  price: string;
  location: string;
  size: string;
  latitude?: number | null;
  longitude?: number | null;
  photos?: string[] | null;
  description?: string | null;
}

interface ListingsMapProps {
  listings: Listing[];
  className?: string;
}

const ListingsMap = ({ listings, className }: ListingsMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  const listingsWithCoords = listings.filter((l) => l.latitude && l.longitude);

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current).setView(BARCELONA_CENTER, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add markers for each listing
    if (listingsWithCoords.length > 0) {
      const bounds = L.latLngBounds([]);
      
      listingsWithCoords.forEach((listing) => {
        const latLng: L.LatLngExpression = [listing.latitude!, listing.longitude!];
        bounds.extend(latLng);

        // Create custom price marker
        const priceIcon = L.divIcon({
          className: "custom-price-marker",
          html: `<div style="background: hsl(14 86% 58%); color: white; padding: 4px 8px; border-radius: 8px; font-size: 12px; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.2); white-space: nowrap;">${listing.price}</div>`,
          iconSize: [80, 30],
          iconAnchor: [40, 30],
        });

        const marker = L.marker(latLng, { icon: priceIcon }).addTo(map);

        // Create popup content
        const popupContent = document.createElement("div");
        popupContent.className = "w-56";
        popupContent.innerHTML = `
          ${listing.photos?.[0] ? `<img src="${listing.photos[0]}" alt="${listing.title}" class="w-full h-28 object-cover rounded-t-lg" />` : ""}
          <div class="p-3">
            <h3 class="font-semibold text-sm line-clamp-1">${listing.title}</h3>
            <p class="text-xs text-gray-500 line-clamp-1 mt-1">${listing.location}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="text-sm font-bold" style="color: hsl(14 86% 58%)">${listing.price}</span>
              <span class="text-xs text-gray-500">${listing.size}</span>
            </div>
            <button class="w-full mt-3 text-center text-xs font-medium hover:underline" style="color: hsl(14 86% 58%)" data-listing-id="${listing.id}">
              View Details →
            </button>
          </div>
        `;

        // Add click handler for the button
        popupContent.querySelector("button")?.addEventListener("click", () => {
          navigate(`/listing/${listing.id}`);
        });

        marker.bindPopup(popupContent);
      });

      // Fit bounds to show all markers
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [listingsWithCoords, navigate]);

  if (listingsWithCoords.length === 0) {
    return (
      <div className={`rounded-xl bg-muted border border-border flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground p-8">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No listings with map locations</p>
          <p className="text-sm">Listings will appear here once agents add locations</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`}>
      <div ref={mapRef} style={{ height: "100%", width: "100%", minHeight: "400px" }} />
    </div>
  );
};

export default ListingsMap;
