'use client';

/**
 * Runtime loader for the YouTube IFrame Player API (client-only, SSR-safe).
 *
 * The API script (`https://www.youtube.com/iframe_api`) is injected once and
 * shared across callers via a module-level promise (single-load guard). The
 * script invokes the global `window.onYouTubeIframeAPIReady` when `YT.Player`
 * is usable; we chain our own callback so we never clobber an existing one.
 *
 * `loadYouTubeIframeApi()` resolves with the `YT` namespace, or rejects if the
 * script can't load (offline, blocked, CSP) so the caller can fall back to a
 * plain muted-autoplay iframe with no reliance on the API.
 */

// Minimal typings for the slice of the IFrame API we use — avoids pulling in a
// separate @types package while keeping the call sites type-checked.
export interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
  getPlayerState: () => number;
  destroy: () => void;
}

export interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

export interface YTNamespace {
  Player: new (
    el: HTMLElement | string,
    options: {
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: YTPlayerEvent) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
        onError?: (event: YTPlayerEvent) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const SCRIPT_SRC = 'https://www.youtube.com/iframe_api';

let apiPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('YouTube IFrame API unavailable during SSR'));
  }

  // Already available (another route/instance loaded it).
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    // Chain onto any pre-existing ready callback rather than overwriting it.
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try {
        previousReady?.();
      } catch {
        /* ignore third-party callback errors */
      }
      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error('YouTube IFrame API loaded without YT.Player'));
      }
    };

    // Reuse an existing tag if one is already in the document.
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener('error', () =>
        reject(new Error('YouTube IFrame API script failed to load')),
      );
      // If YT is somehow already present, resolve immediately.
      if (window.YT?.Player) resolve(window.YT);
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onerror = () => {
      apiPromise = null; // allow a later retry
      reject(new Error('YouTube IFrame API script failed to load'));
    };
    document.head.appendChild(script);
  });

  return apiPromise;
}
