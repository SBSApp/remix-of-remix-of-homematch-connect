import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Image, Send } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const Chat = () => {
  const [isTranslateEnabled, setIsTranslateEnabled] = useState(false);
  const [searchParams] = useSearchParams();
  const userType = (searchParams.get("userType") as "student" | "agent") || "student";
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Chat Header */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">Sarah Chen</h2>
            <p className="text-xs text-muted-foreground">Last active: 5 min ago</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">EN</span>
            <Switch 
              checked={isTranslateEnabled} 
              onCheckedChange={setIsTranslateEnabled}
            />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 max-w-lg mx-auto w-full p-4 pb-24 overflow-y-auto">
        <div className="space-y-4">
          {/* Received Message */}
          <div className="flex justify-start">
            <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%] shadow-card">
              <p className="text-sm text-card-foreground">
                Hi! I'm really interested in the apartment you listed. Is it still available?
              </p>
              <span className="text-xs text-muted-foreground mt-1 block">10:30 AM</span>
            </div>
          </div>

          {/* Sent Message */}
          <div className="flex justify-end">
            <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%] shadow-card">
              <p className="text-sm text-primary-foreground">
                Yes, it's still available! Would you like to schedule a viewing?
              </p>
              <span className="text-xs text-primary-foreground/80 mt-1 block">10:32 AM</span>
            </div>
          </div>

          {/* Received Message */}
          <div className="flex justify-start">
            <div className="bg-card rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%] shadow-card">
              <p className="text-sm text-card-foreground">
                That would be great! I'm free this weekend. Saturday afternoon works for me.
              </p>
              <span className="text-xs text-muted-foreground mt-1 block">10:35 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-lg mx-auto p-4">
          <div className="flex gap-2 items-center">
            <Button size="icon" variant="ghost" className="flex-shrink-0">
              <Image className="w-5 h-5" />
            </Button>
            <Input
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button size="icon" className="flex-shrink-0">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <BottomNav userType={userType} />
    </div>
  );
};

export default Chat;
