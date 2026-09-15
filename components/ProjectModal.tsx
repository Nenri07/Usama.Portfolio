'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { useAccessibleDialog } from '@/lib/useAccessibleDialog';
import type { Project, WorkImage } from '@/lib/data';
import SafeImage from './SafeImage';
import NumberCard from './NumberCard';
import CinematicImageViewer from './CinematicImageViewer';

/**
 * Source-backed service detail overlay. Internal scrolling, focus handling,
 * cinematic image viewing, and reduced-motion degradation are preserved.
 */
interface ProjectModalProps {
  project: Project | null;
  index?: number | null;
  onClose: () => void;
}

function buildGallery(project: Project): WorkImage[] {
  return project.images.length > 0
    ? project.images
    : [{ src: project.image, alt: project.title }];
}

export default function ProjectModal({ project, index, onClose }: ProjectModalProps) {
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const imageRefs = useRef<HTMLElement[]>([]);

  const open = project != null;
  const viewerOpen = viewerIndex != null;

  useAccessibleDialog({
    open,
    onClose,
    containerRef: panelRef,
    initialFocusRef: closeBtnRef,
    suspended: viewerOpen,
  });

  const registerImage = useCallback((element: HTMLButtonElement | null) => {
    if (element && !imageRefs.current.includes(element)) {
      imageRefs.current.push(element);
    }
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const scrim = scrimRef.current;
    const panel = panelRef.current;
    const scroller = scrollRef.current;
    if (!scrim || !panel) return;

    if (prefersReducedMotion()) {
      gsap.set(scrim, { autoAlpha: 1 });
      gsap.set(panel, { autoAlpha: 1, y: 0, rotationX: 0 });
      return;
    }

    let cleanupScroll: (() => void) | undefined;

    try {
      const timeline = gsap.timeline();
      timeline.fromTo(
        scrim,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: 'power2.out' },
      );
      timeline.fromTo(
        panel,
        {
          autoAlpha: 0,
          y: 40,
          rotationX: 8,
          transformPerspective: 1200,
          transformOrigin: 'center top',
        },
        {
          autoAlpha: 1,
          y: 0,
          rotationX: 0,
          duration: 0.6,
          ease: 'power4.out',
        },
        '-=0.15',
      );

      if (scroller) {
        const setters: {
          el: HTMLElement;
          rotX: (value: number) => void;
          rotY: (value: number) => void;
          y: (value: number) => void;
        }[] = [];

        const buildSetters = () => {
          setters.length = 0;
          for (const element of imageRefs.current) {
            setters.push({
              el: element,
              rotX: gsap.quickTo(element, 'rotationX', {
                duration: 0.4,
                ease: 'power2.out',
              }),
              rotY: gsap.quickTo(element, 'rotationY', {
                duration: 0.4,
                ease: 'power2.out',
              }),
              y: gsap.quickTo(element, 'y', {
                duration: 0.4,
                ease: 'power2.out',
              }),
            });
          }
        };

        const onScroll = () => {
          if (setters.length === 0) buildSetters();
          const viewportHeight = scroller.clientHeight || 1;
          const scrollerBounds = scroller.getBoundingClientRect();
          for (const setter of setters) {
            const bounds = setter.el.getBoundingClientRect();
            const center = bounds.top + bounds.height / 2 - scrollerBounds.top;
            const position = (center / viewportHeight) * 2 - 1;
            const clamped = Math.min(1, Math.max(-1, position));
            setter.rotX(clamped * -4);
            setter.rotY(clamped * 3);
            setter.y(clamped * -12);
          }
        };

        requestAnimationFrame(() => {
          buildSetters();
          onScroll();
        });

        scroller.addEventListener('scroll', onScroll, { passive: true });
        cleanupScroll = () => {
          scroller.removeEventListener('scroll', onScroll);
          try {
            for (const setter of setters) {
              gsap.killTweensOf(setter.el);
              gsap.set(setter.el, { rotationX: 0, rotationY: 0, y: 0 });
            }
          } catch {
            // The visible DOM state is already usable.
          }
        };
      }

      return () => {
        timeline.kill();
        cleanupScroll?.();
        imageRefs.current = [];
      };
    } catch {
      try {
        gsap.set([scrim, panel], { autoAlpha: 1, y: 0, rotationX: 0 });
      } catch {
        // The visible DOM state is already usable.
      }
      cleanupScroll?.();
    }
  }, [open]);

  if (!open || !project) return null;

  const itemIndex = index ?? 0;
  const gallery = buildGallery(project);
  const tagServices = project.services.slice(0, 3);

  return (
    <>
      <div
        ref={scrimRef}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        aria-hidden={viewerOpen || undefined}
        inert={viewerOpen || undefined}
        onMouseDown={(event) => {
          if (event.target === scrimRef.current) onClose();
        }}
        className="fixed inset-0 z-[100] flex items-stretch justify-center p-3 sm:p-6"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--color-base) 95%, transparent)',
        }}
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          className="relative flex max-h-full w-full min-w-0 max-w-6xl flex-col overflow-hidden border border-[var(--color-muted)]/20 bg-[var(--color-base)] [transform-style:preserve-3d] will-change-transform"
          style={{ perspective: '1200px' }}
        >
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            data-cursor
            data-cursor-label="Close"
            aria-label="Close service details"
            className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center border border-[var(--color-muted)]/25 bg-[var(--color-base)]/80 text-2xl text-[var(--color-muted)] backdrop-blur transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text)]"
          >
            <span aria-hidden="true">&times;</span>
          </button>

          <div
            ref={scrollRef}
            data-lenis-prevent
            data-lenis-prevent-wheel
            data-lenis-prevent-touch
            className="modal-scroll-surface grid min-w-0 flex-1 grid-cols-1 gap-y-12 overflow-x-hidden overflow-y-auto px-6 py-16 sm:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-16 lg:py-20"
            style={{ perspective: '1200px' }}
          >
            <div className="lg:sticky lg:top-20 lg:self-start">
              <span
                aria-hidden="true"
                className="mb-6 flex h-10 w-10 items-center justify-center border border-[var(--color-accent)] text-[var(--color-accent)]"
              >
                <span
                  className="block h-3 w-3"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
              </span>

              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">
                Service {String(itemIndex + 1).padStart(2, '0')} · {project.category}
              </p>

              <h2 className="break-words text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--color-text)] sm:text-6xl">
                {project.title}
              </h2>

              <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
                {project.summary}
              </p>

              <ul className="mt-8 flex flex-wrap gap-3">
                <li className="border border-[var(--color-accent)]/40 px-4 py-2 text-sm text-[var(--color-text)]">
                  {project.category}
                </li>
                {project.client ? (
                  <li className="border border-[var(--color-muted)]/25 px-4 py-2 text-sm text-[var(--color-muted)]">
                    {project.client}
                  </li>
                ) : null}
                <li className="border border-[var(--color-muted)]/25 px-4 py-2 text-sm text-[var(--color-muted)]">
                  {project.location}
                </li>
                {tagServices.map((service) => (
                  <li
                    key={service}
                    className="border border-[var(--color-muted)]/25 px-4 py-2 text-sm text-[var(--color-muted)]"
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-12">
              {gallery.map((image, galleryIndex) => (
                <button
                  key={image.src}
                  ref={registerImage}
                  type="button"
                  onClick={() => setViewerIndex(galleryIndex)}
                  aria-label={`Open ${image.alt} in cinematic viewer`}
                  data-cursor
                  data-cursor-label="View"
                  className="relative w-full overflow-hidden bg-[var(--qe-surface)] text-[var(--qe-text)] [transform-style:preserve-3d] will-change-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
                  style={{ aspectRatio: '4 / 3' }}
                >
                  <SafeImage
                    src={image.src}
                    alt={image.alt}
                    variant="full"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    loading={galleryIndex === 0 ? 'eager' : 'lazy'}
                    preload={galleryIndex === 0}
                    className="pointer-events-none"
                  />
                  <span className="pointer-events-none absolute bottom-3 left-3 bg-[var(--qe-base)]/88 px-3 py-1.5 font-mono text-xs text-[var(--qe-text)] backdrop-blur">
                    Visual {String(galleryIndex + 1).padStart(2, '0')}
                  </span>
                </button>
              ))}

              <div>
                <h3 className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Scope
                </h3>
                <ul className="mt-5 flex flex-wrap gap-3">
                  {project.services.map((service) => (
                    <li
                      key={service}
                      className="border border-[var(--color-muted)]/25 px-4 py-2 text-sm text-[var(--color-muted)]"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Delivery Notes
                </h3>
                <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {project.facts.map((fact) => (
                    <NumberCard
                      key={fact.label}
                      className="border-t border-[var(--color-muted)]/25 bg-[var(--color-surface)]/40 px-4 pb-5 pt-4"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                        {fact.label}
                      </dt>
                      <dd className="mt-2 text-xl font-semibold leading-tight text-[var(--color-text)] sm:text-2xl">
                        {fact.value}
                      </dd>
                    </NumberCard>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewerIndex != null ? (
        <CinematicImageViewer
          images={gallery}
          initialIndex={viewerIndex}
          title={project.title}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </>
  );
}
