import React from 'react';
import { getOptimizedImageSrc, getResponsiveImageSrc } from '@/utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  responsive?: boolean;
  sizes?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  responsive = false,
  sizes = '(max-width: 768px) 100vw, 50vw'
}) => {
  // Dosya ismini extract et
  const fileName = src.replace(/^\//, '');
  
  if (responsive) {
    // Responsive image için srcSet oluştur
    const srcSet = [
      `${getResponsiveImageSrc(fileName, 'sm')} 400w`,
      `${getResponsiveImageSrc(fileName, 'md')} 800w`,
      `${getResponsiveImageSrc(fileName, 'lg')} 1200w`,
      `${getResponsiveImageSrc(fileName, 'xl')} 1920w`
    ].join(', ');

    return (
      <img
        src={getOptimizedImageSrc(fileName)}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
      />
    );
  }

  return (
    <img
      src={getOptimizedImageSrc(fileName)}
      alt={alt}
      className={className}
      width={width}
      height={width}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
    />
  );
};

export default OptimizedImage;