import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, Compass } from "lucide-react";
import PageContainer from "@/components/ui/page-container";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageContainer background="gradient">
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <Card className="max-w-2xl w-full mx-4 border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg overflow-hidden">
          <CardContent className="p-12 text-center space-y-8">
            {/* Animated 404 */}
            <div className="relative">
              <div className="text-9xl font-bold text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text animate-pulse">
                404
              </div>
              <div className="absolute inset-0 text-9xl font-bold text-slate-200 dark:text-slate-700 -z-10">
                404
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Sayfa Bulunamadı
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Aradığınız sayfa mevcut değil, taşınmış veya silinmiş olabilir. 
                Lütfen URL'yi kontrol edin veya ana sayfaya dönün.
              </p>
              <div className="text-sm text-slate-500 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                <strong>Hatalı URL:</strong> {location.pathname}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/")}
                size="lg"
                className="group flex items-center gap-3"
              >
                <Home className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Ana Sayfaya Dön
              </Button>
              
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                size="lg"
                className="group flex items-center gap-3"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                Geri Git
              </Button>
            </div>

            {/* Quick Links */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Popüler Sayfalar
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/haberler")}
                  className="flex items-center gap-2"
                >
                  📰 Haberler
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/etkinlikler")}
                  className="flex items-center gap-2"
                >
                  🎉 Etkinlikler
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/dergi")}
                  className="flex items-center gap-2"
                >
                  📖 Dergi
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/iletisim")}
                  className="flex items-center gap-2"
                >
                  📞 İletişim
                </Button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 opacity-20">
              <Compass className="h-12 w-12 text-slate-400 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
    </PageContainer>
  );
};

export default NotFound;
