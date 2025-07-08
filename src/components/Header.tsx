
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-sm">S3</span>
          </div>
          <h1 className="text-xl font-bold gradient-text">S3 Bucket Manager</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
