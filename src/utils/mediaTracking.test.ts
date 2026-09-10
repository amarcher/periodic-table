import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkMicrophone, VideoPlaybackTracker, VoiceAttempt } from './mediaTracking';
afterEach(() => vi.useRealTimers());
describe('media outcomes', () => {
  it('counts natural video loops and ignores seeks and hidden playback', () => {
    const tracker = new VideoPlaybackTracker();
    tracker.sample(7.5, 8, true, false);
    expect(tracker.sample(0.25, 8, true, false)).toBe(true);
    expect(tracker.loopCount).toBe(1);
    expect(tracker.takeWatchedMs()).toBe(750);
    tracker.sample(7.8, 8, true, true);
    tracker.sample(0, 8, true, false);
    tracker.sample(4, 8, false, false);
    tracker.sample(5, 8, true, false);
    expect(tracker.loopCount).toBe(1);
    expect(tracker.takeWatchedMs()).toBe(0);
  });
  it('counts the native seek-to-start at a loop boundary only once', () => {
    const tracker = new VideoPlaybackTracker();
    tracker.sample(7.8, 8, true, false);
    expect(tracker.sample(0, 8, true, true)).toBe(true);
    expect(tracker.sample(0, 8, true, true)).toBe(false);
    tracker.sample(0.25, 8, true, false);
    expect(tracker.loopCount).toBe(1);
    expect(tracker.takeWatchedMs()).toBe(200);
  });
  it('distinguishes attempts, connections, failures, and one terminal event', () => {
    let now = 0;
    const emit = vi.fn();
    const voice = new VoiceAttempt(emit, () => now);
    voice.start(); voice.start(); now = 1500; voice.connected(); voice.connected();
    now = 11500; voice.finish('user'); voice.finish('remote');
    expect(emit.mock.calls).toEqual([
      ['voice_agent_activated'], ['voice_connected', { connection_ms: 1500 }],
      ['voice_session_ended', { reason: 'user', duration_ms: 10000 }],
    ]);
    voice.start(); voice.finish('microphone_denied');
    expect(emit).toHaveBeenLastCalledWith('voice_connection_failed', { reason: 'microphone_denied' });
  });
  it('releases the microphone even if permission resolves after the timeout', async () => {
    vi.useFakeTimers();
    let grant!: (stream: MediaStream) => void;
    const stop = vi.fn();
    const permission = new Promise<MediaStream>(resolve => { grant = resolve; });
    const result = checkMicrophone(() => permission, 100);
    const assertion = expect(result).rejects.toMatchObject({ name: 'TimeoutError' });
    await vi.advanceTimersByTimeAsync(100);
    await assertion;
    grant({ getTracks: () => [{ stop }] } as unknown as MediaStream);
    await Promise.resolve();
    expect(stop).toHaveBeenCalledOnce();
  });
});
