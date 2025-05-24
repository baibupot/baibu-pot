
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const NewsSection = () => {
  const news = [
    {
      id: 1,
      title: "Psikoloji Günleri 2024 Başlıyor",
      excerpt: "Bu yıl 15-17 Mart tarihleri arasında düzenlenecek Psikoloji Günleri etkinlik programı açıklandı.",
      date: "15 Mart 2024",
      category: "Etkinlik",
      image: "/api/placeholder/400/200"
    },
    {
      id: 2,
      title: "Yeni Dergi Sayımız Yayında",
      excerpt: "Psikolojiİbu dergisinin 12. sayısı 'Travma ve İyileşme' temasıyla okuyucularla buluştu.",
      date: "10 Mart 2024",
      category: "Dergi",
      image: "/api/placeholder/400/200"
    },
    {
      id: 3,
      title: "Staj Başvuruları Başladı",
      excerpt: "2024 yaz dönemi staj başvuruları için yeni fırsatlar ve rehber bilgileri paylaşıldı.",
      date: "8 Mart 2024",
      category: "Duyuru",
      image: "/api/placeholder/400/200"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Etkinlik':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'Dergi':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case 'Duyuru':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
    }
  };

  return (
    <section className="py-16 bg-white dark:bg-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Öne Çıkan Haberler ve Duyurular
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Topluluk faaliyetleri, akademik gelişmeler ve önemli duyurulardan haberdar olun.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {news.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-slate-900">
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-t-lg overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-300 dark:bg-slate-600 rounded-lg mx-auto mb-2"></div>
                    <span className="text-sm">Görsel</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {item.date}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200">
                  {item.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {item.excerpt}
                </p>
              </CardContent>
              
              <CardFooter className="px-6 pb-6">
                <Button variant="outline" size="sm" className="w-full group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/20 group-hover:border-cyan-200 dark:group-hover:border-cyan-800">
                  Devamını Oku
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link to="/haberler">
              Tüm Haberler ve Duyurular
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
