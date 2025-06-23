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
        return 'bg-slate-50 dark:bg-slate-900';
      case 'gradient':
        return 'bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900';
      default:
        return 'bg-white dark:bg-slate-900';
    }
  };

  return (
    <ThemeProvider>
      <div className={`min-h-screen ${getBackgroundClass()} transition-all duration-300 ${className}`}>
        <Header />
        
        <main className={`${getMaxWidthClass()} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
          {children}
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default PageContainer; 