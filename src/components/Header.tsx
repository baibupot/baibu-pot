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
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto container-mobile">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink-0 interactive-scale">
            <div className="relative">
              <img 
                src="/logo.webp" 
                alt="PÖT Logo" 
                className="w-9 h-9 sm:w-11 sm:h-11 object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold gradient-text-primary truncate">BAİBÜ PÖT</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block leading-tight">Psikoloji Öğrencileri Topluluğu</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200 whitespace-nowrap flex items-center gap-2 backdrop-blur-sm border border-transparent hover:border-cyan-200 dark:hover:border-cyan-800"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            <div className="relative group">
              <button className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200 flex items-center gap-2 backdrop-blur-sm border border-transparent hover:border-cyan-200 dark:hover:border-cyan-800">
                <Users className="h-4 w-4" />
                Daha Fazla
              </button>
              <div className="absolute top-full left-0 mt-2 w-52 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 animate-fade-in-scale">
                <div className="p-2">
                  {moreItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 hover:text-cyan-700 dark:hover:text-cyan-300 rounded-xl transition-all duration-200 flex items-center gap-3"
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl h-10 w-10 sm:h-11 sm:w-11 hover:bg-white/50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
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
              className="lg:hidden rounded-xl h-11 w-11 sm:h-12 sm:w-12 hover:bg-white/50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 active:scale-95 transition-all duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/50 dark:border-slate-700/50 py-4 animate-fade-in-up">
            <div className="space-y-2">
              {[...navigationItems, ...moreItems].map((item, index) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200 flex items-center gap-3 border border-transparent hover:border-cyan-200 dark:hover:border-cyan-800 btn-touch"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ animationDelay: `${index * 50}ms` }}
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
