
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, Eye, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNews } from '@/hooks/useSupabaseData';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';

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
      <PageContainer>
        <LoadingPage 
          title="Haberler Yükleniyor"
          message="Güncel haberler ve duyurular hazırlanıyor..."
          icon={Newspaper}
        />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState 
          title="Haberler Yüklenemedi"
          message="Haberleri yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          onRetry={() => window.location.reload()}
          variant="network"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Hero Section */}
      <PageHero
        title="Haberler ve Duyurular"
        description="BAİBÜ Psikoloji Öğrencileri Topluluğu'nun güncel haberlerini ve duyurularını takip edin. Etkinlikler, akademik gelişmeler ve topluluk haberleri burada."
        icon={Newspaper}
        gradient="blue"
      >
        {news.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {news.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Toplam Haber</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {news.filter((n) => n.category === 'duyuru').length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Duyuru</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {news.filter((n) => n.category === 'etkinlik').length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Etkinlik</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {news.filter((n) => {
                  const newsDate = new Date(n.created_at);
                  const currentDate = new Date();
                  return newsDate.getMonth() === currentDate.getMonth() && 
                         newsDate.getFullYear() === currentDate.getFullYear();
                }).length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Bu Ay</div>
            </div>
          </div>
        )}
      </PageHero>

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
              <Card key={article.id} className="card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
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
            <EmptyState
              icon={Newspaper}
              title="Haber Bulunamadı"
              description="Aradığınız kriterlere uygun haber bulunmuyor. Lütfen farklı filtreler deneyin."
              variant="search"
              actionLabel="Filtreleri Temizle"
              onAction={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
            />
          )}
    </PageContainer>
  );
};

export default Haberler;
