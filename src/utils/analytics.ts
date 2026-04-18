import posthog from 'posthog-js';

// ---------- PostHog ----------
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string) || 'https://us.i.posthog.com';

let initialized = false;

export function initAnalytics() {
  if (initialized || !POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false,
    capture_pageview: true,
    persistence: 'localStorage',
  });
  initialized = true;
}

// ---------- Element Events ----------

export function trackElementOpened(symbol: string, atomicNumber: number) {
  if (!initialized) return;
  posthog.capture('element_opened', { symbol, atomic_number: atomicNumber });
  gtag('event', 'element_opened', { symbol, atomic_number: atomicNumber });
}

export function trackElementClosed(symbol: string, atomicNumber: number, durationMs: number) {
  if (!initialized) return;
  posthog.capture('element_closed', { symbol, atomic_number: atomicNumber, duration_ms: durationMs });
  gtag('event', 'element_closed', { symbol, atomic_number: atomicNumber, duration_ms: durationMs });
}

// ---------- Phase Diagram ----------

export function trackPhaseDiagramUsed(symbol: string, atomicNumber: number) {
  if (!initialized) return;
  posthog.capture('phase_diagram_used', { symbol, atomic_number: atomicNumber });
  gtag('event', 'phase_diagram_used', { symbol, atomic_number: atomicNumber });
}

// ---------- Atom Visualizer Controls ----------

export function trackValenceToggle(symbol: string, atomicNumber: number, valenceOnly: boolean) {
  if (!initialized) return;
  posthog.capture('valence_toggle', { symbol, atomic_number: atomicNumber, valence_only: valenceOnly });
  gtag('event', 'valence_toggle', { symbol, atomic_number: atomicNumber, valence_only: valenceOnly });
}

export function trackOrbitalFilter(symbol: string, atomicNumber: number, filter: string | null) {
  if (!initialized) return;
  posthog.capture('orbital_filter', { symbol, atomic_number: atomicNumber, filter });
  gtag('event', 'orbital_filter', { symbol, atomic_number: atomicNumber, filter });
}

export function trackUnfilledToggle(symbol: string, atomicNumber: number, showUnfilled: boolean) {
  if (!initialized) return;
  posthog.capture('unfilled_toggle', { symbol, atomic_number: atomicNumber, show_unfilled: showUnfilled });
  gtag('event', 'unfilled_toggle', { symbol, atomic_number: atomicNumber, show_unfilled: showUnfilled });
}

export function trackHybridization(symbol: string, atomicNumber: number, mode: string | null) {
  if (!initialized) return;
  posthog.capture('hybridization_toggle', { symbol, atomic_number: atomicNumber, mode });
  gtag('event', 'hybridization_toggle', { symbol, atomic_number: atomicNumber, mode });
}

// ---------- Video Events ----------

export function trackVideoPlayToggle(symbol: string, atomicNumber: number, isPlaying: boolean) {
  if (!initialized) return;
  posthog.capture('video_play_toggle', { symbol, atomic_number: atomicNumber, is_playing: isPlaying });
  gtag('event', 'video_play_toggle', { symbol, atomic_number: atomicNumber, is_playing: isPlaying });
}

export function trackVideoLoop(symbol: string, atomicNumber: number, loopCount: number) {
  if (!initialized) return;
  posthog.capture('video_loop', { symbol, atomic_number: atomicNumber, loop_count: loopCount });
  gtag('event', 'video_loop', { symbol, atomic_number: atomicNumber, loop_count: loopCount });
}

// ---------- Voice Agent ----------

export function trackVoiceAgentActivated() {
  if (!initialized) return;
  posthog.capture('voice_agent_activated');
  gtag('event', 'voice_agent_activated');
}

// ---------- GA4 Helpers ----------

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  window.gtag?.(...args);
}
