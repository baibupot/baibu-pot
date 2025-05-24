import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import useScrollToTop from "@/hooks/useScrollToTop";
import Index from "./pages/Index";
import Etkinlikler from "./pages/Etkinlikler";
import Dergi from "./pages/Dergi";
import DergiDetay from "./pages/DergiDetay";
import Anketler from "./pages/Anketler";
import Sponsorlar from "./pages/Sponsorlar";
import Haberler from "./pages/Haberler";
import Ekipler from "./pages/Ekipler";
import AkademikBelgeler from "./pages/AkademikBelgeler";
import Staj from "./pages/Staj";
import Iletisim from "./pages/Iletisim";
import SiteHaritasi from "./pages/SiteHaritasi";
import SSS from "./pages/SSS";
import GizlilikPolitikasi from "./pages/GizlilikPolitikasi";
import AdminGirisi from "./pages/AdminGirisi";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import PdfFlipbookDemo from './pages/PdfFlipbookDemo';

const queryClient = new QueryClient();

const AppContent = () => {
  useScrollToTop();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/haberler" element={<Haberler />} />
      <Route path="/etkinlikler" element={<Etkinlikler />} />
      <Route path="/dergi" element={<Dergi />} />
      <Route path="/dergi/:id" element={<DergiDetay />} />
      <Route path="/pdf-demo" element={<PdfFlipbookDemo />} />
      <Route path="/anketler" element={<Anketler />} />
      <Route path="/sponsorlar" element={<Sponsorlar />} />
      <Route path="/ekipler" element={<Ekipler />} />
      <Route path="/akademik-belgeler" element={<AkademikBelgeler />} />
      <Route path="/staj" element={<Staj />} />
      <Route path="/iletisim" element={<Iletisim />} />
      <Route path="/site-haritasi" element={<SiteHaritasi />} />
      <Route path="/sss" element={<SSS />} />
      <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
      <Route path="/admin" element={<AdminGirisi />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
