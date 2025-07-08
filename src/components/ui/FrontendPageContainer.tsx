import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { pageStyles, cn } from '@/shared/design-system';

interface FrontendPageContainerProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'alt';
  withPadding?: boolean;
}

const FrontendPageContainer: React.FC<FrontendPageContainerProps> = ({
  children,
  className,
  background = 'default',
  withPadding = true
}) => {
  const getBackgroundClass = () => {
    if (background === 'alt') {
      return 'bg-slate-50 dark:bg-slate-800/50';
    }
    return pageStyles.container;
  };

  return (
    <ThemeProvider>
      <div className={cn(getBackgroundClass(), className)}>
        <Header />
        
        <main className={withPadding ? pageStyles.content : ''}>
          {children}
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default FrontendPageContainer; 