import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cardStyles, spacing, responsive, cn } from '@/shared/design-system';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  emoji?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan' | 'orange' | 'indigo' | 'pink' | 'emerald' | 'violet';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

const variantClasses = {
  primary: 'from-blue-500 to-blue-600',
  success: 'from-green-500 to-green-600', 
  warning: 'from-yellow-500 to-yellow-600',
  danger: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
  cyan: 'from-cyan-500 to-cyan-600',
  orange: 'from-orange-500 to-orange-600',
  indigo: 'from-indigo-500 to-indigo-600',
  pink: 'from-pink-500 to-pink-600',
  emerald: 'from-emerald-500 to-emerald-600',
  violet: 'from-violet-500 to-violet-600'
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  emoji,
  variant = 'primary',
  trend,
  className
}) => {
  return (
    <div className={cn(
      'bg-gradient-to-br text-white rounded-xl shadow-lg',
      variantClasses[variant],
      spacing.padding.card,
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn(
            responsive.text.caption,
            'text-white/80 font-medium'
          )}>
            {emoji && <span className="mr-1">{emoji}</span>}
            {title}
          </p>
          <p className={cn(
            responsive.text.title,
            'font-bold'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              responsive.text.caption,
              'text-white/70 mt-1'
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={cn(
              responsive.text.caption,
              'text-white/80 mt-1'
            )}>
              <span className={trend.isPositive ? 'text-green-200' : 'text-red-200'}>
                {trend.isPositive ? '↗' : '↘'} {trend.value}
              </span>
            </p>
          )}
        </div>
        {Icon && (
          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white/60" />
        )}
      </div>
    </div>
  );
}; 