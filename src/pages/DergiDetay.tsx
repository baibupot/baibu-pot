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
import { processGitHubPdfPages, getPdfPageCount, loadMagazinePageUrls } from '../utils/pdfProcessor';
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
  // Legacy state'ler kaldırıldı - yeni sistemde gerek yok
  
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

  // 🗑️ Eski lazy loading sistemi kaldırıldı - yeni sistemde gereksiz
  // Artık sayfa sayfa JPG'ler direkt yükleniyor, range request'e gerek yok

  // PDF'i flipbook sayfalarına çevir - SAYFA SAYFA VE LEGACY SİSTEM
  const processPdfForFlipbook = async () => {
    if (!magazine?.pdf_file || pdfProcessing) return;
    
    setPdfProcessing(true);
    setPdfProcessProgress(10);
    
    try {
      const url = magazine.pdf_file;
      
      // 🆕 YENİ SİSTEM: Metadata.json formatı (sayfa sayfa yüklenmiş)
      if (url.includes('metadata.json')) {
        setPdfProcessProgress(20);
        
        // Metadata'dan sayfa URL'lerini yükle
        const pageUrls = await loadMagazinePageUrls(magazine.issue_number, {
          owner: 'Nadirmermer',
          repo: 'baibu-pot-storage', 
          branch: 'main'
        });
        
        if (pageUrls.length > 0) {
          setTotalPdfPages(pageUrls.length);
          setPdfProcessProgress(50);
          
          // Tüm sayfaları direkt URL'ler olarak set et - ANINDA HAZIR!
          setFlipbookPages(pageUrls);
          setPdfProcessProgress(100);
          setPdfProcessing(false);
          
          console.log(`✅ Sayfa sayfa dergi yüklendi: ${pageUrls.length} sayfa (metadata sistemi)`);
          
        } else {
          throw new Error('Sayfa URL\'leri yüklenemedi');
        }
      }
      // 📄 LEGACY SİSTEM: Tek PDF dosyası (eski yöntem - basitleştirildi)
      else if (url.includes('raw.githubusercontent.com') && url.includes('.pdf')) {
        // Eski sistemde basit fallback - tek PDF olarak göster
        setFlipbookPages([url]);
        setTotalPdfPages(1);
        setPdfProcessProgress(100);
        setPdfProcessing(false);
        
        console.log('⚠️ Legacy PDF sistemi: Tek dosya olarak görüntülenecek');
        console.log('💡 Daha iyi deneyim için admin panelinden sayfa sayfa yükleyin');
      }
      // 🌐 DİREKT URL: Harici PDF linkler
      else {
        // Diğer URL'ler (direkt PDF)
        setFlipbookPages([url]);
        setPdfProcessProgress(100);
        setPdfProcessing(false);
      }
      
    } catch (error) {
      console.error('PDF yükleme hatası:', error);
      // Fallback sayfalar
      setFlipbookPages([
        magazine.cover_image || '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg',
        '/placeholder.svg'
      ]);
      setPdfProcessProgress(100);
      setPdfProcessing(false);
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
            // 🆕 Yeni sistemde preload gereksiz - tüm sayfalar zaten hazır!
            // Sadece analytics için sayfa tracking yapılıyor
            console.debug(`📖 Sayfa ${page + 1} görüntüleniyor`);
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

      {/* 📱 MOBİL ve 💻 DESKTOP OPTİMİZE LAYOUT */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Panel - Dergi Kapağı ve Ana Butonlar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Kapak Resmi - Tıklanabilir */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
              <div 
                className="relative cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
                onClick={async () => {
                  // 🎯 Kapağa tıklayınca direkt okuma başlar!
                  if (flipbookPages.length === 0 && !pdfProcessing) {
                    processPdfForFlipbook();
                  }
                  setIsReading(true);
                }}
                title="Dergiyi okumak için tıklayın"
              >
                  <img
                    src={magazine.cover_image || '/placeholder.svg'}
                    alt={magazine.title}
                  className="w-full h-auto rounded-lg shadow-lg"
                  />
                  {magazine.published && (
                  <Badge className="absolute top-3 right-3">
                      Yayında
                    </Badge>
                  )}
                {/* Hover efekti */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg flex items-center justify-center">
                  <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
              
              {/* 📱 Kapağın Altında Ana Butonlar */}
              <CardContent className="p-4 space-y-3">
                {/* Ana Okuma Butonu */}
                <Button 
                  onClick={async () => {
                    if (flipbookPages.length === 0 && !pdfProcessing) {
                      processPdfForFlipbook();
                    }
                    setIsReading(true);
                  }}
                  className="w-full text-lg py-3"
                  size="lg"
                  disabled={!magazine.pdf_file}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  {pdfProcessing ? '⏳ Hazırlanıyor...' : '📖 Flipbook Oku'}
                </Button>
                
                {/* İndirme Butonu */}
                {getDownloadUrl() && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    asChild
                  >
                    <a
                      href={getDownloadUrl()!}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF İndir
                    </a>
                  </Button>
                )}
                
                {!magazine.pdf_file && (
                  <p className="text-red-500 dark:text-red-400 text-sm text-center">
                    Bu dergi henüz yüklenmiyor
                  </p>
                )}
                
                {/* İpucu */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                    💡 <strong>Kapağa tıklayarak</strong> da okumaya başlayabilirsiniz
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sağ Panel - Dergi Bilgileri (2 sütun) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{magazine.title}</h1>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Badge variant="outline" className="text-lg px-3 py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  Sayı {magazine.issue_number}
                </Badge>
                <span className="text-gray-600 dark:text-gray-400">
                  {new Date(magazine.publication_date).toLocaleDateString('tr-TR')}
                </span>
                {magazine.theme && (
                  <Badge variant="secondary" className="text-sm px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                    🎨 {magazine.theme}
                  </Badge>
                )}
              </div>
              
              {magazine.description && (
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                  {magazine.description}
                </p>
              )}
            </div>

            {/* 🗑️ Ana okuma butonu sol panele taşındı */}

            {/* Contributors Bölümü - KOMPAKT GRİD */}
            {contributors.length > 0 && (
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-4 flex items-center">
                    👥 Bu Sayıda Katkıda Bulunanlar ({contributors.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contributors.map((contributor) => (
                      <div key={contributor.id} className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 border border-purple-200 dark:border-purple-700 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3 mb-2">
                          {contributor.profile_image ? (
                            <img 
                              src={contributor.profile_image} 
                              alt={contributor.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-purple-300 dark:border-purple-600"
                              onError={(e) => {
                                e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#a855f7"/><text x="24" y="32" text-anchor="middle" fill="white" font-family="Arial" font-size="18" font-weight="bold">${contributor.name.charAt(0).toUpperCase()}</text></svg>`)}`;
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 rounded-full flex items-center justify-center border-2 border-purple-300 dark:border-purple-600">
                              <span className="text-purple-700 dark:text-purple-300 font-bold text-lg">
                                {contributor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm text-purple-800 dark:text-purple-200 truncate">
                              {contributor.name}
                            </h5>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200 text-xs">
                              {contributor.role === 'editor' ? '✏️ Editör' :
                               contributor.role === 'author' ? '📝 Yazar' :
                               contributor.role === 'illustrator' ? '🎨 İllüstratör' :
                               contributor.role === 'designer' ? '🖌️ Tasarımcı' :
                               contributor.role === 'translator' ? '🌐 Çevirmen' : contributor.role}
                            </Badge>
                          </div>
                        </div>
                        
                        {contributor.bio && (
                          <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed mb-2">
                            {contributor.bio.length > 80 ? 
                              `${contributor.bio.substring(0, 80)}...` : 
                              contributor.bio}
                  </p>
                )}

                        {/* Sosyal Medya - Kompakt */}
                        {contributor.social_links && Object.keys(contributor.social_links as any).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(contributor.social_links as any).map(([platform, link]) => {
                              if (!link || link === '') return null;
                              
                              const socialConfig = {
                                linkedin: { icon: '💼', color: 'text-blue-600' },
                                twitter: { icon: '🐦', color: 'text-sky-600' },
                                instagram: { icon: '📷', color: 'text-pink-600' },
                                github: { icon: '💻', color: 'text-gray-700' },
                                email: { icon: '📧', color: 'text-green-600' },
                                website: { icon: '🌐', color: 'text-purple-600' }
                              };
                              
                              const config = socialConfig[platform as keyof typeof socialConfig] || 
                                { icon: '🔗', color: 'text-gray-600' };
                              
                              return (
                                <a
                                  key={platform}
                                  href={platform === 'email' ? `mailto:${link}` : link as string}
                                  target={platform !== 'email' ? '_blank' : undefined}
                                  rel={platform !== 'email' ? 'noopener noreferrer' : undefined}
                                  className={`text-lg hover:scale-110 transition-transform ${config.color}`}
                                  title={`${contributor.name} - ${platform}`}
                                >
                                  {config.icon}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sponsors Bölümü - KOMPAKT GRİD */}
            {magazineSponsors.length > 0 && (
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                    🏢 Bu Sayının Sponsorları ({magazineSponsors.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {magazineSponsors.map((magazineSponsor, index) => (
                      <div key={index} className="flex flex-col items-center gap-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:shadow-md transition-all duration-200 text-center">
                        {magazineSponsor.logo_url ? (
                          <img 
                            src={magazineSponsor.logo_url} 
                            alt={magazineSponsor.sponsor_name}
                            className="w-10 h-10 object-contain rounded border bg-white"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded border bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 font-bold text-sm">
                              {magazineSponsor.sponsor_name?.charAt(0).toUpperCase() || '🏢'}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0 w-full">
                          {magazineSponsor.website_url ? (
                            <a 
                              href={magazineSponsor.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-xs text-blue-900 dark:text-blue-100 hover:text-blue-700 dark:hover:text-blue-300 underline block truncate"
                              title={magazineSponsor.sponsor_name}
                            >
                              {magazineSponsor.sponsor_name || 'Sponsor'}
                            </a>
                          ) : (
                            <div className="font-medium text-xs text-blue-900 dark:text-blue-100 truncate" title={magazineSponsor.sponsor_name}>
                              {magazineSponsor.sponsor_name || 'Sponsor'}
                            </div>
                          )}
                          <div className="text-xs text-blue-700 dark:text-blue-300 mt-1 truncate">
                            {magazineSponsor.sponsorship_type || 'Sponsor'}
                          </div>
                  </div>
                  </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* 🗑️ Teknik butonlar sol panele taşındı */}


          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DergiDetay;
