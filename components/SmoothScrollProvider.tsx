"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Wraps the app in a Lenis smooth-scroll lifecycle (Req 7.4).
 *
 * Lenis is instantiated inside an effect (browser-only), driven by a
 * requestAnimationFrame loop, and torn down on unmount. The init is wrapped in
 * try/catch so that if Lenis fails to construct, native browser scrolling
 * remains fully functional.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    let lenis: Lenis | undefined;
    let raf = 0;

    try {
      lenis = new Lenis({ smoothWheel: true });

      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };

      raf = requestAnimationFrame(loop);
    } catch {
      // Lenis failed to init — native scrolling stays intact (Req 7.4).
    }

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
