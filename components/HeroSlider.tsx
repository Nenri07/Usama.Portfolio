'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { animate, stagger } from 'animejs';
import InfinitePerspectiveSlider, {
  type InfinitePerspectiveSliderItem,
} from './ui/infinite-perspective-slider';
import Nav from './Nav';
import HeroAmbient from './HeroAmbient';
import { heroCards } from '@/lib/data';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * HeroSlider â€” the full-screen hero built on the perspective slider.
 *
 * Feeds the mixed `heroCards` deck into `InfinitePerspectiveSlider`: the 16
 * Qasim EVENT cards (each backed by its OWN `/qasim/*` photography) followed by
 * every Puro CLEANING engagement (backed by `/puro/work/*` photography). The
 * two capabilities never share imagery. Every card shows a visible capability
 * tag ("Events & Hospitality" vs "Cleaning & Facilities") in its description,
 * and clicking routes to the correct detail â€” the EVENT gallery for an event
 * card, the CONTRACT modal for a cleaning card â€” via `onEventClick` /
 * `onContractClick`.
 *
 * The slider is a CSS-transform carousel (each card is a positioned node with a
 * single transform), so the full deck renders without jank â€” no per-frame
 * layout, and the rAF loop suspends when the hero is off-screen or the tab is
 * hidden. It handles drag/wheel scroll, the velocity tilt, per-card SplitText
 * reveal, and reduced-motion degradation internally.
 */

interface HeroSliderProps {
  /** Open the EVENT detail for `qasimProjects[index]`. */
  onEventClick: (index: number) => void;
  /** Open the CONTRACT detail for `contractCards[index]`. */
  onContractClick: (index: number) => void;
}

export default function HeroSlider({ onEventClick, onContractClick }: HeroSliderProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const items = useMemo<InfinitePerspectiveSliderItem[]>(
    () =>
      heroCards.map((card, i) => ({
        src: card.image.src,
        number: String(i + 1).padStart(2, '0'),
        title: card.title,
        // Capability tag leads the description so every card is unambiguous.
        desc: `${card.capability} Â· ${card.subtitle}`,
      })),
    [],
  );

  const handleCardClick = useCallback(
    (i: number) => {
      const card = heroCards[i];
      if (!card) return;
      if (card.kind === 'event') onEventClick(card.index);
      else onContractClick(card.index);
    },
    [onEventClick, onContractClick],
  );

  // Staggered entrance for the decorative corner labels. Enhancement only:
  // the text is fully readable at rest; if animejs fails or reduced motion is
  // on, the labels simply stay in place, visible.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || prefersReducedMotion()) return;
    const targets = overlay.querySelectorAll('[data-hero-reveal]');
    if (targets.length === 0) return;
    try {
      animate(targets, {
        opacity: [0, 1],
        translateY: [22, 0],
        filter: ['blur(6px)', 'blur(0px)'],
        duration: 1100,
        delay: stagger(140, { start: 350 }),
        ease: 'out(3)',
      });
    } catch {
      // Leave labels in their readable resting state.
    }
  }, []);

  return (
    <section
      id="top"
      data-deck-section
      className="relative h-screen w-full overflow-hidden bg-base"
    >
      {/* Fixed top navigation overlay. */}
      <Nav />

      {/* Decorative ambient depth + curated collage behind the slider. */}
      <HeroAmbient />

      {/* The curved 3D perspective slider fills the hero. */}
      <div className="absolute inset-0 z-10">
        <InfinitePerspectiveSlider images={items} onCardClick={handleCardClick} />
      </div>

      {/* â”€â”€ Corner labels (reference layout) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          Kept minimal; maroon used sparingly. pointer-events-none so they
          never block the slider drag; the nav sits above them. */}
      <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-30">
        {/* Top-left editorial kicker. */}
        <div className="absolute left-6 top-24 max-w-xs sm:left-8 sm:top-28 lg:left-12">
          <p
            data-hero-reveal
            className="text-secondary font-mono text-[0.7rem] uppercase tracking-[0.24em]"
          >
            Cleaning Â· Hospitality Â· FaÃ§ade
          </p>
          <p
            data-hero-reveal
            className="text-primary mt-3 font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"
          >
            {heroCards.length} projects &amp; engagements across Qatar.
          </p>
        </div>

        {/* Bottom-left: full client index cue. */}
        <div className="absolute bottom-6 left-6 sm:left-8 lg:left-12">
          <p
            data-hero-reveal
            className="text-secondary text-xs font-semibold uppercase tracking-[0.2em]"
          >
            Every client <span className="text-accent">/ tap a card</span>
          </p>
        </div>

        {/* Bottom-right: contact cue (nav has the real link). */}
        <div className="absolute bottom-6 right-6 sm:right-8 lg:right-12">
          <p
            data-hero-reveal
            className="text-secondary text-xs font-semibold uppercase tracking-[0.2em]"
          >
            Contact
          </p>
        </div>
      </div>
    </section>
  );
}
