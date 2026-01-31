import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditListing = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string[]>([]);
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

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Listing not found");
        navigate("/manage-listings");
        return;
      }

      // Check ownership
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || data.agent_id !== user.id) {
        toast.error("You don't have permission to edit this listing");
        navigate("/manage-listings");
        return;
      }

      setTitle(data.title);
      setDescription(data.description || "");
      setLocation(data.location);
      setNeighborhood(data.neighborhood || "");
      setSize(data.size.replace("m²", ""));
      setPrice(data.price.replace("€", "").replace("/month", ""));
      setRentalType((data.stay_type as "Short Term" | "Long Term" | "Either") || "");
      setSelectedAmenities(data.amenities || []);
      setPhotos(data.photos || []);
      if (data.latitude && data.longitude) {
        setCoordinates({ lat: data.latitude, lng: data.longitude });
      }
      setLoading(false);
    };

    fetchListing();
  }, [id, navigate]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const totalPhotos = photos.length + newPhotoPreview.length;
      const remainingSlots = 10 - totalPhotos;
      const newFiles = Array.from(files).slice(0, remainingSlots);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setNewPhotoFiles((prev) => [...prev, ...newFiles]);
      setNewPhotoPreview((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeExistingPhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPhotoPreview((prev) => prev.filter((_, i) => i !== index));
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to update listing");
        navigate("/auth");
        return;
      }

      // Upload new photos
      const uploadedPhotoUrls: string[] = [...photos];
      for (const file of newPhotoFiles) {
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("user-documents")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Error uploading photo:", uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage.from("user-documents").getPublicUrl(fileName);
        uploadedPhotoUrls.push(publicUrl);
      }

      const { error } = await supabase
        .from("listings")
        .update({
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
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating listing:", error);
        toast.error("Failed to update listing");
        return;
      }

      toast.success("Listing updated successfully!");
      navigate("/manage-listings");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout userType="agent">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const totalPhotos = photos.length + newPhotoPreview.length;

  return (
    <AppLayout userType="agent">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-4 py-4 lg:px-8 lg:py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/manage-listings")}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Listings
          </Button>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Edit Listing</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">Update your property listing</p>
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
                  {/* Existing photos */}
                  {photos.map((photo, index) => (
                    <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeExistingPhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-background/80 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {/* New photo previews */}
                  {newPhotoPreview.map((photo, index) => (
                    <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={photo} alt={`New Photo ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeNewPhoto(index)}
                        className="absolute top-1 right-1 p-1 bg-background/80 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                        New
                      </span>
                    </div>
                  ))}
                  {totalPhotos < 10 && (
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
          <div className="mt-8 pt-6 border-t border-border flex gap-4">
            <Button variant="outline" onClick={() => navigate("/manage-listings")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EditListing;
