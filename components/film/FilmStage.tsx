'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { film } from '@/lib/data';
import { hasWebGL, prefersReducedMotion, isCoarsePointer } from '@/lib/motion';
import { gsap } from '@/lib/gsapSetup';
import type { FilmStageHandle } from './filmBackdrop';
import {
  loadYouTubeIframeApi,
  type YTPlayer,
  type YTPlayerEvent,
} from './youtubeApi';

/**
 * FilmStage — the client tree for the cinematic /film route.
 *
 * Choreography on open:
 *   1. A red velvet theatre CURTAIN covers the screen and waves like fabric.
 *   2. After a brief settle it AUTOMATICALLY parts outward (heavy-drapery ease)
 *      to reveal the video, while a glowing amber/teal ambient backdrop blooms
 *      behind and beneath the centered player (a cinema-room "reflection").
 *   3. The video AUTOSTARTS MUTED; a visible "Tap for sound" control unmutes it.
 *   4. When the video ENDS, a "Go to portfolio" CTA appears.
 *
 * Rendering strategy:
 *   - The page/player is ALWAYS rendered and fully accessible regardless of
 *     WebGL support (nothing blocks first paint; all WebGL/DOM work is in
 *     effects).
 *   - WebGL path: a single Three.js renderer draws both curtain + ambient
 *     (see ./filmBackdrop). A GSAP timeline drives `setOpen`.
 *   - Non-WebGL / coarse-pointer path: a CSS red-curtain overlay (two velvet
 *     panels with pleats) slides open via GSAP transforms.
 *   - Reduced motion: no curtain animation at all — the player is revealed
 *     immediately (video may still muted-autoplay; a Play/Sound control stays).
 *   - The YouTube IFrame API powers autoplay-muted, unmute, and ENDED
 *     detection. If it fails to load, a plain muted-autoplay youtube-nocookie
 *     iframe is used and the "Go to portfolio" CTA stays available manually.
 */

// ── Embed URL builders ──────────────────────────────────────────────────────

// Fallback (no IFrame API): privacy-friendly, muted autoplay.
function buildFallbackEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    autoplay: '1',
    mute: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params.toString()}`;
}

type Phase = 'closed' | 'opening' | 'open';

export default function FilmStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const cssCurtainRef = useRef<HTMLDivElement | null>(null);
  const cssLeftRef = useRef<HTMLDivElement | null>(null);
  const cssRightRef = useRef<HTMLDivElement | null>(null);
  const playerHostRef = useRef<HTMLDivElement | null>(null);

  const stageHandleRef = useRef<FilmStageHandle | null>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);

  const [webglActive, setWebglActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('closed');
  const [apiMode, setApiMode] = useState<'pending' | 'api' | 'fallback'>('pending');
  const [muted, setMuted] = useState(true);
  const [ended, setEnded] = useState(false);

  // ── WebGL stage (curtain + ambient) ───────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (prefersReducedMotion() || isCoarsePointer() || !hasWebGL()) {
      return; // CSS curtain / immediate reveal handles these.
    }

    let handle: FilmStageHandle | null = null;
    let cancelled = false;

    import('./filmBackdrop')
      .then(({ createFilmStage }) => {
        if (cancelled) return;
        handle = createFilmStage(canvas);
        if (handle) {
          stageHandleRef.current = handle;
          setWebglActive(true);
        }
      })
      .catch(() => {
        /* stay on the CSS curtain fallback */
      });

    return () => {
      cancelled = true;
      handle?.dispose();
      handle = null;
      stageHandleRef.current = null;
    };
  }, []);

  // ── Curtain choreography ───────────────────────────────────────────────────
  // Drives whichever curtain is active (WebGL handle or CSS panels) on one
  // GSAP timeline: settle/wave → part → ambient bloom → title/frame ease-in.
  useEffect(() => {
    const reduced = prefersReducedMotion();

    // Reduced motion: reveal immediately, no curtain, no wave.
    if (reduced) {
      stageHandleRef.current?.setOpen(1);
      stageHandleRef.current?.setReflection(0.7);
      if (cssCurtainRef.current) cssCurtainRef.current.style.display = 'none';
      // Defer the phase flip out of the effect body (avoids a synchronous
      // cascading render); the DOM is already in its final visible state.
      const id = requestAnimationFrame(() => setPhase('open'));
      return () => cancelAnimationFrame(id);
    }

    const handle = stageHandleRef.current;
    const useCss = !handle;
    const proxy = { open: 0 };

    let tl: gsap.core.Timeline | undefined;
    try {
      tl = gsap.timeline({
        onStart: () => setPhase('opening'),
        onComplete: () => setPhase('open'),
      });

      // Intro title lifts in first.
      if (introRef.current) {
        tl.fromTo(
          introRef.current,
          { y: 18, opacity: 0.001 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
        );
      }

      // Brief settle beat where the fabric just waves (WebGL wave runs on its
      // own clock; here we simply hold before parting).
      tl.to({}, { duration: 0.9 });

      // Part the curtain (heavy drapery ease).
      tl.to(
        proxy,
        {
          open: 1,
          duration: 1.7,
          ease: 'power4.inOut',
          onUpdate: () => {
            if (useCss) {
              const p = proxy.open;
              if (cssLeftRef.current) {
                cssLeftRef.current.style.transform = `translate3d(${-100 * p}%,0,0)`;
              }
              if (cssRightRef.current) {
                cssRightRef.current.style.transform = `translate3d(${100 * p}%,0,0)`;
              }
            } else {
              handle?.setOpen(proxy.open);
            }
            // Ambient reflection blooms in as the curtain parts.
            handle?.setReflection(proxy.open * 0.85);
          },
        },
        '-=0.2',
      );

      // Frame / player eases in as the reveal completes.
      if (frameRef.current) {
        tl.fromTo(
          frameRef.current,
          { y: 40, opacity: 0.001, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 1.0, ease: 'power3.out' },
          '-=1.0',
        );
      }

      // Hide the fully-parted CSS overlay so it never traps clicks.
      if (useCss) {
        tl.set(cssCurtainRef.current, { display: 'none' });
      }
    } catch {
      // Any failure: land on a fully-visible, fully-open resting state.
      try {
        handle?.setOpen(1);
        handle?.setReflection(0.7);
        if (cssCurtainRef.current) cssCurtainRef.current.style.display = 'none';
        if (introRef.current) gsap.set(introRef.current, { clearProps: 'all' });
        if (frameRef.current) gsap.set(frameRef.current, { clearProps: 'all' });
      } catch {
        /* DOM defaults are visible */
      }
      // Defer out of the synchronous effect body (lint: no cascading renders).
      requestAnimationFrame(() => setPhase('open'));
    }

    return () => {
      tl?.kill();
    };
    // Re-run once we know whether the WebGL handle is present.
  }, [webglActive]);

  // ── YouTube player: IFrame API with plain-iframe fallback ──────────────────
  const handleStateChange = useCallback((event: YTPlayerEvent) => {
    const YT = window.YT;
    if (YT && event.data === YT.PlayerState.ENDED) {
      setEnded(true);
      stageHandleRef.current?.setPlaying(false);
    } else if (YT && event.data === YT.PlayerState.PLAYING) {
      setEnded(false);
      stageHandleRef.current?.setPlaying(true);
    } else if (
      YT &&
      (event.data === YT.PlayerState.PAUSED ||
        event.data === YT.PlayerState.BUFFERING)
    ) {
      stageHandleRef.current?.setPlaying(false);
    }
  }, []);

  useEffect(() => {
    const host = playerHostRef.current;
    if (!host) return;

    let cancelled = false;

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !playerHostRef.current) return;
        const player = new YT.Player(playerHostRef.current, {
          videoId: film.youtubeId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            autoplay: 1,
            mute: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (e) => {
              try {
                e.target.mute();
                e.target.playVideo();
              } catch {
                /* autoplay may be deferred by the browser; controls remain */
              }
            },
            onStateChange: handleStateChange,
          },
        });
        ytPlayerRef.current = player;
        setApiMode('api');
      })
      .catch(() => {
        if (cancelled) return;
        setApiMode('fallback');
      });

    return () => {
      cancelled = true;
      try {
        ytPlayerRef.current?.destroy();
      } catch {
        /* nothing to clean up */
      }
      ytPlayerRef.current = null;
    };
  }, [handleStateChange]);

  // ── Sound toggle ───────────────────────────────────────────────────────────
  const toggleSound = useCallback(() => {
    const player = ytPlayerRef.current;
    if (!player) return;
    try {
      if (player.isMuted()) {
        player.unMute();
        player.setVolume(100);
        player.playVideo();
        setMuted(false);
      } else {
        player.mute();
        setMuted(true);
      }
    } catch {
      /* leave the visible state as-is on any API hiccup */
    }
  }, []);

  const soundReady = apiMode === 'api';
  const showBloom = phase !== 'closed';

  return (
    <main
      id="top"
      className="relative isolate flex min-h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-[var(--qe-cinema-deep,#05070F)]"
    >
      {/* WebGL stage canvas (ambient + curtain), behind everything. */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full"
      />

      {/* CSS-only cinematic ambient — always present; the sole ambient when
          WebGL is inactive, and dimmed when WebGL takes over so they don't
          fight for contrast. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 transition-opacity duration-1000"
        style={{
          opacity: webglActive ? 0.32 : showBloom ? 1 : 0.6,
          background:
            'radial-gradient(60% 55% at 32% 60%, color-mix(in srgb, var(--qe-cinema-amber,#E7A14C) 34%, transparent), transparent 70%),' +
            'radial-gradient(55% 50% at 72% 42%, color-mix(in srgb, var(--qe-cinema-teal,#1C6E73) 30%, transparent), transparent 72%),' +
            'radial-gradient(45% 30% at 50% 88%, color-mix(in srgb, var(--qe-cinema-amber,#E7A14C) 22%, transparent), transparent 70%),' +
            'linear-gradient(180deg, var(--qe-cinema-deep,#05070F), #0A0E1A)',
        }}
      />

      {/* Vignette for cinema framing. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* CSS red-curtain fallback overlay — only used when WebGL is inactive.
          Under reduced motion the choreography effect hides it immediately. */}
      {!webglActive ? (
        <div
          ref={cssCurtainRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
        >
          <div
            ref={cssLeftRef}
            className="absolute inset-y-0 left-0 w-1/2 will-change-transform"
            style={{ background: velvetPanel('left') }}
          />
          <div
            ref={cssRightRef}
            className="absolute inset-y-0 right-0 w-1/2 will-change-transform"
            style={{ background: velvetPanel('right') }}
          />
        </div>
      ) : null}

      {/* Top bar: persistent back-to-site control. */}
      <div className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/"
          data-cursor
          data-cursor-label="Home"
          className="text-primary-interactive inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:text-sm"
        >
          <span aria-hidden="true">←</span> Back to site
        </Link>
        <span className="text-secondary font-mono text-[0.7rem] uppercase tracking-[0.28em]">
          Film
        </span>
      </div>

      {/* Stage. */}
      <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-2 sm:px-8">
        <div ref={introRef} className="mb-8 max-w-2xl text-center">
          <p className="text-accent font-mono text-xs uppercase tracking-[0.32em]">
            Presentation
          </p>
          <h1 className="text-primary mt-3 font-display text-[clamp(2.25rem,6vw,4.75rem)] font-semibold leading-[0.95] tracking-tight">
            {film.title}
          </h1>
          <p className="text-secondary mx-auto mt-4 max-w-xl text-base leading-relaxed tracking-[0.01em] sm:text-lg">
            {film.tagline}
          </p>
        </div>

        {/* Centered player with a 3D-styled premium frame. */}
        <div className="w-full max-w-5xl [perspective:1400px]">
          <div
            ref={frameRef}
            className="surface-alt relative mx-auto w-full border border-subtle p-2 sm:p-3"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Gold hairline accent frame. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                boxShadow:
                  'inset 0 0 0 1px color-mix(in srgb, var(--qe-cinema-amber,#E7A14C) 40%, transparent)',
              }}
            />

            {/* Warm/teal frame glow so cinema colour reads at the edges. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-8 -z-10 opacity-80 blur-3xl transition-opacity duration-1000"
              style={{
                opacity: showBloom ? 0.8 : 0.2,
                background:
                  'radial-gradient(50% 60% at 28% 72%, color-mix(in srgb, var(--qe-cinema-amber,#E7A14C) 48%, transparent), transparent 70%),' +
                  'radial-gradient(50% 60% at 76% 34%, color-mix(in srgb, var(--qe-cinema-teal,#1C6E73) 44%, transparent), transparent 72%)',
              }}
            />

            <div className="relative aspect-video w-full overflow-hidden bg-black">
              {/* API player mounts into this host; the API replaces it with an
                  <iframe>. When the API fails we render a plain iframe instead. */}
              {apiMode === 'fallback' ? (
                <iframe
                  src={buildFallbackEmbedUrl(film.youtubeId)}
                  title={`${film.title} — video player`}
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div
                  ref={playerHostRef}
                  className="absolute inset-0 h-full w-full"
                  aria-label={`${film.title} — video player`}
                />
              )}

              {/* End-of-film overlay CTA. */}
              {ended ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-black/70 px-6 text-center backdrop-blur-sm">
                  <p className="text-primary font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    Thanks for watching.
                  </p>
                  <Link
                    href="/"
                    data-cursor
                    data-cursor-label="Portfolio"
                    className="button-on-accent inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)]"
                  >
                    Go to portfolio <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {/* Controls row: sound toggle + persistent portfolio link. */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {soundReady ? (
              <button
                type="button"
                onClick={toggleSound}
                data-cursor
                className="button-outline inline-flex items-center gap-2 border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:text-sm"
              >
                <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
                {muted ? 'Tap for sound' : 'Mute'}
              </button>
            ) : null}

            <Link
              href="/"
              data-cursor
              data-cursor-label="Portfolio"
              className="button-outline inline-flex items-center gap-2 border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--qe-text)] sm:text-sm"
            >
              Go to portfolio <span aria-hidden="true">→</span>
            </Link>
          </div>

          {film.isPlaceholder ? (
            <p className="text-secondary mt-5 text-center font-mono text-[0.7rem] uppercase tracking-[0.16em] opacity-70">
              Interim video — replace the YouTube id in lib/data.ts (film.youtubeId).
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}

/**
 * A CSS velvet curtain-panel background: deep-red vertical gradient with fine
 * repeating pleat highlights and a warm gold rim on the inner (parting) edge.
 * Used only on the non-WebGL / coarse-pointer fallback path.
 */
function velvetPanel(side: 'left' | 'right'): string {
  const rim =
    side === 'left'
      ? 'linear-gradient(90deg, transparent 88%, color-mix(in srgb, var(--qe-cinema-amber,#E7A14C) 55%, transparent) 100%)'
      : 'linear-gradient(90deg, color-mix(in srgb, var(--qe-cinema-amber,#E7A14C) 55%, transparent) 0%, transparent 12%)';
  return [
    rim,
    'repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0) 14px, rgba(255,255,255,0.06) 28px, rgba(0,0,0,0) 42px)',
    'linear-gradient(180deg, #3A0A12 0%, #7E1220 45%, #5A0C18 100%)',
  ].join(',');
}
