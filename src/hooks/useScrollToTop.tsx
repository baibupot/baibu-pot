
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 🎯 Instant scroll for better UX (smooth causes delay issues)
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Anında scroll (smooth yerine)
      });
    };

    // 🎯 Hemen scroll yap (setTimeout gereksiz)
    scrollToTop();
  }, [pathname]);
};

export default useScrollToTop;
