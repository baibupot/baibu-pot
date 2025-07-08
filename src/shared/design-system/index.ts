import { colors } from './colors';
import { spacing } from './spacing';
import { buttonStyles, badgeStyles, cardStyles, pageStyles, heroStyles, sectionStyles } from './components';

export { colors, gradients } from './colors';
export { spacing, layout, responsive } from './spacing';
export { 
  cardStyles, 
  buttonStyles, 
  badgeStyles, 
  inputStyles, 
  modalStyles, 
  transitionStyles,
  pageStyles,
  heroStyles,
  sectionStyles
} from './components';

// Utility function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Helper functions for design system
export const getColorClasses = (variant: 'primary' | 'success' | 'warning' | 'danger', type: 'bg' | 'text' | 'border' | 'hover' = 'bg') => {
  const colorMap = {
    primary: colors.primary,
    success: colors.success, 
    warning: colors.warning,
    danger: colors.danger
  };
  
  return colorMap[variant][type] || colorMap[variant]['600'];
};

export const getButtonClass = (variant: keyof typeof buttonStyles.variants, size: keyof typeof buttonStyles.sizes = 'md') => {
  return cn(
    buttonStyles.base,
    buttonStyles.sizes[size],
    buttonStyles.variants[variant]
  );
};

export const getBadgeClass = (variant: keyof typeof badgeStyles.variants = 'default') => {
  return cn(
    badgeStyles.base,
    badgeStyles.variants[variant]
  );
};

export const getCardClass = (variant: keyof typeof cardStyles = 'base', padding?: boolean) => {
  const baseClass = cardStyles[variant];
  return padding ? cn(baseClass, spacing.padding.card) : baseClass;
}; 