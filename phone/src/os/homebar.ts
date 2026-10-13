import { relLum, requestWallpaperSample, wallpaperLuminance } from "../wallpaper";

/** Picks a solid white/black bar (home bar / top pill) from the average luminance behind the whole bar. `skip`: own hit-zone selector. */
export function initHomeBar(bar: HTMLElement, skip = ".home-bar-zone") {
  const parse = (c: string) => { const m = c.match(/[\d.]+/g); return m ? m.map(Number) : null; };
  function update() {
    const r = bar.getBoundingClientRect(); if (!r.width) return;
    requestWallpaperSample(r);
    const y = r.top + r.height / 2; let sum = 0, n = 0;
    for (let i = 0; i < 7; i++) {
      const x = r.left + (r.width * (i + 0.5)) / 7;
      for (const el of document.elementsFromPoint(x, y)) {
        if (el === bar || el.closest(skip)) continue;
        if (el.tagName === "CANVAS") { const l = wallpaperLuminance(); if (l != null) { sum += l; n++; } break; }
        const c = parse(getComputedStyle(el).backgroundColor);
        if (c && c.length >= 3 && (c[3] ?? 1) > 0.5) { sum += relLum(c[0], c[1], c[2]); n++; break; }
      }
    }
    const lum = n ? sum / n : wallpaperLuminance() ?? 0; // nothing opaque -> wallpaper (dark default)
    bar.classList.toggle("hb-dark", lum > 0.5);
  }
  let t = 0;
  const later = () => { clearTimeout(t); t = window.setTimeout(() => { update(); setTimeout(update, 450); }, 30); };
  new MutationObserver((ms) => { if (ms.some((m) => m.target !== bar && !(m.target instanceof Element && m.target.closest(".clock,.nc-clock,.status")))) later(); }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"], childList: true });
  addEventListener("resize", later);
  setInterval(update, 700);
  update();
  return update;
}
