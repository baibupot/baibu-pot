import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeroProps {
  title: string;
  description?: string; // artık kullanılmıyor ama backward compatibility için var
  icon?: LucideIcon; // artık kullanılmıyor ama backward compatibility için var
  gradient?: 'cyan' | 'teal' | 'emerald' | 'blue' | 'purple' | 'pink';
  children?: React.ReactNode; // artık kullanılmıyor ama backward compatibility için var
}

const PageHero: React.FC<PageHeroProps> = ({ 
  title, 
  gradient = 'cyan'
  // description, icon, children artık kullanılmıyor - minimal tasarım için
}) => {
  const gradientClasses = {
    cyan: 'from-cyan-500 to-teal-600',
    teal: 'from-teal-500 to-emerald-600',
    emerald: 'from-emerald-500 to-green-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-pink-600',
    pink: 'from-pink-500 to-rose-600'
  };

  const backgroundClasses = {
    cyan: 'from-cyan-50/50 to-teal-50/50 dark:from-cyan-950/30 dark:to-teal-950/30',
    teal: 'from-teal-50/50 to-emerald-50/50 dark:from-teal-950/30 dark:to-emerald-950/30',
    emerald: 'from-emerald-50/50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/30',
    blue: 'from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30',
    purple: 'from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30',
    pink: 'from-pink-50/50 to-rose-50/50 dark:from-pink-950/30 dark:to-rose-950/30'
  };

  return (
    <section className={`relative bg-gradient-to-r ${backgroundClasses[gradient]} py-8 md:py-12 overflow-hidden`}>
      {/* Minimal background accent */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white dark:bg-slate-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
            {/* İki renkli başlık efekti */}
            <span className={`bg-gradient-to-r ${gradientClasses[gradient]} bg-clip-text text-transparent drop-shadow-sm`}>
              {title}
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
};

export default PageHero; 