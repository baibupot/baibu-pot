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
              <img 
                src="/logo.png" 
                alt="PÖT Logo" 
                className="w-12 h-12 object-contain"
              />
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
                href="https://www.instagram.com/baibupsikoloji"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </a>
              <a
                href="https://facebook.com/aibu.pot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </a>
              <a
                href="https://twitter.com/baibupsikoloji"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-slate-600 dark:text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.29 20c7.547 0 11.675-6.155 11.675-11.495 0-.175 0-.349-.012-.522A8.18 8.18 0 0022 5.92a8.19 8.19 0 01-2.357.637A4.077 4.077 0 0021.448 4.1a8.224 8.224 0 01-2.605.981A4.107 4.107 0 0016.616 3c-2.266 0-4.104 1.822-4.104 4.07 0 .32.036.634.106.934C8.728 7.87 5.8 6.13 3.671 3.149a4.025 4.025 0 00-.555 2.048c0 1.413.725 2.662 1.825 3.393A4.093 4.093 0 012.8 7.15v.051c0 1.974 1.417 3.627 3.292 4.004a4.1 4.1 0 01-1.853.07c.522 1.613 2.037 2.788 3.833 2.82A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://tr.linkedin.com/in/baibupsikoloji?trk=public_post_feed-actor-name"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-slate-600 dark:text-slate-400"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.968v5.699h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.034 0 3.595 1.997 3.595 4.59v5.606zm0 0"/></svg>
              </a>
              <a
                href="https://www.youtube.com/channel/UCq_LNuabFO9CWm7dHFPxSHQ"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-slate-600 dark:text-slate-400"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.425 3.5 12 3.5 12 3.5s-7.425 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.147 0 12 0 12s0 3.853.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.575 20.5 12 20.5 12 20.5s7.425 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.853 24 12 24 12s0-3.853-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a
                href="https://open.spotify.com/user/chg73jv11emfnf66gt23hqm67?si=82f2e1622ee64249"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors duration-200"
                aria-label="Spotify"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="h-5 w-5 text-slate-600 dark:text-slate-400"><path d="M12 0C5.371 0 0 5.371 0 12c0 6.627 5.371 12 12 12s12-5.373 12-12c0-6.629-5.371-12-12-12zm5.438 17.438c-.229.373-.708.49-1.08.26-2.953-1.807-6.675-2.213-11.06-1.209-.429.094-.859-.168-.953-.598-.094-.43.168-.859.598-.953 4.771-1.07 8.872-.617 12.174 1.318.373.229.49.708.261 1.082zm1.543-3.082c-.287.467-.893.617-1.359.33-3.381-2.08-8.547-2.684-12.547-1.463-.521.156-1.072-.137-1.229-.658-.156-.521.137-1.072.658-1.229 4.547-1.363 10.229-.707 14.047 1.684.467.287.617.893.33 1.336zm.146-3.146c-4.08-2.426-10.88-2.646-14.438-1.438-.635.199-1.318-.146-1.518-.781-.199-.635.146-1.318.781-1.518 4.08-1.281 11.453-1.027 16.02 1.646.573.344.76 1.094.416 1.668-.344.573-1.094.76-1.668.416z"/></svg>
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
          <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1">
            © 2025 BAİBÜ Psikoloji Öğrencileri Topluluğu. Tüm hakları saklıdır. <span className="text-red-500 text-lg">♥</span> ile yapıldı.
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
