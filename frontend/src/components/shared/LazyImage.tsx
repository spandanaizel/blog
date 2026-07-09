import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Tailwind aspect-ratio class for the wrapping container, e.g. 'aspect-[16/9]'. Prevents layout shift while the image loads. */
  aspectClassName?: string;
  containerClassName?: string;
}

export function LazyImage({
  className,
  aspectClassName = 'aspect-[16/9]',
  containerClassName,
  onLoad,
  alt = '',
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-muted', aspectClassName, containerClassName)}>
      <img
        loading="lazy"
        decoding="async"
        alt={alt}
        className={cn(
          'h-full w-full object-cover transition-all duration-500 ease-out',
          loaded ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-md',
          className
        )}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        {...props}
      />
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
    </div>
  );
}
