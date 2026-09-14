'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { resolveImagePath } from '@/lib/format';
import type { Project } from '@/lib/data';
import SafeImage from './SafeImage';

/**
 * ProjectModal — a full-screen project-detail overlay (Step 4).
 *
 * When `project` is non-null it renders a fixed, dark-scrim overlay (above the
 * nav) with the project's title, `year · venue`, the services list, and the
 * Public_Metric counts (visitors / winners / staff / days). NO revenue / cost /
 * profit figures ever appear.
 *
 * Behavior:
 *  - Animated entrance via GSAP (scrim fade + panel fade/scale/slide). Under
 *    `prefers-reduced-motion` it appears instantly.
 *  - Closes on ESC, on scrim click (but not clicks inside the panel), and via
 *    the close button.
 *  - Body scroll is locked while open and restored on close.
 *  - Focus moves to the close button on open and is restored to the previously
 *    focused element on close (minimal focus trap on Tab).
 */

interface ProjectModalProps {
  project: Project | null;
  /** The project's index (for sequential image resolution). */
  index?: number | null;
  onClose: () => void;
}

/** Build the Public_Metric line, e.g. "40,000 visitors · 76 staff · 3 days". */
function metricParts(project: Project): string[] {
  const parts: string[] = [];
  if (project.visitors) parts.push(`${project.visitors} visitors`);
  if (project.winners) parts.push(`${project.winners} winners`);
  if (project.staff) parts.push(`${project.staff} staff`);
  if (project.days) parts.push(`${project.days} days`);
  return parts;
}

export default function ProjectModal({ project, index, onClose }: ProjectModalProps) {
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const open = project != null;

  // Entrance animation (before paint so there's no flash of final state).
  useLayoutEffect(() => {
    if (!open) return;
    const scrim = scrimRef.current;
    const panel = panelRef.current;
    if (!scrim || !panel) return;

    if (prefersReducedMotion()) {
      gsap.set(scrim, { autoAlpha: 1 });
      gsap.set(panel, { autoAlpha: 1, y: 0, scale: 1 });
      return;
    }

    try {
      const tl = gsap.timeline();
      tl.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
      tl.fromTo(
        panel,
        { autoAlpha: 0, y: 24, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'power4.out' },
        '-=0.15',
      );
      return () => {
        tl.kill();
      };
    } catch {
      // On failure make sure the modal is fully visible.
      gsap.set([scrim, panel], { autoAlpha: 1, y: 0, scale: 1 });
    }
  }, [open]);

  // Body scroll lock, ESC handler, focus management.
  useEffect(() => {
    if (!open) return;

    lastFocused.current = (document.activeElement as HTMLElement | null) ?? null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the modal.
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      // Minimal focus trap: keep Tab within the panel.
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      // Restore focus to whatever opened the modal.
      lastFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !project) return null;

  const src = resolveImagePath(project, index ?? 0);
  const metrics = metricParts(project);

  return (
    <div
      ref={scrimRef}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onClick={(e) => {
        // Close only when the scrim itself is clicked, not the panel.
        if (e.target === scrimRef.current) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-6 py-16 sm:px-8"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-base) 95%, transparent)' }}
    >
      <div
        ref={panelRef}
        className="relative mx-auto w-full max-w-5xl bg-[var(--color-base)]"
      >
        {/* Close button — data-cursor so the custom cursor reacts. */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          data-cursor
          data-cursor-label="Close"
          aria-label="Close project"
          className="absolute right-0 top-0 z-10 flex h-12 w-12 items-center justify-center text-2xl text-[var(--color-muted)] transition-colors hover:text-[var(--color-accent)]"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        {/* Hero image. */}
        <div className="w-full overflow-hidden bg-[var(--color-surface)]" style={{ aspectRatio: '16 / 9' }}>
          <SafeImage src={src} alt={project.title} variant="full" />
        </div>

        {/* Detail content. */}
        <div className="pt-10">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
            {project.year} · {project.venue}
          </p>

          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--color-text)] sm:text-6xl">
            {project.title}
          </h2>

          {/* Services as chips. */}
          {project.services.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-3">
              {project.services.map((service, i) => (
                <li
                  key={i}
                  className="border border-[var(--color-muted)]/25 px-4 py-2 text-sm text-[var(--color-muted)]"
                >
                  {service}
                </li>
              ))}
            </ul>
          )}

          {/* Public_Metric counts (NO financial figures). */}
          {metrics.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {metrics.map((metric, i) => {
                const [value, ...rest] = metric.split(' ');
                return (
                  <div key={i} className="border-t border-[var(--color-muted)]/25 pt-4">
                    <dt className="text-3xl font-semibold text-[var(--color-text)] sm:text-4xl">
                      {value}
                    </dt>
                    <dd className="mt-1 text-sm uppercase tracking-wide text-[var(--color-muted)]">
                      {rest.join(' ')}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
