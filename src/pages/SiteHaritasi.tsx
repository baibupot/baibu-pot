import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, FileText, Calendar, Users, Mail, Building, BookOpen, Briefcase, MapPin, ExternalLink } from 'lucide-react';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';

const SiteHaritasi = () => {
  const siteStructure = [
    {
      category: '🏠 Ana Sayfalar',
      icon: Home,
      color: 'cyan',
      pages: [
        { name: 'Anasayfa', href: '/', description: 'Ana sayfa ve genel bilgiler', emoji: '🏠' },
        { name: 'Haberler/Duyurular', href: '/haberler', description: 'Güncel haberler ve duyurular', emoji: '📰' },
        { name: 'Etkinlikler', href: '/etkinlikler', description: 'Geçmiş ve gelecek etkinlikler', emoji: '🎉' },
        { name: 'Dergi', href: '/dergi', description: 'Psikolojiİbu dergi arşivi', emoji: '📖' }
      ]
    },
    {
      category: '👥 Topluluk',
      icon: Users,
      color: 'emerald',
      pages: [
        { name: 'Ekipler', href: '/ekipler', description: 'Topluluk yönetimi ve ekip üyeleri', emoji: '👥' },
        { name: 'Anketler', href: '/anketler', description: 'Aktif anketler ve geri bildirimler', emoji: '📊' },
        { name: 'Sponsorlar', href: '/sponsorlar', description: 'Destekçilerimiz ve iş ortakları', emoji: '🤝' }
      ]
    },
    {
      category: '📚 Akademik',
      icon: BookOpen,
      color: 'blue',
      pages: [
        { name: 'Akademik Belgeler', href: '/akademik-belgeler', description: 'Akademik kaynak kütüphanesi', emoji: '📄' },
        { name: 'Stajlar', href: '/stajlar', description: 'Staj fırsatları ve rehberi', emoji: '💼' },
        { name: 'Ürünler', href: '/urunler', description: 'Topluluk ürünleri ve hizmetleri', emoji: '🛍️' }
      ]
    },
    {
      category: '📞 İletişim ve Bilgi',
      icon: Mail,
      color: 'purple',
      pages: [
        { name: 'İletişim', href: '/iletisim', description: 'Bize ulaşın', emoji: '📞' },
        { name: 'Sıkça Sorulan Sorular', href: '/sss', description: 'Merak edilen sorular ve cevapları', emoji: '❓' },
        { name: 'Gizlilik Politikası', href: '/gizlilik-politikasi', description: 'Veri koruma ve gizlilik', emoji: '🛡️' },
        { name: 'Site Haritası', href: '/site-haritasi', description: 'Tüm sayfa bağlantıları', emoji: '🗺️' }
      ]
    },
    {
      category: '⚙️ Yönetim',
      icon: Building,
      color: 'orange',
      pages: [
        { name: 'Admin Girişi', href: '/admin', description: 'Yönetici paneli girişi', emoji: '🔐' }
      ]
    }
  ];

  const totalPages = siteStructure.reduce((total, section) => total + section.pages.length, 0);

  return (
    <PageContainer background="slate">
      {/* Hero Section */}
      <PageHero
        title="Site Haritası"
        description="BAİBÜ Psikoloji Öğrencileri Topluluğu web sitesindeki tüm sayfaları ve bölümleri buradan kolayca bulabilirsiniz."
        icon={MapPin}
        gradient="teal"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {totalPages}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Toplam Sayfa</div>
          </div>
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {siteStructure.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Ana Kategori</div>
          </div>
          <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              100%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Erişilebilir</div>
          </div>
        </div>
      </PageHero>

      {/* Site Structure */}
      <section className="pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {siteStructure.map((section) => (
            <Card key={section.category} className="card-hover overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <section.icon className={`h-6 w-6 text-${section.color}-500`} />
                  {section.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.pages.map((page) => (
                    <div key={page.href} className="group">
                      <Link
                        to={page.href}
                        className="block p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 border-l-4 border-teal-300 dark:border-teal-600 hover:border-teal-500"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-2xl">{page.emoji}</span>
                            <div>
                              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200 text-lg">
                                {page.name}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                {page.description}
                              </p>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-teal-500 transition-colors duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2" />
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-16">
        <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950 rounded-2xl p-12 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Hızlı Erişim
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              En çok ziyaret edilen sayfalara hızlı erişim için aşağıdaki butonları kullanabilirsiniz.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <Button asChild size="lg" className="group h-16">
                <Link to="/" className="flex flex-col items-center gap-2">
                  <Home className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-medium">Anasayfa</span>
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="group h-16">
                <Link to="/haberler" className="flex flex-col items-center gap-2">
                  <FileText className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-medium">Haberler</span>
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="group h-16">
                <Link to="/etkinlikler" className="flex flex-col items-center gap-2">
                  <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-medium">Etkinlikler</span>
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="group h-16">
                <Link to="/iletisim" className="flex flex-col items-center gap-2">
                  <Mail className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-medium">İletişim</span>
                </Link>
              </Button>
            </div>

            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                💡 Tüm sayfalar mobil uyumlu olarak tasarlanmıştır ve modern tarayıcılarda mükemmel çalışır.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default SiteHaritasi;
