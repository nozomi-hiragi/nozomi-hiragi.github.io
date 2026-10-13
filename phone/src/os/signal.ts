/**
 * Signal model: rewards exploring apps.
 * - Starts at 1G with 0 bars (shown as "1G" with greyed bars).
 * - Each app id opened for the first time: +1 bar (max 4).
 * - Opening a new app at 4 bars: generation +1 (2G, 3G, ...) and bars reset to 1.
 *   => n unique opens: n=0 -> 1G/0, else gen = 1 + floor((n-1)/4), bars = (n-1)%4 + 1.
 * - Opened ids persist in localStorage ("os.signal.opened").
 * Debug: ?resetSignal=1 clears it; ?signalOpened=N simulates N unique opens.
 */
const KEY = "os.signal.opened";

export type SignalState = { gen: number; bars: number };

export function signalFor(n: number): SignalState {
  if (n <= 0) return { gen: 1, bars: 0 };
  return { gen: 1 + Math.floor((n - 1) / 4), bars: ((n - 1) % 4) + 1 };
}

export class Signal {
  private opened: Set<string>;
  onChange: (s: SignalState, upgraded: boolean) => void = () => {};

  constructor() {
    const q = new URLSearchParams(location.search);
    if (q.has("resetSignal")) localStorage.removeItem(KEY);
    let ids: string[] = [];
    try { ids = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { /* ignore */ }
    this.opened = new Set(ids);
    const sim = Number(q.get("signalOpened"));
    if (q.has("signalOpened") && Number.isFinite(sim)) {
      this.opened = new Set(Array.from({ length: Math.max(0, sim) }, (_, i) => `debug-${i}`));
      this.save();
    }
  }

  get state() { return signalFor(this.opened.size); }

  /** record an app open; returns true if it was new */
  open(id: string) {
    if (this.opened.has(id)) return false;
    const before = this.state.gen;
    this.opened.add(id);
    this.save();
    this.onChange(this.state, this.state.gen > before);
    return true;
  }

  /** forget all opened apps (back to 1G / 0 bars) */
  reset() {
    this.opened.clear();
    this.save();
    this.onChange(this.state, false);
  }

  private save() { localStorage.setItem(KEY, JSON.stringify([...this.opened])); }
}
