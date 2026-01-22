import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LeadCardProps {
  id: number;
  name: string;
  program: string;
  budget: string;
  verified: boolean;
  languages: string[];
  financialProof: boolean;
  rentalDuration: "Short Term" | "Long Term";
  responseTime: "<3hrs" | "3-5hrs" | ">5hrs";
  bio: string;
}

const LeadCard = ({ id, name, program, budget, verified, languages, financialProof, rentalDuration, responseTime, bio }: LeadCardProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-card rounded-xl shadow-card overflow-hidden mb-4 hover:shadow-elevated transition-shadow cursor-pointer"
      onClick={() => navigate(`/student/${id}`)}
    >
      <div className="flex gap-4 p-4">
        <div className="w-24 h-24 rounded-full flex-shrink-0 bg-muted flex items-center justify-center">
          <User className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-card-foreground">{name}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{program}</p>
          <p className="text-primary font-semibold mb-2">{budget}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {languages.map((language) => (
              <Badge 
                key={language} 
                variant="outline" 
                className="text-xs"
              >
                {language}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {financialProof && (
              <Badge 
                variant="secondary" 
                className="text-xs"
              >
                Financial Proof
              </Badge>
            )}
            <Badge 
              variant="outline" 
              className="text-xs"
            >
              {rentalDuration}
            </Badge>
            <Badge 
              variant="outline" 
              className="text-xs flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              {responseTime}
            </Badge>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className="text-sm text-card-foreground line-clamp-3">{bio}</p>
      </div>
    </div>
  );
};

export default LeadCard;
