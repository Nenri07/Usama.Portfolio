'use client';

import { createContext, useContext } from 'react';

/**
 * The minimal, typed slice of the WebGL {@link HoverImageController} exposed to
 * consumers (WorkList / ProjectRow) via React Context (Req 10.2, 10.5, 10.6).
 *
 * `setPointer` is included so consumers *could* forward pointer moves, but in
 * practice the pointer is driven globally by `HoverImageCanvas` itself, so
 * WorkList only needs `show`/`hide`.
 */
export interface HoverImageValue {
  /** Warp/fade the shared preview to the image at `src` (Req 10.4, 10.5). */
  show(src: string): void;
  /** Fade the shared preview out to hidden (Req 10.6). */
  hide(): void;
  /** Feed the latest pointer position (pixels) to the smoothed follow (Req 10.3). */
  setPointer(x: number, y: number): void;
}

/**
 * Context carrying the shared hover-image controller, or `null` when WebGL is
 * unavailable / init failed. Consumers treat `null` as "no canvas wiring" and
 * fall back to the readable text list (Req 10.7).
 */
export const HoverImageContext = createContext<HoverImageValue | null>(null);

/**
 * Read the shared hover-image controller. Returns `null` when no WebGL preview
 * is active (no provider value), so callers can gate their canvas calls.
 */
export function useHoverImage(): HoverImageValue | null {
  return useContext(HoverImageContext);
}
