import { describe, expect, it, vi } from 'vitest';
import { ExplorationTracker } from './exploration';

const hydrogen = { symbol: 'H', atomicNumber: 1 };
const gold = { symbol: 'Au', atomicNumber: 79 };
describe('exploration journeys', () => {
  it('counts a direct landing once and measures focused time across hidden intervals', () => {
    let now = 1000;
    const emit = vi.fn();
    const tracker = new ExplorationTracker(emit, () => now);
    tracker.setVisible(true);
    tracker.enter(hydrogen);
    tracker.enter(hydrogen); // Repeated React effects are not another visit.
    now = 4000;
    tracker.setVisible(false);
    now = 104000;
    tracker.setVisible(true);
    now = 106000;
    tracker.enter(null);
    expect(emit.mock.calls.filter(([name]) => name === 'element_opened')).toHaveLength(1);
    expect(emit).toHaveBeenCalledWith('element_closed', { symbol: 'H', atomic_number: 1, duration_ms: 5000 });
    const checkpoints = emit.mock.calls.filter(([name]) => name === 'element_engagement');
    expect(checkpoints.map(([, props]) => props.active_ms)).toEqual([3000, 2000]);
  });
  it('counts unique elements across reloads, but starts fresh after inactivity', () => {
    let now = 10000000;
    const store = new Map<string, string>();
    const storage = { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => { store.set(key, value); } };
    const emit = vi.fn();
    const first = new ExplorationTracker(emit, () => now, () => now, storage);
    first.enter(hydrogen); first.enter(gold); first.enter(hydrogen);
    expect(emit).toHaveBeenLastCalledWith('exploration_progress', { distinct_elements: 2 });
    const reload = new ExplorationTracker(emit, () => now, () => now, storage);
    reload.enter(gold);
    expect(emit).toHaveBeenLastCalledWith('exploration_progress', { distinct_elements: 2 });
    now += 31 * 60000;
    reload.enter(hydrogen);
    expect(emit).toHaveBeenLastCalledWith('exploration_progress', { distinct_elements: 1 });
  });
  it('handles unavailable storage and pagehide without duplicate close events', () => {
    const emit = vi.fn();
    const tracker = new ExplorationTracker(emit, () => 0, () => 0, { getItem: () => { throw Error(); }, setItem: () => { throw Error(); } });
    tracker.enter(gold); tracker.close(); tracker.close();
    expect(emit.mock.calls.filter(([name]) => name === 'element_closed')).toHaveLength(1);
    expect(emit).toHaveBeenLastCalledWith('element_closed', { symbol: 'Au', atomic_number: 79, duration_ms: 0 });
  });
});
