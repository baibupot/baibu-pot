import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Book, Download, Eye, Calendar, User, Users, Heart, BookOpen } from 'lucide-react';
import PageContainer from '@/components/ui/page-container';
import LoadingPage from '@/components/ui/loading-page';
import ErrorState from '@/components/ui/error-state';
import ModernPdfReader from '@/components/ModernPdfReader';
import FlipbookReader from '@/components/FlipbookReader';
import { useMagazineIssues } from '@/hooks/useSupabaseData';
import { useMagazineReads } from '@/hooks/useMagazineReads';

const DergiDetay = () => {
  const { id } = useParams<{ id: string }>();
  const [showReader, setShowReader] = useState<false | 'modern' | 'flipbook'>(false);
  const { data: magazines = [], isLoading, error } = useMagazineIssues(false);
  
  // Google Drive Demo Dergisi
  const mockPdfDemo = {
    id: 'google-drive-demo',
    title: 'Google Drive PDF Demo',
    issue_number: 1,
    publication_date: '2024-01-01',
    cover_image: '/kampus.jpg',
    description: 'Google Drive destekli modern PDF okuyucu deneyimi! Bu demo dergi Google Drive\'dan gelir ve otomatik olarak optimized şekilde görüntülenir.',
    pdf_file: 'https://drive.google.com/file/d/1RSRb8JqCx6g4kWE2QStERkGFuOqB-Xsw/view?usp=sharing',
    slug: 'google-drive-demo',
    theme: 'Google Drive Entegrasyonu',
    published: true,
    created_by: null,
    created_at: '',
    updated_at: ''
  };

  const allMagazines = [mockPdfDemo, ...magazines];
  const magazineDetail = allMagazines.find(mag => mag.slug === id || mag.id === id);
  
  const { readCount, incrementReadCount } = useMagazineReads(magazineDetail?.id || 'unknown');

  if (isLoading) {
    return <LoadingPage title="Dergi Yükleniyor" message="Dergi detayları yükleniyor..." />;
  }

  if (error || !magazineDetail) {
    return (
      <PageContainer background="slate">
        <div className="min-h-[60vh] flex items-center justify-center">
          <ErrorState
            title="Dergi Bulunamadı"
            message="Aradığınız dergi sayısı mevcut değil veya silinmiş olabilir."
            onRetry={() => window.location.href = '/dergi'}
            variant="notfound"
          />
        </div>
      </PageContainer>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long'
    });
  };

  const handleReadMagazine = (mode: 'modern' | 'flipbook' = 'modern') => {
    incrementReadCount();
    setShowReader(mode);
  };

  // Tam ekran dergi okuyucu - Modern PDF reader ile Google Drive desteği
  if (showReader === 'modern') {
    return (
      <ModernPdfReader 
        pdfUrl={magazineDetail.pdf_file || ''}
        title={magazineDetail.title}
        magazineId={magazineDetail.id}
        onClose={() => setShowReader(false)}
      />
    );
  }

    // Flipbook okuyucu - Gerçek sayfa çevirme deneyimi (TODO: Google Drive uyumlu hale getirilecek)
  if (showReader === 'flipbook') {
    // Geçici olarak modern okuyucuya yönlendir
    alert('📖 Flipbook deneyimi yakında gelecek! Şimdilik modern okuyucuyu kullanabilirsiniz.');
    setShowReader('modern');
    return null;
  }

  return (
    <PageContainer background="slate">
      {/* Breadcrumb */}
      <section className="py-6">
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4">
          <Button variant="ghost" asChild>
            <Link to="/dergi" className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
              <ArrowLeft className="h-4 w-4" />
              Dergi Arşivine Dön
            </Link>
          </Button>
        </div>
      </section>

      {/* Magazine Header */}
      <section className="pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cover Image */}
          <div className="lg:col-span-1">
            <Card className="card-hover overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <div className="aspect-[3/4] bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 dark:from-purple-900 dark:via-pink-900 dark:to-purple-900 flex items-center justify-center relative overflow-hidden">
                {magazineDetail.cover_image ? (
                  <img 
                    src={magazineDetail.cover_image} 
                    alt={magazineDetail.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy"
                  />
                ) : (
                  <Book className="h-32 w-32 text-purple-300 dark:text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Floating badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg">
                    Sayı {magazineDetail.issue_number}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Magazine Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {magazineDetail.id === 'google-drive-demo' && (
                  <Badge className="bg-gradient-to-r from-blue-400 to-blue-600 text-white border-0 shadow-md">
                    ☁️ Google Drive Demo
                  </Badge>
                )}
                {readCount > 0 && (
                  <Badge variant="outline" className="border-blue-300 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                    👁️ {readCount} okunma
                  </Badge>
                )}
                <Badge variant="outline" className="border-purple-300 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20">
                  📖 PDF Format
                </Badge>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                {magazineDetail.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span className="text-lg font-medium">{formatDate(magazineDetail.publication_date)}</span>
                </div>

                {magazineDetail.theme && (
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Book className="h-5 w-5 text-purple-500" />
                    <span className="text-lg font-medium">Tema: {magazineDetail.theme}</span>
                  </div>
                )}
              </div>

              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {magazineDetail.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={() => handleReadMagazine('modern')}
                    size="lg" 
                    className="group bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-6 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    disabled={!magazineDetail.pdf_file}
                  >
                    <Eye className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    📱 Modern Okuyucu
                  </Button>
                  
                  <Button 
                    onClick={() => handleReadMagazine('flipbook')}
                    size="lg" 
                    variant="outline"
                    className="group border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                    disabled={!magazineDetail.pdf_file}
                  >
                    <BookOpen className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    📖 Flipbook Deneyimi
                  </Button>
                </div>
                {magazineDetail.pdf_file && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="group border-2 border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-4 text-lg font-semibold transition-all duration-300"
                    asChild
                  >
                    <a href={magazineDetail.pdf_file} target="_blank" rel="noopener noreferrer">
                      <Download className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                      PDF İndir
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Cards */}
      <section className="pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
                📅 Yayın Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Sayı:</span> {magazineDetail.issue_number}
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">Tarih:</span> {formatDate(magazineDetail.publication_date)}
                </p>
                {magazineDetail.theme && (
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Tema:</span> {magazineDetail.theme}
                  </p>
                )}
                {readCount > 0 && (
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Okunma:</span> {readCount} kez
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Users className="h-6 w-6 text-blue-600" />
                👥 Topluluk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                BAİBÜ Psikoloji Öğrencileri Topluluğu tarafından özenle hazırlandı.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Heart className="h-6 w-6 text-pink-600" />
                💝 Destek
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Dergimizi beğendiyseniz lütfen arkadaşlarınızla paylaşın.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-purple-900/40 rounded-2xl p-12 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Daha Fazla Dergi Keşfedin
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Psikoloji dünyasından güncel yazılar, araştırmalar ve ilham verici içerikler için 
              dergi arşivimizi keşfedin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="group">
                <Link to="/dergi" className="flex items-center gap-3">
                  <Book className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  Tüm Dergileri Görüntüle
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="group">
                <Link to="/haberler" className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  Güncel Haberler
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default DergiDetay;
