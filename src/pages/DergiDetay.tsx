import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Book, Download, Eye, Calendar, User, Users, Heart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import FlipbookReader from '@/components/FlipbookReader';

// Mock data - bu veriler Supabase'den gelecek
const mockMagazineDetails = {
  '1': {
    id: '1',
    title: 'Psikoloji ve Teknoloji',
    issue_number: 15,
    publication_date: '2024-03-01',
    cover_image: '/placeholder.svg',
    description: 'Bu sayımızda psikoloji alanında teknolojinin etkilerini ve gelecekteki rolünü inceliyoruz. Dijital çağın insan davranışları üzerindeki etkilerini, sanal gerçeklik terapisini, yapay zeka destekli psikolojik değerlendirmeleri ve teknoloji bağımlılığını ele alıyoruz.',
    editor: 'Dr. Ayşe Kaya',
    authors: [
      'Prof. Dr. Mehmet Özkan',
      'Doç. Dr. Zeynep Acar',
      'Arş. Gör. Burak Demir',
      'Psk. Elif Yıldız'
    ],
    illustrators: [
      'Grafiker Cem Tunç',
      'İllüstratör Seda Kara'
    ],
    sponsors: [
      'BAİBÜ Rektörlüğü',
      'Türk Psikologlar Derneği',
      'Mindfulness Merkezi'
    ],
    pdf_url: '#',
    pages: [
      '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg',
      '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg',
      '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'
    ],
    featured: true,
    published: true
  },
  '2': {
    id: '2',
    title: 'Çocuk Gelişimi',
    issue_number: 14,
    publication_date: '2024-01-01',
    cover_image: '/placeholder.svg',
    description: 'Çocuk gelişimi süreçleri ve modern yaklaşımlar üzerine detaylı incelemeler.',
    editor: 'Dr. Fatma Yıldırım',
    authors: ['Prof. Dr. Ali Çelik', 'Doç. Dr. Merve Şen'],
    illustrators: ['Grafiker Can Öz'],
    sponsors: ['BAİBÜ Rektörlüğü'],
    pdf_url: '#',
    pages: [
      '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg',
      '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'
    ],
    featured: false,
    published: true
  }
};

const DergiDetay = () => {
  const { id } = useParams<{ id: string }>();
  const [showReader, setShowReader] = useState(false);
  
  const magazineDetail = id ? mockMagazineDetails[id as keyof typeof mockMagazineDetails] : null;

  if (!magazineDetail) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <Book className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Dergi bulunamadı
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Aradığınız dergi sayısı mevcut değil.
              </p>
              <Button asChild>
                <Link to="/dergi">Dergi Arşivine Dön</Link>
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Tam ekran dergi okuyucu gösteriliyorsa sadece onu render et
  if (showReader) {
    return (
      <ThemeProvider>
        <FlipbookReader 
          pages={magazineDetail.pages}
          title={magazineDetail.title}
          onClose={() => setShowReader(false)}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/dergi" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Dergi Arşivine Dön
              </Link>
            </Button>
          </div>

          {/* Magazine Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Cover Image */}
            <div className="lg:col-span-1">
              <Card className="overflow-hidden">
                <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <Book className="h-24 w-24 text-slate-400" />
                </div>
              </Card>
            </div>

            {/* Magazine Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300">
                  Sayı {magazineDetail.issue_number}
                </Badge>
                {magazineDetail.featured && (
                  <Badge variant="outline">
                    Öne Çıkan
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {magazineDetail.title}
              </h1>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-6">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(magazineDetail.publication_date)}</span>
              </div>

              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                {magazineDetail.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowReader(true)}
                  size="lg" 
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
                >
                  <Eye className="h-4 w-4" />
                  Dergiyi Oku
                </Button>
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  PDF İndir
                </Button>
              </div>
            </div>
          </div>

          {/* Team and Credits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-cyan-600" />
                  Editör
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {magazineDetail.editor}
                </p>
              </CardContent>
            </Card>

            {/* Authors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-teal-600" />
                  Yazarlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {magazineDetail.authors.map((author, index) => (
                    <li key={index} className="text-slate-700 dark:text-slate-300 text-sm">
                      {author}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Illustrators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Book className="h-5 w-5 text-emerald-600" />
                  Çizerler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {magazineDetail.illustrators.map((illustrator, index) => (
                    <li key={index} className="text-slate-700 dark:text-slate-300 text-sm">
                      {illustrator}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Sponsors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-red-600" />
                  Sponsorlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {magazineDetail.sponsors.map((sponsor, index) => (
                    <li key={index} className="text-slate-700 dark:text-slate-300 text-sm">
                      {sponsor}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default DergiDetay;
