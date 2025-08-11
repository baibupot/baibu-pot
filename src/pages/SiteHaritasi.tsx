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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {siteStructure.map((section, sectionIndex) => (
            <Card 
              key={section.category} 
              variant="modern" 
              className="animate-fade-in-up"
              style={{ animationDelay: `${sectionIndex * 150}ms` }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className={`p-2 bg-${section.color}-100 dark:bg-${section.color}-900/50 rounded-xl`}>
                    <section.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${section.color}-600 dark:text-${section.color}-400`} />
                  </div>
                  {section.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {section.pages.map((page, pageIndex) => (
                    <div 
                      key={page.href} 
                      className="group animate-fade-in-up"
                      style={{ animationDelay: `${(sectionIndex * 150) + (pageIndex * 50)}ms` }}
                    >
                      <Link
                        to={page.href}
                        className={`block p-4 sm:p-5 rounded-xl bg-gradient-to-r from-${section.color}-50/50 to-slate-50/50 dark:from-${section.color}-900/20 dark:to-slate-800/50 hover:from-${section.color}-100/70 hover:to-slate-100/70 dark:hover:from-${section.color}-900/40 dark:hover:to-slate-800/70 transition-all duration-300 border border-${section.color}-200/30 dark:border-${section.color}-800/30 hover:border-${section.color}-300/50 dark:hover:border-${section.color}-700/50 hover:shadow-lg interactive-scale`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1">
                            <div className={`p-2 bg-${section.color}-100 dark:bg-${section.color}-900/50 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                              <span className="text-lg sm:text-xl">{page.emoji}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-semibold text-slate-900 dark:text-white group-hover:text-${section.color}-600 dark:group-hover:text-${section.color}-400 transition-colors duration-200 text-base sm:text-lg mb-1`}>
                                {page.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {page.description}
                              </p>
                            </div>
                          </div>
                          <ExternalLink className={`h-4 w-4 text-slate-400 group-hover:text-${section.color}-500 transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 flex-shrink-0 ml-2`} />
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
      <section className="py-12 sm:py-16">
        <Card variant="modern" className="bg-gradient-to-br from-teal-50/80 via-cyan-50/80 to-blue-50/80 dark:from-teal-950/50 dark:via-cyan-950/50 dark:to-blue-950/50 border-teal-200/50 dark:border-teal-800/50 animate-fade-in-up animation-delay-500">
          <CardContent className="p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
            </div>
            
            <div className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-8">
              <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 animate-bounce">🚀</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                Hızlı Erişim
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                En çok ziyaret edilen sayfalara hızlı erişim için aşağıdaki butonları kullanabilirsiniz. 🎯
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
                <Button 
                  asChild 
                  size="touch" 
                  className="group h-16 sm:h-20 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold shadow-xl hover:shadow-2xl interactive-scale"
                >
                  <Link to="/" className="flex flex-col items-center gap-1 sm:gap-2">
                    <Home className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs sm:text-sm font-medium">🏠 Anasayfa</span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild 
                  size="touch" 
                  className="group h-16 sm:h-20 border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-semibold interactive-scale"
                >
                  <Link to="/haberler" className="flex flex-col items-center gap-1 sm:gap-2">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs sm:text-sm font-medium">📰 Haberler</span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild 
                  size="touch" 
                  className="group h-16 sm:h-20 border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-semibold interactive-scale"
                >
                  <Link to="/etkinlikler" className="flex flex-col items-center gap-1 sm:gap-2">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs sm:text-sm font-medium">🎉 Etkinlikler</span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild 
                  size="touch" 
                  className="group h-16 sm:h-20 border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-semibold interactive-scale"
                >
                  <Link to="/iletisim" className="flex flex-col items-center gap-1 sm:gap-2">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs sm:text-sm font-medium">📞 İletişim</span>
                  </Link>
                </Button>
              </div>

              <div className="pt-6 sm:pt-8 border-t border-teal-200/50 dark:border-teal-800/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">
                      100%
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      📱 Mobil Uyumlu
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">
                      A+
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      ⚡ Performans
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">
                      24/7
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      🌐 Erişilebilir
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
};

export default SiteHaritasi;
