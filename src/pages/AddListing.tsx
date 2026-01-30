import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LocationPicker from "@/components/LocationPicker";

const amenitiesList = [
  "Bills Included",
  "WiFi Included",
  "Laundry",
  "Dishwasher",
  "Elevator",
  "Heating",
  "A/C",
  "Pet Friendly",
];

const AddListing = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [rentalType, setRentalType] = useState<"Short Term" | "Long Term" | "Either" | "">("");
  const [price, setPrice] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
      const newFiles = Array.from(files);
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 10));
      setPhotoFiles((prev) => [...prev, ...newFiles].slice(0, 10));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !description || !location || !size || !neighborhood || !rentalType || !price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!coordinates) {
      toast.error("Please select a location on the map");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to create a listing");
        navigate("/auth");
        return;
      }

      const uploadedPhotoUrls: string[] = [];
      for (const file of photoFiles) {
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("user-documents")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Error uploading photo:", uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("user-documents").getPublicUrl(fileName);

        uploadedPhotoUrls.push(publicUrl);
      }

      const { error } = await supabase.from("listings").insert({
        agent_id: user.id,
        title,
        description,
        price: `€${price}/month`,
        location,
        neighborhood,
        size: `${size}m²`,
        stay_type: rentalType,
        amenities: selectedAmenities,
        photos: uploadedPhotoUrls,
        latitude: coordinates?.lat,
        longitude: coordinates?.lng,
      });

      if (error) {
        console.error("Error creating listing:", error);
        toast.error("Failed to create listing");
        return;
      }

      toast.success("Listing created successfully!");
      navigate("/manage-listings");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout userType="agent">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-4 py-4 lg:px-8 lg:py-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Add New Listing</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">Create a new property listing</p>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-4xl">
        <div className="bg-card rounded-xl shadow-card p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Photos (max 10)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-background/80 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 10 && (
                    <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Modern Downtown Apartment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Location Picker */}
              <div className="space-y-2">
                <Label>Property Location in Barcelona *</Label>
                <LocationPicker
                  value={coordinates ? { ...coordinates, address: location } : undefined}
                  onChange={(loc) => {
                    setCoordinates({ lat: loc.lat, lng: loc.lng });
                    // Extract neighborhood from address if possible
                    const parts = loc.address.split(", ");
                    if (parts.length > 1) {
                      setLocation(parts.slice(0, 2).join(", "));
                      const neighborhoodPart = parts.find(p => 
                        p.includes("Barri") || p.includes("Eixample") || p.includes("Gràcia") || 
                        p.includes("Sarrià") || p.includes("Sants") || p.includes("Sant")
                      );
                      if (neighborhoodPart) {
                        setNeighborhood(neighborhoodPart);
                      }
                    } else {
                      setLocation(loc.address);
                    }
                  }}
                />
              </div>

              {/* Location Display */}
              <div className="space-y-2">
                <Label htmlFor="location">Address</Label>
                <Input
                  id="location"
                  placeholder="Selected from map above"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  readOnly
                />
              </div>

              {/* Neighborhood */}
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Neighborhood *</Label>
                <Input
                  id="neighborhood"
                  placeholder="e.g. Eixample, Gràcia"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Size */}
                <div className="space-y-2">
                  <Label htmlFor="size">Size (m²) *</Label>
                  <Input
                    id="size"
                    type="number"
                    placeholder="e.g. 45"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price (€/month) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g. 1200"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Rental Type */}
              <div className="space-y-2">
                <Label>Rental Duration *</Label>
                <Select
                  value={rentalType}
                  onValueChange={(value: "Short Term" | "Long Term" | "Either") => setRentalType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rental duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short Term">Short Term</SelectItem>
                    <SelectItem value="Long Term">Long Term</SelectItem>
                    <SelectItem value="Either">Either</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((amenity) => (
                    <Button
                      key={amenity}
                      type="button"
                      variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAmenity(amenity)}
                      className="rounded-full"
                    >
                      {amenity}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-border">
            <Button onClick={handleSubmit} size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Listing"
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddListing;
