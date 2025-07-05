import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { layout, responsive, cn } from '@/shared/design-system';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  actionLabel,
  onAction,
  actionDisabled = false,
  children,
  className
}) => {
  return (
    <div className={cn(layout.flex.between, className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            {icon}
          </div>
        )}
        <div>
          <h2 className={cn(
            responsive.text.title,
            'font-bold text-gray-900 dark:text-white flex items-center gap-2'
          )}>
            {title}
          </h2>
          {subtitle && (
            <p className={cn(
              responsive.text.body,
              'text-gray-600 dark:text-gray-400 mt-1'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {children}
        {actionLabel && onAction && (
          <Button 
            onClick={onAction}
            disabled={actionDisabled}
            className="w-full sm:w-auto h-12 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}; 