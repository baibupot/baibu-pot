import React from 'react';
import { layout, spacing, responsive } from '@/shared/design-system';
import { cn } from '@/shared/design-system';

interface AdminPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminPageContainer: React.FC<AdminPageContainerProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      layout.container,
      spacing.padding.section,
      spacing.space.section,
      className
    )}>
      {children}
    </div>
  );
}; 