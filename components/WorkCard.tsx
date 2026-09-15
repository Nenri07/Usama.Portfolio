'use client';

import { useCallback } from 'react';
import { gsap } from '@/lib/gsapSetup';
import clsx from 'clsx';
import SafeImage from './SafeImage';
import { useReveal } from '@/lib/reveal';
import { resolveImagePath, staggerDelay } from '@/lib/format';
import { prefersReducedMotion } from '@/lib/motion';
import type { Project } from '@/lib/data';

const BASE_DELAY = 100;
const REVEAL_DURATION = 0.6;

export interface WorkCardProps {
  project: Project;
  index: number;
  className?: string;
}

/** Legacy grid presentation kept compatible with the source-backed work model. */
export default function WorkCard({ project, index, className }: WorkCardProps) {
  const reduced = prefersReducedMotion();

  const onReveal = useCallback(
    (element: Element) => {
      const node = element as HTMLElement;
      try {
        gsap.set(node, { clipPath: 'inset(100% 0 0 0)' });
        gsap.to(node, {
          clipPath: 'inset(0 0 0 0)',
          duration: REVEAL_DURATION,
          delay: staggerDelay(index, BASE_DELAY) / 1000,
          ease: 'power3.out',
        });
      } catch {
        node.style.clipPath = 'inset(0 0 0 0)';
      }
    },
    [index],
  );

  const revealRef = useReveal({
    start: 'top 90%',
    disabled: reduced,
    onReveal,
  });

  return (
    <article
      ref={revealRef}
      className={clsx(
        'group relative isolate overflow-hidden rounded-none bg-[var(--color-surface)]',
        className,
      )}
      style={{ clipPath: 'inset(0 0 0 0)' }}
    >
      <div className="absolute inset-0 -z-10 transition-transform duration-300 ease-out group-hover:scale-105">
        <SafeImage
          src={resolveImagePath(project, index)}
          alt={project.title}
          variant="full"
          sizes="(max-width: 768px) 100vw, 50vw"
          fallbackColor="var(--color-surface)"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,14,26,0.15) 0%, rgba(10,14,26,0.9) 100%)',
          }}
        />
      </div>

      <div className="flex h-full w-full flex-col justify-end p-4 sm:p-5">
        <h3 className="text-lg font-semibold leading-tight text-[var(--color-text)] sm:text-xl">
          {project.title}
        </h3>
        <span className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {project.category}
        </span>

        <div
          className={clsx(
            'mt-2 flex max-h-0 translate-y-2 flex-col gap-2 overflow-hidden opacity-0',
            'transition-all duration-300 ease-out',
            'group-hover:max-h-72 group-hover:translate-y-0 group-hover:opacity-100',
          )}
        >
          <span className="text-sm text-[var(--color-text)]">
            {project.client ? `${project.client} · ` : ''}{project.location}
          </span>
          <ul className="flex flex-wrap gap-1.5">
            {project.services.map((service) => (
              <li
                key={service}
                className="border border-[var(--color-muted)]/40 px-2 py-0.5 text-xs text-[var(--color-muted)]"
              >
                {service}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
