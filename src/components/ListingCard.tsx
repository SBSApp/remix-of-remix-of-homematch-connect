import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useSavedListingsDB } from "@/hooks/useListings";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ListingCardProps {
  id: string;
  image: string;
  title: string;
  price: string;
  location: string;
  size: string;
  description: string;
  stayType?: string;
}

const ListingCard = ({ id, image, title, price, location, size, description, stayType }: ListingCardProps) => {
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useSavedListingsDB();
  const [isListingSaved, setIsListingSaved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsListingSaved(isSaved(id));
  }, [id, isSaved]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const getStayTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "Short Term":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      case "Long Term":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "Either":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      default:
        return "";
    }
  };

  const handleCardClick = () => {
    navigate(`/listing/${id}`);
  };

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    const success = await toggleSaved(id);
    if (success) {
      setIsListingSaved(!isListingSaved);
    }
  };

  return (
    <div 
      className="bg-card rounded-xl shadow-card overflow-hidden mb-4 hover:shadow-elevated transition-shadow relative cursor-pointer"
      onClick={handleCardClick}
    >
      <button
        onClick={handleHeartClick}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
        aria-label={isListingSaved ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isListingSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"
          }`}
        />
      </button>
      <div className="flex gap-4 p-4">
        <img
          src={image}
          alt={title}
          className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-lg text-card-foreground truncate">{title}</h3>
          </div>
          <p className="text-primary font-bold text-xl mb-2">{price}</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{location}</p>
            <p>{size}</p>
          </div>
          {stayType && (
            <Badge className={`mt-2 text-xs ${getStayTypeBadgeStyle(stayType)}`}>
              {stayType}
            </Badge>
          )}
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className="text-sm text-card-foreground line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default ListingCard;
