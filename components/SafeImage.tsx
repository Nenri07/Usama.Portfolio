'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

/**
 * SafeImage keeps image-heavy presentation surfaces stable while files load.
 * A polished surface-token shimmer occupies the exact image container, then
 * the real image fades in. Missing or timed-out files settle to a solid
 * fallback without changing layout.
 */
interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Layout hint. `full` fills its container with object-cover. */
  variant?: 'full' | 'auto';
  /** Placeholder color shown while loading and after failure. */
  fallbackColor?: string;
  /** If set, mark as failed when onLoad has not fired within this many ms. */
  timeoutMs?: number;
  /** Native image loading strategy. Defaults to lazy. */
  loading?: 'lazy' | 'eager';
  /** Preserve native drag control for slider/gallery uses. */
  draggable?: boolean;
}

type ImageStatus = 'loading' | 'loaded' | 'failed';

export default function SafeImage({
  src,
  alt,
  className,
  variant = 'full',
  fallbackColor = 'var(--color-surface)',
  timeoutMs,
  loading = 'lazy',
  draggable,
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
        <span
          aria-hidden="true"
          className="safe-image-skeleton absolute inset-0"
        />
      ) : null}

      {status !== 'failed' ? (
        // A plain img intentionally preserves runtime fallback for user-supplied files.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          draggable={draggable}
          onLoad={handleLoad}
          onError={handleError}
          className={clsx(
            isFull && 'h-full w-full object-cover',
            'safe-image-media',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
          )}
          style={{ backgroundColor: fallbackColor }}
        />
      ) : (
        <span aria-hidden="true" className="block h-full min-h-px w-full" />
      )}
    </span>
  );
}
