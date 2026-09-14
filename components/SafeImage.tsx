'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

/**
 * SafeImage — a graceful-degradation image (Req 1.5, 1.6, 2.2, 4.8).
 *
 * Uses a plain <img> rather than next/image so that missing or misnamed files
 * (the user-supplied img-000.png–img-012.png arrive later) degrade at runtime
 * without any build-time file constraints.
 *
 * - Present images display normally with no code change (Req 1.5).
 * - On error the image is omitted and a solid placeholder background shows
 *   instead of throwing (Req 1.6, 4.8).
 * - An optional load timeout (used by the hero, ~3000ms) marks the image as
 *   failed if `onLoad` never fires, so the fallback still appears (Req 2.2).
 */
interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Layout hint. `full` fills its container with object-cover. */
  variant?: 'full' | 'auto';
  /** Placeholder color shown on failure. Defaults to the surface token. */
  fallbackColor?: string;
  /** If set, mark as failed when onLoad hasn't fired within this many ms. */
  timeoutMs?: number;
  /** Native image loading strategy. Defaults to 'lazy' to keep image-heavy pages light. */
  loading?: 'lazy' | 'eager';
}

export default function SafeImage({
  src,
  alt,
  className,
  variant = 'full',
  fallbackColor = 'var(--color-surface)',
  timeoutMs,
  loading = 'lazy',
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  // Optional load-timeout: if the image hasn't loaded in time, fall back so
  // the placeholder shows (Req 2.2). Timer is cleared on load/unmount.
  useEffect(() => {
    if (!timeoutMs) return;
    const timer = window.setTimeout(() => {
      if (!loadedRef.current) setFailed(true);
    }, timeoutMs);
    return () => window.clearTimeout(timer);
  }, [timeoutMs, src]);

  const handleLoad = () => {
    loadedRef.current = true;
    setLoaded(true);
  };

  const handleError = () => {
    setFailed(true);
  };

  const isFull = variant === 'full';

  // On failure render only the placeholder background — no image, no throw.
  if (failed) {
    return (
      <div
        aria-hidden="true"
        className={clsx(isFull && 'h-full w-full', className)}
        style={{ backgroundColor: fallbackColor }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      className={clsx(
        isFull && 'h-full w-full object-cover',
        !loaded && 'opacity-0',
        loaded && 'opacity-100',
        className,
      )}
      // Keep a placeholder color behind the image until it loads so a slow or
      // failing image never flashes empty.
      style={{ backgroundColor: fallbackColor }}
    />
  );
}
