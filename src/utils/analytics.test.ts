import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const posthog = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn() }));
vi.mock('posthog-js', () => ({ default: posthog }));
const gtag = vi.fn();
beforeEach(() => {
  vi.resetModules(); vi.resetAllMocks();
  vi.stubEnv('PROD', true);
  vi.stubEnv('VITE_POSTHOG_KEY', '');
  vi.stubGlobal('window', { location: { hostname: 'periodictable.tech' }, gtag,
    addEventListener: vi.fn(), setInterval: vi.fn() });
  vi.stubGlobal('document', { hidden: false, hasFocus: () => true, addEventListener: vi.fn() });
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('independent analytics destinations', () => {
  it('sends GA events even with no PostHog key', async () => {
    const analytics = await import('./analytics');
    analytics.initAnalytics();
    analytics.trackPhaseDiagramUsed('H', 1);
    expect(gtag).toHaveBeenCalledWith('event', 'phase_diagram_used', { symbol: 'H', atomic_number: 1 });
    expect(posthog.init).not.toHaveBeenCalled();
  });
  it('keeps PostHog working when GA throws, and GA working when PostHog throws', async () => {
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key');
    const analytics = await import('./analytics');
    analytics.initAnalytics();
    gtag.mockImplementationOnce(() => { throw Error('blocked'); });
    analytics.trackEvent('voice_connected', { connection_ms: 200 });
    expect(posthog.capture).toHaveBeenCalledWith('voice_connected', { connection_ms: 200 });
    posthog.capture.mockImplementationOnce(() => { throw Error('blocked'); });
    expect(() => analytics.trackEvent('voice_session_ended')).not.toThrow();
    expect(gtag).toHaveBeenLastCalledWith('event', 'voice_session_ended', {});
  });
  it('does not send local verification traffic and bounds repetitive errors', async () => {
    const analytics = await import('./analytics');
    for (let i = 0; i < 20; i++) analytics.trackDiagnostic('video_stalled');
    expect(gtag).toHaveBeenCalledTimes(5);
    window.location.hostname = 'localhost';
    analytics.trackEvent('element_opened');
    expect(gtag).toHaveBeenCalledTimes(5);
  });
});
