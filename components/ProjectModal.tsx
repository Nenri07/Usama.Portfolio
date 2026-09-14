'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { useAccessibleDialog } from '@/lib/useAccessibleDialog';
import { resolveImagePath, imagePathForIndex } from '@/lib/format';
import type { Project } from '@/lib/data';
import SafeImage from './SafeImage';
import NumberCard from './NumberCard';

/**
 * ProjectModal — a rich, full-screen project-DETAIL overlay (Griflan-style).
 *
 * When `project` is non-null it renders a fixed dark-scrim overlay (above the
 * nav, z-[100]) containing a large dark panel with its OWN internal scroll. The
 * detail "page" scrolls INSIDE the panel:
 *  - LEFT column (sticky within the panel): the project title, a concise
 *    generated description built from the project's own fields, and a row of
 *    tag chips (year, venue, up to 3 services) with a small maroon accent mark.
 *  - RIGHT column: a vertically scrolling stack of curated imagery (built from
 *    the project's own image plus a couple of other curated images for depth),
 *    an "all services" chip block, and a Public_Metric counts block rendered as
 *    3D number cards.
 *
 * NO revenue / cost / profit figures ever appear — only Public_Metric counts.
 *
 * 3D treatment:
 *  - Panel entrance animates in with a 3D tilt (rotateX + perspective + rise).
 *  - Right-column gallery images tilt/parallax subtly as the panel scrolls.
 *    Because the modal scrolls INTERNALLY (not the window), the tilt is driven
 *    by a plain `scroll` event listener on the scrollable panel element (via
 *    GSAP `quickTo`), NOT a window ScrollTrigger — this avoids the
 *    ScrollTrigger-in-modal `scroller` complexity and is disposed on close.
 *  - Metric counts render as 3D number cards (shared NumberCard) that tilt
 *    toward the pointer on a fine pointer.
 *
 * Behavior preserved from the original:
 *  - ESC close, scrim-click close (not panel clicks), close button (data-cursor).
 *  - Body scroll lock while open, restored on close.
 *  - Focus moves to the close button on open, restored to the opener on close,
 *    with a minimal Tab focus trap.
 *  - Under `prefers-reduced-motion`: everything renders flat and fully visible,
 *    the panel appears instantly, and no scroll/tilt listeners are created.
 *  - All GSAP is wrapped in try/catch; on failure the modal stays flat, fully
 *    readable, and closeable.
 */

interface ProjectModalProps {
  project: Project | null;
  /** The project's index (for sequential image resolution). */
  index?: number | null;
  onClose: () => void;
}

/** Total number of curated project images (img-000..img-012). */
const PROJECT_IMAGE_COUNT = 13;

/** A single Public_Metric count for the 3D number-card block. */
interface Metric {
  value: string;
  label: string;
}

/** Build the Public_Metric counts (NO financial figures). */
function metricParts(project: Project): Metric[] {
  const parts: Metric[] = [];
  if (project.visitors) parts.push({ value: project.visitors, label: 'Visitors' });
  if (project.winners) parts.push({ value: project.winners, label: 'Winners' });
  if (project.staff) parts.push({ value: project.staff, label: 'Staff' });
  if (project.days) parts.push({ value: project.days, label: 'Days' });
  return parts;
}

/**
 * Build a concise, factual 1–2 sentence description purely from the project's
 * own fields — the data has no prose. NO financial figures.
 */
function buildDescription(project: Project): string {
  const services = project.services.slice(0, 3).join(', ');
  const base = `${project.title} at ${project.venue} (${project.year})`;
  const withServices = services ? `${base} — ${services}` : base;
  const trailing = project.visitors ? `, drawing ${project.visitors} visitors` : '';
  return `${withServices}${trailing}.`;
}

/**
 * Assemble a small gallery (the project's own image plus two other curated
 * images) so the detail has visual depth. All paths resolve to curated files;
 * SafeImage degrades gracefully if any file is missing.
 */
function buildGallery(project: Project, index: number): { src: string; alt: string }[] {
  const primary = resolveImagePath(project, index);
  const second = imagePathForIndex((index + 3) % PROJECT_IMAGE_COUNT);
  const third = imagePathForIndex((index + 7) % PROJECT_IMAGE_COUNT);
  return [
    { src: primary, alt: project.title },
    { src: second, alt: `${project.title} — related visual` },
    { src: third, alt: `${project.title} — related visual` },
  ];
}

export default function ProjectModal({ project, index, onClose }: ProjectModalProps) {
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Per-image quickTo setters for the scroll-driven tilt, keyed by DOM node.
  const imageRefs = useRef<HTMLDivElement[]>([]);

  const open = project != null;

  useAccessibleDialog({
    open,
    onClose,
    containerRef: panelRef,
    initialFocusRef: closeBtnRef,
  });

  // Collect gallery image nodes for the scroll tilt.
  const registerImage = useCallback((el: HTMLDivElement | null) => {
    if (el && !imageRefs.current.includes(el)) {
      imageRefs.current.push(el);
    }
  }, []);

  // Entrance animation + scroll-driven right-column tilt (before paint so
  // there's no flash of final state).
  useLayoutEffect(() => {
    if (!open) return;
    const scrim = scrimRef.current;
    const panel = panelRef.current;
    const scroller = scrollRef.current;
    if (!scrim || !panel) return;

    if (prefersReducedMotion()) {
      // Flat + fully visible, instant, no listeners (Req 9.8).
      gsap.set(scrim, { autoAlpha: 1 });
      gsap.set(panel, { autoAlpha: 1, y: 0, rotationX: 0 });
      return;
    }

    let cleanupScroll: (() => void) | undefined;

    try {
      // Panel 3D entrance: tilt in on X with perspective + rise. Scrim fades.
      const tl = gsap.timeline();
      tl.fromTo(
        scrim,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: 'power2.out' },
      );
      tl.fromTo(
        panel,
        { autoAlpha: 0, y: 40, rotationX: 8, transformPerspective: 1200, transformOrigin: 'center top' },
        {
          autoAlpha: 1,
          y: 0,
          rotationX: 0,
          duration: 0.6,
          ease: 'power4.out',
        },
        '-=0.15',
      );

      // Scroll-driven tilt/parallax on the right-column gallery images. Driven
      // by a plain scroll listener on the INTERNAL scroll container (the modal
      // scrolls internally, not the window) via GSAP quickTo — no
      // ScrollTrigger `scroller` needed. Disposed on close.
      if (scroller) {
        // Defer setter creation so the images have mounted.
        const setters: {
          el: HTMLDivElement;
          rotX: (v: number) => void;
          rotY: (v: number) => void;
          y: (v: number) => void;
        }[] = [];

        const buildSetters = () => {
          setters.length = 0;
          for (const el of imageRefs.current) {
            setters.push({
              el,
              rotX: gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power2.out' }),
              rotY: gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power2.out' }),
              y: gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power2.out' }),
            });
          }
        };

        const onScroll = () => {
          if (setters.length === 0) buildSetters();
          const vh = scroller.clientHeight || 1;
          for (const s of setters) {
            const rect = s.el.getBoundingClientRect();
            const scRect = scroller.getBoundingClientRect();
            // Position of the image center relative to the scroller viewport,
            // normalized to roughly -1 (top) .. 1 (bottom).
            const center = rect.top + rect.height / 2 - scRect.top;
            const t = (center / vh) * 2 - 1;
            const clamped = t < -1 ? -1 : t > 1 ? 1 : t;
            // Subtle: a few degrees of tilt + a little parallax drift.
            s.rotX(clamped * -4);
            s.rotY(clamped * 3);
            s.y(clamped * -12);
          }
        };

        // Run once after mount so images start with a resting tilt.
        requestAnimationFrame(() => {
          buildSetters();
          onScroll();
        });

        scroller.addEventListener('scroll', onScroll, { passive: true });
        cleanupScroll = () => {
          scroller.removeEventListener('scroll', onScroll);
          try {
            for (const s of setters) {
              gsap.killTweensOf(s.el);
              gsap.set(s.el, { rotationX: 0, rotationY: 0, y: 0 });
            }
          } catch {
            /* nothing to clean up */
          }
        };
      }

      return () => {
        tl.kill();
        cleanupScroll?.();
        imageRefs.current = [];
      };
    } catch {
      // On failure make sure the modal is fully visible and flat.
      try {
        gsap.set([scrim, panel], { autoAlpha: 1, y: 0, rotationX: 0 });
      } catch {
        /* leave as-is */
      }
      cleanupScroll?.();
    }
  }, [open]);

  if (!open || !project) return null;

  const idx = index ?? 0;
  const description = buildDescription(project);
  const gallery = buildGallery(project, idx);
  const metrics = metricParts(project);
  // Up to 3 services as tag chips in the left column.
  const tagServices = project.services.slice(0, 3);

  return (
    <div
      ref={scrimRef}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onMouseDown={(e) => {
        // Close only when the scrim itself is pressed, not the panel. Using
        // mousedown target guards against selections that end on the scrim.
        if (e.target === scrimRef.current) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-stretch justify-center p-3 sm:p-6"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-base) 95%, transparent)' }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex max-h-full w-full min-w-0 max-w-6xl flex-col overflow-hidden border border-[var(--color-muted)]/20 bg-[var(--color-base)] [transform-style:preserve-3d] will-change-transform"
        style={{ perspective: '1200px' }}
      >
        {/* Close button — data-cursor so the custom cursor reacts. */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          data-cursor
          data-cursor-label="Close"
          aria-label="Close project"
          className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center border border-[var(--color-muted)]/25 bg-[var(--color-base)]/80 text-2xl text-[var(--color-muted)] backdrop-blur transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text)]"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        {/* Internal scroll container — the detail page scrolls INSIDE here.
            transform-style + perspective enable the right-column 3D tilt. */}
        <div
          ref={scrollRef}
          className="grid min-w-0 flex-1 grid-cols-1 gap-y-12 overflow-x-hidden overflow-y-auto overscroll-contain px-6 py-16 sm:px-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-16 lg:py-20"
          style={{ perspective: '1200px' }}
        >
          {/* LEFT column — sticky within the panel. */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            {/* Small maroon accent mark (badge). */}
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
              Project {String(idx + 1).padStart(2, '0')} · {project.year}
            </p>

            <h2 className="break-words text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--color-text)] sm:text-6xl">
              {project.title}
            </h2>

            <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
              {description}
            </p>

            {/* Tag chips: year, venue, and up to 3 services. */}
            <ul className="mt-8 flex flex-wrap gap-3">
              <li className="border border-[var(--color-accent)]/40 px-4 py-2 text-sm text-[var(--color-text)]">
                {project.year}
              </li>
              <li className="border border-[var(--color-muted)]/25 px-4 py-2 text-sm text-[var(--color-muted)]">
                {project.venue}
              </li>
              {tagServices.map((service, i) => (
                <li
                  key={i}
                  className="border border-[var(--color-muted)]/25 px-4 py-2 text-sm text-[var(--color-muted)]"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT column — scrolling gallery + info + metrics. */}
          <div className="flex flex-col gap-12">
            {/* Gallery of curated visuals, each with a scroll-driven 3D tilt. */}
            {gallery.map((img, i) => (
              <div
                key={i}
                ref={registerImage}
                data-cursor
                data-cursor-label="View"
                className="relative w-full overflow-hidden bg-[var(--color-surface)] [transform-style:preserve-3d] will-change-transform"
                style={{ aspectRatio: '4 / 3' }}
              >
                <SafeImage
                  src={img.src}
                  alt={img.alt}
                  variant="full"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
                <span className="pointer-events-none absolute bottom-3 left-3 bg-[var(--color-base)]/85 px-3 py-1.5 font-mono text-xs text-[var(--color-muted)] backdrop-blur">
                  Visual {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            ))}

            {/* All services as chips. */}
            {project.services.length > 0 && (
              <div>
                <h3 className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  Services
                </h3>
                <ul className="mt-5 flex flex-wrap gap-3">
                  {project.services.map((service, i) => (
                    <li
                      key={i}
                      className="border border-[var(--color-muted)]/25 px-4 py-2 text-sm text-[var(--color-muted)]"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Public_Metric counts as 3D number cards (NO financial figures). */}
            {metrics.length > 0 && (
              <div>
                <h3 className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  By the Numbers
                </h3>
                <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {metrics.map((metric, i) => (
                    <NumberCard
                      key={i}
                      className="border-t border-[var(--color-muted)]/25 bg-[var(--color-surface)]/40 px-4 pb-5 pt-4"
                    >
                      <dt className="text-3xl font-semibold leading-none text-[var(--color-text)] sm:text-4xl">
                        {metric.value}
                      </dt>
                      <dd className="mt-2 text-sm uppercase tracking-wide text-[var(--color-muted)]">
                        {metric.label}
                      </dd>
                    </NumberCard>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
