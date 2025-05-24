
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';

interface FlipbookReaderProps {
  pages: string[];
  title: string;
  onClose: () => void;
}

const FlipbookReader: React.FC<FlipbookReaderProps> = ({ pages, title, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Gelişmiş sayfa çevirme sesi
  const playPageTurnSound = useCallback(() => {
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Kağıt hışırtısı için daha karmaşık ses
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode1 = audioContext.createGain();
      const gainNode2 = audioContext.createGain();
      const masterGain = audioContext.createGain();
      
      oscillator1.connect(gainNode1);
      oscillator2.connect(gainNode2);
      gainNode1.connect(masterGain);
      gainNode2.connect(masterGain);
      masterGain.connect(audioContext.destination);
      
      // Kağıt hışırtısı frekansları
      oscillator1.frequency.setValueAtTime(180, audioContext.currentTime);
      oscillator1.frequency.exponentialRampToValueAtTime(60, audioContext.currentTime + 0.15);
      
      oscillator2.frequency.setValueAtTime(320, audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.2);
      
      // Gain animasyonları
      gainNode1.gain.setValueAtTime(0.08, audioContext.currentTime);
      gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      gainNode2.gain.setValueAtTime(0.06, audioContext.currentTime + 0.05);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      masterGain.gain.setValueAtTime(0.3, audioContext.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      
      oscillator1.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.15);
      
      oscillator2.start(audioContext.currentTime + 0.05);
      oscillator2.stop(audioContext.currentTime + 0.2);
    }
  }, [soundEnabled]);

  // Ekran boyutunu kontrol et
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Son okunan sayfayı localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem(`magazine-${title}-page`, currentPage.toString());
  }, [currentPage, title]);

  // Sayfa açıldığında son okunan sayfayı yükle
  useEffect(() => {
    const savedPage = localStorage.getItem(`magazine-${title}-page`);
    if (savedPage) {
      setCurrentPage(parseInt(savedPage, 10));
    }
  }, [title]);

  // Tam ekran modunu otomatik etkinleştir
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        console.log('Fullscreen not supported or denied');
      }
    };
    
    enterFullscreen();
    
    return () => {
      if (document.exitFullscreen && isFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Kontrolleri gizleme/gösterme
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => {
      resetControlsTimeout();
    };

    window.addEventListener('mousemove', handleMouseMove);
    resetControlsTimeout();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Klavye kontrolü
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextPage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevPage();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoom(prev => Math.min(prev + 0.25, 4));
          break;
        case '-':
          e.preventDefault();
          setZoom(prev => Math.max(prev - 0.25, 0.5));
          break;
        case '0':
          e.preventDefault();
          setZoom(1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, pages.length]);

  const nextPage = useCallback(() => {
    if (currentPage < pages.length - (isMobile ? 1 : 2) && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('next');
      playPageTurnSound();
      
      setTimeout(() => {
        setCurrentPage(prev => prev + (isMobile ? 1 : 2));
        setIsFlipping(false);
        setFlipDirection(null);
      }, 600);
    }
  }, [currentPage, pages.length, isMobile, isFlipping, playPageTurnSound]);

  const prevPage = useCallback(() => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('prev');
      playPageTurnSound();
      
      setTimeout(() => {
        setCurrentPage(prev => prev - (isMobile ? 1 : 2));
        setIsFlipping(false);
        setFlipDirection(null);
      }, 600);
    }
  }, [currentPage, isFlipping, isMobile, playPageTurnSound]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Gelişmiş sayfa çevirme - köşeden çevirme desteği
  const handlePageInteraction = useCallback((e: React.MouseEvent, side: 'left' | 'right') => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Sağ üst köşe veya sol üst köşe kontrolü
    const isCornerClick = (side === 'right' && x > rect.width * 0.8 && y < rect.height * 0.3) ||
                         (side === 'left' && x < rect.width * 0.2 && y < rect.height * 0.3);
    
    if (isCornerClick || !isDragging) {
      if (side === 'right') {
        nextPage();
      } else {
        prevPage();
      }
    }
  }, [nextPage, prevPage, isDragging]);

  // Sürükle-bırak sayfa çevirme
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStart.x !== 0) {
      const deltaX = Math.abs(e.clientX - dragStart.x);
      const deltaY = Math.abs(e.clientY - dragStart.y);
      
      if (deltaX > 10 || deltaY > 10) {
        setIsDragging(true);
      }
    }
  }, [dragStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          prevPage();
        } else {
          nextPage();
        }
      }
    }
    
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });
  }, [isDragging, dragStart, nextPage, prevPage]);

  const getVisiblePages = () => {
    if (isMobile) {
      return [pages[currentPage]].filter(Boolean);
    } else {
      return [pages[currentPage], pages[currentPage + 1]].filter(Boolean);
    }
  };

  const getPageType = (pageIndex: number) => {
    return pageIndex === 0 ? 'cover' : 'regular';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex flex-col overflow-hidden">
      {/* Kontroller - sadece mouse hareket ettiğinde görünür */}
      <div className={`absolute top-4 left-4 right-4 z-20 flex items-center justify-between transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-white/20 mx-1" />
          <span className="text-white text-sm font-medium truncate max-w-48">{title}</span>
        </div>

        <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white hover:bg-white/20 transition-colors"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
          <div className="h-4 w-px bg-white/20 mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
            className="text-white hover:bg-white/20 transition-colors"
            title="Uzaklaştır"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-white text-xs px-2 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(prev => Math.min(prev + 0.25, 4))}
            className="text-white hover:bg-white/20 transition-colors"
            title="Yakınlaştır"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(1)}
            className="text-white hover:bg-white/20 transition-colors"
            title="Sıfırla"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <div className="h-4 w-px bg-white/20 mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20 transition-colors"
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Ana Okuma Alanı */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative cursor-grab active:cursor-grabbing"
        style={{ 
          perspective: '2000px',
          transformOrigin: 'center center'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div 
          className="flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ 
            transform: `scale(${zoom})`,
          }}
        >
          {/* Kitap Container */}
          <div className="flex items-center gap-0 relative drop-shadow-2xl">
            {getVisiblePages().map((page, index) => {
              const pageIndex = currentPage + index;
              const pageType = getPageType(pageIndex);
              const isLeftPage = index === 0 && !isMobile;
              const isRightPage = index === 1 || (index === 0 && isMobile);
              
              return (
                <div
                  key={pageIndex}
                  className={`
                    relative transition-all duration-600 ease-in-out cursor-pointer select-none
                    ${isMobile ? 'w-[85vw] max-w-sm' : 'w-[35vw] max-w-lg'}
                    aspect-[3/4]
                    ${pageType === 'cover' 
                      ? 'bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-slate-400 shadow-2xl' 
                      : 'bg-white border border-slate-200 shadow-xl'
                    }
                    ${isFlipping && flipDirection === 'next' && isRightPage 
                      ? 'animate-[flipPageNext_0.6s_ease-in-out]' 
                      : ''
                    }
                    ${isFlipping && flipDirection === 'prev' && isLeftPage 
                      ? 'animate-[flipPagePrev_0.6s_ease-in-out]' 
                      : ''
                    }
                    hover:shadow-3xl transform-gpu rounded-sm
                  `}
                  onClick={(e) => handlePageInteraction(e, isRightPage ? 'right' : 'left')}
                  style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin: isRightPage ? 'left center' : 'right center'
                  }}
                >
                  {/* Sayfa Köşe Kıvrımı - Daha Gerçekçi */}
                  <div className={`
                    absolute top-0 right-0 w-12 h-12 
                    ${pageType === 'cover' 
                      ? 'bg-gradient-to-bl from-slate-300/60 via-slate-200/40 to-transparent' 
                      : 'bg-gradient-to-bl from-slate-200/50 via-slate-100/30 to-transparent'
                    }
                    opacity-60 pointer-events-none transform rotate-0 rounded-bl-lg
                    shadow-inner
                  `} />
                  
                  {/* Ana Sayfa Görseli */}
                  <img
                    src={page}
                    alt={`Sayfa ${pageIndex + 1}`}
                    className="w-full h-full object-cover rounded-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                    draggable={false}
                    style={{ 
                      filter: pageType === 'cover' ? 'contrast(1.1) saturate(1.1)' : 'none'
                    }}
                  />
                  
                  {/* Sayfa Cilt Efekti */}
                  {pageType === 'regular' && isLeftPage && (
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent via-slate-300/30 to-slate-400/50 opacity-50" />
                  )}
                  
                  {/* Interaktif Köşe Alanları */}
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-0 hover:opacity-20 bg-cyan-500 transition-opacity duration-200 rounded-bl-2xl pointer-events-auto" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alt Bilgi */}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-black/70 backdrop-blur-md rounded-xl px-6 py-3 border border-white/10">
          <div className="text-white text-sm text-center font-medium">
            Sayfa {currentPage + 1}{!isMobile && pages[currentPage + 1] ? `-${currentPage + 2}` : ''} / {pages.length}
          </div>
          <div className="text-white/60 text-xs text-center mt-1">
            Boşluk: İleri • ←→: Sayfa çevir • Esc: Çık • +/- : Zoom
          </div>
        </div>
      </div>

      {/* Gelişmiş CSS Animasyonları */}
      <style>{`
        @keyframes flipPageNext {
          0% {
            transform: perspective(2000px) rotateY(0deg);
            z-index: 10;
          }
          25% {
            transform: perspective(2000px) rotateY(-25deg);
            z-index: 10;
          }
          50% {
            transform: perspective(2000px) rotateY(-90deg);
            z-index: 10;
          }
          75% {
            transform: perspective(2000px) rotateY(-155deg);
            z-index: 10;
          }
          100% {
            transform: perspective(2000px) rotateY(-180deg);
            z-index: 1;
          }
        }
        
        @keyframes flipPagePrev {
          0% {
            transform: perspective(2000px) rotateY(-180deg);
            z-index: 1;
          }
          25% {
            transform: perspective(2000px) rotateY(-155deg);
            z-index: 10;
          }
          50% {
            transform: perspective(2000px) rotateY(-90deg);
            z-index: 10;
          }
          75% {
            transform: perspective(2000px) rotateY(-25deg);
            z-index: 10;
          }
          100% {
            transform: perspective(2000px) rotateY(0deg);
            z-index: 10;
          }
        }
      `}</style>
    </div>
  );
};

export default FlipbookReader;
