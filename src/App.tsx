import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';
import useScrollToTop from '@/hooks/useScrollToTop';
import Index from '@/pages/Index';
import Haberler from '@/pages/Haberler';
import Dergi from '@/pages/Dergi';
import Etkinlikler from '@/pages/Etkinlikler';
import Anketler from '@/pages/Anketler';
import Sponsorlar from '@/pages/Sponsorlar';
import Ekipler from '@/pages/Ekipler';
import AkademikBelgeler from '@/pages/AkademikBelgeler';
import Stajlar from '@/pages/Stajlar';
import SSS from '@/pages/SSS';
import Iletisim from '@/pages/Iletisim';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import Urunler from '@/pages/Urunler';
import GizlilikPolitikasi from '@/pages/GizlilikPolitikasi';
import SiteHaritasi from '@/pages/SiteHaritasi';
import DergiDetay from '@/pages/DergiDetay';
import HaberDetay from '@/pages/HaberDetay';
import EtkinlikDetay from '@/pages/EtkinlikDetay';
import AnketDetay from '@/pages/AnketDetay';
import NotFound from '@/pages/NotFound';
import CookieBanner from '@/components/CookieBanner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Router içinde çalışan scroll-to-top wrapper
function AppRoutes() {
  useScrollToTop(); // 🎯 Her sayfa değişikliğinde en üste scroll
  
  return (
    <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/haberler" element={<Haberler />} />
          <Route path="/haberler/:slug" element={<HaberDetay />} />
          <Route path="/dergi" element={<Dergi />} />
          <Route path="/dergi/:id" element={<DergiDetay />} />
          <Route path="/etkinlikler" element={<Etkinlikler />} />
          <Route path="/etkinlikler/:slug" element={<EtkinlikDetay />} />
          <Route path="/anketler" element={<Anketler />} />
          <Route path="/anketler/:slug" element={<AnketDetay />} />
          <Route path="/sponsorlar" element={<Sponsorlar />} />
          <Route path="/urunler" element={<Urunler />} />
          <Route path="/ekipler" element={<Ekipler />} />
          <Route path="/akademik-belgeler" element={<AkademikBelgeler />} />
          <Route path="/stajlar" element={<Stajlar />} />
          <Route path="/sss" element={<SSS />} />
          <Route path="/iletisim" element={<Iletisim />} />
          <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasi />} />
          <Route path="/site-haritasi" element={<SiteHaritasi />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/reset-password" element={<AdminLogin resetMode={true} />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
  );
}

function App() {
  return (
    <>
      <CookieBanner />
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <AppRoutes />
          </Router>
          <Toaster 
            position="top-right"
            expand={true}
            richColors
            closeButton
          />
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
