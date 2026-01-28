import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

// Custom marker icon with price
const createPriceMarker = (price: string) => {
  return L.divIcon({
    className: "custom-price-marker",
    html: `<div class="bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-semibold shadow-lg whitespace-nowrap">${price}</div>`,
    iconSize: [80, 30],
    iconAnchor: [40, 30],
  });
};

// Barcelona center coordinates
const BARCELONA_CENTER: [number, number] = [41.3851, 2.1734];

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

// Component to fit bounds
function FitBoundsController({ listings }: { listings: Listing[] }) {
  const map = useMap();

  useEffect(() => {
    const validListings = listings.filter((l) => l.latitude && l.longitude);
    if (validListings.length > 0) {
      const bounds = L.latLngBounds(
        validListings.map((l) => [l.latitude!, l.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [listings, map]);

  return null;
}

// Individual marker component
function ListingMarker({ listing, onNavigate }: { listing: Listing; onNavigate: (id: string) => void }) {
  return (
    <Marker
      position={[listing.latitude!, listing.longitude!]}
      icon={createPriceMarker(listing.price)}
    >
      <Popup>
        <div className="w-56 p-0">
          {listing.photos?.[0] && (
            <img
              src={listing.photos[0]}
              alt={listing.title}
              className="w-full h-28 object-cover rounded-t-lg"
            />
          )}
          <div className="p-3">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1">
              {listing.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
              {listing.location}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-primary">{listing.price}</span>
              <span className="text-xs text-muted-foreground">{listing.size}</span>
            </div>
            <button
              onClick={() => onNavigate(listing.id)}
              className="w-full mt-3 text-center text-xs font-medium text-primary hover:underline"
            >
              View Details →
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

const ListingsMap = ({ listings, className }: ListingsMapProps) => {
  const navigate = useNavigate();

  const listingsWithCoords = listings.filter((l) => l.latitude && l.longitude);

  const handleNavigate = (id: string) => {
    navigate(`/listing/${id}`);
  };

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
      <MapContainer
        center={BARCELONA_CENTER}
        zoom={13}
        style={{ height: "100%", width: "100%", minHeight: "400px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBoundsController listings={listingsWithCoords} />
        {listingsWithCoords.map((listing) => (
          <ListingMarker
            key={listing.id}
            listing={listing}
            onNavigate={handleNavigate}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default ListingsMap;
