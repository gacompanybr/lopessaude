import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    __metaPixelFallback?: (eventName?: string, params?: Record<string, unknown>) => void;
  }
}

const fireMetaPixelFallback = (eventName = "PageView", params: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;

  const query = new URLSearchParams({
    id: "4618957974838971",
    ev: eventName,
    dl: window.location.href,
    rl: document.referrer || "",
    if: "false",
    ts: String(Date.now()),
    sw: String(window.screen?.width || window.innerWidth),
    sh: String(window.screen?.height || window.innerHeight),
    v: "2.9.338",
    r: "stable",
  });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.set(`cd[${key}]`, String(value));
  });

  const img = new Image(1, 1);
  img.style.display = "none";
  img.src = `https://www.facebook.com/tr/?${query.toString()}`;
};

const MetaPixelPageTracker = () => {
  const location = useLocation();
  useEffect(() => {
    window.__metaPixelFallback = fireMetaPixelFallback;

    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
    fireMetaPixelFallback("PageView");
  }, [location.pathname, location.search]);
  return null;
};
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index.tsx";
import Leads from "./pages/Leads.tsx";
import Settings from "./pages/Settings.tsx";
import Auth from "./pages/Auth.tsx";
import MetaIntegration from "./pages/MetaIntegration.tsx";
import NotFound from "./pages/NotFound.tsx";
import LandingAds from "./pages/LandingAds.tsx";
import WhatsAppClickTracker from "./components/WhatsAppClickTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <MetaPixelPageTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/leads"
                element={
                  <ProtectedRoute>
                    <Leads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <AdminRoute>
                    <Settings />
                  </AdminRoute>
                }
              />
              <Route
                path="/meta-integration"
                element={
                  <ProtectedRoute>
                    <MetaIntegration />
                  </ProtectedRoute>
                }
              />
              <Route path="/consulta-3k7" element={<LandingAds />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
