import React from 'react';
import { LucideIcon } from 'lucide-react';

interface LoadingPageProps {
  title?: string;
  message?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'minimal';
}

const LoadingPage: React.FC<LoadingPageProps> = ({ 
  title = "Yükleniyor...", 
  message = "İçerik hazırlanıyor, lütfen bekleyin.",
  icon: Icon,
  variant = 'default'
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-200 dark:border-cyan-800"></div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">{title}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Main Loading Animation */}
        <div className="relative">
          <div className="w-16 h-16 mx-auto">
            {Icon ? (
              <div className="relative">
                <Icon className="w-16 h-16 text-cyan-500 dark:text-cyan-400 animate-pulse" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-200 dark:border-cyan-800 rounded-full animate-spin border-t-transparent"></div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-800 rounded-full animate-spin border-t-transparent"></div>
                <div className="absolute inset-2 w-12 h-12 border-4 border-teal-200 dark:border-teal-800 rounded-full animate-spin border-b-transparent animation-delay-150"></div>
                <div className="absolute inset-4 w-8 h-8 border-4 border-emerald-200 dark:border-emerald-800 rounded-full animate-spin border-l-transparent animation-delay-300"></div>
              </div>
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce animation-delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage; 