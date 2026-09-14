'use client';

import { useCallback, useEffect, useRef } from 'react';
import { contact } from '@/lib/data';
import { buildMailto } from '@/lib/format';
import { gsap, ScrollTrigger, registerScrollTrigger } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { useReveal } from '@/lib/reveal';
import SafeImage from './SafeImage';

const ENDING_PLANES = [
  {
    src: '/work/img-001.png',
    className: 'left-[-4%] top-[15%] w-[34vw] sm:left-[2%] sm:w-[22vw]',
    transform: 'translateZ(-170px) rotateY(28deg) rotateZ(-5deg)',
  },
  {
    src: '/work/img-004.png',
    className: 'right-[-5%] top-[12%] w-[32vw] sm:right-[3%] sm:w-[21vw]',
    transform: 'translateZ(-120px) rotateY(-30deg) rotateZ(4deg)',
  },
  {
    src: '/work/img-007.png',
    className: 'bottom-[7%] left-[5%] w-[30vw] sm:left-[16%] sm:w-[18vw]',
    transform: 'translateZ(-80px) rotateY(20deg) rotateZ(6deg)',
  },
  {
    src: '/work/img-010.png',
    className: 'bottom-[5%] right-[3%] w-[31vw] sm:right-[15%] sm:w-[19vw]',
    transform: 'translateZ(-60px) rotateY(-22deg) rotateZ(-6deg)',
  },
  {
    src: '/work/img-012.png',
    className: 'left-1/2 top-[4%] hidden w-[16vw] md:block',
    transform: 'translateX(-50%) translateZ(-230px) rotateX(8deg)',
  },
] as const;

interface LenisLike {
  scrollTo: (
    target: HTMLElement | number,
    options?: {
      duration?: number;
      force?: boolean;
      immediate?: boolean;
      offset?: number;
    },
  ) => void;
}

function scrollToTarget(target: HTMLElement | number) {
  const reduced = prefersReducedMotion();
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
  if (lenis?.scrollTo) {
    try {
      lenis.scrollTo(target, {
        duration: reduced ? 0 : 0.9,
        force: true,
        immediate: reduced,
        offset: 0,
      });
      return;
    } catch {
      /* fall through to native scrolling */
    }
  }

  const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior });
  } else {
    target.scrollIntoView({ behavior, block: 'start' });
  }
}

/** Premium final presentation screen with a one-time, downward-only settle. */
export default function ThankYou() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduced = prefersReducedMotion();

  const onReveal = useCallback((element: Element) => {
    try {
      const planes = element.querySelectorAll<HTMLElement>('[data-thank-plane]');
      const copy = element.querySelectorAll<HTMLElement>('[data-thank-copy]');
      const timeline = gsap.timeline();

      timeline.fromTo(
        planes,
        { scale: 0.88, y: 56 },
        {
          scale: 1,
          y: 0,
          duration: 1.15,
          ease: 'power4.out',
          stagger: 0.08,
        },
      );
      timeline.fromTo(
        copy,
        { y: 36, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.85,
          ease: 'power4.out',
          stagger: 0.1,
        },
        '-=0.72',
      );
    } catch {
      try {
        gsap.set(element.querySelectorAll('[data-thank-plane], [data-thank-copy]'), {
          clearProps: 'all',
        });
      } catch {
        /* final DOM state is already visible */
      }
    }
  }, []);

  const revealRef = useReveal({
    start: 'top 76%',
    once: true,
    disabled: reduced,
    onReveal,
  });

  // When downward scrolling comes to rest inside the Contact→ending handoff,
  // settle this screen to the viewport top once. Upward scrolling always wins.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) return;

    let trigger: ScrollTrigger | undefined;
    let settleTimer = 0;
    let armed = false;
    let settled = false;

    const cancelSettle = () => {
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = 0;
    };

    const scheduleSettle = () => {
      cancelSettle();
      settleTimer = window.setTimeout(() => {
        if (!armed || settled) return;
        const rect = section.getBoundingClientRect();
        if (rect.top <= 2 || rect.top >= window.innerHeight * 0.82) return;
        settled = true;
        armed = false;
        scrollToTarget(section);
      }, 220);
    };

    try {
      registerScrollTrigger();
      trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        end: 'top top',
        onEnter: (self) => {
          if (self.direction > 0 && !settled) {
            armed = true;
            scheduleSettle();
          }
        },
        onUpdate: (self) => {
          if (self.direction > 0 && armed && !settled) {
            scheduleSettle();
          } else if (self.direction < 0) {
            armed = false;
            cancelSettle();
          }
        },
        onLeaveBack: () => {
          armed = false;
          cancelSettle();
        },
        onLeave: () => {
          armed = false;
          cancelSettle();
        },
      });
    } catch {
      /* native scrolling remains unchanged */
    }

    return () => {
      cancelSettle();
      trigger?.kill();
    };
  }, []);

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node;
      revealRef(node);
    },
    [revealRef],
  );

  return (
    <section
      id="thank-you"
      ref={setRefs}
      className="relative isolate flex min-h-[100dvh] w-full min-w-0 max-w-full items-center justify-center overflow-hidden bg-[var(--qe-base)] px-5 py-20 [perspective:1400px] sm:px-8 lg:px-12"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--qe-accent)_18%,transparent),transparent_56%)]"
      />

      {/* Local project imagery forms a restrained five-plane coverflow orbit.
          Plane classes are literal strings above so Tailwind discovers them. */}
      <div aria-hidden="true" className="absolute inset-0 [transform-style:preserve-3d]">
        {ENDING_PLANES.map((plane, index) => (
          <div
            key={`image-${plane.src}`}
            data-thank-plane
            className={`absolute aspect-[4/5] overflow-hidden border border-[var(--qe-muted)]/20 bg-[var(--qe-surface)] ${plane.className} ${index === 4 ? 'opacity-35' : 'opacity-55'} [transform-style:preserve-3d]`}
            style={{ transform: plane.transform }}
          >
            <SafeImage
              src={plane.src}
              alt=""
              variant="full"
              sizes="(max-width: 640px) 34vw, 22vw"
              loading="lazy"
              fallbackColor="var(--qe-surface)"
            />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--qe-base)_16%,transparent),color-mix(in_srgb,var(--qe-base)_62%,transparent))]" />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl min-w-0 flex-col items-center text-center [transform:translateZ(80px)] [transform-style:preserve-3d]">
        <p
          data-thank-copy
          className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-[var(--qe-accent)]"
        >
          End of presentation · Doha, Qatar
        </p>

        <h2
          data-thank-copy
          className="mt-7 max-w-full break-words font-display text-[clamp(4.25rem,15vw,11rem)] font-semibold leading-[0.78] tracking-[-0.045em] text-[var(--qe-text)] [text-shadow:0_2px_28px_var(--qe-base)]"
        >
          Thank You.
        </h2>

        <p
          data-thank-copy
          className="mt-8 max-w-2xl bg-[color-mix(in_srgb,var(--qe-base)_78%,transparent)] px-4 py-2 text-base leading-relaxed text-[var(--qe-text)] backdrop-blur-sm sm:text-xl"
        >
          The next memorable gathering starts with one clear conversation.
        </p>

        <div data-thank-copy className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <a
            href={buildMailto(contact.email)}
            className="inline-flex min-h-14 items-center border border-[var(--qe-accent)] bg-[var(--qe-accent)] px-7 py-3 text-base font-semibold text-[var(--qe-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--qe-accent)_86%,white)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
          >
            Start the next activation
          </a>
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              scrollToTarget(0);
            }}
            className="inline-flex min-h-14 items-center gap-3 border-b border-[var(--qe-accent)] px-2 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--qe-text)] transition-colors hover:text-[var(--qe-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
          >
            Return to the beginning <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </section>
  );
}
