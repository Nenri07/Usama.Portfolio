"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, registerScrollTrigger } from "@/lib/gsapSetup";

/**
 * Smooth-scroll + ScrollTrigger integration (Req 8.4, 9.2, 9.7).
 *
 * Lenis provides smooth scroll and DRIVES ScrollTrigger: Lenis scroll events
 * call `ScrollTrigger.update`, and the GSAP ticker advances Lenis (with lag
 * smoothing disabled) so a single clock runs both smooth scroll and
 * scroll-triggered animation — no competing rAF loops.
 *
 * The whole init is wrapped in try/catch: if GSAP or Lenis fails to construct,
 * native browser scrolling remains functional and every animated element stays
 * in its final visible state (Req 9.7).
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    let lenis: Lenis | undefined;
    let tick: ((time: number) => void) | undefined;

    try {
      registerScrollTrigger();

      lenis = new Lenis({ smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);

      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    } catch {
      // GSAP/Lenis failed to init — native scrolling + final visible state
      // remain intact (Req 9.7).
    }

    return () => {
      if (tick) {
        gsap.ticker.remove(tick);
      }
      lenis?.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <>{children}</>;
}
