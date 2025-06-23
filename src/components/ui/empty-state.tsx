import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: 'default' | 'search' | 'error';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'search':
        return {
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800'
        };
      case 'error':
        return {
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        };
      default:
        return {
          iconColor: 'text-slate-400',
          bgColor: 'bg-slate-50 dark:bg-slate-800',
          borderColor: 'border-slate-200 dark:border-slate-700'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        {/* Icon with animated background */}
        <div className="relative mb-8">
          <div className={`w-24 h-24 mx-auto rounded-full ${styles.bgColor} ${styles.borderColor} border-2 flex items-center justify-center relative overflow-hidden`}>
            {/* Animated background pulse */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white dark:via-slate-700 to-transparent opacity-20 -skew-x-12 animate-shimmer"></div>
            <Icon className={`h-12 w-12 ${styles.iconColor} relative z-10`} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actionLabel && onAction && (
              <Button 
                onClick={onAction}
                className="flex items-center gap-2"
              >
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button 
                variant="outline" 
                onClick={onSecondaryAction}
                className="flex items-center gap-2"
              >
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}

        {/* Decorative dots */}
        <div className="flex justify-center mt-8 space-x-2">
          <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-pulse animation-delay-100"></div>
          <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-pulse animation-delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState; 