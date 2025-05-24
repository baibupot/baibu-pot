
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, FileText, Calendar, Users, Mail, Building, BookOpen, Briefcase, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

const SiteHaritasi = () => {
  const siteStructure = [
    {
      category: 'Ana Sayfalar',
      icon: Home,
      pages: [
        { name: 'Anasayfa', href: '/', description: 'Ana sayfa ve genel bilgiler' },
        { name: 'Haberler/Duyurular', href: '/haberler', description: 'Güncel haberler ve duyurular' },
        { name: 'Etkinlikler', href: '/etkinlikler', description: 'Geçmiş ve gelecek etkinlikler' },
        { name: 'Dergi', href: '/dergi', description: 'Psikolojiİbu dergi arşivi' }
      ]
    },
    {
      category: 'Topluluk',
      icon: Users,
      pages: [
        { name: 'Ekipler', href: '/ekipler', description: 'Topluluk yönetimi ve ekip üyeleri' },
        { name: 'Anketler', href: '/anketler', description: 'Aktif anketler ve geri bildirimler' },
        { name: 'Sponsorlar', href: '/sponsorlar', description: 'Destekçilerimiz ve iş ortakları' }
      ]
    },
    {
      category: 'Akademik',
      icon: BookOpen,
      pages: [
        { name: 'Akademik Belgeler', href: '/akademik-belgeler', description: 'Akademik kaynak kütüphanesi' },
        { name: 'Staj', href: '/staj', description: 'Staj fırsatları ve rehberi' }
      ]
    },
    {
      category: 'İletişim ve Bilgi',
      icon: Mail,
      pages: [
        { name: 'İletişim', href: '/iletisim', description: 'Bize ulaşın' },
        { name: 'Sıkça Sorulan Sorular', href: '/sss', description: 'Merak edilen sorular ve cevapları' },
        { name: 'Gizlilik Politikası', href: '/gizlilik-politikasi', description: 'Veri koruma ve gizlilik' }
      ]
    },
    {
      category: 'Yönetim',
      icon: Building,
      pages: [
        { name: 'Admin Girişi', href: '/admin', description: 'Yönetici paneli girişi' }
      ]
    }
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-cyan-500 mr-3" />
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Site Haritası
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              BAİBÜ Psikoloji Öğrencileri Topluluğu web sitesindeki tüm sayfaları ve 
              bölümleri buradan kolayca bulabilirsiniz.
            </p>
          </div>

          {/* Site Structure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {siteStructure.map((section) => (
              <Card key={section.category} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <section.icon className="h-6 w-6 text-cyan-500" />
                    {section.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.pages.map((page) => (
                      <div key={page.href} className="border-l-2 border-cyan-200 dark:border-cyan-800 pl-4">
                        <Link
                          to={page.href}
                          className="block group"
                        >
                          <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
                            {page.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {page.description}
                          </p>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Navigation */}
          <div className="mt-16 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Hızlı Erişim
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              En çok ziyaret edilen sayfalara hızlı erişim için aşağıdaki butonları kullanabilirsiniz.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild>
                <Link to="/">Anasayfa</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/haberler">Haberler</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/etkinlikler">Etkinlikler</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/iletisim">İletişim</Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default SiteHaritasi;
