"use client";

/**
 * InfinitePerspectiveSlider — a faithful recreation of the 21st.dev
 * "Infinite Perspective Slider" (hyperiux): a curved 3D perspective row of
 * project panels that scroll horizontally by wheel or drag, tilt on the Y axis
 * with velocity, loop infinitely, and reveal a per-card number / title / desc
 * via SplitText on hover.
 *
 * Adaptations for this project (documented per Step 1):
 *  - The built-in demo `defaultImages` array is EMPTY. This component is always
 *    fed the real `images` prop (from our `projects`), so the demo images are
 *    irrelevant. When `images` is empty it renders nothing but the scroll cue.
 *  - shadcn-style class names resolve to our CSS tokens via @theme aliases in
 *    app/globals.css (`bg-background`, `text-foreground`,
 *    `text-muted-foreground`). The one `bg-muted` fill is written directly as
 *    `bg-[var(--color-surface)]` so the card placeholder uses our surface token
 *    rather than the muted TEXT color.
 *  - Added an optional `onCardClick?(index)` prop, wired to each card image's
 *    onClick, so a parent (HeroSlider) can open a project-detail modal.
 *
 * Graceful degrade: if GSAP/SplitText fail to init, the cards still render as a
 * horizontally scrollable row of images with visible titles. Under
 * `prefers-reduced-motion` the perspective tilt and text animation are disabled
 * and the layout snaps to a static, readable row.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
} from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import SafeImage from "../SafeImage";

// Register once, browser-only. Registering twice is a no-op in GSAP; the guard
// keeps SSR from touching gsap plugin internals.
if (typeof window !== "undefined") {
  try {
    gsap.registerPlugin(SplitText);
  } catch {
    /* SplitText unavailable — the component degrades to a static row. */
  }
}

/** One panel of the slider. */
export interface InfinitePerspectiveSliderItem {
  src: string;
  number: string;
  title: string;
  desc: string;
}

export interface InfinitePerspectiveSliderProps {
  images: InfinitePerspectiveSliderItem[];
  cardWidth?: number;
  cardGap?: number;
  perspective?: number;
  scrollSpeed?: number;
  scrollLerp?: number;
  velocityLerp?: number;
  rotationSensitivity?: number;
  rotationDamp?: number;
  rotationLerp?: number;
  maxRotation?: number;
  scrollStopDelay?: number;
  textEnterDuration?: number;
  textLeaveDuration?: number;
  textStagger?: number;
  /** Called with the card index when a card image is clicked. */
  onCardClick?: (index: number) => void;
  className?: string;
}

/** Empty by design — the component is always fed the real `images` prop. */
const defaultImages: InfinitePerspectiveSliderItem[] = [];

/** SSR-safe reduced-motion check. */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A visibility gate: reports whether the element is on screen (via
 * IntersectionObserver) plus whether the document/tab is visible, so the rAF
 * loop can suspend when off-screen or backgrounded. SSR-safe.
 */
function createVisibilityGate(el: HTMLElement, onChange: (visible: boolean) => void) {
  if (typeof window === "undefined") {
    return { destroy() {} };
  }

  let inView = true;
  let docVisible = typeof document === "undefined" ? true : !document.hidden;

  const emit = () => onChange(inView && docVisible);

  let observer: IntersectionObserver | undefined;
  try {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView = entry.isIntersecting;
        }
        emit();
      },
      { threshold: 0 },
    );
    observer.observe(el);
  } catch {
    inView = true;
  }

  const onVisibility = () => {
    docVisible = !document.hidden;
    emit();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    destroy() {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}

/**
 * A rAF loop that can be suspended/resumed. `tick(dt)` receives the delta time
 * in seconds (clamped so a long background pause doesn't produce a huge jump).
 */
function createSuspendedRaf(tick: (dt: number) => void) {
  let rafId = 0;
  let running = false;
  let last = 0;

  const frame = (time: number) => {
    if (!running) return;
    const dt = last === 0 ? 1 / 60 : Math.min(0.1, (time - last) / 1000);
    last = time;
    try {
      tick(dt);
    } catch {
      /* keep the loop alive even if a frame throws */
    }
    rafId = requestAnimationFrame(frame);
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      last = 0;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    },
  };
}

function InfinitePerspectiveSliderComp({
  images = defaultImages,
  cardWidth = 320,
  cardGap = 40,
  perspective = 1600,
  scrollSpeed = 1,
  scrollLerp = 0.1,
  velocityLerp = 0.1,
  rotationSensitivity = 0.06,
  rotationDamp = 0.9,
  rotationLerp = 0.1,
  maxRotation = 40,
  scrollStopDelay = 120,
  textEnterDuration = 0.6,
  textLeaveDuration = 0.4,
  textStagger = 0.04,
  onCardClick,
  className,
}: InfinitePerspectiveSliderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const splitsRef = useRef<Array<{ number?: SplitText; title?: SplitText; desc?: SplitText }>>(
    [],
  );

  // Mutable animation state kept out of React render for the rAF loop.
  const state = useRef({
    scroll: 0, // target scroll (grows/shrinks with input)
    scrollCurrent: 0, // eased scroll actually applied
    velocity: 0, // raw per-frame delta
    velocitySmoothed: 0, // eased velocity → drives tilt
    rotation: 0, // current Y rotation applied to the track
    rotationTarget: 0,
    dragging: false,
    dragStartX: 0,
    dragStartScroll: 0,
    stopTimer: 0 as number,
    reduced: false,
  });

  const count = images.length;
  const step = cardWidth + cardGap;
  const totalWidth = step * count;

  // Stable per-card refs.
  const setCardRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      cardRefs.current[index] = node;
    },
    [],
  );

  /**
   * Position every card along the row and wrap it into the infinite loop so
   * cards leaving one edge reappear on the other. Applies the perspective tilt
   * (Y rotation) to the track and a subtle per-card depth so the row curves.
   */
  const positionCards = useCallback(() => {
    const s = state.current;
    const track = trackRef.current;
    const root = rootRef.current;
    if (!track || !root || count === 0 || totalWidth === 0) return;

    const viewport = root.clientWidth || totalWidth;
    const half = totalWidth / 2;

    for (let i = 0; i < count; i += 1) {
      const card = cardRefs.current[i];
      if (!card) continue;

      // Base position of the card, offset by the eased scroll.
      let x = i * step - s.scrollCurrent;

      // Wrap into [-half, half) so the row loops infinitely.
      x = ((x % totalWidth) + totalWidth + half) % totalWidth - half;

      // Curve: distance from center → subtle Z push + counter-rotation so the
      // row reads as a shallow arc rather than a flat strip.
      const dist = x + viewport / 2 - cardWidth / 2;
      const norm = viewport === 0 ? 0 : (dist - viewport / 2) / (viewport / 2);
      const z = -Math.abs(norm) * 200;
      const ry = s.reduced ? 0 : -norm * 8;

      card.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${ry}deg)`;
      card.style.zIndex = String(1000 - Math.round(Math.abs(norm) * 1000));
    }

    // Whole-track Y rotation from smoothed velocity (the signature tilt).
    if (!s.reduced) {
      track.style.transform = `rotateY(${s.rotation}deg)`;
    } else {
      track.style.transform = "none";
    }
  }, [count, step, totalWidth, cardWidth]);

  // Main animation loop + input wiring.
  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || count === 0) return;

    const s = state.current;
    s.reduced = prefersReducedMotion();

    // Reduced motion: snap to a static, readable row and skip the loop/tilt.
    if (s.reduced) {
      s.scroll = 0;
      s.scrollCurrent = 0;
      s.rotation = 0;
      positionCards();
      return;
    }

    const raf = createSuspendedRaf((dt) => {
      // Ease the applied scroll toward the target.
      const prev = s.scrollCurrent;
      s.scrollCurrent += (s.scroll - s.scrollCurrent) * scrollLerp;

      // Raw velocity (per-frame delta, normalized to 60fps) → smoothed.
      s.velocity = (s.scrollCurrent - prev) / (dt * 60 || 1);
      s.velocitySmoothed += (s.velocity - s.velocitySmoothed) * velocityLerp;

      // Rotation target from smoothed velocity, damped and clamped.
      s.rotationTarget = gsap.utils.clamp(
        -maxRotation,
        maxRotation,
        s.velocitySmoothed * rotationSensitivity,
      );
      s.rotationTarget *= rotationDamp;
      s.rotation += (s.rotationTarget - s.rotation) * rotationLerp;

      positionCards();
    });

    const gate = createVisibilityGate(root, (visible) => {
      if (visible) raf.start();
      else raf.stop();
    });
    raf.start();

    // ── Input: wheel ────────────────────────────────────────────────────
    const scheduleStop = () => {
      if (s.stopTimer) window.clearTimeout(s.stopTimer);
      s.stopTimer = window.setTimeout(() => {
        // Let velocity/tilt settle back to rest when scrolling stops.
        s.velocity = 0;
      }, scrollStopDelay);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      s.scroll += delta * scrollSpeed;
      scheduleStop();
    };
    root.addEventListener("wheel", onWheel, { passive: false });

    // ── Input: drag (pointer) ───────────────────────────────────────────
    const onPointerDown = (e: PointerEvent) => {
      s.dragging = true;
      s.dragStartX = e.clientX;
      s.dragStartScroll = s.scroll;
      root.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.dragStartX;
      s.scroll = s.dragStartScroll - dx * scrollSpeed;
      scheduleStop();
    };
    const onPointerUp = (e: PointerEvent) => {
      s.dragging = false;
      root.releasePointerCapture?.(e.pointerId);
    };
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);

    // ── Resize ──────────────────────────────────────────────────────────
    const onResize = () => positionCards();
    window.addEventListener("resize", onResize);

    return () => {
      raf.stop();
      gate.destroy();
      if (s.stopTimer) window.clearTimeout(s.stopTimer);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", onResize);
    };
  }, [
    count,
    positionCards,
    scrollLerp,
    velocityLerp,
    rotationSensitivity,
    rotationDamp,
    rotationLerp,
    maxRotation,
    scrollSpeed,
    scrollStopDelay,
  ]);

  // Initial layout as soon as the cards mount (before paint) so there is no
  // flash of stacked cards.
  useLayoutEffect(() => {
    positionCards();
  }, [positionCards]);

  // ── Per-card SplitText enter/leave on hover ──────────────────────────────
  const buildSplit = useCallback(
    (index: number) => {
      if (prefersReducedMotion()) return;
      const card = cardRefs.current[index];
      if (!card) return;
      // Already built for this card.
      if (splitsRef.current[index]) return;
      try {
        const numberEl = card.querySelector<HTMLElement>("[data-ips-number]");
        const titleEl = card.querySelector<HTMLElement>("[data-ips-title]");
        const descEl = card.querySelector<HTMLElement>("[data-ips-desc]");
        splitsRef.current[index] = {
          number: numberEl ? new SplitText(numberEl, { type: "chars" }) : undefined,
          title: titleEl ? new SplitText(titleEl, { type: "chars,words" }) : undefined,
          desc: descEl ? new SplitText(descEl, { type: "lines" }) : undefined,
        };
        const built = splitsRef.current[index];
        const targets = [
          ...(built.number?.chars ?? []),
          ...(built.title?.chars ?? []),
          ...(built.desc?.lines ?? []),
        ];
        gsap.set(targets, { yPercent: 120, opacity: 0 });
      } catch {
        /* SplitText failed — leave text statically visible. */
      }
    },
    [],
  );

  const handleEnter = useCallback(
    (index: number) => {
      if (prefersReducedMotion()) return;
      buildSplit(index);
      const built = splitsRef.current[index];
      if (!built) return;
      const targets = [
        ...(built.number?.chars ?? []),
        ...(built.title?.chars ?? []),
        ...(built.desc?.lines ?? []),
      ];
      if (targets.length === 0) return;
      gsap.to(targets, {
        yPercent: 0,
        opacity: 1,
        duration: textEnterDuration,
        ease: "power4.out",
        stagger: textStagger,
        overwrite: true,
      });
    },
    [buildSplit, textEnterDuration, textStagger],
  );

  const handleLeave = useCallback(
    (index: number) => {
      if (prefersReducedMotion()) return;
      const built = splitsRef.current[index];
      if (!built) return;
      const targets = [
        ...(built.number?.chars ?? []),
        ...(built.title?.chars ?? []),
        ...(built.desc?.lines ?? []),
      ];
      if (targets.length === 0) return;
      gsap.to(targets, {
        yPercent: 120,
        opacity: 0,
        duration: textLeaveDuration,
        ease: "power3.in",
        stagger: { each: textStagger, from: "end" },
        overwrite: true,
      });
    },
    [textLeaveDuration, textStagger],
  );

  // Revert splits on unmount so repeated mounts don't leak split DOM.
  useEffect(() => {
    const splits = splitsRef.current;
    return () => {
      splits.forEach((entry) => {
        try {
          entry?.number?.revert();
          entry?.title?.revert();
          entry?.desc?.revert();
        } catch {
          /* nothing to revert */
        }
      });
    };
  }, []);

  const rootStyle = useMemo<CSSProperties>(
    () => ({ perspective: `${perspective}px` }),
    [perspective],
  );

  return (
    <div
      ref={rootRef}
      className={
        "relative h-full w-full overflow-hidden bg-background text-foreground select-none touch-none " +
        (className ?? "")
      }
      style={rootStyle}
      aria-roledescription="carousel"
    >
      {/* The 3D track — transform-style preserve-3d so cards keep their depth. */}
      <div
        ref={trackRef}
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {images.map((item, index) => (
          <div
            key={index}
            ref={setCardRef(index)}
            className="absolute top-1/2 left-0 -translate-y-1/2"
            style={{
              width: `${cardWidth}px`,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
            onMouseEnter={() => handleEnter(index)}
            onMouseLeave={() => handleLeave(index)}
          >
            {/* Card image — the click target that opens the modal. */}
            <div
              role={onCardClick ? "button" : undefined}
              tabIndex={onCardClick ? 0 : undefined}
              aria-label={onCardClick ? `Open ${item.title}` : undefined}
              data-cursor
              data-cursor-label="View"
              onClick={() => onCardClick?.(index)}
              onKeyDown={(e) => {
                if (!onCardClick) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCardClick(index);
                }
              }}
              className="relative w-full overflow-hidden bg-[var(--color-surface)] cursor-pointer"
              style={{ aspectRatio: "3 / 4" }}
            >
              <SafeImage
                src={item.src}
                alt={item.title}
                variant="full"
                loading={index < 3 ? "eager" : "lazy"}
                draggable={false}
                className="pointer-events-none"
                fallbackColor="var(--color-surface)"
              />
            </div>

            {/* Number / title / desc — SplitText-revealed on hover. */}
            <div className="mt-4 flex flex-col gap-1 overflow-hidden">
              <span
                data-ips-number
                className="block font-mono text-sm text-[var(--color-accent)]"
              >
                {item.number}
              </span>
              <span
                data-ips-title
                className="font-display block text-lg font-semibold tracking-tight text-foreground"
              >
                {item.title}
              </span>
              <span
                data-ips-desc
                className="block text-sm text-muted-foreground"
              >
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll cue — hint that the row is draggable/scrollable. */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Drag / Scroll
      </div>
    </div>
  );
}

export default function InfinitePerspectiveSlider(props: InfinitePerspectiveSliderProps) {
  return <InfinitePerspectiveSliderComp {...props} />;
}
