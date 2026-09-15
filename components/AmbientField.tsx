'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { hasWebGL, prefersReducedMotion } from '@/lib/motion';

/**
 * AmbientField — a self-contained, decorative WebGL depth layer that sits
 * BEHIND a section's content to add a slow, premium sense of depth (the
 * "second 3D moment" beyond the hero).
 *
 * It renders a single full-section fragment-shader plane (ogl {@link Triangle})
 * drawing slow-drifting maroon/light radial fields — no textures, no user data,
 * cheap to run. It is purely decorative: `aria-hidden`, `pointer-events:none`,
 * and it never gates any text.
 *
 * Safety / performance:
 *   • Feature-gated on {@link hasWebGL}; if WebGL is unavailable it renders
 *     nothing (the section keeps its normal solid background).
 *   • DPR is capped at 1.5 (this is a soft blurred field — extra resolution is
 *     wasted) to bound fill cost.
 *   • The render loop PAUSES when the section scrolls out of view
 *     (IntersectionObserver) and when the tab is hidden, so it never burns GPU
 *     off-screen.
 *   • On unmount it cancels the loop, drops listeners, and calls
 *     `WEBGL_lose_context` so the GL context is freed (no leaks).
 *   • Disabled entirely under reduced motion (renders nothing).
 */
export default function AmbientField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion() || !hasWebGL()) return;

    let disposed = false;
    let rafId = 0;
    let visible = true;
    let running = false;
    let renderer: Renderer | null = null;
    let gl: Renderer['gl'] | null = null;

    try {
      const dpr = Math.min(
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
        1.5,
      );
      renderer = new Renderer({ canvas, alpha: true, dpr });
      gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const program = new Program(gl, {
        vertex: /* glsl */ `
          attribute vec2 uv;
          attribute vec2 position;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 0.0, 1.0);
          }
        `,
        fragment: /* glsl */ `
          precision highp float;
          varying vec2 vUv;
          uniform float uTime;
          uniform vec2 uResolution;
          uniform vec3 uAccent;
          uniform vec3 uLight;

          // Two slow-drifting soft radial blooms + a faint moving band. All
          // low-frequency so it reads as ambient depth, never as noise.
          float bloom(vec2 uv, vec2 c, float r) {
            float d = distance(uv, c);
            return smoothstep(r, 0.0, d);
          }

          void main() {
            vec2 uv = vUv;
            float aspect = uResolution.x / max(uResolution.y, 1.0);
            uv.x *= aspect;

            vec2 c1 = vec2(0.28 * aspect + sin(uTime * 0.06) * 0.06,
                           0.34 + cos(uTime * 0.05) * 0.05);
            vec2 c2 = vec2(0.78 * aspect + cos(uTime * 0.04) * 0.05,
                           0.72 + sin(uTime * 0.07) * 0.05);

            float a = bloom(uv, c1, 0.55 * aspect) * 0.55;
            float b = bloom(uv, c2, 0.5 * aspect) * 0.4;

            vec3 col = uAccent * a + uLight * b;
            float alpha = clamp(a + b, 0.0, 0.6);
            gl_FragColor = vec4(col, alpha);
          }
        `,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: [1, 1] },
          // Maroon accent + faint cool light, matching the theme primitives.
          uAccent: { value: [0.431, 0.078, 0.137] }, // #6E1423
          uLight: { value: [0.95, 0.95, 0.94] },
        },
      });

      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      const setSize = () => {
        const rect = canvas.getBoundingClientRect();
        const w = Math.max(1, rect.width);
        const h = Math.max(1, rect.height);
        renderer!.setSize(w, h);
        program.uniforms.uResolution.value = [w * dpr, h * dpr];
      };
      setSize();

      let start = 0;
      const frame = (t: number) => {
        if (disposed) return;
        if (!visible) {
          running = false;
          return;
        }
        if (!start) start = t;
        program.uniforms.uTime.value = (t - start) / 1000;
        renderer!.render({ scene: mesh });
        rafId = requestAnimationFrame(frame);
      };
      const play = () => {
        if (running || disposed || !visible) return;
        running = true;
        rafId = requestAnimationFrame(frame);
      };

      const onResize = () => setSize();
      window.addEventListener('resize', onResize);

      // Pause when scrolled off-screen.
      const io = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? false;
          if (visible) play();
        },
        { threshold: 0 },
      );
      io.observe(canvas);

      // Pause when the tab is hidden.
      const onVisibility = () => {
        visible = !document.hidden && visible;
        if (!document.hidden) play();
      };
      document.addEventListener('visibilitychange', onVisibility);

      play();

      return () => {
        disposed = true;
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibility);
        io.disconnect();
        try {
          const lose = gl?.getExtension('WEBGL_lose_context');
          lose?.loseContext();
        } catch {
          /* best-effort teardown */
        }
      };
    } catch {
      // Any failure → render nothing; the section keeps its solid background.
      return;
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
