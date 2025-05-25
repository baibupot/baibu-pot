
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Calendar, User, FileText } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useAcademicDocuments } from '@/hooks/useSupabaseData';

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
      'ders_notlari': 'Ders Notları',
      'arastirma': 'Araştırma',
      'tez': 'Tez',
      'makale': 'Makale',
      'sunum': 'Sunum',
      'diger': 'Diğer'
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'ders_notlari': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'arastirma': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
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

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-red-500">Belgeler yüklenirken bir hata oluştu.</div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Akademik Kaynak Kütüphanesi
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Psikoloji eğitiminize destek olacak akademik belgeler, ders notları, araştırmalar 
              ve diğer faydalı kaynakları burada bulabilirsiniz. Tüm belgeler ücretsiz olarak 
              erişiminize sunulmuştur.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Belge ara..."
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
                  <SelectItem value="ders_notlari">Ders Notları</SelectItem>
                  <SelectItem value="arastirma">Araştırma</SelectItem>
                  <SelectItem value="tez">Tez</SelectItem>
                  <SelectItem value="makale">Makale</SelectItem>
                  <SelectItem value="sunum">Sunum</SelectItem>
                  <SelectItem value="diger">Diğer</SelectItem>
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

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-12 w-12 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(document.category)}>
                      {getCategoryLabel(document.category)}
                    </Badge>
                    <Badge variant="outline">{document.file_type}</Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{document.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {document.description && (
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {document.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    {document.author && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <User className="h-4 w-4" />
                        <span>{document.author}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(document.upload_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Download className="h-4 w-4" />
                      <span>{document.downloads} indirme</span>
                    </div>
                  </div>

                  {document.tags && document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <Button 
                    className="w-full flex items-center gap-2"
                    onClick={() => window.open(document.file_url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                    İndir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Belge bulunamadı
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Aradığınız kriterlere uygun belge bulunmuyor.
              </p>
            </div>
          )}

          {/* Usage Notice */}
          <div className="mt-12 bg-blue-50 dark:bg-blue-950 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Kullanım Koşulları
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Bu belgeler yalnızca eğitim amaçlı kullanım içindir. Telif hakkı sahiplerinin 
              izni olmadan ticari amaçlarla kullanılması yasaktır. Belgeleri kullanırken 
              kaynak göstermeyi unutmayın.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default AkademikBelgeler;
