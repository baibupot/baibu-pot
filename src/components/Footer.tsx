import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">PÖT</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">BAİBÜ PÖT</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Psikoloji Öğrencileri Topluluğu</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md">
              Bolu Abant İzzet Baysal Üniversitesi Psikoloji Öğrencileri Topluluğu olarak, 
              psikoloji alanında bilgi paylaşımı ve sosyal etkileşimi destekliyoruz.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
              >
                <Instagram className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
              >
                <Facebook className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Hızlı Linkler
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/haberler" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">
                  Haberler/Duyurular
                </Link>
              </li>
              <li>
                <Link to="/dergi" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">
                  Psikolojiİbu Dergi
                </Link>
              </li>
              <li>
                <Link to="/etkinlikler" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">
                  Etkinlikler
                </Link>
              </li>
              <li>
                <Link to="/ekipler" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">
                  Ekiplerimiz
                </Link>
              </li>
            </ul>
          </div>

          {/* Diğer Sayfalar */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Diğer Sayfalar
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/iletisim" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">
                  İletişim
                </Link>
              </li>
              <li>
                <Link to="/sss" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">
                  S.S.S.
                </Link>
              </li>
              <li>
                <Link to="/site-haritasi" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">
                  Site Haritası
                </Link>
              </li>
              <li>
                <Link to="/gizlilik-politikasi" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200">
                  Admin Girişi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            © 2024 BAİBÜ Psikoloji Öğrencileri Topluluğu. Tüm hakları saklıdır.
          </p>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">Tema:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="text-xs"
            >
              {theme === 'light' ? 'Karanlık' : 'Aydınlık'}
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
