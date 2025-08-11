import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Mail, Heart, Building2 } from 'lucide-react';
import { useSponsors } from '@/hooks/useSupabaseData';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';

const Sponsorlar = () => {
  const { data: sponsors = [], isLoading, error } = useSponsors(true);

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

  const handleSponsorClick = (website: string | null) => {
    if (website) {
      window.open(website, '_blank');
    }
  };

  const sponsorsByType = {
    ana: sponsors.filter(s => s.sponsor_type === 'ana'),
    destekci: sponsors.filter(s => s.sponsor_type === 'destekci'),
    medya: sponsors.filter(s => s.sponsor_type === 'medya'),
    akademik: sponsors.filter(s => s.sponsor_type === 'akademik')
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer background="slate">
        <LoadingPage 
          title="Sponsorlar Yükleniyor"
          message="Değerli destekçilerimizi tanıtmaya hazırlanıyoruz..."
          icon={Heart}
        />
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer background="slate">
        <ErrorState 
          title="Sponsorlar Yüklenemedi"
          message="Sponsor bilgilerini yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          onRetry={() => window.location.reload()}
          variant="network"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer background="slate">
      {/* Hero Section */}
      <PageHero
        title="Destekçilerimiz ve İş Ortaklarımız"
        gradient="pink"
      />

      {/* Stats Cards - Modern Mobile First */}
      {sponsors.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {sponsorsByType.ana.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                🥇 Ana Sponsor
              </div>
            </div>
          </Card>
          
          <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up animation-delay-100">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {sponsorsByType.destekci.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                🤝 Destekçi
              </div>
            </div>
          </Card>
          
          <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up animation-delay-200">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {sponsorsByType.medya.length + sponsorsByType.akademik.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                📱 Partner
              </div>
            </div>
          </Card>
          
          <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up animation-delay-300">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold gradient-text-primary">
                {sponsors.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                ✨ Toplam
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Sponsors by Category */}
      <div className="space-y-8 sm:space-y-12">
        {Object.entries(sponsorsByType).map(([type, typeSponsors]) => 
          typeSponsors.length > 0 && (
            <section key={type} className="animate-fade-in-up">
              {/* Category Header */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-1 w-12 sm:w-16 gradient-primary rounded-full"></div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                    {getSponsorTypeLabel(type)}
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                  {type === 'ana' && 'Ana sponsorlarımız, etkinliklerimizin gerçekleşmesinde kritik rol oynayan değerli ortaklarımızdır.'}
                  {type === 'destekci' && 'Destekçi kurumlarımız, topluluğumuzun büyümesine katkı sağlayan değerli iş ortaklarımızdır.'}
                  {type === 'medya' && 'Medya partnerlerimiz, etkinliklerimizin daha geniş kitlelere ulaşmasını sağlar.'}
                  {type === 'akademik' && 'Akademik ortaklarımız, bilimsel faaliyetlerimizde bizimle işbirliği yapan kurumlarımızdır.'}
                </p>
              </div>
              
              {/* Sponsors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {typeSponsors.map((sponsor, index) => (
                  <Card 
                    key={sponsor.id} 
                    variant="interactive"
                    className="group overflow-hidden"
                    onClick={() => handleSponsorClick(sponsor.website)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Sponsor Logo */}
                    <div className="aspect-video bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50 p-4 sm:p-6 flex items-center justify-center relative overflow-hidden">
                      {sponsor.logo ? (
                        <img
                          src={sponsor.logo}
                          alt={`${sponsor.name} Logo`}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 filter group-hover:brightness-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-200/50 dark:bg-slate-600/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 dark:text-slate-500" />
                        </div>
                      )}
                      
                      {/* Website Indicator */}
                      {sponsor.website && (
                        <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Sponsor Info */}
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge 
                          className={`${getSponsorTypeColor(sponsor.sponsor_type)} text-xs font-medium`}
                          variant="secondary"
                        >
                          {getSponsorTypeLabel(sponsor.sponsor_type)}
                        </Badge>
                      </div>
                      
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200 mb-2 line-clamp-2">
                        {sponsor.name}
                      </h3>
                    
                      
                      {sponsor.description && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {sponsor.description}
                        </p>
                      )}


                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )
        )}
      </div>

      {/* Empty State */}
      {sponsors.length === 0 && (
        <EmptyState
          icon={Building2}
          title="Henüz Sponsor Bulunmuyor"
          description="Yeni sponsorlar eklendiğinde burada görünecek. Sponsorluk fırsatları için bizimle iletişime geçin!"
          actionLabel="İletişim"
          onAction={() => window.location.href = '/iletisim'}
        />
      )}

      {/* Become a Sponsor Section */}
      <section className="py-16">
        <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-pink-950 dark:via-rose-950 dark:to-red-950 rounded-2xl p-12 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="text-6xl mb-6">🤝</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Sponsor Olmak İster Misiniz?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Topluluğumuzun faaliyetlerine sponsor olarak destek vermek, gençlerin eğitimine 
              katkı sağlamak ve kurumsal sosyal sorumluluk projelerinize değer katmak için 
              bizimle iletişime geçin.
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="group" onClick={() => window.location.href = '/iletisim'}>
                <Mail className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                İletişime Geç
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default Sponsorlar;
