
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MagazineSection = () => {
  return (
    <section className="py-16 bg-white dark:bg-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Sol taraf - Dergi görseli */}
          <div className="relative">
            <div className="relative z-10 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-8 shadow-xl">
              <div className="aspect-[3/4] bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden">
                <div className="h-full flex flex-col">
                  {/* Dergi kapağı header */}
                  <div className="bg-gradient-to-r from-cyan-600 to-teal-600 p-4 text-white">
                    <h3 className="text-xl font-bold">Psikolojiİbu</h3>
                    <p className="text-sm opacity-90">Psikoloji Öğrencileri Dergisi</p>
                  </div>
                  
                  {/* Dergi kapağı içerik */}
                  <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-slate-900 dark:text-white">12</span>
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Travma ve İyileşme
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Özel Dosya: Post-travmatik Stres Bozukluğu
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Mart 2024 • Sayı 12
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-cyan-200 dark:bg-cyan-800 rounded-full opacity-60"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-teal-200 dark:bg-teal-800 rounded-full opacity-60"></div>
          </div>

          {/* Sağ taraf - İçerik */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Dergimiz: <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Psikolojiİbu</span>
            </h2>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Psikoloji alanındaki güncel araştırmaları, akademik makaleleri ve öğrenci çalışmalarını 
              içeren dergimiz, bilimsel bilgiyi erişilebilir kılmayı hedefliyor.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-slate-700 dark:text-slate-300">Akademik makaleler ve araştırmalar</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="text-slate-700 dark:text-slate-300">Öğrenci çalışmaları ve deneyimleri</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-700 dark:text-slate-300">Uzman görüşleri ve röportajlar</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-slate-700 dark:text-slate-300">Kitap incelemeleri ve öneriler</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white">
                <Link to="/dergi">
                  Son Sayıyı Keşfet
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dergi">
                  Arşivi İncele
                </Link>
              </Button>
            </div>

            {/* İstatistikler */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">12</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Yayınlanan Sayı</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">45+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Makale</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">25+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Yazar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MagazineSection;
