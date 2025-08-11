import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="bg-gradient-to-br from-slate-50/80 via-white to-slate-100/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-t border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto container-mobile py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo ve Açıklama */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6 interactive-scale cursor-pointer" onClick={() => window.location.href = '/'}>
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="PÖT Logo" 
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold gradient-text-primary">BAİBÜ PÖT</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Psikoloji Öğrencileri Topluluğu</p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6 max-w-md leading-relaxed">
              Bolu Abant İzzet Baysal Üniversitesi Psikoloji Öğrencileri Topluluğu olarak, 
              psikoloji alanında bilgi paylaşımı ve sosyal etkileşimi destekliyoruz.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="https://www.instagram.com/baibupsikoloji"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg interactive-scale"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://facebook.com/aibu.pot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg interactive-scale"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://twitter.com/baibupsikoloji"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg interactive-scale"
                aria-label="X (Twitter)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4 text-white dark:text-black">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://tr.linkedin.com/in/baibupsikoloji"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg interactive-scale"
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4 text-white"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.034 0 3.595 1.997 3.595 4.59v5.606zm0 0"/></svg>
              </a>
              <a
                href="https://www.youtube.com/@BAİBÜPsikolojiTopluluğu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg interactive-scale"
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4 text-white"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.425 3.5 12 3.5 12 3.5s-7.425 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.147 0 12 0 12s0 3.853.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.575 20.5 12 20.5 12 20.5s7.425 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.853 24 12 24 12s0-3.853-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a
                href="https://open.spotify.com/user/chg73jv11emfnf66gt23hqm67"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg interactive-scale"
                aria-label="Spotify"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4 text-white"><path d="M12 0C5.371 0 0 5.371 0 12c0 6.627 5.371 12 12 12s12-5.373 12-12c0-6.629-5.371-12-12-12zm5.438 17.438c-.229.373-.708.49-1.08.26-2.953-1.807-6.675-2.213-11.06-1.209-.429.094-.859-.168-.953-.598-.094-.43.168-.859.598-.953 4.771-1.07 8.872-.617 12.174 1.318.373.229.49.708.261 1.082zm1.543-3.082c-.287.467-.893.617-1.359.33-3.381-2.08-8.547-2.684-12.547-1.463-.521.156-1.072-.137-1.229-.658-.156-.521.137-1.072.658-1.229 4.547-1.363 10.229-.707 14.047 1.684.467.287.617.893.33 1.336zm.146-3.146c-4.08-2.426-10.88-2.646-14.438-1.438-.635.199-1.318-.146-1.518-.781-.199-.635.146-1.318.781-1.518 4.08-1.281 11.453-1.027 16.02 1.646.573.344.76 1.094.416 1.668-.344.573-1.094.76-1.668.416z"/></svg>
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="h-1 w-4 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full"></div>
              📚 Hızlı Linkler
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/haberler" className="text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 flex items-center gap-2 group">
                  📰 Haberler & Duyurular
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              </li>
              <li>
                <Link to="/dergi" className="text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 flex items-center gap-2 group">
                  📖 Psikolojiİbu Dergi
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              </li>
              <li>
                <Link to="/etkinlikler" className="text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 flex items-center gap-2 group">
                  🎉 Etkinlikler
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              </li>
              <li>
                <Link to="/ekipler" className="text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 flex items-center gap-2 group">
                  👥 Ekiplerimiz
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Diğer Sayfalar */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="h-1 w-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              ⚙️ Diğer Sayfalar
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/iletisim" className="text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 flex items-center gap-2 group">
                  📞 İletişim
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              </li>
              <li>
                <Link to="/sss" className="text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 flex items-center gap-2 group">
                  ❓ S.S.S.
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 flex items-center gap-2 group">
                  🔐 Admin Girişi
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left">
              © 2025 <span className="font-bold gradient-text-primary">BAİBÜ PÖT</span> - Tüm hakları saklıdır.
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center sm:text-right">
              <span>Geliştirici: </span>
              <a 
                href="http://instagram.com/nadir.mermer/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors duration-200 font-semibold interactive-scale inline-flex items-center gap-1"
              >
                Nadir Mermer 
                <span className="text-red-500 animate-pulse">♥</span>
              </a>
            </div>
          </div>
          
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
