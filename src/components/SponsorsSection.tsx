
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SponsorsSection = () => {
  const sponsors = [
    { name: "Sponsor 1", logo: "/api/placeholder/120/60" },
    { name: "Sponsor 2", logo: "/api/placeholder/120/60" },
    { name: "Sponsor 3", logo: "/api/placeholder/120/60" },
    { name: "Sponsor 4", logo: "/api/placeholder/120/60" },
    { name: "Sponsor 5", logo: "/api/placeholder/120/60" },
    { name: "Sponsor 6", logo: "/api/placeholder/120/60" },
  ];

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Değerli Destekçilerimiz
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Topluluk faaliyetlerimizi destekleyen kurum ve kuruluşlara teşekkür ederiz.
          </p>
        </div>

        {/* Sponsor logoları */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {sponsors.map((sponsor, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center group"
            >
              <div className="w-24 h-12 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center group-hover:bg-slate-300 dark:group-hover:bg-slate-600 transition-colors duration-200">
                <span className="text-xs text-slate-500 dark:text-slate-400">{sponsor.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sponsor ol çağrısı */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Topluluk Faaliyetlerimize Destek Olmak İster Misiniz?
          </h3>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Psikoloji eğitimi ve araştırmalarına katkıda bulunarak, geleceğin psikologlarının 
            yetişmesine destek olabilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/sponsorlar">
                Sponsorluk Bilgileri
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Link to="/iletisim">
                İletişime Geç
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
