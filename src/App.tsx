import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen } from "@/components/SplashScreen";
import { PWAInstaller } from "@/components/PWAInstaller";
import { Navigation } from "@/components/Navigation";
import Dashboard from "./pages/Dashboard";
import Cofrinho from "./pages/Cofrinho";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SplashScreen onComplete={handleSplashComplete} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {currentPage === "dashboard" ? <Dashboard /> : <Cofrinho />}
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        <PWAInstaller />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
