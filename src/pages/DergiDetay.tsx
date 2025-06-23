import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import PageContainer from '../components/ui/page-container';
import PageHero from '../components/ui/page-hero';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Download, BookOpen } from 'lucide-react';
import FlipbookReader from '../components/FlipbookReader';
import { processGitHubPdfPages, getPdfPageCount } from '../utils/pdfProcessor';
import { useMagazineContributors } from '../hooks/useSupabaseData';
import { trackMagazineRead } from '../utils/magazineTracking';

interface Magazine {
  id: string;
  title: string;
  description: string | null;
  theme: string | null;
  issue_number: number;
  publication_date: string;
  cover_image: string | null;
  pdf_file: string | null;
  slug: string;
  published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const DergiDetay = () => {
  const { id } = useParams<{ id: string }>();
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [flipbookPages, setFlipbookPages] = useState<string[]>([]);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [pdfProcessProgress, setPdfProcessProgress] = useState(0);
  const [totalPdfPages, setTotalPdfPages] = useState(0);
  const [loadedPageRanges, setLoadedPageRanges] = useState<Set<string>>(new Set());
  const [currentlyLoading, setCurrentlyLoading] = useState<Set<string>>(new Set());
  
  // Gizli istatistik tracking için state'ler
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);
  const [currentReadingSession, setCurrentReadingSession] = useState<string | null>(null);
  
  // Contributors verilerini çek
  const { data: contributors = [] } = useMagazineContributors(magazine?.id);
  
  // Magazine sponsors verilerini çek
  const [magazineSponsors, setMagazineSponsors] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchSponsorsData = async () => {
      if (!magazine?.id) return;
      
      try {
        // Yeni sistemde direkt magazine_sponsors tablosundan al
        const { data: magazineSponsorData } = await supabase
          .from('magazine_sponsors')
          .select('*')
          .eq('magazine_issue_id', magazine.id)
          .order('sort_order', { ascending: true });
          
        setMagazineSponsors(magazineSponsorData || []);
      } catch (error) {
        console.error('Sponsors yüklenirken hata:', error);
      }
    };
    
    fetchSponsorsData();
  }, [magazine?.id]);

  useEffect(() => {
    const fetchMagazine = async () => {
      if (!id) {
        setError('Dergi ID bulunamadı');
        setLoading(false);
        return;
      }

      try {
        // Önce slug ile ara, bulamazsa issue_number ile ara
        let { data, error: fetchError } = await supabase
          .from('magazine_issues')
          .select('*')
          .eq('slug', id)
          .single();

        // Slug ile bulunamadıysa ve ID sayısal ise issue_number ile ara
        if (fetchError && /^\d+$/.test(id)) {
          const result = await supabase
            .from('magazine_issues')
            .select('*')
            .eq('issue_number', parseInt(id))
            .single();
          data = result.data;
          fetchError = result.error;
        }

        // Son olarak ID ile ara (UUID ise)
        if (fetchError && id.length > 10) {
          const result = await supabase
            .from('magazine_issues')
            .select('*')
            .eq('id', id)
            .single();
          data = result.data;
          fetchError = result.error;
        }

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          setError('Dergi bulunamadı');
          return;
        }

        setMagazine(data);

        // Gizli istatistik tracking başlat (sayfa yüklendiğinde)
        if (data.pdf_file) {
          // Hiç ses çıkarmadan tracking başlat
          startReadingSession(data.id);
        }

      } catch (err: any) {
        setError(err.message || 'Dergi yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchMagazine();
  }, [id]);

  // Gizli istatistik tracking - kullanıcı hiç anlamayacak
  const startReadingSession = (magazineId: string) => {
    const startTime = Date.now();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setReadingStartTime(startTime);
    setCurrentReadingSession(sessionId);
    
    // Sayfa kapatılırken otomatik kaydet (background tracking)
    const handleBeforeUnload = () => {
      if (readingStartTime) {
        const duration = Date.now() - readingStartTime;
        // Async olmayan şekilde hızlıca kaydet
        navigator.sendBeacon('/api/magazine-read', JSON.stringify({
          magazineId,
          duration,
          completed: false
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (readingStartTime) {
        const duration = Date.now() - readingStartTime;
        // Normal okuma tamamlandığında
        trackMagazineRead(magazineId, duration, totalPdfPages, true);
      }
    };
  };
  
  // Okuma sonu tracking
  const endReadingSession = async (pagesRead?: number, completed = false) => {
    if (!readingStartTime || !magazine?.id) return;
    
    const duration = Date.now() - readingStartTime;
    
    // Gizlice veritabanına kaydet
    try {
      await trackMagazineRead(
        magazine.id,
        duration,
        pagesRead || totalPdfPages,
        completed
      );
    } catch (error) {
      // Sessizce hata yakala, kullanıcıya gösterme
      console.debug('Analytics error:', error);
    }
    
    setReadingStartTime(null);
    setCurrentReadingSession(null);
  };

  const getDownloadUrl = () => {
    if (!magazine?.pdf_file) return null;
    const url = magazine.pdf_file;
    
    // GitHub Raw URL'ler direkt indirilebilir
    if (url.includes('raw.githubusercontent.com')) {
      return url;
    }
    
    // Diğer URL'ler direkt kullanılır
    return url;
  };

  // Lazy loading için sayfa aralığı yükleme - DUPLICATE PREVENTION
  const loadPageRange = async (pdfUrl: string, startPage: number, endPage: number) => {
    const rangeKey = `${startPage}-${endPage}`;
    
    // Bu aralık zaten yüklenmişse veya yükleniyorsa atla
    if (loadedPageRanges.has(rangeKey) || currentlyLoading.has(rangeKey)) {
      return;
    }

    // Yükleme başlıyor olarak işaretle
    setCurrentlyLoading(current => new Set(current).add(rangeKey));

    try {
      const result = await processGitHubPdfPages(pdfUrl, startPage, endPage);

      if (result.success && result.pages.length > 0) {
        // Mevcut sayfalara yeni sayfaları ekle
        setFlipbookPages(currentPages => {
          const newPages = [...currentPages];
          
          // Sayfa indekslerini ayarla (0-based)
          for (let i = 0; i < result.pages.length; i++) {
            const pageIndex = startPage - 1 + i; // PDF sayfa numarası 1-based, array 0-based
            if (pageIndex < newPages.length) {
              newPages[pageIndex] = result.pages[i];
            }
          }
          
          return newPages;
        });

        // Bu aralığı yüklendi olarak işaretle
        setLoadedPageRanges(current => new Set(current).add(rangeKey));
      }
    } catch (error) {
      // Lazy loading hatası
    } finally {
      // Yükleme tamamlandı, loading set'inden çıkar
      setCurrentlyLoading(current => {
        const newSet = new Set(current);
        newSet.delete(rangeKey);
        return newSet;
      });
    }
  };

  // Sayfa değişiminde yakındaki sayfaları preload et - OPTIMIZED
  const preloadNearbyPages = async (pdfUrl: string, currentPage: number, totalPages: number) => {
    const preloadRange = 2; // Her yönden 2 sayfa preload (daha az)
    
    const startPage = Math.max(1, currentPage - preloadRange);
    const endPage = Math.min(totalPages, currentPage + preloadRange + 1);
    
    // 3'er sayfalık gruplar halinde yükle (daha küçük chunk)
    const chunkSize = 3;
    for (let i = startPage; i <= endPage; i += chunkSize) {
      const chunkEnd = Math.min(i + chunkSize - 1, endPage);
      loadPageRange(pdfUrl, i, chunkEnd); // await olmadan - paralel
    }
  };

  // PDF'i flipbook sayfalarına çevir - ULTRA FAST START
  const processPdfForFlipbook = async () => {
    if (!magazine?.pdf_file || pdfProcessing) return;
    
    setPdfProcessing(true);
    setPdfProcessProgress(10);
    
    try {
      const url = magazine.pdf_file;
      
      if (url.includes('raw.githubusercontent.com')) {
        // 1. PDF sayfa sayısını öğren
        const pageCount = await getPdfPageCount(url);
        if (pageCount > 0) {
          setTotalPdfPages(pageCount);
          setPdfProcessProgress(30);
          
          // 2. Placeholder array oluştur (anında flipbook için)
          const placeholders = Array(pageCount).fill('/placeholder.svg');
          setFlipbookPages(placeholders);
          setPdfProcessProgress(50);
          
          // 3. SADECE İLK SAYFAYI (kapak) hemen yükle - ULTRA FAST
          const coverResult = await processGitHubPdfPages(url, 1, 1);
          
          if (coverResult.success && coverResult.pages.length > 0) {
            // Kapağı yerleştir
            setFlipbookPages(currentPages => {
              const newPages = [...currentPages];
              newPages[0] = coverResult.pages[0];
              return newPages;
            });
            
            setLoadedPageRanges(new Set(['1-1']));
            setPdfProcessProgress(100);
            
            // 4. Diğer sayfalar arka planda lazy loading (100ms delay)
            setTimeout(() => {
              if (pageCount > 1) {
                // 2-3. sayfalar 100ms sonra
                loadPageRange(url, 2, 3);
                
                // 4-6. sayfalar 500ms sonra  
                setTimeout(() => loadPageRange(url, 4, 6), 500);
                
                // 7-10. sayfalar 1000ms sonra
                setTimeout(() => loadPageRange(url, 7, 10), 1000);
              }
            }, 100);
            
          } else {
            throw new Error('Kapak sayfası yüklenemedi');
          }
        } else {
          throw new Error('PDF sayfa sayısı alınamadı');
        }
        
      } else {
        // Diğer URL'ler (direkt PDF)
        setFlipbookPages([url]);
      }
      
    } catch (error) {
      // Fallback sayfalar
      setFlipbookPages([
        magazine.cover_image || '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg'
      ]);
    } finally {
      setPdfProcessing(false);
      setPdfProcessProgress(100);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  if (error || !magazine) {
    return (
      <PageContainer>
        <PageHero 
          title="Hata" 
          description={error || 'Dergi bulunamadı'} 
        />
        <div className="text-center">
          <Link to="/dergi">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dergi Listesine Dön
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  // Eğer okuma modundaysa flipbook göster
  if (isReading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <FlipbookReader 
          pages={flipbookPages}
          title={magazine.title}
          magazineId={magazine.id}
          totalPages={totalPdfPages}
          onClose={() => {
            // Flipbook kapatılırken session'ı sonlandır
            endReadingSession(totalPdfPages, true);
            setIsReading(false);
          }}
          isLoading={pdfProcessing}
          loadingProgress={pdfProcessProgress}
          loadingText={magazine.pdf_file?.includes('raw.githubusercontent.com') ? 
            `${pdfProcessProgress < 50 ? 'PDF analiz ediliyor...' : 
               pdfProcessProgress < 80 ? 'İlk sayfalar hazırlanıyor...' : 
               'Son hazırlıklar yapılıyor...'
             }` : 
            'PDF hazırlanıyor...'
          }
          onPageChange={(page) => {
            // Sayfa değişiminde yakındaki sayfaları preload et
            if (magazine.pdf_file?.includes('raw.githubusercontent.com') && totalPdfPages > 0) {
              preloadNearbyPages(magazine.pdf_file, page + 1, totalPdfPages); // +1 çünkü flipbook 0-based, PDF 1-based
            }
          }}
        />
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <Link to="/dergi">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dergi Listesine Dön
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Sol Panel - Dergi Kapağı */}
          <div>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="relative">
                  <img
                    src={magazine.cover_image || '/placeholder.svg'}
                    alt={magazine.title}
                    className="w-full h-auto rounded-lg shadow-lg max-w-md mx-auto"
                  />
                  {magazine.published && (
                    <Badge className="absolute top-2 right-2">
                      Yayında
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Sağ Panel - Dergi Bilgileri */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{magazine.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="text-lg px-3 py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  Sayı {magazine.issue_number}
                </Badge>
                <span className="text-gray-600 dark:text-gray-400">
                  {new Date(magazine.publication_date).toLocaleDateString('tr-TR')}
                </span>
              </div>
              
              {magazine.description && (
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                  {magazine.description}
                </p>
              )}
            </div>

            {/* Ana Okuma Butonu */}
            <Card className="border-2 border-primary/20 dark:border-primary/30 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Dergiyi Oku</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Sayfa çevirme efektleri ile gerçek dergi okuma deneyimi
                </p>
                
                <Button 
                  onClick={async () => {
                    // Direkt okuma moduna geç
                    setIsReading(true);
                    
                    // Flipbook açılırken additional tracking yok - zaten session başlatıldı
                    
                    // PDF henüz işlenmemişse arka planda işle
                    if (flipbookPages.length === 0 && !pdfProcessing) {
                      processPdfForFlipbook(); // await olmadan arka planda çalıştır
                    }
                  }}
                  className="w-full text-lg py-3"
                  size="lg"
                  disabled={!magazine.pdf_file}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  📖 Flipbook Oku
                </Button>
                
                {!magazine.pdf_file && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-2">
                    Bu dergi henüz yüklenmiyor
                  </p>
                )}
              </CardContent>
            </Card>

            {/* İndirme Butonu */}
            {getDownloadUrl() && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <a
                    href={getDownloadUrl()!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full border-gray-300 dark:border-gray-600">
                      <Download className="w-4 h-4 mr-2" />
                      PDF İndir
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Bilgi Kutusu */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 İpucu</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Dergiyi flipbook formatında okumak için "Flipbook Oku" butonunu kullanın. 
                  Sayfa çevirme efektleri ile gerçek dergi okuma deneyimi yaşayın.
                </p>
              </CardContent>
            </Card>

            {/* Contributors Bölümü - YENİ ÖZELLİK */}
            {contributors.length > 0 && (
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-3 flex items-center">
                    👥 Katkıda Bulunanlar ({contributors.length})
                  </h4>
                  <div className="space-y-3">
                    {contributors.map((contributor) => (
                      <div key={contributor.id} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        {contributor.profile_image ? (
                          <img 
                            src={contributor.profile_image} 
                            alt={contributor.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                            <span className="text-purple-600 dark:text-purple-300 font-medium text-sm">
                              {contributor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {contributor.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {contributor.role === 'editor' ? 'Editör' :
                               contributor.role === 'author' ? 'Yazar' :
                               contributor.role === 'illustrator' ? 'İllüstratör' :
                               contributor.role === 'designer' ? 'Tasarımcı' :
                               contributor.role === 'translator' ? 'Çevirmen' : contributor.role}
                            </Badge>
                          </div>
                          {contributor.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {contributor.bio}
                            </p>
                          )}
                          {contributor.social_links && Object.keys(contributor.social_links as any).length > 0 && (
                            <div className="flex gap-2 text-xs">
                              {Object.entries(contributor.social_links as any).map(([platform, link]) => (
                                <a 
                                  key={platform}
                                  href={link as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 dark:text-purple-400 hover:underline"
                                >
                                  {platform === 'linkedin' ? '💼 LinkedIn' :
                                   platform === 'twitter' ? '🐦 Twitter' :
                                   platform === 'instagram' ? '📷 Instagram' : 
                                   platform === 'email' ? '✉️ Email' : platform}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sponsors Bölümü - YENİ ÖZELLİK */}
            {magazineSponsors.length > 0 && (
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                    🏢 Bu Sayının Sponsorları ({magazineSponsors.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {magazineSponsors.map((magazineSponsor, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        {magazineSponsor.logo_url ? (
                          <img 
                            src={magazineSponsor.logo_url} 
                            alt={magazineSponsor.sponsor_name}
                            className="w-12 h-12 object-contain rounded border bg-white"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded border bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 font-bold text-lg">
                              {magazineSponsor.sponsor_name?.charAt(0).toUpperCase() || '🏢'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {magazineSponsor.website_url ? (
                            <a 
                              href={magazineSponsor.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-blue-900 dark:text-blue-100 hover:text-blue-700 dark:hover:text-blue-300 underline"
                            >
                              {magazineSponsor.sponsor_name || 'Sponsor'}
                            </a>
                          ) : (
                            <div className="font-medium text-blue-900 dark:text-blue-100">
                              {magazineSponsor.sponsor_name || 'Sponsor'}
                            </div>
                          )}
                          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            {magazineSponsor.sponsorship_type || 'Sponsor'}
                          </div>
                          {magazineSponsor.website_url && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              🌐 {magazineSponsor.website_url.replace(/^https?:\/\//, '')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teknik Bilgiler */}
            <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">📋 Dergi Bilgileri</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Sayı Numarası:</span>
                    <span>{magazine.issue_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Yayın Tarihi:</span>
                    <span>{new Date(magazine.publication_date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durum:</span>
                    <Badge variant={magazine.published ? "default" : "secondary"} className="text-xs">
                      {magazine.published ? 'Yayında' : 'Taslak'}
                    </Badge>
                  </div>
                  {magazine.theme && (
                    <div className="flex justify-between">
                      <span>Tema:</span>
                      <Badge variant="outline" className="text-xs">
                        {magazine.theme}
                      </Badge>
                    </div>
                  )}
                  {contributors.length > 0 && (
                    <div className="flex justify-between">
                      <span>Katkıda Bulunanlar:</span>
                      <span>{contributors.length} kişi</span>
                    </div>
                  )}
                  {magazine.pdf_file?.includes('raw.githubusercontent.com') && (
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <Badge variant="outline" className="text-xs">
                        GitHub PDF + Lazy Loading
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DergiDetay;
