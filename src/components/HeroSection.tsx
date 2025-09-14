import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { useMagazineIssues, useEvents } from '@/hooks/useSupabaseData';

const HeroSection = () => {
  // Gerçek verileri çek
  const { data: magazines = [] } = useMagazineIssues(true);
  const { data: events = [] } = useEvents();

  return (
    <section className="relative bg-[url('/kampus.jpg')] bg-cover bg-center py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-10 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Sol taraf - İçerik */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                BAİBÜ Psikoloji
              </span>
              <br />
              Öğrenci Topluluğu
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
              Bolu Abant İzzet Baysal Üniversitesi Psikoloji Öğrencileri Topluluğu olarak, 
              psikoloji alanında bilgi paylaşımı, araştırma ve sosyal etkileşimi destekliyoruz.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white">
                <Link to="/etkinlikler">
                  Son Etkinlikler
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dergi">
                  Dergimizi İncele
                </Link>
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">500+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Aktif Üye</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{events.length}+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Etkinlik</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{magazines.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Dergi Sayısı</div>
              </div>
            </div>
          </div>

          {/* Sağ taraf - Görsel */}
          <div className="relative">
            <div className="relative z-10 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl">
              <div className="aspect-square bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-21 h-21 flex items-center justify-center mx-auto mb-4">
                    <img 
                      src="/logo.webp" 
                      alt="BAİBÜ Psikoloji Öğrencileri Topluluğu Logosu" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    BAİBÜ Psikoloji Topluluğu
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Bilim, sanat ve sosyal aktivitelerle dolu bir topluluk
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-cyan-200 dark:bg-cyan-800 rounded-full"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-teal-200 dark:bg-teal-800 rounded-full"></div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="h-6 w-6 text-slate-400" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
