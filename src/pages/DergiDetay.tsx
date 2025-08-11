import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import PageContainer from '../components/ui/page-container';
import LoadingPage from '../components/ui/loading-page';
import ErrorState from '../components/ui/error-state';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Download, BookOpen, Calendar, Users, Building2, ExternalLink } from 'lucide-react';
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
  const navigate = useNavigate();
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

  // Sponsor türü renklerini ve etiketlerini belirle
  const getSponsorTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'ana': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'destekci': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'medya': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'akademik': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getSponsorTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'ana': '🥇 Ana Sponsor',
      'destekci': '🤝 Destekçi',
      'medya': '📺 Medya Partneri',
      'akademik': '🎓 Akademik Partner'
    };
    return labels[type] || type;
  };
  
  useEffect(() => {
    const fetchSponsorsData = async () => {
      if (!magazine?.id) return;
      
      try {
        // Sponsors tablosuyla join yaparak sponsor bilgilerini al
        const { data: magazineSponsorData } = await supabase
          .from('magazine_sponsors')
          .select(`
            *,
            sponsors (
              id,
              name,
              logo,
              website,
              description,
              sponsor_type
            )
          `)
          .eq('magazine_issue_id', magazine.id)
          .order('sort_order', { ascending: true });
          
        // Sponsor bilgilerini düzenle
        const formattedSponsors = (magazineSponsorData || []).map((item: any) => ({
          id: item.id,
          sponsor_id: item.sponsor_id,
          sponsorship_type: item.sponsorship_type,
          sort_order: item.sort_order,
          sponsor_name: item.sponsors?.name || 'Bilinmeyen Sponsor',
          logo_url: item.sponsors?.logo || null,
          website_url: item.sponsors?.website || null,
          description: item.sponsors?.description || null,
          sponsor_type: item.sponsors?.sponsor_type || 'destekci'
        }));
          
        setMagazineSponsors(formattedSponsors);
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
        // Beacon API ile tracking (sync)
        const payload = JSON.stringify({
          magazine_issue_id: magazineId,
          reading_duration: duration,
          completed_reading: false,
          session_id: sessionId,
          device_type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
        });
        navigator.sendBeacon('/api/magazine-read', payload);
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
    if (!readingStartTime || !magazine?.id) {
      return;
    }
    
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
      // Sessizce hata yakala
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
          owner: import.meta.env.VITE_GITHUB_OWNER,
          repo: import.meta.env.VITE_GITHUB_REPO, 
          branch: import.meta.env.VITE_GITHUB_BRANCH
        });
        
        if (pageUrls.length > 0) {
          setTotalPdfPages(pageUrls.length);
          setPdfProcessProgress(50);
          
          // Tüm sayfaları direkt URL'ler olarak set et - ANINDA HAZIR!
          setFlipbookPages(pageUrls);
          setPdfProcessProgress(100);
          setPdfProcessing(false);
          

          
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
      <PageContainer background="gradient">
        <LoadingPage 
          title="Dergi Detayı Yükleniyor"
          message="Dergi içeriği hazırlanıyor..."
          icon={BookOpen}
        />
      </PageContainer>
    );
  }

  if (error || !magazine) {
    return (
      <PageContainer background="gradient">
        <ErrorState 
          title="Dergi Bulunamadı"
          message={error || 'Aradığınız dergi bulunamadı veya silinmiş olabilir.'}
          onRetry={() => navigate('/dergi')}
          variant="notfound"
        />
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
          }}
        />
      </div>
    );
  }

  return (
    <PageContainer background="gradient">
      {/* Mobile-First Header */}
      <div className="mb-6 sm:mb-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dergi')}
          className="mb-4 h-12 px-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 interactive-scale"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-medium">Dergi Listesine Dön</span>
        </Button>
      </div>

      {/* Modern Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Sol Panel - Dergi Kapağı ve Ana Butonlar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Kapak Resmi - Modern Interactive Card */}
            <Card variant="interactive" className="overflow-hidden animate-fade-in-up group">
              <div 
                className="relative cursor-pointer"
                onClick={async () => {
                  // 🎯 Kapağa tıklayınca direkt okuma başlar!
                  if (flipbookPages.length === 0 && !pdfProcessing) {
                    processPdfForFlipbook();
                  }
                  setIsReading(true);
                }}
                title="Dergiyi okumak için tıklayın"
              >
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img
                    src={magazine.cover_image || '/placeholder.svg'}
                    alt={magazine.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Status Badge */}
                  {magazine.published && (
                    <Badge className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg backdrop-blur-md border border-white/20">
                      ✅ Yayında
                    </Badge>
                  )}
                  
                  {/* Hover Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full p-4 shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <BookOpen className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Ana Okuma Butonu */}
                <Button 
                  onClick={async () => {
                    if (flipbookPages.length === 0 && !pdfProcessing) {
                      processPdfForFlipbook();
                    }
                    setIsReading(true);
                  }}
                  size="touch"
                  variant="gradient"
                  className="w-full font-bold shadow-xl hover:shadow-2xl"
                  disabled={!magazine.pdf_file}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  {pdfProcessing ? '⏳ Hazırlanıyor...' : '📖 Flipbook Oku'}
                </Button>
                
                {!magazine.pdf_file && (
                  <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800/50">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                      ⚠️ Bu dergi henüz yüklenemiyor
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sağ Panel - Dergi Bilgileri */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Magazine Info Card */}
            <Card variant="modern" className="animate-fade-in-up animation-delay-200">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text-primary mb-4 sm:mb-6 leading-tight">
                  {magazine.title}
                </h1>
                
                {/* Meta Information */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium px-4 py-2 w-fit">
                    📖 Sayı {magazine.issue_number}
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                      <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400">
                      📅 {new Date(magazine.publication_date).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {magazine.theme && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-3 py-1.5 w-fit">
                      🎨 {magazine.theme}
                    </Badge>
                  )}
                </div>
                
                {magazine.description && (
                  <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    {magazine.description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 🗑️ Ana okuma butonu sol panele taşındı */}

            {/* Contributors Section */}
            {contributors.length > 0 && (
              <Card variant="modern" className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-950/50 dark:to-indigo-950/50 border-purple-200/50 dark:border-purple-800/50 animate-fade-in-up animation-delay-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    👥 Bu Sayıda Katkıda Bulunanlar ({contributors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {contributors.map((contributor, index) => (
                      <Card key={contributor.id} variant="interactive" className="p-3 sm:p-4 animate-fade-in-up" style={{ animationDelay: `${300 + index * 100}ms` }}>
                        <div className="flex items-center gap-3 mb-3">
                          {contributor.profile_image ? (
                            <img 
                              src={contributor.profile_image} 
                              alt={contributor.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-purple-300 dark:border-purple-600 shadow-lg"
                              onError={(e) => {
                                e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#a855f7"/><text x="24" y="32" text-anchor="middle" fill="white" font-family="Arial" font-size="18" font-weight="bold">${contributor.name.charAt(0).toUpperCase()}</text></svg>`)}`;
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg sm:text-xl">
                                {contributor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm sm:text-base text-purple-800 dark:text-purple-200 truncate">
                              {contributor.name}
                            </h5>
                            <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-medium mt-1">
                              {contributor.role === 'editor' ? '✏️ Editör' :
                               contributor.role === 'author' ? '📝 Yazar' :
                               contributor.role === 'illustrator' ? '🎨 İllüstratör' :
                               contributor.role === 'designer' ? '🖌️ Tasarımcı' :
                               contributor.role === 'translator' ? '🌐 Çevirmen' : contributor.role}
                            </Badge>
                          </div>
                        </div>
                        
                        {contributor.bio && (
                          <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 leading-relaxed mb-3">
                            {contributor.bio.length > 80 ? 
                              `${contributor.bio.substring(0, 80)}...` : 
                              contributor.bio}
                          </p>
                        )}

                        {/* Social Links */}
                        {contributor.social_links && Object.keys(contributor.social_links as any).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(contributor.social_links as any).map(([platform, link]) => {
                              if (!link || link === '') return null;
                              
                              const socialConfig = {
                                linkedin: { icon: '💼', color: 'bg-blue-500 hover:bg-blue-600' },
                                twitter: { icon: '🐦', color: 'bg-sky-500 hover:bg-sky-600' },
                                instagram: { icon: '📷', color: 'bg-pink-500 hover:bg-pink-600' },
                                github: { icon: '💻', color: 'bg-gray-700 hover:bg-gray-800' },
                                email: { icon: '📧', color: 'bg-green-500 hover:bg-green-600' },
                                website: { icon: '🌐', color: 'bg-purple-500 hover:bg-purple-600' }
                              };
                              
                              const config = socialConfig[platform as keyof typeof socialConfig] || 
                                { icon: '🔗', color: 'bg-gray-500 hover:bg-gray-600' };
                              
                              return (
                                <a
                                  key={platform}
                                  href={platform === 'email' ? `mailto:${link}` : link as string}
                                  target={platform !== 'email' ? '_blank' : undefined}
                                  rel={platform !== 'email' ? 'noopener noreferrer' : undefined}
                                  className={`${config.color} text-white text-xs px-2 py-1 rounded-lg transition-all duration-200 interactive-scale flex items-center gap-1`}
                                  title={`${contributor.name} - ${platform}`}
                                >
                                  <span className="text-sm">{config.icon}</span>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sponsors Section */}
            {magazineSponsors.length > 0 && (
              <Card variant="modern" className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200/50 dark:border-blue-800/50 animate-fade-in-up animation-delay-400">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    🏢 Bu Sayının Sponsorları ({magazineSponsors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {magazineSponsors.map((magazineSponsor, index) => (
                      <Card key={index} variant="interactive" className="p-3 sm:p-4 group animate-fade-in-up" style={{ animationDelay: `${400 + index * 100}ms` }}>
                        <div className="flex items-center gap-3 mb-3">
                          {/* Logo */}
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-800 dark:to-cyan-800 rounded-2xl flex items-center justify-center p-2 relative overflow-hidden shadow-lg">
                            {magazineSponsor.logo_url ? (
                              <img 
                                src={magazineSponsor.logo_url} 
                                alt={magazineSponsor.sponsor_name}
                                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            ) : (
                              <span className="text-blue-600 dark:text-blue-300 font-bold text-xl">
                                {magazineSponsor.sponsor_name?.charAt(0).toUpperCase() || '🏢'}
                              </span>
                            )}
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300"></div>
                          </div>
                          
                          {/* Sponsor Info */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm sm:text-base text-blue-900 dark:text-blue-100 truncate mb-1">
                              {magazineSponsor.sponsor_name || 'Sponsor'}
                            </h5>
                            <Badge className={`${getSponsorTypeColor(magazineSponsor.sponsor_type)} text-xs font-medium`}>
                              {getSponsorTypeLabel(magazineSponsor.sponsor_type)}
                            </Badge>
                          </div>
                          
                          {/* Website Link */}
                          {magazineSponsor.website_url && (
                            <a 
                              href={magazineSponsor.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200 interactive-scale"
                              title="Web sitesini ziyaret et"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        
                        {/* Description */}
                        {magazineSponsor.description && (
                          <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                            {magazineSponsor.description.length > 100 ? 
                              `${magazineSponsor.description.substring(0, 100)}...` : 
                              magazineSponsor.description}
                          </p>
                        )}
                      </Card>
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
