import posthog from 'posthog-js';
import { ExplorationTracker } from './exploration';
import type { EventProperties } from './exploration';

let initialized = false;
let listening = false;
let exploration: ExplorationTracker | undefined;
let currentElement: { symbol: string; atomicNumber: number } | null = null;
const diagnostics = new Map<string, number>();

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

function enabled() {
  return import.meta.env.PROD && ['periodictable.tech', 'www.periodictable.tech'].includes(window.location.hostname);
}

/** Destinations are independent. Callers send bounded properties, never transcripts or error messages. */
export function trackEvent(name: string, properties: EventProperties = {}) {
  if (!enabled()) return;
  try { window.gtag?.('event', name, properties); } catch { /* Optional destination. */ }
  if (initialized) {
    try { posthog.capture(name, properties); } catch { /* Optional destination. */ }
  }
}

export function trackDiagnostic(name: string, properties: EventProperties = {}) {
  const count = diagnostics.get(name) || 0;
  if (count >= 5) return;
  diagnostics.set(name, count + 1);
  trackEvent(name, properties);
}

export function initAnalytics() {
  if (listening) return;
  listening = true;
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (key && enabled()) {
    try {
      posthog.init(key, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
        autocapture: false, capture_pageview: true, persistence: 'localStorage',
      });
      initialized = true;
    } catch { /* GA remains available if PostHog cannot initialize. */ }
  }
  let storage: Storage | undefined;
  try { storage = window.sessionStorage; } catch { /* Managed browser. */ }
  exploration = new ExplorationTracker(trackEvent, undefined, undefined, storage);
  const updateVisibility = () => exploration?.setVisible(!document.hidden && document.hasFocus());
  updateVisibility();
  document.addEventListener('visibilitychange', updateVisibility);
  window.addEventListener('focus', updateVisibility);
  window.addEventListener('blur', updateVisibility);
  window.addEventListener('pagehide', () => exploration?.close());
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) { exploration?.enter(currentElement); updateVisibility(); }
  });
  window.setInterval(() => exploration?.flush(), 30_000);
  window.addEventListener('error', () => trackDiagnostic('application_error', { kind: 'runtime' }));
  window.addEventListener('unhandledrejection', () => trackDiagnostic('application_error', { kind: 'unhandled_promise' }));
}

export function trackElementRoute(element: typeof currentElement) {
  currentElement = element;
  exploration?.enter(element);
}

const elementEvent = (name: string, symbol: string, atomicNumber: number, properties: EventProperties = {}) =>
  trackEvent(name, { symbol, atomic_number: atomicNumber, ...properties });

export const trackPhaseDiagramUsed = (s: string, n: number) => elementEvent('phase_diagram_used', s, n);
export const trackValenceToggle = (s: string, n: number, value: boolean) => elementEvent('valence_toggle', s, n, { valence_only: value });
export const trackOrbitalFilter = (s: string, n: number, filter: string | null) => elementEvent('orbital_filter', s, n, { filter });
export const trackUnfilledToggle = (s: string, n: number, value: boolean) => elementEvent('unfilled_toggle', s, n, { show_unfilled: value });
export const trackHybridization = (s: string, n: number, mode: string | null) => elementEvent('hybridization_toggle', s, n, { mode });
export const trackVideoPlayToggle = (s: string, n: number, value: boolean) => elementEvent('video_play_toggle', s, n, { is_playing: value });
export const trackVideoLoop = (s: string, n: number, loopCount: number) => elementEvent('video_loop', s, n, { loop_count: loopCount });
export const trackVoiceAgentActivated = () => trackEvent('voice_agent_activated');
