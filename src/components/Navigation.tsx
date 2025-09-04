import { Button } from "@/components/ui/button";
import { Home, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-lg p-1">
        <div className="flex gap-1">
          <Button
            variant={currentPage === "dashboard" ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange("dashboard")}
            className={cn(
              "rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm",
              currentPage === "dashboard" 
                ? "bg-gradient-to-r from-primary to-accent text-white" 
                : "hover:bg-secondary"
            )}
          >
            <Home className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Dashboard</span>
            <span className="xs:hidden">Home</span>
          </Button>
          <Button
            variant={currentPage === "cofrinho" ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange("cofrinho")}
            className={cn(
              "rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm",
              currentPage === "cofrinho" 
                ? "bg-gradient-to-r from-primary to-accent text-white" 
                : "hover:bg-secondary"
            )}
          >
            <PiggyBank className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Cofrinho</span>
            <span className="xs:hidden">Meta</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
