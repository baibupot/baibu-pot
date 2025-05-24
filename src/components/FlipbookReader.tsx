
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize,
  Volume2,
  VolumeX
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Sayfa çevirme sesi - daha gerçekçi
  const playPageTurnSound = useCallback(() => {
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Daha gerçekçi kağıt sesi frekansları
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
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

  // Tam ekran modu otomatik olarak etkinleştir
  useEffect(() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
    
    return () => {
      if (document.exitFullscreen && isFullscreen) {
        document.exitFullscreen();
      }
    };
  }, []);

  // Klavye kontrolü
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          nextPage();
          break;
        case 'ArrowLeft':
          prevPage();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
          setZoom(prev => Math.min(prev + 0.2, 3));
          break;
        case '-':
          setZoom(prev => Math.max(prev - 0.2, 0.5));
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
      }, 300);
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
      }, 300);
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

  const handlePageClick = useCallback((e: React.MouseEvent, side: 'left' | 'right') => {
    e.preventDefault();
    if (side === 'right') {
      nextPage();
    } else {
      prevPage();
    }
  }, [nextPage, prevPage]);

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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex flex-col">
      {/* Minimal Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
          <span className="text-white text-sm font-medium">{title}</span>
        </div>

        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white hover:bg-white/20"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
            className="text-white hover:bg-white/20"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-white text-xs px-2">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
            className="text-white hover:bg-white/20"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Reading Area */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        style={{ 
          perspective: '1000px',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        <div className="relative flex items-center justify-center">
          {/* Book Container */}
          <div className="flex items-center gap-1 relative">
            {getVisiblePages().map((page, index) => {
              const pageIndex = currentPage + index;
              const pageType = getPageType(pageIndex);
              const isLeftPage = index === 0 && !isMobile;
              const isRightPage = index === 1 || (index === 0 && isMobile);
              
              return (
                <div
                  key={pageIndex}
                  className={`
                    relative bg-white transition-all duration-500 cursor-pointer
                    ${isMobile ? 'w-[85vw] max-w-sm' : 'w-[40vw] max-w-md'}
                    aspect-[3/4]
                    ${pageType === 'cover' 
                      ? 'shadow-2xl border-2 border-slate-300' 
                      : 'shadow-xl'
                    }
                    ${isFlipping && flipDirection === 'next' && isRightPage 
                      ? 'animate-[flipNext_0.3s_ease-in-out]' 
                      : ''
                    }
                    ${isFlipping && flipDirection === 'prev' && isLeftPage 
                      ? 'animate-[flipPrev_0.3s_ease-in-out]' 
                      : ''
                    }
                    hover:shadow-2xl transform-gpu
                  `}
                  onClick={(e) => handlePageClick(e, isRightPage ? 'right' : 'left')}
                  style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin: isRightPage ? 'left center' : 'right center'
                  }}
                >
                  {/* Page Corner Curl Effect */}
                  <div className={`
                    absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl 
                    ${pageType === 'cover' 
                      ? 'from-slate-200 to-transparent' 
                      : 'from-slate-100 to-transparent'
                    }
                    opacity-30 pointer-events-none
                  `} />
                  
                  <img
                    src={page}
                    alt={`Sayfa ${pageIndex + 1}`}
                    className="w-full h-full object-cover rounded-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                    draggable={false}
                  />
                  
                  {/* Page binding effect for non-cover pages */}
                  {pageType === 'regular' && isLeftPage && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-r from-transparent to-slate-300 opacity-40" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="text-white text-sm text-center">
            Sayfa {currentPage + 1}{!isMobile && pages[currentPage + 1] ? `-${currentPage + 2}` : ''} / {pages.length}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes flipNext {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(-90deg);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }
        
        @keyframes flipPrev {
          0% {
            transform: rotateY(-180deg);
          }
          50% {
            transform: rotateY(-90deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }
      `}</style>
    </div>
  );
};

export default FlipbookReader;
