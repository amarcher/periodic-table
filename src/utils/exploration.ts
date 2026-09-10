export type EventProperties = Record<string, string | number | boolean | null>;
export type EmitEvent = (name: string, properties?: EventProperties) => void;
type TrackedElement = { symbol: string; atomicNumber: number };

/** A route visit counts focused, visible time. Injectable clocks keep this testable. */
export class ExplorationTracker {
  private element: TrackedElement | null = null;
  private activeSince: number | null = null;
  private activeMs = 0;
  private reportedMs = 0;
  private visible = false;
  private discovered = new Set<string>();
  private lastActivity = 0;

  private emit: EmitEvent;
  private now: () => number;
  private wallTime: () => number;
  private storage?: Pick<Storage, 'getItem' | 'setItem'>;

  constructor(emit: EmitEvent, now = () => performance.now(),
    wallTime = () => Date.now(), storage?: Pick<Storage, 'getItem' | 'setItem'>) {
    this.emit = emit; this.now = now; this.wallTime = wallTime; this.storage = storage;
    try {
      const saved = JSON.parse(storage?.getItem('periodic-exploration') || 'null');
      if (saved && wallTime() - saved.updated < 30 * 60_000 && Array.isArray(saved.symbols)) {
        this.discovered = new Set(saved.symbols.filter((s: unknown) => typeof s === 'string' && /^[A-Z][a-z]?$/.test(s)));
        this.lastActivity = saved.updated;
      }
    } catch { /* Storage can be unavailable on managed devices. */ }
  }

  setVisible(visible: boolean) {
    this.accrue();
    this.visible = visible;
    this.activeSince = visible && this.element ? this.now() : null;
    if (!visible) this.flush();
  }

  enter(element: TrackedElement | null) {
    if (element?.symbol === this.element?.symbol) return;
    this.close();
    this.element = element;
    if (!element) return;
    if (this.wallTime() - this.lastActivity > 30 * 60_000) this.discovered.clear();
    this.discovered.add(element.symbol);
    this.save();
    this.activeSince = this.visible ? this.now() : null;
    this.emit('element_opened', this.properties());
    this.emit('exploration_progress', { distinct_elements: this.discovered.size });
  }

  flush() {
    this.accrue();
    const delta = Math.round(this.activeMs - this.reportedMs);
    if (this.element && delta > 0) {
      this.emit('element_engagement', { ...this.properties(), active_ms: delta });
      this.reportedMs = this.activeMs;
      this.save();
    }
  }

  close() {
    if (!this.element) return;
    this.flush();
    this.emit('element_closed', { ...this.properties(), duration_ms: Math.round(this.activeMs) });
    this.element = null;
    this.activeSince = null;
    this.activeMs = 0;
    this.reportedMs = 0;
  }

  private properties() { return { symbol: this.element!.symbol, atomic_number: this.element!.atomicNumber }; }
  private accrue() {
    if (this.activeSince === null) return;
    const now = this.now();
    this.activeMs += Math.max(0, now - this.activeSince);
    this.activeSince = now;
  }
  private save() {
    this.lastActivity = this.wallTime();
    try {
      this.storage?.setItem('periodic-exploration', JSON.stringify({ updated: this.lastActivity, symbols: [...this.discovered] }));
    } catch { /* Tracking must never interrupt navigation. */ }
  }
}
