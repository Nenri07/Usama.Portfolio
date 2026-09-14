'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

/**
 * Responsive local-image delivery with a stable shimmer/fallback frame.
 * Next Image supplies width-aware WebP/AVIF candidates while this component
 * retains the existing runtime failure, timeout, fade, and drag semantics.
 */
interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Layout hint. `full` fills its positioned container with object-cover. */
  variant?: 'full' | 'auto';
  /** Placeholder color shown while loading and after failure. */
  fallbackColor?: string;
  /** If set, mark as failed when onLoad has not fired within this many ms. */
  timeoutMs?: number;
  /** Native image loading strategy. Defaults to lazy. */
  loading?: 'lazy' | 'eager';
  /** Preload only a single true LCP image. Do not combine with loading. */
  preload?: boolean;
  /** Responsive rendered-width hint used to generate/select the srcset. */
  sizes?: string;
  /** Optimizer quality. Defaults to Next's supported 75 preset. */
  quality?: number;
  /** Preserve native drag control for slider/gallery uses. */
  draggable?: boolean;
  /** Cover presentation by default; cinematic viewing uses contain. */
  objectFit?: 'cover' | 'contain';
}

type ImageStatus = 'loading' | 'loaded' | 'failed';

export default function SafeImage({
  src,
  alt,
  className,
  variant = 'full',
  fallbackColor = 'var(--qe-surface, #0F1424)',
  timeoutMs,
  loading = 'lazy',
  preload = false,
  sizes = '100vw',
  quality = 75,
  draggable,
  objectFit = 'cover',
}: SafeImageProps) {
  const [state, setState] = useState<{ src: string; status: ImageStatus }>({
    src,
    status: 'loading',
  });
  const loadedRef = useRef(false);
  const status = state.src === src ? state.status : 'loading';
  const isFull = variant === 'full';

  useEffect(() => {
    loadedRef.current = false;
    if (!timeoutMs) return;

    const timer = window.setTimeout(() => {
      if (!loadedRef.current) setState({ src, status: 'failed' });
    }, timeoutMs);

    return () => window.clearTimeout(timer);
  }, [src, timeoutMs]);

  const handleLoad = () => {
    loadedRef.current = true;
    setState({ src, status: 'loaded' });
  };

  const handleError = () => {
    loadedRef.current = false;
    setState({ src, status: 'failed' });
  };

  const mediaClassName = clsx(
    isFull && 'h-full w-full',
    'safe-image-media',
    status === 'loaded' ? 'opacity-100' : 'opacity-0',
  );

  return (
    <span
      className={clsx(
        'safe-image-frame relative block overflow-hidden',
        isFull ? 'h-full w-full' : 'inline-block max-w-full',
        className,
      )}
      style={{ backgroundColor: fallbackColor }}
    >
      {status === 'loading' ? (
        <span aria-hidden="true" className="safe-image-skeleton absolute inset-0" />
      ) : null}

      {status !== 'failed' ? (
        isFull ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            quality={quality}
            {...(preload ? { preload: true } : { loading })}
            decoding="async"
            draggable={draggable}
            onLoad={handleLoad}
            onError={handleError}
            className={mediaClassName}
            style={{ backgroundColor: fallbackColor, objectFit }}
          />
        ) : (
          // Unknown intrinsic dimensions require the native auto-size path.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading={loading}
            decoding="async"
            draggable={draggable}
            onLoad={handleLoad}
            onError={handleError}
            className={mediaClassName}
            style={{ backgroundColor: fallbackColor, objectFit }}
          />
        )
      ) : (
        <span aria-hidden="true" className="block h-full min-h-px w-full" />
      )}
    </span>
  );
}
