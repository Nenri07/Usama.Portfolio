'use client';

import * as THREE from 'three';

/**
 * A self-contained Three.js cinematic stage for the /film route.
 *
 * A SINGLE renderer/scene drives two decorative layers with one animation loop:
 *
 *   1. AMBIENT — a full-screen background plane rendering a deep cinema gradient
 *      with two drifting volumetric glows (warm amber + teal), a soft floor
 *      "reflection" bloom beneath where the centered player sits, a gentle
 *      vignette, and low animated grain. Clearly present (not flat) but tuned
 *      so it never harms the contrast of the controls/text layered in front.
 *
 *   2. CURTAIN — a red velvet theatre curtain rendered as two cloth panels
 *      (left/right) with a vertex-shader fabric wave (folds + noise ripple) and
 *      velvet fragment shading (vertical pleats, warm gold rim light, deep-red
 *      body). The panels start closed covering the screen, are driven by
 *      `setOpen(progress)` (0 = shut, 1 = fully parted off-screen) on a
 *      GSAP timeline, and keep waving while they part.
 *
 * Everything is DECORATIVE — the real accessible YouTube player sits in front in
 * the DOM. The returned handle exposes `setOpen`, `setReflection`, `setPlaying`
 * and `dispose`. `dispose()` cancels the rAF, removes listeners, and frees every
 * geometry/material/renderer and forces a GL context loss so nothing leaks
 * across client navigations. Callers must guard WebGL / reduced-motion / coarse
 * pointer themselves; this module assumes it may run.
 */

export interface FilmStageHandle {
  /** 0 = curtain fully closed, 1 = fully open/parted off screen. */
  setOpen: (progress: number) => void;
  /** 0..1 strength of the warm floor reflection bloom beneath the player. */
  setReflection: (strength: number) => void;
  /** Toggle a subtle liveliness boost while the video plays. */
  setPlaying: (playing: boolean) => void;
  dispose: () => void;
}

/* ── Shared shader chunks ──────────────────────────────────────────────────── */

const FULLSCREEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Ambient backdrop: gradient + two drifting glows + floor reflection + grain.
const AMBIENT_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec3  uBase;
  uniform vec3  uAmber;
  uniform vec3  uTeal;
  uniform float uIntro;
  uniform float uReflection;
  uniform float uEnergy;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float glow(vec2 uv, vec2 center, float radius) {
    float d = distance(uv, center);
    return smoothstep(radius, 0.0, d);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 auv = vec2((uv.x - 0.5) * aspect + 0.5, uv.y);
    float ax = 0.5 - 0.5 * aspect;

    // Deep base gradient, lifted a touch toward the centre.
    float vign = smoothstep(1.25, 0.10, distance(uv, vec2(0.5)));
    vec3 col = mix(uBase * 0.45, uBase, vign);

    // Two drifting volumetric glows behind the player region.
    float t = uTime * 0.09;
    vec2 amberC = vec2(0.30 + 0.06 * sin(t),        0.60 + 0.05 * cos(t * 0.9));
    vec2 tealC  = vec2(0.72 + 0.05 * cos(t * 1.1),  0.42 + 0.05 * sin(t * 0.8));

    float boost = 1.0 + 0.18 * uEnergy;
    col += uAmber * glow(auv, vec2(amberC.x * aspect + ax, amberC.y), 0.62) * 0.85 * uIntro * boost;
    col += uTeal  * glow(auv, vec2(tealC.x  * aspect + ax, tealC.y),  0.58) * 0.70 * uIntro * boost;

    // Warm floor "reflection" bloom beneath the centered player.
    vec2 floorC = vec2(0.5 * aspect + ax, 0.14);
    float bounce = glow(auv, floorC, 0.42) * uReflection * uIntro;
    col += mix(uAmber, uTeal, 0.35) * bounce * 0.55;

    // Subtle centre halo where the player sits so it feels "wrapped".
    float halo = glow(auv, vec2(0.5 * aspect + ax, 0.55), 0.34);
    col += mix(uAmber, uTeal, 0.5) * halo * 0.10 * uIntro;

    // Low animated grain (never enough to hurt control contrast).
    float g = hash(uv * uResolution.xy * 0.5 + uTime * 60.0);
    col += (g - 0.5) * 0.03;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Velvet curtain panel: vertex wave + velvet fragment shading.
const CURTAIN_VERT = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uOpen;     // 0 closed .. 1 open
  uniform float uSide;     // -1 left panel, +1 right panel
  uniform float uWave;     // wave amplitude multiplier (settle beat)
  varying vec2  vUv;
  varying float vFold;

  // Cheap value noise for an organic ripple.
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i), b = hash(i+vec2(1.,0.));
    float c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));
    vec2 u = f*f*(3.-2.*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }

  void main() {
    vUv = uv;
    vec3 p = position;

    // Vertical drapery folds across the panel width (more folds = velvet look).
    float folds = sin(uv.x * 26.0) * 0.5 + 0.5;
    vFold = folds;

    // Fabric wave: folds sway + a slow noise ripple. Amplitude eases out as the
    // panel opens so parted fabric settles. Bottom sways more than the top.
    float sway = sin(uv.x * 10.0 + uTime * 1.6) * 0.06;
    float ripple = (noise(vec2(uv.x * 5.0, uv.y * 3.0 + uTime * 0.6)) - 0.5) * 0.10;
    float amp = uWave * (0.35 + 0.65 * uv.y) * (1.0 - 0.6 * uOpen);
    p.z += (sway + ripple) * amp;

    // Fold depth gives the cloth thickness/relief.
    p.z += (folds - 0.5) * 0.05;

    // Part the panel outward as it opens. Each panel translates toward its own
    // side and gathers (slight horizontal squash) like drawn drapery.
    float shift = uSide * uOpen * 1.15;
    p.x = p.x * (1.0 - 0.18 * uOpen) + shift;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const CURTAIN_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3  uDeep;
  uniform vec3  uRed;
  uniform vec3  uGold;
  uniform float uSide;
  varying vec2  vUv;
  varying float vFold;

  void main() {
    // Velvet body: deep red shaded by the fold relief (darker in the valleys).
    float shade = mix(0.55, 1.15, vFold);
    vec3 col = mix(uDeep, uRed, shade);

    // Fine vertical pleat lines for fabric texture.
    float pleat = sin(vUv.x * 120.0) * 0.5 + 0.5;
    col *= 0.92 + 0.08 * pleat;

    // Warm gold rim light down the inner (parting) edge of each panel.
    float innerEdge = uSide < 0.0 ? vUv.x : (1.0 - vUv.x);
    float rim = smoothstep(0.12, 0.0, innerEdge);
    col += uGold * rim * 0.6;

    // Soft top shadow + bottom weight for depth.
    col *= 0.85 + 0.15 * smoothstep(0.0, 0.5, vUv.y);
    col *= 1.0 - 0.18 * smoothstep(0.85, 1.0, vUv.y);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function hexToVec3(hex: string): THREE.Vector3 {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

export function createFilmStage(canvas: HTMLCanvasElement): FilmStageHandle | null {
  let renderer: THREE.WebGLRenderer | null = null;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
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
  renderer.autoClear = false;

  /* ── Ambient layer (orthographic full-screen quad) ─────────────────────── */
  const ambientScene = new THREE.Scene();
  const ambientCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const ambientGeo = new THREE.PlaneGeometry(2, 2);
  const ambientUniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uBase: { value: hexToVec3('#05070F') },
    uAmber: { value: hexToVec3('#E7A14C') },
    uTeal: { value: hexToVec3('#1C6E73') },
    uIntro: { value: 0 },
    uReflection: { value: 0 },
    uEnergy: { value: 0 },
  };
  const ambientMat = new THREE.ShaderMaterial({
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: AMBIENT_FRAG,
    uniforms: ambientUniforms,
    depthTest: false,
    depthWrite: false,
  });
  const ambientMesh = new THREE.Mesh(ambientGeo, ambientMat);
  ambientScene.add(ambientMesh);

  /* ── Curtain layer (perspective, two subdivided cloth panels) ──────────── */
  const curtainScene = new THREE.Scene();
  const curtainCam = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
  curtainCam.position.set(0, 0, 2.4);

  // A panel spans half the visible width; generous subdivisions for the wave.
  const makePanel = (side: number) => {
    const geo = new THREE.PlaneGeometry(1.35, 2.6, 40, 40);
    const uniforms = {
      uTime: { value: 0 },
      uOpen: { value: 0 },
      uSide: { value: side },
      uWave: { value: 1 },
      uDeep: { value: hexToVec3('#3A0A12') },
      uRed: { value: hexToVec3('#7E1220') },
      uGold: { value: hexToVec3('#E7A14C') },
    };
    const mat = new THREE.ShaderMaterial({
      vertexShader: CURTAIN_VERT,
      fragmentShader: CURTAIN_FRAG,
      uniforms,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    // Seat each panel against its half of the screen; slight overlap at centre.
    mesh.position.x = side * 0.66;
    return { mesh, uniforms };
  };

  const left = makePanel(-1);
  const right = makePanel(1);
  curtainScene.add(left.mesh, right.mesh);

  const fitCurtainCamera = (w: number, h: number) => {
    const aspect = w / Math.max(h, 1);
    curtainCam.aspect = aspect;
    // Push the camera back on narrow/tall viewports so panels still cover.
    curtainCam.position.z = aspect < 1 ? 3.1 : 2.4;
    curtainCam.updateProjectionMatrix();
  };

  const applySize = () => {
    const { w, h } = getSize();
    renderer!.setSize(w, h, false);
    ambientUniforms.uResolution.value.set(w * dpr, h * dpr);
    fitCurtainCamera(w, h);
  };
  applySize();

  /* ── State + animation loop ────────────────────────────────────────────── */
  let raf = 0;
  let running = true;
  let openValue = 0;
  let energy = 0; // eased toward playing target
  let energyTarget = 0;
  const start = performance.now();
  const introDuration = 1400;

  const render = (now: number) => {
    const elapsed = now - start;
    const time = elapsed / 1000;

    // Ambient.
    ambientUniforms.uTime.value = time;
    ambientUniforms.uIntro.value = Math.min(1, elapsed / introDuration);
    energy += (energyTarget - energy) * 0.05;
    ambientUniforms.uEnergy.value = energy;

    // Curtain wave (both panels share the clock). Wave amplitude fades as the
    // panels finish parting so leftover fabric doesn't flap once open.
    const wave = 1 - Math.min(1, openValue / 0.85);
    left.uniforms.uTime.value = time;
    right.uniforms.uTime.value = time;
    left.uniforms.uWave.value = wave;
    right.uniforms.uWave.value = wave;

    try {
      renderer!.clear();
      renderer!.render(ambientScene, ambientCam);
      // Only pay for the curtain pass while any fabric is still visible.
      if (openValue < 0.999) {
        renderer!.clearDepth();
        renderer!.render(curtainScene, curtainCam);
      }
    } catch {
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
  };

  const loop = () => {
    if (!running) return;
    render(performance.now());
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  // Pause the loop when the tab is hidden to save power; resume on return.
  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else if (!running) {
      running = true;
      raf = requestAnimationFrame(loop);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  let resizeScheduled = 0;
  const onResize = () => {
    if (resizeScheduled) return;
    resizeScheduled = requestAnimationFrame(() => {
      resizeScheduled = 0;
      applySize();
    });
  };
  window.addEventListener('resize', onResize, { passive: true });

  const setOpen = (progress: number) => {
    openValue = Math.max(0, Math.min(1, progress));
    left.uniforms.uOpen.value = openValue;
    right.uniforms.uOpen.value = openValue;
  };
  const setReflection = (strength: number) => {
    ambientUniforms.uReflection.value = Math.max(0, Math.min(1, strength));
  };
  const setPlaying = (playing: boolean) => {
    energyTarget = playing ? 1 : 0;
  };

  const dispose = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    if (resizeScheduled) cancelAnimationFrame(resizeScheduled);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    try {
      ambientGeo.dispose();
      ambientMat.dispose();
      left.mesh.geometry.dispose();
      (left.mesh.material as THREE.Material).dispose();
      right.mesh.geometry.dispose();
      (right.mesh.material as THREE.Material).dispose();
      renderer?.dispose();
      renderer?.forceContextLoss?.();
    } catch {
      /* nothing else to clean up */
    }
    renderer = null;
  };

  return { setOpen, setReflection, setPlaying, dispose };
}
