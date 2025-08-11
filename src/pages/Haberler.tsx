
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
        gradient="blue"
      />

      {/* Stats Cards */}
      {news.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {news.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                📰 Toplam Haber
              </div>
            </div>
          </Card>
          
          <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up animation-delay-100">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
                {news.filter((n) => n.category === 'duyuru').length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                📢 Duyuru
              </div>
            </div>
          </Card>
          
          <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up animation-delay-200">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {news.filter((n) => n.category === 'etkinlik').length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                🎉 Etkinlik
              </div>
            </div>
          </Card>
          
          <Card variant="modern" className="text-center p-4 sm:p-6 animate-fade-in-up animation-delay-300">
            <div className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold gradient-text-primary">
                {news.filter((n) => {
                  const newsDate = new Date(n.created_at);
                  const currentDate = new Date();
                  return newsDate.getMonth() === currentDate.getMonth() && 
                         newsDate.getFullYear() === currentDate.getFullYear();
                }).length}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                📅 Bu Ay
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card variant="modern" className="p-4 sm:p-6 mb-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Hangi haberi arıyorsunuz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-700 focus:border-cyan-500"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Kategori Seçin" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">🗂️ Tüm Kategoriler</SelectItem>
              <SelectItem value="duyuru">📢 Duyuru</SelectItem>
              <SelectItem value="etkinlik">🎉 Etkinlik</SelectItem>
              <SelectItem value="dergi">📖 Dergi</SelectItem>
              <SelectItem value="genel">📰 Genel</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="touch"
            className="w-full sm:w-auto"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
            }}
          >
            🔄 Temizle
          </Button>
        </div>
        
        {/* Filter Summary */}
        {(searchTerm || categoryFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">{filteredNews.length}</span> haber bulundu
              {searchTerm && <span> • "<strong>{searchTerm}</strong>" araması</span>}
              {categoryFilter !== 'all' && <span> • <strong>{getCategoryLabel(categoryFilter)}</strong> kategorisi</span>}
            </div>
          </div>
        )}
      </Card>

      {/* News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredNews.map((article, index) => (
          <Link key={article.id} to={`/haberler/${article.slug}`} className="block group">
            <Card 
              variant="interactive" 
              className="overflow-hidden h-full animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Featured Image */}
              {article.featured_image && (
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <img 
                    src={article.featured_image} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Category Badge on Image */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`${getCategoryColor(article.category)} text-xs font-medium backdrop-blur-sm`}>
                      {getCategoryLabel(article.category)}
                    </Badge>
                  </div>
                </div>
              )}

              <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
                {/* Category Badge (if no image) */}
                {!article.featured_image && (
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`${getCategoryColor(article.category)} text-xs font-medium`}>
                      {getCategoryLabel(article.category)}
                    </Badge>
                  </div>
                )}
                
                {/* Title */}
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-200 line-clamp-2 mb-3">
                  {article.title}
                </h3>
                
                {/* Date */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{formatDate(article.created_at)}</span>
                </div>
                
                {/* Excerpt */}
                {article.excerpt && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4 flex-1">
                    {article.excerpt}
                  </p>
                )}
                
                {/* Read More Button */}
                <div className="pt-2 mt-auto">
                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-sm font-medium group-hover:gap-3 transition-all duration-200">
                    <Eye className="h-4 w-4" />
                    <span>Devamını Oku</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredNews.length === 0 && (
        <EmptyState
          icon={Newspaper}
          title={news.length === 0 ? "Henüz Haber Yayınlanmadı" : "Haber Bulunamadı"}
          description={news.length === 0 
            ? "Yeni haberler ve duyurular yayınlandığında burada görünecek. Takipte kalın!" 
            : "Aradığınız kriterlere uygun haber bulunmuyor. Farklı filtreler deneyin."
          }
          variant={news.length === 0 ? "default" : "search"}
          actionLabel={news.length === 0 ? undefined : "Filtreleri Temizle"}
          onAction={news.length === 0 ? undefined : () => {
            setSearchTerm('');
            setCategoryFilter('all');
          }}
        />
      )}
    </PageContainer>
  );
};

export default Haberler;
