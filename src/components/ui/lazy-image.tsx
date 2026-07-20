import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number
  className?: string
  imgClassName?: string
  onClick?: () => void
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  imgClassName,
  onClick,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const handleLoad = useCallback(() => setLoaded(true), [])

  return (
    <div
      className={cn('relative overflow-hidden bg-secondary/30', className)}
      style={{ width: width ?? '100%', height }}
      onClick={onClick}
    >
      <div
        className={cn(
          'absolute inset-0 bg-secondary/50 transition-opacity duration-200',
          loaded ? 'opacity-0' : 'opacity-100',
        )}
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        width={typeof width === 'number' ? width : undefined}
        height={height}
        className={cn(
          'transition-opacity duration-200',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName,
        )}
      />
    </div>
  )
}
