
import React, { useState } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNews } from '@/hooks/useSupabaseData';

const Haberler = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { data: news = [], isLoading, error } = useNews(true);

  const filteredNews = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'etkinlik': 'Etkinlik',
      'dergi': 'Dergi',
      'duyuru': 'Duyuru',
      'genel': 'Genel'
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'etkinlik': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'dergi': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'duyuru': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'genel': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">Yükleniyor...</div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center text-red-500">Haberler yüklenirken bir hata oluştu.</div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Haberler ve Duyurular
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              BAİBÜ Psikoloji Öğrencileri Topluluğu'nun güncel haberlerini ve duyurularını 
              takip edin. Etkinlikler, akademik gelişmeler ve topluluk haberleri burada.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Haber ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  <SelectItem value="duyuru">Duyuru</SelectItem>
                  <SelectItem value="etkinlik">Etkinlik</SelectItem>
                  <SelectItem value="dergi">Dergi</SelectItem>
                  <SelectItem value="genel">Genel</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}>
                Filtreleri Temizle
              </Button>
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  {article.featured_image && (
                    <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={article.featured_image} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(article.category)}>
                      {getCategoryLabel(article.category)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                  
                  {article.excerpt && (
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/haberler/${article.slug}`} className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Devamını Oku
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Haber bulunamadı
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Aradığınız kriterlere uygun haber bulunmuyor.
              </p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Haberler;
