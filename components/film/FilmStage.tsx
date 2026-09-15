'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { film } from '@/lib/data';
import { hasWebGL, prefersReducedMotion, isCoarsePointer } from '@/lib/motion';
import { gsap } from '@/lib/gsapSetup';
import type { FilmBackdropHandle } from './filmBackdrop';

/**
 * FilmStage — the client tree for the dedicated cinematic /film route (Part D).
 *
 * The real, accessible player is a privacy-friendly youtube-nocookie iframe
 * framed in a CSS 3D perspective card. It is ALWAYS rendered and fully
 * functional/keyboard-reachable regardless of WebGL support.
 *
 * A decorative Three.js backdrop (deep cinema gradient + drifting amber/teal
 * glows + grain) is layered BEHIND the frame and only initialized after mount
 * when WebGL is available and neither reduced motion nor a coarse pointer is
 * detected. If any of those guards fail, or init throws, a CSS-only cinematic
 * gradient backdrop is shown instead — no console error, nothing blocks first
 * paint. The backdrop is disposed and its GL context released on unmount.
 */

// Privacy-friendly embed; no autoplay-with-sound. `youtubeId` is a placeholder
// in lib/data.ts until the real video id is pasted in.
function buildEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params.toString()}`;
}

export default function FilmStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const [webglActive, setWebglActive] = useState(false);

  // Defer WebGL init to an effect so it never blocks SSR or first paint.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (prefersReducedMotion() || isCoarsePointer() || !hasWebGL()) {
      return; // CSS-only backdrop handles these cases.
    }

    let handle: FilmBackdropHandle | null = null;
    let cancelled = false;

    // Dynamic import keeps three.js out of the initial route payload.
    import('./filmBackdrop')
      .then(({ createFilmBackdrop }) => {
        if (cancelled) return;
        handle = createFilmBackdrop(canvas);
        if (handle) setWebglActive(true);
      })
      .catch(() => {
        /* stay on the CSS-only backdrop */
      });

    return () => {
      cancelled = true;
      handle?.dispose();
      handle = null;
    };
  }, []);

  // Cinematic entry animation for the framed player + title. Transform/opacity
  // only, and it starts from a visible baseline: if GSAP fails the content is
  // already readable. Skipped under reduced motion.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const frame = frameRef.current;
    const intro = introRef.current;
    if (!frame && !intro) return;

    let tl: gsap.core.Timeline | undefined;
    try {
      tl = gsap.timeline();
      if (intro) {
        tl.fromTo(
          intro,
          { y: 18, opacity: 0.001 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
        );
      }
      if (frame) {
        tl.fromTo(
          frame,
          { y: 46, opacity: 0.001, rotationX: 10, transformPerspective: 1200 },
          { y: 0, opacity: 1, rotationX: 0, duration: 1.0, ease: 'power4.out' },
          '-=0.4',
        );
      }
    } catch {
      // Ensure a clean, fully-visible resting state on any failure.
      try {
        if (intro) gsap.set(intro, { clearProps: 'all' });
        if (frame) gsap.set(frame, { clearProps: 'all' });
      } catch {
        /* DOM defaults are already visible */
      }
    }

    return () => {
      tl?.kill();
    };
  }, []);

  const embedUrl = buildEmbedUrl(film.youtubeId);

  return (
    <main
      id="top"
      className="relative isolate flex min-h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-[var(--qe-cinema-deep,#05070F)]"
    >
      {/* Decorative WebGL backdrop canvas (behind everything). */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full"
      />

      {/* CSS-only cinematic backdrop — always present, and the sole backdrop
          when WebGL is inactive. Fades slightly when WebGL takes over so the
          two never fight for contrast. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-700"
        style={{
          opacity: webglActive ? 0.35 : 1,
          background:
            'radial-gradient(60% 55% at 32% 62%, color-mix(in srgb, var(--qe-cinema-amber,#E7A14C) 34%, transparent), transparent 70%),' +
            'radial-gradient(55% 50% at 72% 40%, color-mix(in srgb, var(--qe-cinema-teal,#1C6E73) 30%, transparent), transparent 72%),' +
            'linear-gradient(180deg, var(--qe-cinema-deep,#05070F), #0A0E1A)',
        }}
      />

      {/* Top bar: back-to-home. */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/"
          data-cursor
          className="text-primary-interactive inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:text-sm"
        >
          <span aria-hidden="true">←</span> Back to site
        </Link>
        <span className="text-secondary font-mono text-[0.7rem] uppercase tracking-[0.2em]">
          Film
        </span>
      </div>

      {/* Stage. */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-4 sm:px-8">
        <div ref={introRef} className="mb-8 max-w-2xl text-center">
          <p className="text-accent font-mono text-xs uppercase tracking-[0.28em]">
            Presentation
          </p>
          <h1 className="text-primary mt-3 font-display text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-tight">
            {film.title}
          </h1>
          <p className="text-secondary mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
            {film.tagline}
          </p>
        </div>

        {/* 3D-styled frame around the accessible iframe. */}
        <div className="w-full max-w-5xl [perspective:1400px]">
          <div
            ref={frameRef}
            className="surface-alt relative mx-auto w-full border border-subtle p-2 shadow-none sm:p-3"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Warm/teal frame glow so cinema colour reads right at the edges. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 -z-10 opacity-70 blur-2xl"
              style={{
                background:
                  'radial-gradient(50% 60% at 30% 70%, color-mix(in srgb, var(--qe-cinema-amber,#E7A14C) 45%, transparent), transparent 70%),' +
                  'radial-gradient(50% 60% at 75% 35%, color-mix(in srgb, var(--qe-cinema-teal,#1C6E73) 40%, transparent), transparent 72%)',
              }}
            />
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <iframe
                src={embedUrl}
                title={`${film.title} — video player`}
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          {film.isPlaceholder ? (
            <p className="text-secondary mt-5 text-center font-mono text-[0.7rem] uppercase tracking-[0.16em] opacity-80">
              Placeholder video — replace the YouTube id in lib/data.ts (film.youtubeId).
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
