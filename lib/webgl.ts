/**
 * WebGL hover-image renderer (Req 10).
 *
 * A thin, framework-agnostic module built on `ogl`. It draws a single
 * cursor-following image "preview" onto one shared, full-viewport canvas with
 * a displacement + RGB-shift warp that reacts to pointer velocity and hover
 * progress, cross-warping from a previous image to the current one.
 *
 * ## Approach (documented per task 18.3)
 * A single full-screen pass is rendered with an `ogl` {@link Triangle} (a big
 * clip-space triangle that covers the whole viewport). The fragment shader
 * draws the preview as a SMALLER quad whose CENTER follows the eased pointer:
 * `vUv` is remapped into the preview's local rect (sized ~22vw with the
 * texture's aspect) centered on `uCenter`. Inside that rect it samples the
 * current + previous textures with cover-fit UVs, offsets those UVs by a
 * displacement proportional to `uVelocity * uHover`, applies an RGB shift
 * (R/G/B sampled at slightly different offsets), cross-mixes prev -> current by
 * `uMix`, and multiplies the whole thing's alpha by `uHover` (and a soft rect
 * mask) so the preview fades in/out and stays a cursor-following card rather
 * than a full-screen image. This keeps a single mesh (no per-frame Transform
 * math) while giving the "floating preview follows the cursor" intent.
 *
 * All setup is wrapped in try/catch and gated on {@link hasWebGL}; it returns
 * `null` on any failure so callers degrade to the readable text list (Req 10.7).
 * No GSAP/animation library is used here — easing is done with a local `lerp`
 * so the module stays framework-agnostic (Req 10.3).
 */

import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import { lerp, clamp } from '@/lib/format';
import { hasWebGL } from '@/lib/motion';

/** Imperative controller returned to the mounting React component. */
export interface HoverImageController {
  /** Load + cap a texture and warp/fade the preview to it (Req 10.4, 10.5). */
  show(src: string): void;
  /** Fade the preview out to fully hidden (Req 10.6). */
  hide(): void;
  /** Feed the latest pointer position (pixels) for the smoothed follow (Req 10.3). */
  setPointer(x: number, y: number): void;
  /** Tear down rAF, listeners, textures, program, and the GL context (Req 10.9). */
  dispose(): void;
}

/** Longest-edge cap for uploaded textures, to bound GPU memory (Req 10.9). */
const MAX_TEXTURE_EDGE = 1024;

/** Preview quad width as a fraction of the viewport width (~22vw). */
const PREVIEW_WIDTH_FRACTION = 0.22;

const VERTEX_SHADER = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform sampler2D uPrevTexture;
  uniform float uHover;        // 0..1 hover/fade progress
  uniform float uMix;          // 0..1 prev -> current cross-mix
  uniform vec2  uVelocity;     // smoothed pointer velocity (bounded)
  uniform vec2  uResolution;   // canvas size in device px
  uniform vec2  uCenter;       // preview center in UV space (0..1)
  uniform vec2  uImageSize;    // current texture natural size (for cover-fit)
  uniform vec2  uPrevImageSize;

  // Cover-fit UVs for an image of size imgSize inside a rect of size rectSize.
  vec2 coverUv(vec2 local, vec2 rectSize, vec2 imgSize) {
    float rectAspect = rectSize.x / rectSize.y;
    float imgAspect = imgSize.x / imgSize.y;
    vec2 scale = vec2(1.0);
    if (imgAspect > rectAspect) {
      scale.x = rectAspect / imgAspect;
    } else {
      scale.y = imgAspect / rectAspect;
    }
    return (local - 0.5) * scale + 0.5;
  }

  void main() {
    // Aspect-corrected preview rect size in UV units. Width is a fixed
    // fraction of the viewport; height derives from the current image aspect.
    float aspect = uResolution.x / uResolution.y;
    float rectW = ${PREVIEW_WIDTH_FRACTION.toFixed(3)};
    float imgAspect = uImageSize.x / uImageSize.y;
    // Keep the on-screen rect's aspect equal to the image aspect.
    float rectH = rectW * aspect / max(imgAspect, 0.0001);
    vec2 rectSize = vec2(rectW, rectH);

    // Local coordinate inside the preview rect (0..1 within the rect).
    vec2 local = (vUv - uCenter) / rectSize + 0.5;

    // Soft rectangular mask so edges fade instead of hard-clipping.
    vec2 edge = smoothstep(0.0, 0.04, local) * smoothstep(0.0, 0.04, 1.0 - local);
    float mask = edge.x * edge.y;
    if (mask <= 0.0) {
      gl_FragColor = vec4(0.0);
      return;
    }

    // Displacement driven by pointer velocity * hover progress.
    vec2 disp = uVelocity * 0.06 * uHover;
    float dispMag = length(disp);

    // Cover-fit + displaced UVs for current and previous textures.
    vec2 baseCur = coverUv(local, rectSize, uImageSize) + disp;
    vec2 basePrev = coverUv(local, rectSize, uPrevImageSize) + disp;

    // RGB shift: sample channels at slightly different offsets.
    vec2 shift = (disp + vec2(dispMag)) * 0.5;
    vec4 cur;
    cur.r = texture2D(uTexture, baseCur + shift).r;
    cur.g = texture2D(uTexture, baseCur).g;
    cur.b = texture2D(uTexture, baseCur - shift).b;
    cur.a = 1.0;

    vec4 prev;
    prev.r = texture2D(uPrevTexture, basePrev + shift).r;
    prev.g = texture2D(uPrevTexture, basePrev).g;
    prev.b = texture2D(uPrevTexture, basePrev - shift).b;
    prev.a = 1.0;

    vec4 color = mix(prev, cur, clamp(uMix, 0.0, 1.0));
    color.a = mask * clamp(uHover, 0.0, 1.0);
    // Premultiply so alpha-blended edges look correct.
    color.rgb *= color.a;
    gl_FragColor = color;
  }
`;

/**
 * Feature-detect WebGL support; SSR-safe (delegates to {@link hasWebGL} in
 * `lib/motion.ts`). Re-exported here so `lib/webgl.ts` is a self-contained
 * entry point for the WebGL layer.
 */
export { hasWebGL };

/**
 * Create the shared hover-image renderer bound to `canvas`, or `null` when
 * WebGL is unavailable or any part of setup fails (Req 10.7). The caller
 * (HoverImageCanvas) shows the plain text list when this returns `null`.
 */
export function createHoverImageRenderer(
  canvas: HTMLCanvasElement,
): HoverImageController | null {
  if (!hasWebGL()) return null;

  try {
    const dpr = Math.min(
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      2,
    );

    const renderer = new Renderer({ canvas, alpha: true, dpr });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    // 1x1 transparent placeholder so the samplers are always valid.
    const blank = new Uint8Array([0, 0, 0, 0]);
    const currentTexture = new Texture(gl, {
      image: blank,
      width: 1,
      height: 1,
    });
    const prevTexture = new Texture(gl, {
      image: blank,
      width: 1,
      height: 1,
    });

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTexture: { value: currentTexture },
        uPrevTexture: { value: prevTexture },
        uHover: { value: 0 },
        uMix: { value: 1 },
        uVelocity: { value: [0, 0] },
        uResolution: { value: [1, 1] },
        uCenter: { value: [0.5, 0.5] },
        uImageSize: { value: [1, 1] },
        uPrevImageSize: { value: [1, 1] },
      },
    });

    const geometry = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry, program });

    // --- State (all mutated only from this closure) ---------------------
    let disposed = false;
    let contextLost = false;
    let rafId = 0;

    // Pointer targets/eased values, in pixels then normalized per-frame.
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let easedX = 0;
    let easedY = 0;
    let havePointer = false;

    // Eased UV center + previous center (for velocity in UV space).
    let centerUvX = 0.5;
    let centerUvY = 0.5;
    let prevCenterUvX = 0.5;
    let prevCenterUvY = 0.5;

    let hoverTarget = 0;
    let mixValue = 1;
    const mixTargetSpeed = 0.08; // per-frame ease toward 1

    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [w * dpr, h * dpr];
    };
    setSize();

    // --- Texture loading (capped to MAX_TEXTURE_EDGE) -------------------
    const loadImage = (src: string): void => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (disposed) return;
        try {
          const { canvas: scaled, width, height } = downscale(img);
          // Move current -> previous, then upload the new image as current.
          prevTexture.image = currentTexture.image ?? blank;
          program.uniforms.uPrevImageSize.value =
            program.uniforms.uImageSize.value;
          prevTexture.needsUpdate = true;

          currentTexture.image = scaled;
          currentTexture.needsUpdate = true;
          program.uniforms.uImageSize.value = [width, height];

          // Kick off the cross-warp from prev -> current.
          mixValue = 0;
          hoverTarget = 1;
        } catch {
          /* keep previous state on any upload failure (Req 10.9) */
        }
      };
      img.onerror = () => {
        /* keep previous preview / stay hidden; text list is intact */
      };
      img.src = src;
    };

    // --- Per-frame loop -------------------------------------------------
    let lastTime = 0;
    const frame = (time: number) => {
      if (disposed || contextLost) return;
      rafId = requestAnimationFrame(frame);

      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;

      // Ease the drawn pointer toward its latest target (pixels).
      if (havePointer) {
        easedX = lerp(easedX, pointerTargetX, 0.12);
        easedY = lerp(easedY, pointerTargetY, 0.12);
      }

      // Normalize to UV (flip Y: screen top -> UV top).
      prevCenterUvX = centerUvX;
      prevCenterUvY = centerUvY;
      centerUvX = easedX / w;
      centerUvY = 1 - easedY / h;
      program.uniforms.uCenter.value = [centerUvX, centerUvY];

      // Velocity from the eased center delta this frame (UV/sec-ish),
      // bounded so the warp never spikes.
      const dt = lastTime === 0 ? 16 : Math.max(time - lastTime, 1);
      lastTime = time;
      const vx = clamp(((centerUvX - prevCenterUvX) / dt) * 1000, -5, 5);
      const vy = clamp(((centerUvY - prevCenterUvY) / dt) * 1000, -5, 5);
      program.uniforms.uVelocity.value = [vx, vy];

      // Ease hover + mix toward their targets.
      const hover = program.uniforms.uHover.value as number;
      program.uniforms.uHover.value = lerp(hover, hoverTarget, 0.1);
      if (mixValue < 1) {
        mixValue = Math.min(1, mixValue + mixTargetSpeed);
      }
      program.uniforms.uMix.value = mixValue;

      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(frame);

    // --- Listeners ------------------------------------------------------
    const onResize = () => setSize();
    window.addEventListener('resize', onResize);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
    canvas.addEventListener('webglcontextlost', onContextLost as EventListener);

    // --- Controller -----------------------------------------------------
    return {
      show(src: string) {
        if (disposed || contextLost) return;
        try {
          loadImage(src);
        } catch {
          /* stay in current state */
        }
      },
      hide() {
        if (disposed) return;
        hoverTarget = 0;
      },
      setPointer(x: number, y: number) {
        pointerTargetX = x;
        pointerTargetY = y;
        if (!havePointer) {
          // First sample: jump the eased position so it doesn't fly in.
          easedX = x;
          easedY = y;
          havePointer = true;
        }
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        try {
          if (rafId) cancelAnimationFrame(rafId);
          window.removeEventListener('resize', onResize);
          canvas.removeEventListener(
            'webglcontextlost',
            onContextLost as EventListener,
          );
          // Free GPU resources.
          const loseCtx = gl.getExtension('WEBGL_lose_context');
          loseCtx?.loseContext();
        } catch {
          /* best-effort teardown */
        }
      },
    };
  } catch {
    // Any init failure -> null so callers render the readable text list.
    return null;
  }
}

/**
 * Draw `img` onto an offscreen canvas, downscaling so its longest edge is at
 * most {@link MAX_TEXTURE_EDGE}px (Req 10.9). Returns the canvas plus its final
 * pixel size. If the source already fits, it is still drawn to a canvas so the
 * uploaded image is a uniform, decodable surface.
 */
function downscale(img: HTMLImageElement): {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
} {
  const naturalW = img.naturalWidth || img.width || 1;
  const naturalH = img.naturalHeight || img.height || 1;
  const longest = Math.max(naturalW, naturalH);
  const scale = longest > MAX_TEXTURE_EDGE ? MAX_TEXTURE_EDGE / longest : 1;
  const width = Math.max(1, Math.round(naturalW * scale));
  const height = Math.max(1, Math.round(naturalH * scale));

  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  const ctx = off.getContext('2d');
  if (ctx) {
    ctx.drawImage(img, 0, 0, width, height);
  }
  return { canvas: off, width, height };
}
