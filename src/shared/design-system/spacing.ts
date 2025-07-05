export const spacing = {
  // Padding Standards
  padding: {
    card: 'p-4',
    cardLarge: 'p-6', 
    cardSmall: 'p-3',
    section: 'px-4 sm:px-6 lg:px-8',
    button: 'px-3 py-2',
    buttonLarge: 'px-4 py-3',
    buttonSmall: 'px-2 py-1'
  },

  // Margin Standards  
  margin: {
    section: 'mb-6',
    element: 'mb-4',
    small: 'mb-2',
    large: 'mb-8'
  },

  // Gap Standards
  gap: {
    small: 'gap-2',
    medium: 'gap-4', 
    large: 'gap-6',
    grid: 'gap-3 sm:gap-4'
  },

  // Space Standards
  space: {
    section: 'space-y-6',
    element: 'space-y-4',
    small: 'space-y-2',
    large: 'space-y-8'
  }
};

export const layout = {
  // Container Standards
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Grid Standards
  grid: {
    stats: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
    cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    responsive: 'grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'
  },

  // Flex Standards
  flex: {
    between: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4',
    center: 'flex items-center justify-center',
    end: 'flex justify-end gap-2',
    start: 'flex items-center gap-2'
  },

  // Height Standards
  height: {
    button: 'h-10',
    buttonSmall: 'h-8',
    buttonLarge: 'h-12',
    input: 'h-10',
    card: 'min-h-[200px]'
  },

  // Width Standards  
  width: {
    sidebar: 'w-64',
    modal: 'max-w-4xl',
    modalSmall: 'max-w-md',
    modalLarge: 'max-w-6xl'
  }
};

export const responsive = {
  // Breakpoint Standards
  mobile: 'block sm:hidden',
  desktop: 'hidden sm:block',
  tablet: 'hidden md:block lg:hidden',
  
  // Text Responsive
  text: {
    title: 'text-xl sm:text-2xl',
    subtitle: 'text-base sm:text-lg', 
    body: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm'
  },

  // Padding Responsive
  padding: {
    card: 'p-3 sm:p-4 lg:p-6',
    section: 'py-4 sm:py-6 lg:py-8'
  }
}; 