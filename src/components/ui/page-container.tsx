import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  background?: 'default' | 'slate' | 'gradient';
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = '7xl',
  background = 'default'
}) => {
  const getMaxWidthClass = () => {
    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '7xl': 'max-w-7xl',
      full: 'max-w-full'
    };
    return maxWidthClasses[maxWidth];
  };

  const getBackgroundClass = () => {
    switch (background) {
      case 'slate':
        return 'bg-gradient-to-br from-slate-50/50 via-white to-slate-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950';
      case 'gradient':
        return 'bg-gradient-to-br from-cyan-50/30 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950';
      default:
        return 'bg-gradient-to-br from-white via-slate-50/20 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950';
    }
  };

  return (
    <ThemeProvider>
      <div className={`min-h-screen ${getBackgroundClass()} transition-all duration-500 ${className}`}>
        <Header />
        
        <main className={`${getMaxWidthClass()} mx-auto container-mobile py-6 sm:py-8 lg:py-12 spacing-mobile`}>
          {children}
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default PageContainer; 