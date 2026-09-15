'use client';

import * as THREE from 'three';

/**
 * A self-contained Three.js cinematic backdrop for the /film stage.
 *
 * This is DECORATIVE framing only — the real, accessible YouTube iframe sits in
 * front of it in the DOM. The scene renders a dark cinema ambience with two
 * soft volumetric-style gradient glows (a deep amber and a teal) drifting behind
 * where the player sits, plus a subtle animated grain, giving the "cinema colors
 * appear behind the player" look.
 *
 * Everything is created inside `createFilmBackdrop`, and the returned
 * `dispose()` cancels the animation frame, removes listeners, and frees every
 * geometry/material/texture/renderer so no GL context leaks. Callers must guard
 * WebGL availability / reduced motion themselves; this module assumes it may run.
 */

export interface FilmBackdropHandle {
  dispose: () => void;
}

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Full-screen gradient + drifting glows + grain, all in a single fragment pass.
const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uBase;
  uniform vec3 uAmber;
  uniform vec3 uTeal;
  uniform float uIntro;

  // Cheap hash-based grain.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float glow(vec2 uv, vec2 center, float radius) {
    float d = distance(uv, center);
    return smoothstep(radius, 0.0, d);
  }

  void main() {
    vec2 uv = vUv;
    // Correct for aspect so glows stay round-ish.
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 auv = vec2((uv.x - 0.5) * aspect + 0.5, uv.y);

    // Base deep-cinema gradient (darker at edges, subtle lift toward centre).
    float vign = smoothstep(1.15, 0.15, distance(uv, vec2(0.5)));
    vec3 col = mix(uBase * 0.55, uBase, vign);

    // Two drifting volumetric glows behind the player region.
    float t = uTime * 0.08;
    vec2 amberC = vec2(0.30 + 0.06 * sin(t), 0.62 + 0.04 * cos(t * 0.9));
    vec2 tealC = vec2(0.72 + 0.05 * cos(t * 1.1), 0.40 + 0.05 * sin(t * 0.8));

    col += uAmber * glow(auv, vec2(amberC.x * aspect + (0.5 - 0.5 * aspect), amberC.y), 0.55) * 0.55 * uIntro;
    col += uTeal  * glow(auv, vec2(tealC.x  * aspect + (0.5 - 0.5 * aspect), tealC.y),  0.5)  * 0.45 * uIntro;

    // Animated film grain, kept low so it never harms control contrast.
    float g = hash(uv * uResolution.xy * 0.5 + uTime * 60.0);
    col += (g - 0.5) * 0.035;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function hexToVec3(hex: string): THREE.Vector3 {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

export function createFilmBackdrop(canvas: HTMLCanvasElement): FilmBackdropHandle | null {
  let renderer: THREE.WebGLRenderer | null = null;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'low-power',
    });
  } catch {
    return null;
  }

  const parent = canvas.parentElement ?? document.body;
  const getSize = () => ({
    w: parent.clientWidth || window.innerWidth,
    h: parent.clientHeight || window.innerHeight,
  });

  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const geometry = new THREE.PlaneGeometry(2, 2);
  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uBase: { value: hexToVec3('#05070F') },
    uAmber: { value: hexToVec3('#E7A14C') },
    uTeal: { value: hexToVec3('#1C6E73') },
    uIntro: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const applySize = () => {
    const { w, h } = getSize();
    renderer!.setSize(w, h, false);
    uniforms.uResolution.value.set(w * dpr, h * dpr);
  };
  applySize();

  let raf = 0;
  const start = performance.now();
  const introDuration = 1600; // ms cinematic fade-in of the glows.

  const loop = () => {
    const now = performance.now();
    const elapsed = now - start;
    uniforms.uTime.value = elapsed / 1000;
    // Ease the intro glow in once, then hold.
    uniforms.uIntro.value = Math.min(1, elapsed / introDuration);
    try {
      renderer!.render(scene, camera);
    } catch {
      // A transient render failure should not spam; stop the loop cleanly.
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  let resizeScheduled = 0;
  const onResize = () => {
    if (resizeScheduled) return;
    resizeScheduled = requestAnimationFrame(() => {
      resizeScheduled = 0;
      applySize();
    });
  };
  window.addEventListener('resize', onResize, { passive: true });

  const dispose = () => {
    if (raf) cancelAnimationFrame(raf);
    if (resizeScheduled) cancelAnimationFrame(resizeScheduled);
    window.removeEventListener('resize', onResize);
    try {
      geometry.dispose();
      material.dispose();
      scene.remove(mesh);
      renderer?.dispose();
      // Force-release the GL context so it never leaks across route changes.
      renderer?.forceContextLoss?.();
    } catch {
      /* nothing else to clean up */
    }
    renderer = null;
  };

  return { dispose };
}
