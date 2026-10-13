/**
 * Force-scroll the document to the very bottom (for iOS standalone where #os may be taller than the viewport).
 * html/body are normally position:fixed + overflow:hidden + touch-action:none, which makes the document unscrollable,
 * so this adds :root.scroll-free (see style.css) which unlocks them and makes #os absolute so it contributes to page height.
 */
export function scrollToBottom() {
  document.documentElement.classList.add("scroll-free");
  const run = () => {
    const de = document.documentElement;
    const h = Math.max(de.scrollHeight, document.body.scrollHeight);
    window.scrollTo(0, h);
    const se = document.scrollingElement as HTMLElement | null;
    if (se) se.scrollTop = se.scrollHeight;
    de.scrollTop = de.scrollHeight; document.body.scrollTop = document.body.scrollHeight;
    // #os and any scrollable ancestor
    for (let el: HTMLElement | null = document.getElementById("os"); el; el = el.parentElement) el.scrollTop = el.scrollHeight;
  };
  run();
  requestAnimationFrame(() => { run(); requestAnimationFrame(run); });
  setTimeout(run, 300);
  setTimeout(run, 800);
}

/** ?scroll=bottom (or iOS home-screen app launch) → scroll to bottom on load. */
export function scrollFromParam() {
  const q = new URLSearchParams(location.search).get("scroll");
  const iosApp = (navigator as { standalone?: boolean }).standalone === true;
  // ?scroll=bottom forces it; iOS home-screen app does it on every launch (?scroll=off disables)
  if (q !== "bottom" && !(iosApp && q !== "off")) return;
  const go = () => scrollToBottom();
  if (document.readyState === "complete") go(); else window.addEventListener("load", go, { once: true });
  setTimeout(go, 500);
}
