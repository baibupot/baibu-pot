import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Home, FileText, BookOpen, Calendar, ClipboardList, Building2, Users, Package, GraduationCap, Briefcase, Mail } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Ana navigasyon - en popüler sayfalar
  const navigationItems = [
    { name: 'Anasayfa', href: '/', icon: <Home className="h-4 w-4" /> },
    { name: 'Haberler', href: '/haberler', icon: <FileText className="h-4 w-4" /> },
    { name: 'Etkinlikler', href: '/etkinlikler', icon: <Calendar className="h-4 w-4" /> },
    { name: 'Dergi', href: '/dergi', icon: <BookOpen className="h-4 w-4" /> },
    { name: 'Anketler', href: '/anketler', icon: <ClipboardList className="h-4 w-4" /> },
    { name: 'Sponsorlar', href: '/sponsorlar', icon: <Building2 className="h-4 w-4" /> },
  ];

  // Daha az popüler sayfalar
  const moreItems = [
    { name: 'Ekipler', href: '/ekipler', icon: <Users className="h-4 w-4" /> },
    { name: 'Ürünler', href: '/urunler', icon: <Package className="h-4 w-4" /> },
    { name: 'Akademik Belgeler', href: '/akademik-belgeler', icon: <GraduationCap className="h-4 w-4" /> },
    { name: 'Stajlar', href: '/stajlar', icon: <Briefcase className="h-4 w-4" /> },
    { name: 'İletişim', href: '/iletisim', icon: <Mail className="h-4 w-4" /> },
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
            <div className="min-w-0">
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
                className="px-2 xl:px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-200 whitespace-nowrap flex items-center gap-2"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            <div className="relative group">
              <button className="px-2 xl:px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-200 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Daha Fazla
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {moreItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 first:rounded-t-md last:rounded-b-md flex items-center gap-3"
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 sm:p-3"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 sm:p-4"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
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
                  className="block px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-200 flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>

          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
