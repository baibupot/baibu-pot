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
    <section className={`relative bg-gradient-to-r ${backgroundClasses[gradient]} py-12 md:py-20 overflow-hidden rounded-3xl mx-4 md:mx-8 shadow-xl`}>
      {/* Dekoratif Blur Daireler */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-40px] left-[-40px] w-72 h-72 bg-white dark:bg-slate-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-40px] right-[-40px] w-64 h-64 bg-white dark:bg-slate-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-2xl opacity-20"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
          <span className={`bg-gradient-to-r ${gradientClasses[gradient]} bg-clip-text text-transparent drop-shadow-md`}>
            {title}
          </span>
        </h1>
      </div>
    </section>
  );
};

export default PageHero;
