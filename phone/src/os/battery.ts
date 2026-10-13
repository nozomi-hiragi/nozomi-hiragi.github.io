/**
 * Battery model.
 * - Day max: 100 - daysSinceUpdate * 100 / 365 (update date = build time, __UPDATE_DATE__).
 *   Every reload starts again at that day's max (intended).
 * - During a session it drops 1% per hour viewed (hidden-tab time doesn't count).
 * - When it reaches 0 and stays at 0 for 1 continuous hour, the screen dies (black).
 * Debug: ?battHours=N adds N viewed hours at start.
 */
const HOUR = 3600_000;

export class Battery {
  readonly max: number;
  readonly updateDate: Date;
  private viewedMs: number;
  private lastTick = performance.now();
  onChange: (pct: number, dead: boolean) => void = () => {};

  constructor(updateDate = new Date(__UPDATE_DATE__), now = new Date()) {
    this.updateDate = updateDate;
    const days = Math.max(0, Math.floor((now.getTime() - updateDate.getTime()) / 86400_000));
    this.max = Math.max(0, 100 - (days * 100) / 365);
    const dbg = Number(new URLSearchParams(location.search).get("battHours"));
    this.viewedMs = Number.isFinite(dbg) ? dbg * HOUR : 0;
    document.addEventListener("visibilitychange", () => { this.lastTick = performance.now(); });
  }

  /** call regularly (e.g. every second) */
  tick() {
    const t = performance.now();
    if (document.visibilityState === "visible") this.viewedMs += t - this.lastTick;
    this.lastTick = t;
    this.onChange(this.percent, this.dead);
  }

  get percent() {
    return Math.max(0, Math.ceil(this.max - this.viewedMs / HOUR));
  }
  /** viewed time spent at 0% (continuous, since reaching 0 it can only stay 0 in-session) */
  get dead() {
    const zeroAt = this.max * HOUR; // viewed ms when it hits 0
    return this.viewedMs - zeroAt >= HOUR;
  }
}
