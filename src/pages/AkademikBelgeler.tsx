import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Calendar, User, FileText, BookOpen } from 'lucide-react';
import { useAcademicDocuments } from '@/hooks/useSupabaseData';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';

const AkademikBelgeler = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { data: documents = [], isLoading, error } = useAcademicDocuments();

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (doc.author && doc.author.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'ders_notlari': '📝 Ders Notları',
      'arastirma': '🔬 Araştırma',
      'tez': '🎓 Tez',
      'makale': '📄 Makale',
      'sunum': '🎤 Sunum',
      'diger': '📁 Diğer'
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'ders_notlari': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'arastirma': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'tez': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'makale': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'sunum': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'diger': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
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

  // Loading state
  if (isLoading) {
    return (
      <PageContainer background="slate">
        <LoadingPage 
          title="Belgeler Yükleniyor"
          message="Akademik kaynaklarımızı hazırlıyoruz..."
          icon={BookOpen}
        />
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer background="slate">
        <ErrorState 
          title="Belgeler Yüklenemedi"
          message="Akademik belgeleri yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
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
        title="Akademik Kaynak Kütüphanesi"
        description="Psikoloji eğitiminize destek olacak akademik belgeler, ders notları, araştırmalar ve diğer faydalı kaynakları burada bulabilirsiniz. Tüm belgeler ücretsiz olarak erişiminize sunulmuştur."
        icon={BookOpen}
        gradient="teal"
      >
        {documents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {documents.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Toplam Belge</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {new Set(documents.map(d => d.category)).size}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Kategori</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {documents.reduce((total, doc) => total + (doc.downloads || 0), 0)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Toplam İndirme</div>
            </div>
            <div className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {new Set(documents.map(d => d.author).filter(Boolean)).size}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Katkıda Bulunan</div>
            </div>
          </div>
        )}
      </PageHero>

      {/* Search and Filters */}
      <section className="py-8">
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Belge ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 dark:bg-slate-700/80"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white/80 dark:bg-slate-700/80">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                <SelectItem value="ders_notlari">Ders Notları</SelectItem>
                <SelectItem value="arastirma">Araştırma</SelectItem>
                <SelectItem value="tez">Tez</SelectItem>
                <SelectItem value="makale">Makale</SelectItem>
                <SelectItem value="sunum">Sunum</SelectItem>
                <SelectItem value="diger">Diğer</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              className="bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
            >
              Filtreleri Temizle
            </Button>
          </div>
        </div>
      </section>

      {/* Documents Grid */}
      <section className="pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document) => (
              <Card 
                key={document.id} 
                className="card-hover group overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="h-40 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900 dark:to-emerald-900 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                    <FileText className="h-16 w-16 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300" />
                    {/* File type indicator */}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {document.file_type}
                      </Badge>
                    </div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getCategoryColor(document.category)}>
                      {getCategoryLabel(document.category)}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200">
                    {document.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {document.description && (
                    <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                      {document.description}
                    </p>
                  )}
                  
                  <div className="space-y-3 mb-6">
                    {document.author && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <User className="h-4 w-4 text-teal-500" />
                        <span>{document.author}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4 text-teal-500" />
                      <span>{formatDate(document.upload_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Download className="h-4 w-4 text-teal-500" />
                      <span className="font-medium text-teal-600 dark:text-teal-400">
                        {document.downloads} indirme
                      </span>
                    </div>
                  </div>

                  {document.tags && document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {document.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {document.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{document.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <Button 
                    className="w-full group-hover:shadow-lg transition-all duration-200"
                    onClick={() => window.open(document.file_url, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    İndir
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3">
              <EmptyState
                icon={FileText}
                title="Belge Bulunamadı"
                description="Aradığınız kriterlere uygun belge bulunmuyor. Lütfen farklı filtreler deneyin."
                variant="search"
                actionLabel="Filtreleri Temizle"
                onAction={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Usage Notice */}
      <section className="py-16">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 rounded-2xl p-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
            <div className="text-6xl mb-6">⚖️</div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Kullanım Koşulları
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Bu belgeler yalnızca eğitim amaçlı kullanım içindir. Telif hakkı sahiplerinin 
              izni olmadan ticari amaçlarla kullanılması yasaktır. Belgeleri kullanırken 
              kaynak göstermeyi unutmayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" className="group">
                <FileText className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Kullanım Şartları
              </Button>
              <Button variant="outline" size="lg" className="group">
                <BookOpen className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                Telif Hakkı Politikası
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default AkademikBelgeler;
