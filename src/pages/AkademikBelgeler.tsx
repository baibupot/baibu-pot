import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Calendar, User, FileText, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAcademicDocuments, useIncrementDocumentDownloads } from '@/hooks/useSupabaseData';
import PageContainer from '@/components/ui/page-container';
import PageHero from '@/components/ui/page-hero';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';
import { downloadFileSafely } from '@/utils/githubStorageHelper';

const AkademikBelgeler = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { data: documents = [], isLoading, error } = useAcademicDocuments();
  const incrementDownloads = useIncrementDocumentDownloads();

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (doc.author && doc.author.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'ders_programlari': '📅 Ders Programları',
      'staj_belgeleri': '💼 Staj Belgeleri',
      'sinav_programlari': '📊 Sınav Programları',
      'ogretim_planlari': '📚 Öğretim Planları/Müfredat',
      'ders_kataloglari': '📖 Ders Katalogları',
      'basvuru_formlari': '📝 Başvuru Formları',
      'resmi_belgeler': '🏛️ Resmi Belgeler',
      'rehber_dokumanlari': '🗺️ Rehber Dokümanları',
      'diger': '📁 Diğer'
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'ders_programlari': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'staj_belgeleri': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'sinav_programlari': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'ogretim_planlari': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'ders_kataloglari': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'basvuru_formlari': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'resmi_belgeler': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'rehber_dokumanlari': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
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

  // Güvenli indirme işlemi
  const handleDownload = async (document: any) => {
    setDownloadingId(document.id);
    setDownloadProgress(0);
    
    try {
      // Dosya adını oluştur
      const fileExtension = document.file_url.split('.').pop() || 'pdf';
      const fileName = `${document.title}.${fileExtension}`;
      
      // Progress callback
      const onProgress = (progress: number) => {
        setDownloadProgress(Math.round(progress));
      };

      // Güvenli indirme
      const result = await downloadFileSafely(document.file_url, fileName, onProgress);
      
      if (result.success) {
        toast.success(`📥 ${document.title} başarıyla indirildi`);
        
        // İndirme sayısını artır
        try {
          await incrementDownloads.mutateAsync(document.id);
        } catch (incrementError) {
          // İndirme sayısı artırma hatası olsa bile kullanıcıyı bilgilendirmeyiz
          console.error('İndirme sayısı artırılamadı:', incrementError);
        }
      } else {
        toast.error(`❌ İndirme hatası: ${result.error}`);
        // Fallback: Normal link ile aç
        window.open(document.file_url, '_blank');
      }
    } catch (error) {
      toast.error('❌ İndirme sırasında hata oluştu');
      // Fallback: Normal link ile aç
      window.open(document.file_url, '_blank');
    } finally {
      setDownloadingId(null);
      setDownloadProgress(0);
    }
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
        title="Öğrenci Hizmetleri Belgeleri"
        description="Psikoloji eğitiminizde ihtiyaç duyacağınız ders programları, staj başvuru belgeleri, sınav programları, müfredat bilgileri ve diğer resmi belgeler. Tüm belgeler öğrencilerimizin kullanımına ücretsiz olarak sunulmuştur."
        icon={BookOpen}
        gradient="teal"
      />

      {/* Search and Filters */}
      <section className="py-6 sm:py-8">
        <Card variant="modern" className="animate-fade-in-up">
          <CardContent className="p-4 sm:p-6">
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
                <SelectItem value="ders_programlari">Ders Programları</SelectItem>
                <SelectItem value="staj_belgeleri">Staj Belgeleri</SelectItem>
                <SelectItem value="sinav_programlari">Sınav Programları</SelectItem>
                <SelectItem value="ogretim_planlari">Öğretim Planları/Müfredat</SelectItem>
                <SelectItem value="ders_kataloglari">Ders Katalogları</SelectItem>
                <SelectItem value="basvuru_formlari">Başvuru Formları</SelectItem>
                <SelectItem value="resmi_belgeler">Resmi Belgeler</SelectItem>
                <SelectItem value="rehber_dokumanlari">Rehber Dokümanları</SelectItem>
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
                    onClick={() => handleDownload(document)}
                    disabled={downloadingId === document.id}
                  >
                    {downloadingId === document.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {downloadProgress > 0 ? `%${downloadProgress}` : 'İndiriliyor...'}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Güvenli İndir
                      </>
                    )}
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


    </PageContainer>
  );
};

export default AkademikBelgeler;
