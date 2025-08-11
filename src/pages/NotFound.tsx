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
      <div className="min-h-[80vh] flex items-center justify-center py-8 sm:py-12">
        <Card variant="modern" className="max-w-2xl w-full mx-4 animate-fade-in-up">
          <CardContent className="p-8 sm:p-12 text-center space-y-6 sm:space-y-8 relative overflow-hidden">
            {/* Animated 404 */}
            <div className="relative animate-fade-in-up">
              <div className="text-7xl sm:text-9xl font-bold text-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text animate-pulse">
                404
              </div>
              <div className="absolute inset-0 text-7xl sm:text-9xl font-bold text-slate-200 dark:text-slate-700 -z-10">
                404
              </div>
              {/* Decorative floating emoji */}
              <div className="absolute -top-4 -right-4 text-4xl animate-bounce animation-delay-500">🔍</div>
              <div className="absolute -bottom-4 -left-4 text-3xl animate-bounce animation-delay-1000">😅</div>
            </div>

            {/* Error Message */}
            <div className="space-y-4 animate-fade-in-up animation-delay-200">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                🚫 Sayfa Bulunamadı
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Aradığınız sayfa mevcut değil, taşınmış, silinmiş veya henüz oluşturulmamış olabilir. 
                Lütfen URL'yi kontrol edin veya ana sayfaya dönün. 🏠
              </p>
              <div className="text-sm text-slate-500 dark:text-slate-500 font-mono bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <strong>📍 Hatalı URL:</strong> <code className="text-red-600 dark:text-red-400">{location.pathname}</code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up animation-delay-400">
              <Button 
                onClick={() => navigate("/")}
                size="touch"
                className="group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold shadow-xl hover:shadow-2xl interactive-scale"
              >
                <Home className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                🏠 Ana Sayfaya Dön
              </Button>
              
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                size="touch"
                className="group border-2 border-slate-600 text-slate-600 hover:bg-slate-600 hover:text-white font-semibold interactive-scale"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                Geri Git
              </Button>
            </div>

            {/* Quick Links */}
            <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-6 sm:pt-8 animate-fade-in-up animation-delay-600">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4 sm:mb-6">
                Popüler Sayfalar
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/haberler")}
                  className="group flex items-center gap-2 h-12 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 interactive-scale"
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">📰</span>
                  Haberler
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/etkinlikler")}
                  className="group flex items-center gap-2 h-12 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 interactive-scale"
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">🎉</span>
                  Etkinlikler
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/dergi")}
                  className="group flex items-center gap-2 h-12 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 interactive-scale"
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">📖</span>
                  Dergi
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/iletisim")}
                  className="group flex items-center gap-2 h-12 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 interactive-scale"
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">📞</span>
                  İletişim
                </Button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-20 animate-fade-in animation-delay-1000">
              <Compass className="h-8 w-8 sm:h-12 sm:w-12 text-slate-400 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 opacity-10 animate-fade-in animation-delay-1500">
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 animate-pulse" />
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
