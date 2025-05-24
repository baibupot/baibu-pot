
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Mail, Heart, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

// Mock data - bu veriler Supabase'den gelecek
const mockSponsors = [
  {
    id: '1',
    name: 'TechCorp Yazılım',
    logo_url: '/placeholder.svg',
    website_url: 'https://example.com',
    description: 'Teknoloji alanında öncü şirket olarak, gençlerin eğitimine destek veriyoruz.',
    sponsor_type: 'altın',
    active: true
  },
  {
    id: '2',
    name: 'Psikoloji Merkezi',
    logo_url: '/placeholder.svg',
    website_url: 'https://example.com',
    description: 'Psikoloji hizmetleri alanında uzman kadromuzla topluma hizmet ediyoruz.',
    sponsor_type: 'gümüş',
    active: true
  },
  {
    id: '3',
    name: 'Kitap Dünyası',
    logo_url: '/placeholder.svg',
    website_url: 'https://example.com',
    description: 'Akademik yayınlar ve kitaplar konusunda öğrencilere destek sağlıyoruz.',
    sponsor_type: 'bronz',
    active: true
  },
  {
    id: '4',
    name: 'Eğitim Platformu',
    logo_url: '/placeholder.svg',
    website_url: 'https://example.com',
    description: 'Online eğitim çözümleri ile öğrencilerin gelişimine katkı sağlıyoruz.',
    sponsor_type: 'destekçi',
    active: true
  }
];

const Sponsorlar = () => {
  const getSponsorTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'altın': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'gümüş': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'bronz': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'destekçi': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getSponsorTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'altın': 'Altın Sponsor',
      'gümüş': 'Gümüş Sponsor',
      'bronz': 'Bronz Sponsor',
      'destekçi': 'Destekçi'
    };
    return labels[type] || type;
  };

  const sponsorsByType = {
    altın: mockSponsors.filter(s => s.sponsor_type === 'altın'),
    gümüş: mockSponsors.filter(s => s.sponsor_type === 'gümüş'),
    bronz: mockSponsors.filter(s => s.sponsor_type === 'bronz'),
    destekçi: mockSponsors.filter(s => s.sponsor_type === 'destekçi')
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Destekçilerimiz ve İş Ortaklarımız
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              BAİBÜ Psikoloji Öğrencileri Topluluğu olarak, faaliyetlerimize destek veren 
              değerli sponsor ve iş ortaklarımıza teşekkür ederiz. Onların desteği sayesinde 
              daha kaliteli etkinlikler düzenleyebiliyoruz.
            </p>
          </div>

          {/* Sponsors by Category */}
          {Object.entries(sponsorsByType).map(([type, sponsors]) => 
            sponsors.length > 0 && (
              <div key={type} className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <Heart className="h-6 w-6 text-red-500" />
                  {getSponsorTypeLabel(type)}
                </h2>
                <div className={`grid gap-6 ${type === 'altın' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {sponsors.map((sponsor) => (
                    <Card key={sponsor.id} className={`hover:shadow-lg transition-shadow duration-300 ${type === 'altın' ? 'border-yellow-200 dark:border-yellow-800' : ''}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge className={getSponsorTypeColor(sponsor.sponsor_type)}>
                              {getSponsorTypeLabel(sponsor.sponsor_type)}
                            </Badge>
                          </div>
                        </div>
                        <div className={`${type === 'altın' ? 'h-32' : 'h-24'} bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4`}>
                          <Building2 className={`${type === 'altın' ? 'h-16 w-16' : 'h-12 w-12'} text-slate-400`} />
                        </div>
                        <CardTitle className={`${type === 'altın' ? 'text-xl' : 'text-lg'} text-slate-900 dark:text-white`}>
                          {sponsor.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                          {sponsor.description}
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center gap-2"
                          onClick={() => window.open(sponsor.website_url, '_blank')}
                        >
                          Web Sitesini Ziyaret Et
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Become a Sponsor Section */}
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Sponsor Olmak İster Misiniz?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Toplululuğumuzun faaliyetlerine sponsor olarak destek vermek, gençlerin eğitimine 
              katkı sağlamak ve kurumsal sosyal sorumluluk projelerinize değer katmak için 
              bizimle iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                İletişime Geç
              </Button>
              <Button variant="outline">
                Sponsorluk Paketi İndir
              </Button>
            </div>
          </div>

          {mockSponsors.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Henüz sponsor bulunmuyor
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Yeni sponsorlar eklendiğinde burada görünecek.
              </p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Sponsorlar;
