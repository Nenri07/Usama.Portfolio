'use client';

import { useMemo } from 'react';
import InfinitePerspectiveSlider, {
  type InfinitePerspectiveSliderItem,
} from './ui/infinite-perspective-slider';
import Nav from './Nav';
import { projects } from '@/lib/data';
import { resolveImagePath } from '@/lib/format';

/**
 * HeroSlider — the full-screen hero built on the perspective slider (Step 2).
 *
 * Feeds our real `projects` into `InfinitePerspectiveSlider` and overlays the
 * jesperlandberg-style corner labels plus the fixed <Nav>. Clicking a card
 * calls `onCardClick(index)` so the parent (HomeClient) can open the project
 * modal for `projects[index]`.
 *
 * The slider itself handles drag/wheel scroll, the velocity tilt, per-card
 * SplitText reveal, and reduced-motion degradation.
 */

interface HeroSliderProps {
  onCardClick: (index: number) => void;
}

export default function HeroSlider({ onCardClick }: HeroSliderProps) {
  const items = useMemo<InfinitePerspectiveSliderItem[]>(
    () =>
      projects.map((project, i) => ({
        src: resolveImagePath(project, i),
        number: String(i + 1).padStart(2, '0'),
        title: project.title,
        desc: `${project.year} · ${project.venue}`,
      })),
    [],
  );

  return (
    <section id="top" className="relative h-screen w-full overflow-hidden bg-base">
      {/* Fixed top navigation overlay. */}
      <Nav />

      {/* The curved 3D perspective slider fills the hero. */}
      <div className="absolute inset-0">
        <InfinitePerspectiveSlider images={items} onCardClick={onCardClick} />
      </div>

      {/* ── Corner labels (reference layout) ─────────────────────────────
          Kept minimal; maroon used sparingly. pointer-events-none so they
          never block the slider drag; the nav sits above them. */}
      <div className="pointer-events-none absolute inset-0 z-30">
        {/* Bottom-left: featured / full index cue. */}
        <div className="absolute bottom-6 left-6 sm:left-8 lg:left-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Featured{' '}
            <span className="text-[var(--color-accent)]">/ Full</span>
          </p>
        </div>

        {/* Bottom-right: contact cue (nav has the real link). */}
        <div className="absolute bottom-6 right-6 sm:right-8 lg:right-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Contact
          </p>
        </div>
      </div>
    </section>
  );
}
