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
  'pdf-demo': {
    id: 'pdf-demo',
    title: 'PDF Flipbook Demo Dergisi',
    issue_number: 99,
    publication_date: '2024-06-01',
    cover_image: '/pdf-demo-cover.jpg',
    description: 'Gerçek PDF dosyasını flipbook olarak deneyimleyin! Bu sayı, PDF dosyasının sayfa sayfa çevrilebildiği bir demo içerir.',
    editor: 'Demo Editör',
    authors: ['Demo Yazar 1', 'Demo Yazar 2'],
    illustrators: ['Demo Çizer'],
    sponsors: ['Demo Sponsor'],
    pdf_url: '/ornek.pdf',
    pages: [],
    featured: false,
    published: true
  },
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

  // Tam ekran dergi okuyucu - header/footer olmadan
  if (showReader) {
    return (
      <FlipbookReader 
        pages={magazineDetail.pages}
        title={magazineDetail.title}
        onClose={() => setShowReader(false)}
      />
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

          {/* Magazine Header - Responsive iyileştirmeleri */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Cover Image - Daha etkileyici görünüm */}
            <div className="lg:col-span-1">
              <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
                  {magazineDetail.cover_image ? (
                    <img src={magazineDetail.cover_image} alt={magazineDetail.title} className="object-cover w-full h-full" />
                  ) : (
                    <Book className="h-24 w-24 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Card>
            </div>

            {/* Magazine Info - Gelişmiş layout */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0 px-4 py-2">
                  Sayı {magazineDetail.issue_number}
                </Badge>
                {magazineDetail.featured && (
                  <Badge variant="outline" className="border-amber-300 text-amber-600 dark:text-amber-400">
                    ⭐ Öne Çıkan
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                {magazineDetail.title}
              </h1>

              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Calendar className="h-5 w-5" />
                <span className="text-lg">{formatDate(magazineDetail.publication_date)}</span>
              </div>

              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {magazineDetail.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {magazineDetail.id === 'pdf-demo' ? (
                  <Button
                    asChild
                    size="lg"
                    className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link to="/pdf-demo">
                      <Eye className="h-5 w-5" />
                      Dergiyi Tam Ekranda Oku
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowReader(true)}
                    size="lg" 
                    className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Eye className="h-5 w-5" />
                    Dergiyi Tam Ekranda Oku
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex items-center gap-3 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-3 text-lg font-semibold transition-all duration-300"
                  asChild
                >
                  <a href={magazineDetail.pdf_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-5 w-5" />
                    PDF İndir
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Team and Credits - Grid iyileştirmeleri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
