import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeroProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  gradient?: 'cyan' | 'teal' | 'emerald' | 'blue' | 'purple' | 'pink';
  children?: React.ReactNode;
}

const PageHero: React.FC<PageHeroProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  gradient = 'cyan',
  children 
}) => {
  const gradientClasses = {
    cyan: 'from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950',
    teal: 'from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950',
    emerald: 'from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950',
    blue: 'from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
    purple: 'from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
    pink: 'from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950'
  };

  const iconColors = {
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900',
    teal: 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900',
    pink: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900'
  };

  return (
    <section className={`relative bg-gradient-to-br ${gradientClasses[gradient]} py-16 lg:py-20 overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-white dark:bg-slate-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-300 dark:bg-cyan-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-teal-300 dark:bg-teal-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Icon */}
          {Icon && (
            <div className="flex justify-center">
              <div className={`p-4 rounded-2xl ${iconColors[gradient]} backdrop-blur-sm shadow-lg`}>
                <Icon className="h-12 w-12" />
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Children (for additional content like buttons, stats, etc.) */}
          {children && (
            <div className="pt-4">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg 
          className="w-full h-auto text-white dark:text-slate-900" 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,32L48,37.3C96,43,192,53,288,64C384,75,480,85,576,85.3C672,85,768,75,864,69.3C960,64,1056,64,1152,69.3C1248,75,1344,85,1392,90.7L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
};

export default PageHero; 