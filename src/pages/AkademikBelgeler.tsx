
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Search, FileText, Calendar, User, Eye } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

// Mock data - bu veriler Supabase'den gelecek
const mockDocuments = [
  {
    id: '1',
    title: 'Psikoloji Araştırma Yöntemleri El Kitabı',
    description: 'Nicel ve nitel araştırma yöntemleri, veri analizi teknikleri ve raporlama standartları hakkında kapsamlı rehber.',
    category: 'Araştırma Yöntemleri',
    file_type: 'PDF',
    file_size: '2.4 MB',
    upload_date: '2024-03-15',
    uploaded_by: 'Dr. Ahmet Yılmaz',
    download_count: 156,
    tags: ['araştırma', 'yöntem', 'analiz', 'rapor']
  },
  {
    id: '2',
    title: 'Klinik Psikoloji Vaka Örnekleri',
    description: 'Farklı psikolojik bozukluklar için vaka analizleri ve tedavi yaklaşımları.',
    category: 'Klinik Psikoloji',
    file_type: 'PDF',
    file_size: '1.8 MB',
    upload_date: '2024-03-10',
    uploaded_by: 'Doç. Dr. Ayşe Demir',
    download_count: 98,
    tags: ['klinik', 'vaka', 'tedavi', 'analiz']
  },
  {
    id: '3',
    title: 'Gelişim Psikolojisi Ders Notları',
    description: 'Yaşam boyu gelişim süreçleri, kritik dönemler ve gelişimsel teoriler üzerine detaylı notlar.',
    category: 'Gelişim Psikolojisi',
    file_type: 'PDF',
    file_size: '3.1 MB',
    upload_date: '2024-03-05',
    uploaded_by: 'Yrd. Doç. Dr. Mehmet Kaya',
    download_count: 203,
    tags: ['gelişim', 'çocuk', 'ergen', 'yaşlanma']
  },
  {
    id: '4',
    title: 'Sosyal Psikoloji Makale Koleksiyonu',
    description: 'Grup dinamikleri, önyargı, tutum değişimi ve sosyal etki konularında seçilmiş makaleler.',
    category: 'Sosyal Psikoloji',
    file_type: 'PDF',
    file_size: '4.2 MB',
    upload_date: '2024-02-28',
    uploaded_by: 'Prof. Dr. Fatma Öz',
    download_count: 127,
    tags: ['sosyal', 'grup', 'tutum', 'etki']
  },
  {
    id: '5',
    title: 'SPSS ile İstatistiksel Analiz Rehberi',
    description: 'SPSS programı kullanarak temel ve ileri istatistiksel analizlerin nasıl yapılacağına dair adım adım rehber.',
    category: 'İstatistik',
    file_type: 'PDF',
    file_size: '2.9 MB',
    upload_date: '2024-02-20',
    uploaded_by: 'Dr. Ali Çelik',
    download_count: 312,
    tags: ['spss', 'istatistik', 'analiz', 'veri']
  },
  {
    id: '6',
    title: 'Nöropsikoloji Test Bataryası',
    description: 'Bilişsel fonksiyonları değerlendirmek için kullanılan nöropsikolojik testler ve uygulama kılavuzu.',
    category: 'Nöropsikoloji',
    file_type: 'PDF',
    file_size: '1.6 MB',
    upload_date: '2024-02-15',
    uploaded_by: 'Doç. Dr. Zeynep Aydın',
    download_count: 89,
    tags: ['nöropsikoloji', 'test', 'bilişsel', 'değerlendirme']
  }
];

const AkademikBelgeler = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const categories = [
    'Tümü',
    'Araştırma Yöntemleri',
    'Klinik Psikoloji',
    'Gelişim Psikolojisi',
    'Sosyal Psikoloji',
    'İstatistik',
    'Nöropsikoloji'
  ];

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Tümü' || doc.category === selectedCategory;
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
      'Araştırma Yöntemleri': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Klinik Psikoloji': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Gelişim Psikolojisi': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Sosyal Psikoloji': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'İstatistik': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Nöropsikoloji': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300'
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
              Akademik Kaynak Kütüphanesi
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Psikoloji eğitiminizi destekleyecek akademik belgeler, araştırma raporları, 
              ders notları ve rehber materyallerinin bulunduğu kütüphanemize hoş geldiniz. 
              Tüm kaynaklar eğitim amaçlı olarak paylaşılmaktadır.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Belgeler içinde ara (başlık, açıklama, etiketler)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Usage Notice */}
          <div className="mb-8 p-4 bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 rounded-lg">
            <h3 className="text-sm font-semibold text-cyan-900 dark:text-cyan-100 mb-2">
              Kullanım Koşulları
            </h3>
            <p className="text-sm text-cyan-800 dark:text-cyan-200">
              Bu belgeler sadece eğitim amaçlı paylaşılmıştır. Telif hakları ilgili yazarlara aittir. 
              Belgeleri ticari amaçlarla kullanmak veya izinsiz dağıtmak yasaktır.
            </p>
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-5 w-5 text-slate-500" />
                        <Badge className={getCategoryColor(doc.category)}>
                          {doc.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {doc.file_type} - {doc.file_size}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {doc.title}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        {doc.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(doc.upload_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{doc.uploaded_by}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          <span>{doc.download_count} indirme</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Görüntüle
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        İndir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Aradığınız belge bulunamadı
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Lütfen farklı arama terimleri deneyin veya kategori filtresini değiştirin.
              </p>
            </div>
          )}

          {/* Contribution Section */}
          <div className="mt-12 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Katkı Sağlamak İster Misiniz?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Akademik belgelerinizi toplulukla paylaşarak diğer öğrencilerin eğitimine 
              katkı sağlayabilirsiniz. Belge paylaşımı için bizimle iletişime geçin.
            </p>
            <Button>
              Belge Paylaş
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default AkademikBelgeler;
