
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
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

  // Ses efekti için
  const playPageTurnSound = useCallback(() => {
    if (soundEnabled) {
      // Basit bir sayfa çevirme sesi simülasyonu
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
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

  const nextPage = () => {
    if (currentPage < pages.length - (isMobile ? 1 : 2)) {
      setCurrentPage(prev => prev + (isMobile ? 1 : 2));
      playPageTurnSound();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - (isMobile ? 1 : 2));
      playPageTurnSound();
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const getVisiblePages = () => {
    if (isMobile) {
      return [pages[currentPage]].filter(Boolean);
    } else {
      return [pages[currentPage], pages[currentPage + 1]].filter(Boolean);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header Controls */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-white hover:bg-slate-700"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
            className="text-white hover:bg-slate-700"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
            className="text-white hover:bg-slate-700"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-slate-700"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Reader Area */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden">
        <div className="relative flex items-center justify-center h-full">
          {/* Previous Page Button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={prevPage}
            disabled={currentPage === 0}
            className="absolute left-4 z-10 bg-black/50 text-white hover:bg-black/70 disabled:opacity-30"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          {/* Pages Container */}
          <div 
            className="flex items-center justify-center gap-2 h-full transition-transform duration-300"
            style={{ transform: `scale(${zoom})` }}
          >
            {getVisiblePages().map((page, index) => (
              <div
                key={currentPage + index}
                className={`
                  bg-white shadow-2xl transition-all duration-500 transform
                  ${isMobile ? 'w-[90vw] max-w-md' : 'w-[40vw] max-w-lg'}
                  aspect-[3/4] hover:shadow-3xl
                `}
                style={{
                  animation: 'fadeIn 0.5s ease-in-out'
                }}
              >
                <img
                  src={page}
                  alt={`Sayfa ${currentPage + index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
            ))}
          </div>

          {/* Next Page Button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={nextPage}
            disabled={currentPage >= pages.length - (isMobile ? 1 : 2)}
            className="absolute right-4 z-10 bg-black/50 text-white hover:bg-black/70 disabled:opacity-30"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="text-sm">
          Sayfa {currentPage + 1}{!isMobile && pages[currentPage + 1] ? `-${currentPage + 2}` : ''} / {pages.length}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">
            Navigasyon: ← → | Zoom: + - | Çıkış: ESC
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FlipbookReader;
