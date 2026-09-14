"use client";

import { useEffect } from "react";
import { initCursor } from "@/lib/motion";

/**
 * Custom pointer element (Req 9.4, 9.6, 9.8).
 *
 * Mounts `initCursor` in an effect (cleaned up on unmount). The cursor node is
 * created imperatively by `initCursor`, so this component renders nothing —
 * which keeps it SSR-safe. Under reduced motion or on coarse/touch pointers
 * `initCursor` no-ops and the native cursor remains.
 */
export default function CustomCursor() {
  useEffect(() => {
    const cleanup = initCursor();
    return cleanup;
  }, []);

  return null;
}
