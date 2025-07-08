import React from 'react';
import { pageStyles, sectionStyles, cn } from '@/shared/design-system';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'alt';
  withContainer?: boolean;
  spacing?: 'default' | 'tight' | 'loose';
}

const Section: React.FC<SectionProps> = ({
  children,
  className,
  background = 'default',
  withContainer = true,
  spacing = 'default'
}) => {
  const spacingClasses = {
    tight: 'py-6 sm:py-8 lg:py-12',
    default: pageStyles.sectionSpacing,
    loose: 'py-12 sm:py-16 lg:py-24'
  };

  const backgroundClass = background === 'alt' ? sectionStyles.backgroundAlt : '';

  return (
    <section className={cn(backgroundClass, spacingClasses[spacing], className)}>
      {withContainer ? (
        <div className={pageStyles.section}>
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
};

export default Section; 