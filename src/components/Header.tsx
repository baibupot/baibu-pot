
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navigationItems = [
    { name: 'Anasayfa', href: '/' },
    { name: 'Haberler/Duyurular', href: '/haberler' },
    { name: 'Dergi', href: '/dergi' },
    { name: 'Etkinlikler', href: '/etkinlikler' },
    { name: 'Anketler', href: '/anketler' },
    { name: 'Sponsorlar', href: '/sponsorlar' },
  ];

  const moreItems = [
    { name: 'Ekipler', href: '/ekipler' },
    { name: 'Ürünler', href: '/urunler' },
    { name: 'Akademik Belgeler', href: '/akademik-belgeler' },
    { name: 'Stajlar', href: '/stajlar' },
    { name: 'İletişim', href: '/iletisim' },
  ];

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 min-w-0 flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="PÖT Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <div className="hidden xs:block min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate">BAİBÜ PÖT</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">Bolu Abant İzzet Baysal Psikoloji Öğrencileri Topluluğu</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="px-2 xl:px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-200 whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}
            <div className="relative group">
              <button className="px-2 xl:px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-200">
                Daha Fazla
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {moreItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-md last:rounded-b-md"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Search */}
            <div className="flex items-center">
              {isSearchOpen ? (
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Site içinde ara..."
                    className="w-32 sm:w-48 h-8 sm:h-9 text-sm"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-1 sm:p-2"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden sm:flex p-2"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-1 sm:p-2"
            >
              {theme === 'light' ? (
                <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1 sm:p-2"
            >
              {isMenuOpen ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 py-4">
            <div className="space-y-1">
              {[...navigationItems, ...moreItems].map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 sm:hidden">
              <div className="flex items-center space-x-2 px-3">
                <Search className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Site içinde ara..."
                  className="flex-1 h-9"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
