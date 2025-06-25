
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 🎯 Sistem temasını ve kaydedilen temayı kontrol et (flicker önleme)
const getInitialTheme = (): Theme => {
  // Önce localStorage'dan kontrol et
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('baibu-pot-theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Eğer kaydedilen tema yoksa sistem temasını kullan
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  
  return 'light'; // Fallback
};

// 🎯 HTML'e temayı hemen uygula (sayfa yüklenmeden önce)
const applyThemeToDocument = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 🎯 Hemen doğru tema ile başla (flicker yok)
  const [theme, setTheme] = useState<Theme>(() => {
    const initialTheme = getInitialTheme();
    applyThemeToDocument(initialTheme); // Hemen uygula
    return initialTheme;
  });

  // 🎯 Sistem tema değişikliğini dinle
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Sadece kaydedilen tema yoksa sistem temasını uygula
      const savedTheme = localStorage.getItem('baibu-pot-theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // 🎯 Tema değişikliğinde kaydet ve uygula
  useEffect(() => {
    applyThemeToDocument(theme);
    localStorage.setItem('baibu-pot-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
