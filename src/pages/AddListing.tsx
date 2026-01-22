import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      const newFiles = Array.from(files);
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 10));
      setPhotoFiles(prev => [...prev, ...newFiles].slice(0, 10));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !description || !location || !size || !neighborhood || !rentalType || !price) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to create a listing");
        navigate("/auth");
        return;
      }

      // Upload photos to storage
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

        const { data: { publicUrl } } = supabase.storage
          .from("user-documents")
          .getPublicUrl(fileName);

        uploadedPhotoUrls.push(publicUrl);
      }

      // Insert listing into database
      const { error } = await supabase
        .from("listings")
        .insert({
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Add New Listing</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Photo Upload */}
        <div className="space-y-2">
          <Label>Photos (max 10)</Label>
          <div className="grid grid-cols-3 gap-2">
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

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="e.g. 123 Main Street, Amsterdam"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
            className="min-h-[100px]"
          />
        </div>

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

        {/* Neighborhood */}
        <div className="space-y-2">
          <Label htmlFor="neighborhood">Neighborhood *</Label>
          <Input
            id="neighborhood"
            placeholder="e.g. Jordaan, Amsterdam"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
          />
        </div>

        {/* Rental Type */}
        <div className="space-y-2">
          <Label>Rental Duration *</Label>
          <Select value={rentalType} onValueChange={(value: "Short Term" | "Long Term" | "Either") => setRentalType(value)}>
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

        {/* Submit Button */}
        <Button onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting}>
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

      <BottomNav userType="agent" />
    </div>
  );
};

export default AddListing;
