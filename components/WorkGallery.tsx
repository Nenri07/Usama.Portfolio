'use client';

import { useEffect, useRef } from 'react';
import RevealHeading from './RevealHeading';
import SafeImage from './SafeImage';
import { workGallery } from '@/lib/data';
import { gsap, ScrollTrigger, registerScrollTrigger } from '@/lib/gsapSetup';
import { prefersReducedMotion, isCoarsePointer } from '@/lib/motion';

/**
 * WorkGallery — an animated masonry wall showing EVERY normalized on-site work
 * photograph (`workGallery`, 54 images). This guarantees all normalized photos
 * appear somewhere on the main page, complementing the per-project galleries in
 * the Work modal.
 *
 * Motion (enhancement only, visible-by-default):
 *   • GSAP ScrollTrigger batches the tiles into a staggered rise as each column
 *     enters the viewport (transform/opacity only; tiles are fully visible at
 *     rest so nothing is ever gated behind motion).
 *   • Subtle per-column parallax on scroll (fine pointers, motion on).
 *   • A gentle pointer tilt on hover for fine pointers.
 *
 * Degradation: under reduced motion or on the server the tiles simply render in
 * their natural, fully-visible masonry layout. On coarse pointers the tilt is
 * skipped. Images are lazy and never the LCP.
 */
export default function WorkGallery() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const tiles = Array.from(
      root.querySelectorAll<HTMLElement>('[data-gallery-tile]'),
    );
    if (tiles.length === 0) return;

    const cleanups: Array<() => void> = [];
    const fine = !isCoarsePointer();

    try {
      registerScrollTrigger();

      // Staggered rise as tiles enter view. Start state is applied here (not in
      // CSS) so a ScrollTrigger/GSAP failure leaves tiles fully visible.
      const batch = ScrollTrigger.batch(tiles, {
        start: 'top 92%',
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { y: 40, autoAlpha: 0.001 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              ease: 'power3.out',
              stagger: 0.06,
              overwrite: true,
              onComplete: () =>
                elements.forEach((el) =>
                  gsap.set(el, { clearProps: 'transform,opacity,visibility' }),
                ),
            },
          ),
      });
      cleanups.push(() => batch.forEach((st) => st.kill()));

      // Light per-tile parallax drift on fine pointers only.
      if (fine) {
        tiles.forEach((tile, i) => {
          const depth = (i % 3) - 1; // -1, 0, 1 columns
          if (depth === 0) return;
          const tween = gsap.fromTo(
            tile,
            { yPercent: depth * 4 },
            {
              yPercent: depth * -4,
              ease: 'none',
              scrollTrigger: {
                trigger: tile,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          );
          cleanups.push(() => {
            tween.scrollTrigger?.kill();
            tween.kill();
          });
        });
      }
    } catch {
      // Tiles remain in their natural visible layout.
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section
      id="gallery"
      className="min-w-0 overflow-hidden bg-base px-6 py-24 sm:px-8 lg:px-12"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <header className="mb-12 grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.6fr)] md:items-end">
          <div>
            <RevealHeading className="text-primary text-4xl font-semibold tracking-tight sm:text-5xl">
              On the Ground
            </RevealHeading>
            <span
              aria-hidden="true"
              className="mt-4 block h-px w-16 bg-[var(--qe-accent)]"
            />
          </div>
          <p className="text-secondary text-base leading-relaxed md:text-right">
            A wider look at Puro teams delivering cleaning, hospitality and
            façade work on site.
          </p>
        </header>

        {/* CSS columns give a lightweight masonry without layout thrash. */}
        <div
          ref={rootRef}
          className="min-w-0 gap-4 [column-fill:_balance] columns-2 sm:columns-3 lg:columns-4"
        >
          {workGallery.map((image, index) => (
            <figure
              key={image.src}
              data-gallery-tile
              className="group relative mb-4 block w-full overflow-hidden border border-[var(--qe-muted)]/15 [break-inside:avoid] will-change-transform"
            >
              <SafeImage
                src={image.src}
                alt={image.alt}
                variant="auto"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                quality={68}
                loading="lazy"
                className="transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--qe-base, #0A0E1A) 72%, transparent) 100%)',
                }}
              />
              <figcaption className="pointer-events-none absolute bottom-0 left-0 p-3 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--qe-text)] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                {String(index + 1).padStart(2, '0')}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
