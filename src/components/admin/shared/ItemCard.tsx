import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cardStyles, spacing, responsive, cn } from '@/shared/design-system';

interface ItemCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  image?: string;
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  }>;
  metadata?: Array<{
    icon?: React.ReactNode;
    label: string;
    value: string;
  }>;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  children,
  title,
  subtitle,
  image,
  badges,
  metadata,
  actions,
  onClick,
  className
}) => {
  const isClickable = !!onClick;

  return (
    <div 
      className={cn(
        cardStyles.listItem,
        isClickable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start gap-3">
            {/* Image */}
            {image && (
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            )}
            
            {/* Title and Subtitle */}
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                responsive.text.subtitle,
                'font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'
              )}>
                {title}
              </h3>
              {subtitle && (
                <p className={cn(
                  responsive.text.body,
                  'text-gray-600 dark:text-gray-400 line-clamp-2 mt-1'
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Badges */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {badges.map((badge, index) => (
                <Badge 
                  key={index} 
                  variant={badge.variant || 'outline'}
                  className="text-xs font-medium"
                >
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Metadata */}
          {metadata && metadata.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {metadata.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}: {item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Custom Content */}
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex flex-row sm:flex-col gap-2 sm:flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}; 