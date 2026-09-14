'use client';

import { useCallback, useState, type CSSProperties } from 'react';
import clsx from 'clsx';
import { gsap } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { useReveal } from '@/lib/reveal';
import { divisions, type TeamDivision } from '@/lib/data';
import CrewModal from './CrewModal';
import SafeImage from './SafeImage';

const PILE_TRANSFORMS = [
  {
    rest: 'translate3d(-68%, -48%, 10px) rotateZ(-8deg) rotateY(5deg)',
    hover: 'translate3d(-71%, -50%, 26px) rotateZ(-10deg) rotateY(7deg)',
  },
  {
    rest: 'translate3d(-48%, -55%, 32px) rotateZ(2deg) rotateY(-3deg)',
    hover: 'translate3d(-48%, -59%, 54px) rotateZ(1deg) rotateY(-4deg)',
  },
  {
    rest: 'translate3d(-28%, -43%, 18px) rotateZ(8deg) rotateY(-6deg)',
    hover: 'translate3d(-25%, -45%, 38px) rotateZ(10deg) rotateY(-8deg)',
  },
  {
    rest: 'translate3d(-48%, -35%, 44px) rotateZ(-2deg) rotateX(2deg)',
    hover: 'translate3d(-48%, -31%, 66px) rotateZ(-1deg) rotateX(3deg)',
  },
] as const;

type PileStyle = CSSProperties & {
  '--pile-rest': string;
  '--pile-hover': string;
};

interface CrewRowProps {
  division: TeamDivision;
  index: number;
  onSelect: (division: TeamDivision) => void;
}

function CrewRow({ division, index, onSelect }: CrewRowProps) {
  const reduced = prefersReducedMotion();
  const reverse = index % 2 === 1;
  const previewImages = division.images.slice(0, 4);

  const onReveal = useCallback((element: Element) => {
    try {
      gsap.fromTo(
        element,
        { y: 48, rotationX: -7, transformPerspective: 1200 },
        { y: 0, rotationX: 0, duration: 0.85, ease: 'power4.out' },
      );
    } catch {
      /* default final state remains visible */
    }
  }, []);

  const revealRef = useReveal({
    start: 'top 82%',
    once: true,
    disabled: reduced,
    onReveal,
  });

  return (
    <article
      ref={revealRef}
      className="grid min-w-0 items-center gap-10 border-t border-[var(--color-muted)]/20 py-14 [transform-style:preserve-3d] sm:py-20 lg:grid-cols-2 lg:gap-16"
    >
      <div className={clsx('min-w-0', reverse && 'lg:order-2')}>
        <div className="crew-pile group relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden [perspective:1200px]">
          <div
            aria-hidden="true"
            className="absolute inset-[12%] border border-[var(--color-accent)]/25"
          />
          {previewImages.map((src, imageIndex) => {
            const transforms = PILE_TRANSFORMS[imageIndex];
            const style: PileStyle = {
              '--pile-rest': transforms.rest,
              '--pile-hover': transforms.hover,
              zIndex: imageIndex + 1,
            };

            return (
              <div
                key={src}
                className="crew-pile-card absolute left-1/2 top-1/2 aspect-[4/5] w-[54%] overflow-hidden border border-[var(--color-muted)]/25 bg-[var(--color-surface)] [transform-style:preserve-3d]"
                style={style}
              >
                <SafeImage
                  src={src}
                  alt=""
                  variant="full"
                  fallbackColor="var(--color-surface)"
                  loading="lazy"
                />
              </div>
            );
          })}
          <span className="absolute bottom-3 right-3 z-10 bg-[var(--color-base)]/90 px-3 py-2 font-mono text-xs text-[var(--color-muted)] backdrop-blur">
            {String(division.images.length).padStart(2, '0')} images
          </span>
        </div>
      </div>

      <div className={clsx('min-w-0', reverse && 'lg:order-1')}>
        <p className="font-mono text-sm text-[var(--color-accent)]">
          Division {String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="mt-4 break-words text-3xl font-semibold leading-tight text-[var(--color-text)] sm:text-5xl">
          {division.name}
        </h3>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
          {division.blurb}
        </p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--color-muted)]">
          {division.management}
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {division.capabilities.map((capability) => (
            <li
              key={capability}
              className="border border-[var(--color-muted)]/25 px-3 py-1.5 text-sm text-[var(--color-muted)]"
            >
              {capability}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onSelect(division)}
          aria-haspopup="dialog"
          className="mt-8 inline-flex min-h-12 items-center gap-4 border-b border-[var(--color-accent)] pb-2 text-base font-semibold text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-text)]"
        >
          View crew
          <span aria-hidden="true" className="text-[var(--color-accent)]">↗</span>
          <span className="sr-only">— {division.images.length} photographs</span>
        </button>
      </div>
    </article>
  );
}

export default function TeamShowcase() {
  const [selectedDivision, setSelectedDivision] = useState<TeamDivision | null>(null);

  const openDivision = useCallback((division: TeamDivision) => {
    setSelectedDivision(division);
  }, []);

  const closeDivision = useCallback(() => {
    setSelectedDivision(null);
  }, []);

  return (
    <>
      <div className="min-w-0">
        {divisions.map((division, index) => (
          <CrewRow
            key={division.slug}
            division={division}
            index={index}
            onSelect={openDivision}
          />
        ))}
      </div>

      {selectedDivision ? (
        <CrewModal division={selectedDivision} onClose={closeDivision} />
      ) : null}
    </>
  );
}
