import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Navbar from "./components/Navbar";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import ScrollManager from "./components/ScrollManager";
import AIAssistant from "./components/AIAssistant";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const CivicServicesPage = lazy(() => import("./modules/civic/pages/CivicServicesPage"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CustomCursor />
          <ScrollProgress />
          <ScrollManager />
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/civic-services"
              element={
                <Suspense fallback={<div className="pt-32 pb-32 text-center text-sm text-muted-foreground">Loading Civic Services…</div>}>
                  <CivicServicesPage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AIAssistant />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
