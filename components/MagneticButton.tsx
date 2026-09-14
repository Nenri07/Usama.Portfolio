"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { magnetic } from "@/lib/motion";

/**
 * Magnetic hover wrapper (Req 9.4, 9.5, 9.8).
 *
 * Wraps its children in an inline-block element and applies `magnetic` to that
 * element in an effect (cleaned up on unmount). The wrapper never swallows
 * clicks, so the child stays fully interactive. Under reduced motion / SSR the
 * `magnetic` utility no-ops, so the child renders static and clickable.
 */
export default function MagneticButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const cleanup = magnetic(el);
    return cleanup;
  }, []);

  return (
    <span ref={ref} className={className} style={{ display: "inline-block" }}>
      {children}
    </span>
  );
}
