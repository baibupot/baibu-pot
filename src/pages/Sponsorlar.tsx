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
        description="BAİBÜ Psikoloji Öğrencileri Topluluğu olarak, faaliyetlerimize destek veren değerli sponsor ve iş ortaklarımıza teşekkür ederiz. Onların desteği sayesinde daha kaliteli etkinlikler düzenleyebiliyoruz."
        icon={Heart}
        gradient="pink"
      >
        {sponsors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {sponsorsByType.ana.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Ana Sponsor</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {sponsorsByType.destekci.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Destekçi</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {sponsorsByType.medya.length + sponsorsByType.akademik.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Partner</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {sponsors.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Toplam</div>
            </div>
          </div>
        )}
      </PageHero>

      {/* Sponsors by Category */}
      <div className="space-y-16 py-12">
        {Object.entries(sponsorsByType).map(([type, typeSponsors]) => 
          typeSponsors.length > 0 && (
            <section key={type}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                  <Heart className="h-8 w-8 text-pink-500" />
                  {getSponsorTypeLabel(type)}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {type === 'ana' && 'Ana sponsorlarımız, etkinliklerimizin gerçekleşmesinde kritik rol oynayan değerli ortaklarımızdır.'}
                  {type === 'destekci' && 'Destekçi kurumlarımız, topluluğumuzun büyümesine katkı sağlayan değerli iş ortaklarımızdır.'}
                  {type === 'medya' && 'Medya partnerlerimiz, etkinliklerimizin daha geniş kitlelere ulaşmasını sağlar.'}
                  {type === 'akademik' && 'Akademik ortaklarımız, bilimsel faaliyetlerimizde bizimle işbirliği yapan kurumlarımızdır.'}
                </p>
              </div>
              
              <div className={`grid gap-8 ${type === 'ana' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {typeSponsors.map((sponsor) => (
                  <Card 
                    key={sponsor.id} 
                    className={`card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm ${
                      type === 'ana' ? 'border-l-4 border-l-yellow-500' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <Badge className={getSponsorTypeColor(sponsor.sponsor_type)}>
                          {getSponsorTypeLabel(sponsor.sponsor_type)}
                        </Badge>
                      </div>
                      
                      <div className={`${type === 'ana' ? 'h-40' : 'h-32'} bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center mb-4 p-4 relative overflow-hidden`}>
                        {sponsor.logo ? (
                          <img 
                            src={sponsor.logo} 
                            alt={sponsor.name} 
                            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300" 
                          />
                        ) : (
                          <Building2 className={`${type === 'ana' ? 'h-20 w-20' : 'h-16 w-16'} text-slate-400 group-hover:scale-110 transition-transform duration-300`} />
                        )}
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                      </div>
                      
                      <CardTitle className={`${type === 'ana' ? 'text-2xl' : 'text-xl'} text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-200`}>
                        {sponsor.name}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      {sponsor.description && (
                        <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                          {sponsor.description}
                        </p>
                      )}
                      
                      {sponsor.website && (
                        <Button 
                          variant="outline" 
                          className="w-full group-hover:shadow-lg transition-all duration-200"
                          onClick={() => window.open(sponsor.website, '_blank')}
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Web Sitesini Ziyaret Et
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group">
                <Mail className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                İletişime Geç
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Heart className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                Sponsorluk Paketi İndir
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default Sponsorlar;
