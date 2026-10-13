/**
 * Debounced size watcher that ignores tiny jitter (iOS toolbars / visualViewport wobble during navigation).
 * Calls cb only when width changes, or height changes by more than `minDh` px.
 */
export function onStableResize(get: () => { w: number; h: number }, cb: () => void, { delay = 150, minDh = 4 } = {}) {
  let last = get(), t = 0;
  const check = () => {
    clearTimeout(t);
    t = window.setTimeout(() => {
      const now = get();
      if (Math.abs(now.w - last.w) < 1 && Math.abs(now.h - last.h) <= minDh) return;
      last = now;
      cb();
    }, delay);
  };
  window.addEventListener("resize", check);
  window.visualViewport?.addEventListener("resize", check);
}
