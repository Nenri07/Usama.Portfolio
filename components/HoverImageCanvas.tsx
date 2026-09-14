'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createHoverImageRenderer, type HoverImageController } from '@/lib/webgl';
import { HoverImageContext, type HoverImageValue } from './HoverImageContext';

/**
 * HoverImageCanvas — the single, shared full-viewport WebGL preview canvas
 * (Req 10.2, 10.6, 10.7, 10.9, 10.10).
 *
 * Mounted ONCE near the layout root (inside SmoothScrollProvider), it:
 *  - renders one fixed, full-viewport, `pointer-events:none` `<canvas>` behind
 *    interactive content and below the custom cursor (z-index 30 < cursor's
 *    9999), so it never blocks clicks (Req 10.2);
 *  - defers WebGL setup with `requestAnimationFrame` so it does not block the
 *    first paint of the Project_List text (Req 10.10);
 *  - calls {@link createHoverImageRenderer}; if that returns `null` (no WebGL /
 *    init failure) the context value stays `null` and consumers skip all canvas
 *    wiring, standing alone as readable text (Req 10.7);
 *  - attaches a global `pointermove` listener that feeds the controller so the
 *    preview follows the cursor (Req 10.3);
 *  - disposes the controller (freeing the GL context + GPU resources) on
 *    unmount (Req 10.9).
 *
 * It is a Context provider: it wraps `children` so the whole app shares one
 * canvas. The canvas element is always rendered (so its ref exists) and is
 * harmless when WebGL is unavailable (it just stays transparent/unused).
 */
export default function HoverImageCanvas({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [value, setValue] = useState<HoverImageValue | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let controller: HoverImageController | null = null;
    let rafId = 0;
    let onPointerMove: ((e: PointerEvent) => void) | null = null;

    // Defer setup to the next frame so WebGL init doesn't block first paint
    // of the Project_List text (Req 10.10).
    rafId = requestAnimationFrame(() => {
      try {
        controller = createHoverImageRenderer(canvas);
      } catch {
        controller = null;
      }

      // No WebGL / init failed → leave context null; consumers degrade to text.
      if (!controller) return;

      const active = controller;

      onPointerMove = (e: PointerEvent) => {
        active.setPointer(e.clientX, e.clientY);
      };
      window.addEventListener('pointermove', onPointerMove);

      // Expose only the minimal slice through context (Req 10.2).
      setValue({
        show: (src: string) => active.show(src),
        hide: () => active.hide(),
        setPointer: (x: number, y: number) => active.setPointer(x, y),
      });
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (onPointerMove) window.removeEventListener('pointermove', onPointerMove);
      controller?.dispose();
      setValue(null);
    };
  }, []);

  return (
    <HoverImageContext.Provider value={value}>
      {/*
        Single shared canvas: fixed + full-viewport, non-interactive so it never
        blocks clicks, and below the custom cursor (z 9999) but above section
        content (Req 10.2).
      */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 30,
        }}
      />
      {children}
    </HoverImageContext.Provider>
  );
}
