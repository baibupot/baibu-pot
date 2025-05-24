
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Book, Download, Eye, Search, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

// Mock data - bu veriler Supabase'den gelecek
const mockMagazineIssues = [
  {
    id: '1',
    title: 'Psikoloji ve Teknoloji',
    issue_number: 15,
    publication_date: '2024-03-01',
    cover_image: '/placeholder.svg',
    description: 'Bu sayımızda psikoloji alanında teknolojinin etkilerini ve gelecekteki rolünü inceliyoruz.',
    pdf_url: '#',
    featured: true,
    published: true
  },
  {
    id: '2',
    title: 'Çocuk Gelişimi',
    issue_number: 14,
    publication_date: '2024-01-01',
    cover_image: '/placeholder.svg',
    description: 'Çocuk gelişimi süreçleri ve modern yaklaşımlar üzerine detaylı incelemeler.',
    pdf_url: '#',
    featured: false,
    published: true
  },
  {
    id: '3',
    title: 'Klinik Psikoloji',
    issue_number: 13,
    publication_date: '2023-11-01',
    cover_image: '/placeholder.svg',
    description: 'Klinik psikoloji alanındaki son gelişmeler ve vaka çalışmaları.',
    pdf_url: '#',
    featured: false,
    published: true
  }
];

const Dergi = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<typeof mockMagazineIssues[0] | null>(null);

  const filteredIssues = mockMagazineIssues.filter(issue =>
    issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Psikolojiİbu Dergi Arşivi
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              BAİBÜ Psikoloji Öğrencileri Topluluğu'nun akademik dergisi "Psikolojiİbu"nun 
              tüm sayılarına buradan ulaşabilirsiniz. Psikoloji alanındaki güncel konular, 
              araştırmalar ve makaleler ile bilginizi genişletin.
            </p>
          </div>

          {/* Search Section */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Dergi sayılarında ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Featured Issue */}
          {filteredIssues.find(issue => issue.featured) && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Öne Çıkan Sayı
              </h2>
              {(() => {
                const featuredIssue = filteredIssues.find(issue => issue.featured)!;
                return (
                  <Card className="overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <div className="h-64 md:h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <Book className="h-16 w-16 text-slate-400" />
                        </div>
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300">
                            Sayı {featuredIssue.issue_number}
                          </Badge>
                          <Badge variant="outline">
                            Öne Çıkan
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                          {featuredIssue.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(featuredIssue.publication_date)}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                          {featuredIssue.description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button 
                            onClick={() => setSelectedIssue(featuredIssue)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Oku
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            PDF İndir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })()}
            </div>
          )}

          {/* All Issues Grid */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Tüm Sayılar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIssues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                      <Book className="h-12 w-12 text-slate-400" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300">
                        Sayı {issue.issue_number}
                      </Badge>
                      {issue.featured && (
                        <Badge variant="outline">
                          Öne Çıkan
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{issue.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(issue.publication_date)}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {issue.description}
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button 
                        onClick={() => setSelectedIssue(issue)}
                        variant="outline" 
                        className="w-full flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Oku
                      </Button>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        PDF İndir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredIssues.length === 0 && (
            <div className="text-center py-12">
              <Book className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Aradığınız dergi sayısı bulunamadı
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Lütfen farklı arama terimleri deneyin.
              </p>
            </div>
          )}
        </main>

        {/* Magazine Reader Modal */}
        {selectedIssue && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedIssue.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sayı {selectedIssue.issue_number} - {formatDate(selectedIssue.publication_date)}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedIssue(null)}
                >
                  Kapat
                </Button>
              </div>
              <div className="p-6">
                <div className="h-96 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Book className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      PDF okuyucu burada gösterilecek
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                      Supabase entegrasyonu ile PDF görüntüleme eklenecek
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

export default Dergi;
