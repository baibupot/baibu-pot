export const cardStyles = {
  // Base Card Styles
  base: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm',
  
  // Interactive Cards
  interactive: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200',
  
  // Stat Cards
  stat: 'bg-gradient-to-br p-4 rounded-xl shadow-lg text-white',
  
  // List Item Cards
  listItem: 'group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200',
  
  // Header Cards
  header: 'bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700'
};

export const buttonStyles = {
  // Base Button Classes
  base: 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  
  // Size Variants
  sizes: {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm', 
    lg: 'h-12 px-6 text-base'
  },
  
  // Color Variants
  variants: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    outline: 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
  },
  
  // Gradient Variants
  gradients: {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
  }
};

export const badgeStyles = {
  // Base Badge
  base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  
  // Variants
  variants: {
    default: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300', 
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-transparent'
  }
};

export const inputStyles = {
  // Base Input
  base: 'block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 transition-colors',
  
  // States
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500'
};

export const modalStyles = {
  // Overlay
  overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
  
  // Content
  content: 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto',
  
  // Sizes
  sizes: {
    sm: 'w-full max-w-md',
    md: 'w-full max-w-2xl',
    lg: 'w-full max-w-4xl',
    xl: 'w-full max-w-6xl'
  }
};

export const transitionStyles = {
  // Common Transitions
  base: 'transition-all duration-200',
  slow: 'transition-all duration-300',
  fast: 'transition-all duration-150',
  
  // Hover Effects
  hover: {
    scale: 'hover:scale-105 transition-transform duration-200',
    shadow: 'hover:shadow-lg transition-shadow duration-200',
    opacity: 'hover:opacity-80 transition-opacity duration-200'
  },
  
  // Focus Effects
  focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
}; 