import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, ExternalLink, Heart } from 'lucide-react';
import { useSponsors } from '@/hooks/useSupabaseData';

const SponsorsSection = () => {
  const { data: sponsors = [], isLoading } = useSponsors(true);
  
  // Sponsor türü renklerini ve etiketlerini belirle
  const getSponsorTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'ana': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'destekci': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'medya': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'akademik': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getSponsorTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ana': '🥇 Ana Sponsor',
      'destekci': '🤝 Destekçi',
      'medya': '📺 Medya Partneri',
      'akademik': '🎓 Akademik Partner'
    };
    return labels[type] || type;
  };
  
  // Aktif sponsorları al ve ana sponsorları öne çıkar
  const activeSponsors = sponsors
    .filter(sponsor => sponsor.active)
    .sort((a, b) => {
      // Ana sponsorlar önce, sonra sort_order'a göre
      if (a.sponsor_type === 'ana' && b.sponsor_type !== 'ana') return -1;
      if (b.sponsor_type === 'ana' && a.sponsor_type !== 'ana') return 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    })
    .slice(0, 8); // İlk 8 sponsoru göster

  if (isLoading) {
    return (
      <section className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Sponsor bilgileri yükleniyor...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Heart className="h-8 w-8 text-pink-500" />
            Değerli Destekçilerimiz
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Topluluk faaliyetlerimizi destekleyen kurum ve kuruluşlara teşekkür ederiz.
          </p>
        </div>

        {/* Sponsor kartları */}
        {activeSponsors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {activeSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border border-slate-200 dark:border-slate-700"
                onClick={() => sponsor.website && window.open(sponsor.website, '_blank')}
              >
                {/* Sponsor türü badge */}
                <div className="flex justify-between items-start mb-4">
                  <Badge className={getSponsorTypeColor(sponsor.sponsor_type)}>
                    {getSponsorTypeLabel(sponsor.sponsor_type)}
                  </Badge>
                  {sponsor.website && (
                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-200" />
                  )}
                </div>

                {/* Logo alanı */}
                <div className="h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center mb-4 p-3 relative overflow-hidden">
                  {sponsor.logo ? (
                    <img 
                      src={sponsor.logo} 
                      alt={sponsor.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                  )}
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                </div>

                {/* Sponsor adı */}
                <h3 className="font-semibold text-slate-900 dark:text-white text-center group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-200 mb-2">
                  {sponsor.name}
                </h3>

                {/* Açıklama (varsa) */}
                {sponsor.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center line-clamp-2 leading-relaxed">
                    {sponsor.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mb-12">
            <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Henüz sponsor bulunmuyor.
            </p>
          </div>
        )}

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
