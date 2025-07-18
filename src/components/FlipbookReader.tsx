import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import { trackSimplePageRead } from '@/utils/magazineTracking';

// Gerçekçi kağıt çevirme sesi (public klasörüne eklenmiş bir mp3 dosyası kullanılacak)
const PAGE_FLIP_SOUND = '/page-flip.mp3';

interface FlipbookReaderProps {
  pages: string[];
  title: string;
  magazineId: string;
  totalPages?: number;
  onClose: () => void;
  isLoading?: boolean;
  loadingProgress?: number;
  loadingText?: string;
  onPageChange?: (page: number) => void;
}

const FlipbookReader: React.FC<FlipbookReaderProps> = ({ pages, title, magazineId, totalPages = 0, onClose, isLoading = false, loadingProgress = 0, loadingText = 'Yükleniyor...', onPageChange }) => {
  const flipBookRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  // Dinamik oran için state
  const [aspect, setAspect] = useState(3 / 4); // varsayılan 3:4
  
  // Gizli tracking için state'ler - kullanıcı hiç görmeyecek
  const [pageStartTimes, setPageStartTimes] = useState<{ [pageNumber: number]: number }>({});
  const [viewedPages, setViewedPages] = useState<Set<number>>(new Set());
  // Kontrollerin görünürlüğü için state
  const [controlsVisible, setControlsVisible] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  // İlk sayfa görselinin oranını al
  useEffect(() => {
    if (pages && pages.length > 0) {
      const img = new window.Image();
      img.onload = function () {
        if (img.naturalWidth && img.naturalHeight) {
          setAspect(img.naturalWidth / img.naturalHeight);
      }
    };
      img.src = pages[0];
      }
  }, [pages]);

  // Sayfa çevirme sesini çal
  const playFlipSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  // Tam ekran fonksiyonu
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Sayfa değişiminde ses çal, callback çağır ve gizli tracking yap
  const onFlip = (e: any) => {
    const newPage = e.data;
    const prevPage = currentPage;
    const now = Date.now();
    
    // Kontrolleri göster çünkü etkileşim var
    setControlsVisible(true);
    setUserInteracted(true);
    
    // Önceki sayfanın okuma süresini hesapla ve kaydet (sessizce)
    if (pageStartTimes[prevPage]) {
      const readingDuration = now - pageStartTimes[prevPage];
      
      // En az 2 saniye bakılmışsa gerçek okuma sayılır
      if (readingDuration >= 2000) {
        // Gizlice veritabanına kaydet
        // console.log(`📊 Sayfa ${prevPage + 1} için okuma süresi: ${readingDuration}ms`);
        trackSimplePageRead(magazineId, prevPage + 1, readingDuration).catch((error) => {
          // Hata olursa sessizce geç ama loglama yap
          console.error(`❌ Sayfa ${prevPage + 1} okuma istatistiği kayıt hatası:`, error);
        });
        
        // Bu sayfayı gerçekten okumuş olarak işaretle
        setViewedPages(prev => new Set([...prev, prevPage]));
      }
    }
    
    // Yeni sayfa başlangıç zamanını kaydet
    setPageStartTimes(prev => ({ ...prev, [newPage]: now }));
    
    setCurrentPage(newPage);
    
    // Parent component'e sayfa değişimini bildir (lazy loading için)
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  // Sayfa çevirme animasyonu başlarken ses çal (onChangeState ile)
  const onChangeState = (e: any) => {
    if (e.data === 'flipping') {
      playFlipSound();
      // Çevirme sırasında kontrolleri göster
      setControlsVisible(true);
      setUserInteracted(true);
    }
  };

  // İlk sayfa tracking'i başlat
  useEffect(() => {
    if (pages.length > 0) {
      const now = Date.now();
      setPageStartTimes({ 0: now }); // İlk sayfa (sayfa 0) için başlangıç zamanı
    }
  }, [pages.length]);

  // Component unmount olurken son sayfa tracking'ini yap
  useEffect(() => {
    return () => {
      // Component kapanırken son sayfanın süresini kaydet
      if (pageStartTimes[currentPage]) {
        const readingDuration = Date.now() - pageStartTimes[currentPage];
        if (readingDuration >= 2000) {
          // console.log(`📊 Component kapanırken son sayfa (${currentPage + 1}) okuma süresi: ${readingDuration}ms`);
          trackSimplePageRead(magazineId, currentPage + 1, readingDuration).catch((error) => {
            console.error(`❌ Son sayfa okuma istatistiği kayıt hatası:`, error);
          });
          
          // Oturum özeti istatistiği (toplam) - opsiyonel
          const totalPages = [...viewedPages].length + 1; // Son sayfayı da ekle
          // console.log(`📚 Toplam okunan sayfa: ${totalPages}, toplam süre: ${readingDuration}ms`);
        }
      }
    };
  }, [magazineId, currentPage, pageStartTimes, viewedPages]);

  // Klavye ile çıkış
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Fare/dokunma hareketlerini dinle ve kontrolleri göster
  useEffect(() => {
    const showControls = () => {
      setControlsVisible(true);
      setUserInteracted(true);
    };

    // Kontrolleri belirli süre sonra otomatik gizle
    if (userInteracted) {
      const hideTimer = setTimeout(() => {
        setControlsVisible(false);
      }, 2500); // 2.5 saniye sonra gizle

      return () => clearTimeout(hideTimer);
    }

    const container = document.querySelector('.flipbook-container');
    if (container) {
      container.addEventListener('mousemove', showControls);
      container.addEventListener('touchstart', showControls);
      return () => {
        container.removeEventListener('mousemove', showControls);
        container.removeEventListener('touchstart', showControls);
      };
    }
  }, [userInteracted]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex flex-col overflow-hidden flipbook-container">
      {/* Üst bar - kontrollerle birlikte opacity değişir */}
      <div 
        className={`absolute top-0 left-0 right-0 z-20 px-2 pt-4 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-0 bg-black/80 backdrop-blur-md rounded-lg px-3 py-2 sm:p-4 border border-white/20 w-full text-xs sm:text-sm shadow-lg">
          {/* Sol taraf: Kapatma + Başlık */}
          <div className="flex items-center gap-2 max-w-full overflow-x-auto">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 transition-colors p-1">
            <X className="h-4 w-4" />
          </Button>
            <span className="text-white font-medium truncate max-w-[40vw] sm:max-w-48 px-2">{title}</span>
        </div>
          {/* Sağ taraf: Ses + Tam Ekran */}
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)} className="text-white hover:bg-white/20 transition-colors p-1" title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}>
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20 transition-colors p-1" title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="text-2xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">{loadingText}</h3>
              <div className="w-full bg-gray-200/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(30, loadingProgress)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-300">
                {loadingProgress}% tamamlandı
              </p>
              <p className="text-xs text-gray-400 mt-2">
                İlk yükleme biraz zaman alabilir...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Flipbook Alanı */}
      <style>{`
        .page-corner {
          width: 64px !important;
          height: 64px !important;
        }
        
        /* Sayfa resimlerinde koruma */
        .protected-image {
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          pointer-events: none;
        }
        
        /* Sayfa içeriği için koruma, ancak sayfa çevirmeye izin ver */
        .page-content {
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          position: relative;
        }
        
        /* Sayfa tıklamaları için görünmez katman */
        .page-interaction-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10;
          cursor: pointer;
        }
        
        /* 850px'den itibaren yan boşluklar başlasın */
        @media (min-width: 850px) {
          .flipbook-container {
            padding-left: 2%;
            padding-right: 2%;
          }
        }
        
        @media (min-width: 900px) {
          .flipbook-container {
            padding-left: 3%;
            padding-right: 3%;
          }
        }
        
        @media (min-width: 950px) {
          .flipbook-container {
            padding-left: 4%;
            padding-right: 4%;
          }
        }
        
        @media (min-width: 1000px) {
          .flipbook-container {
            padding-left: 5%;
            padding-right: 5%;
          }
        }
        
        @media (min-width: 1200px) {
          .flipbook-container {
            padding-left: 8%;
            padding-right: 8%;
          }
        }
        
        @media (min-width: 1400px) {
          .flipbook-container {
            padding-left: 12%;
            padding-right: 12%;
          }
        }
        
        @media (min-width: 1600px) {
          .flipbook-container {
            padding-left: 15%;
            padding-right: 15%;
          }
        }
      `}</style>
      <div className="flex-1 flex items-center justify-center overflow-hidden relative py-10 sm:py-16 md:py-24 flipbook-container"
        onContextMenu={(e) => {
          // Sağ tık menüsünü engelle (tüm flipbook container'ında)
          e.preventDefault();
          return false;
        }}
      >
        {pages.length > 0 && pages.some(page => page !== '/placeholder.svg') ? (
          <HTMLFlipBook
            width={(() => {
              // Ekran genişliğine göre farklı boyutlar uygula
              const screenWidth = window.innerWidth;
              
              // Ekran boyutuna göre oranlar (ekran büyüdükçe dergi küçülür)
              let screenRatio = 0.67; // Varsayılan %67 oran
              
              // Ekran genişliğine göre oran ayarla
              if (screenWidth < 768) {
                screenRatio = 0.8; // Mobil için daha büyük
              } else if (screenWidth >= 768 && screenWidth < 850) {
                screenRatio = 0.7; // Tablet için orta
              } else if (screenWidth >= 850 && screenWidth < 900) {
                screenRatio = 0.68; // Geçiş başlangıcı
              } else if (screenWidth >= 900 && screenWidth < 950) {
                screenRatio = 0.66; // Geçiş ortası
              } else if (screenWidth >= 950 && screenWidth < 1000) {
                screenRatio = 0.65; // Geçiş sonu
              } else if (screenWidth >= 1000 && screenWidth < 1200) {
                screenRatio = 0.63; // Küçük masaüstü
              } else if (screenWidth >= 1200 && screenWidth < 1400) {
                screenRatio = 0.6; // Orta masaüstü
              } else if (screenWidth >= 1400) {
                screenRatio = 0.55; // Geniş ekranlar
              }
              
              // Maksimum genişlik kontrolü
              let maxWidthLimit;
              if (screenWidth < 768) {
                maxWidthLimit = 500; // Mobil
              } else if (screenWidth >= 768 && screenWidth < 1000) {
                maxWidthLimit = 650; // Tablet
              } else if (screenWidth >= 1000 && screenWidth < 1200) {
                maxWidthLimit = 700; // Küçük masaüstü
              } else if (screenWidth >= 1200 && screenWidth < 1400) {
                maxWidthLimit = 750; // Orta masaüstü
              } else {
                maxWidthLimit = 800; // Geniş ekranlar
              }
              
              const maxW = Math.min(screenWidth * screenRatio, maxWidthLimit);
              const maxH = Math.min(window.innerHeight * 0.7, 1000);
              
              const wByH = maxH * aspect;
              if (wByH > maxW) return Math.round(maxW);
              return Math.round(wByH);
            })()}
            height={(() => {
              // Ekran genişliğine göre farklı boyutlar uygula
              const screenWidth = window.innerWidth;
              
              // Ekran boyutuna göre oranlar (ekran büyüdükçe dergi küçülür)
              let screenRatio = 0.67; // Varsayılan %67 oran
              
              // Ekran genişliğine göre oran ayarla
              if (screenWidth < 768) {
                screenRatio = 0.8; // Mobil için daha büyük
              } else if (screenWidth >= 768 && screenWidth < 850) {
                screenRatio = 0.7; // Tablet için orta
              } else if (screenWidth >= 850 && screenWidth < 900) {
                screenRatio = 0.68; // Geçiş başlangıcı
              } else if (screenWidth >= 900 && screenWidth < 950) {
                screenRatio = 0.66; // Geçiş ortası
              } else if (screenWidth >= 950 && screenWidth < 1000) {
                screenRatio = 0.65; // Geçiş sonu
              } else if (screenWidth >= 1000 && screenWidth < 1200) {
                screenRatio = 0.63; // Küçük masaüstü
              } else if (screenWidth >= 1200 && screenWidth < 1400) {
                screenRatio = 0.6; // Orta masaüstü
              } else if (screenWidth >= 1400) {
                screenRatio = 0.55; // Geniş ekranlar
              }
              
              // Maksimum genişlik kontrolü
              let maxWidthLimit;
              let maxHeightLimit;
              if (screenWidth < 768) {
                maxWidthLimit = 500; // Mobil
                maxHeightLimit = 700;
              } else if (screenWidth >= 768 && screenWidth < 1000) {
                maxWidthLimit = 650; // Tablet
                maxHeightLimit = 800;
              } else if (screenWidth >= 1000 && screenWidth < 1200) {
                maxWidthLimit = 700; // Küçük masaüstü
                maxHeightLimit = 850;
              } else if (screenWidth >= 1200 && screenWidth < 1400) {
                maxWidthLimit = 750; // Orta masaüstü
                maxHeightLimit = 900;
              } else {
                maxWidthLimit = 800; // Geniş ekranlar
                maxHeightLimit = 950;
              }
              
              const maxW = Math.min(screenWidth * screenRatio, maxWidthLimit);
              const maxH = Math.min(window.innerHeight * 0.7, maxHeightLimit);
              
              const hByW = maxW / aspect;
              if (hByW > maxH) return Math.round(maxH);
              return Math.round(hByW);
            })()}
            size="stretch"
            minWidth={280}
            maxWidth={800}
            minHeight={400}
            maxHeight={1000}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onFlip}
            onChangeState={onChangeState}
            ref={flipBookRef}
            className="shadow-2xl rounded-lg bg-background"
            style={{ margin: '0 auto' }}
            startPage={currentPage}
            drawShadow={true}
            flippingTime={700}
            usePortrait={true}
            disableFlipByClick={false}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            startZIndex={1}
            autoSize={true}
          >
            {pages.map((page, idx) => (
              <div key={idx} className="w-full h-full flex items-center justify-center bg-background overflow-hidden">
                {page === '/placeholder.svg' ? (
                  // Placeholder için güzel loading state
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500">
                    <div className="animate-pulse">
                      <div className="text-4xl mb-4">📄</div>
                      <div className="text-sm font-medium">Sayfa {idx + 1}</div>
                      <div className="text-xs mt-1">Yükleniyor...</div>
                    </div>
                  </div>
                ) : (
                  <div className="page-content w-full h-full flex items-center justify-center">
                    {/* Sayfa etkileşimi için görünmez katman (sayfa çevirme için) */}
                    <div className="page-interaction-layer"></div>
                  <img
                    src={page.includes('drive.google.com') ? 
                      `https://images.weserv.nl/?url=${encodeURIComponent(page)}` : 
                      page
                    }
                    alt={`Sayfa ${idx + 1}`}
                      className="object-contain w-full h-full protected-image"
                    draggable={false}
                      onContextMenu={(e) => {
                        e.preventDefault(); 
                        return false;
                      }}
                      onDragStart={(e) => {
                        e.preventDefault();
                        return false;
                      }}
                    onError={e => { 
                      console.log('❌ Resim yüklenemedi:', page);
                      (e.target as HTMLImageElement).src = '/placeholder.svg'; 
                    }}
                  />
                  </div>
                )}
              </div>
            ))}
          </HTMLFlipBook>
        ) : (
          // PDF henüz hiç yüklenmemişse büyük loading ekranı göster
          <div className="text-center text-white max-w-md">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
              <div className="text-6xl mb-4 animate-pulse">📖</div>
              <h3 className="text-xl font-semibold mb-2">Dergi Hazırlanıyor</h3>
              <p className="text-gray-300 mb-4">
                PDF sayfa sayfa işleniyor, birazdan okumaya başlayabilirsiniz...
              </p>
              <div className="w-full bg-gray-200/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: '30%' }}
                ></div>
              </div>
            </div>
          </div>
        )}
        {/* Ses efekti için audio elementi */}
        <audio ref={audioRef} src={PAGE_FLIP_SOUND} preload="auto" />
      </div>

      {/* Alt bilgi ve slider */}
      {pages.length > 0 && (
        <div 
          className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 w-auto px-2 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="bg-black/80 backdrop-blur-md rounded-lg px-3 py-3 border border-white/20 flex flex-col items-center text-xs sm:text-sm min-w-[120px] w-full shadow-lg">
            <div className="text-white font-medium mb-1 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <span>
                Sayfa {currentPage + 1} / {pages.length}
              </span>
            </div>
            <div className="flex flex-col items-center w-full">
              <input
                type="range"
                min={1}
                max={pages.length}
                value={currentPage + 1}
                onChange={e => {
                  const pageNum = Number(e.target.value) - 1;
                  setCurrentPage(pageNum);
                  // flip fonksiyonunu doğru şekilde çağır
                  flipBookRef.current?.pageFlip()?.flip(pageNum);
                  // Kullanıcı etkileşimi var, kontrolleri göster
                  setControlsVisible(true);
                  setUserInteracted(true);
                }}
                className="w-40 sm:w-64 h-2 rounded-lg appearance-none bg-gradient-to-r from-cyan-400 to-teal-400 outline-none transition-all duration-200 shadow-md border border-cyan-500 focus:ring-2 focus:ring-cyan-400"
                style={{ minWidth: 100, maxWidth: 320 }}
              />
              <div className="flex justify-between w-full mt-1 px-1 text-[10px] text-cyan-200 font-mono">
                <span>1</span>
                <span>{pages.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlipbookReader;
