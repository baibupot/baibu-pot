
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, MessageCircle, Eye } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

// Mock data - bu veriler Supabase'den gelecek
const mockNews = [
  {
    id: '1',
    title: 'Yeni Dönem Etkinlik Programı Açıklandı',
    excerpt: 'Bahar döneminde düzenleyeceğimiz etkinliklerin programı belli oldu. Psikoloji alanında uzman konuşmacılar ve çeşitli workshop\'lar sizleri bekliyor.',
    content: 'Detaylı içerik buraya gelecek...',
    featured_image: '/placeholder.svg',
    publication_date: '2024-03-15',
    author: 'BAİBÜ PÖT Yönetimi',
    category: 'Duyuru',
    published: true,
    view_count: 245,
    comment_count: 12
  },
  {
    id: '2',
    title: 'Psikoloji Günü Kutlama Etkinliği',
    excerpt: '9 Eylül Dünya Psikoloji Günü kapsamında düzenlediğimiz etkinlikler büyük ilgi gördü. Katılan herkese teşekkür ederiz.',
    content: 'Detaylı içerik buraya gelecek...',
    featured_image: '/placeholder.svg',
    publication_date: '2024-03-10',
    author: 'Etkinlik Koordinatörlüğü',
    category: 'Haber',
    published: true,
    view_count: 189,
    comment_count: 8
  },
  {
    id: '3',
    title: 'Yeni Üye Kayıtları Başladı',
    excerpt: 'Topluluğumuza katılmak isteyen öğrenciler için yeni üye kayıt süreci başlamıştır. Başvuru formu ve detaylar için duyuru metnini okuyun.',
    content: 'Detaylı içerik buraya gelecek...',
    featured_image: '/placeholder.svg',
    publication_date: '2024-03-05',
    author: 'Üyelik Koordinatörlüğü',
    category: 'Duyuru',
    published: true,
    view_count: 312,
    comment_count: 15
  }
];

const Haberler = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedNews, setSelectedNews] = useState<typeof mockNews[0] | null>(null);

  const categories = ['Tümü', 'Haber', 'Duyuru', 'Etkinlik'];

  const filteredNews = mockNews.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || news.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Haber': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Duyuru': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Etkinlik': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Haberler ve Duyurular
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Topluluğumuzla ilgili en güncel haberler, duyurular ve gelişmeleri 
              buradan takip edebilirsiniz. Tüm önemli bilgiler ve etkinlik duyuruları 
              için düzenli olarak bu sayfayı kontrol edin.
            </p>
          </div>

          {/* Filter and Search Section */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Haberler ve duyurular içinde ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((news) => (
              <Card key={news.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4">
                    {/* Placeholder for news image */}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(news.category)}>
                      {news.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{news.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(news.publication_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{news.author}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                    {news.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{news.view_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{news.comment_count}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setSelectedNews(news)}
                      variant="outline" 
                      size="sm"
                    >
                      Devamını Oku
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Aradığınız içerik bulunamadı
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Lütfen farklı arama terimleri deneyin veya kategori filtresini değiştirin.
              </p>
            </div>
          )}
        </main>

        {/* News Detail Modal */}
        {selectedNews && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
                <div className="flex-1">
                  <Badge className={getCategoryColor(selectedNews.category)} style={{ marginBottom: '8px' }}>
                    {selectedNews.category}
                  </Badge>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {selectedNews.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(selectedNews.publication_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{selectedNews.author}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedNews(null)}
                >
                  Kapat
                </Button>
              </div>
              <div className="p-6">
                <div className="h-64 bg-slate-100 dark:bg-slate-700 rounded-lg mb-6">
                  {/* Placeholder for news image */}
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedNews.content}
                  </p>
                  <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Bu haber içeriği Supabase entegrasyonu ile gerçek verilerle doldurulacak.
                      Şu anda örnek içerik gösterilmektedir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Haberler;
