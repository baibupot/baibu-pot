
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Etkinlikler from "./pages/Etkinlikler";
import Dergi from "./pages/Dergi";
import Anketler from "./pages/Anketler";
import Sponsorlar from "./pages/Sponsorlar";
import Haberler from "./pages/Haberler";
import Ekipler from "./pages/Ekipler";
import AkademikBelgeler from "./pages/AkademikBelgeler";
import Staj from "./pages/Staj";
import Iletisim from "./pages/Iletisim";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/haberler" element={<Haberler />} />
          <Route path="/etkinlikler" element={<Etkinlikler />} />
          <Route path="/dergi" element={<Dergi />} />
          <Route path="/anketler" element={<Anketler />} />
          <Route path="/sponsorlar" element={<Sponsorlar />} />
          <Route path="/ekipler" element={<Ekipler />} />
          <Route path="/akademik-belgeler" element={<AkademikBelgeler />} />
          <Route path="/staj" element={<Staj />} />
          <Route path="/iletisim" element={<Iletisim />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
