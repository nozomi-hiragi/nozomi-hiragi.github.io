/**
 * Visible-area model. On mobile, innerHeight / 100vh can differ from what is actually visible
 * (address bar, toolbars, pinch zoom). We size #os to window.visualViewport and expose:
 *   --vvh / --vvw / --vvt / --vvl CSS vars, and vp() for gesture math.
 */
export function vp() {
  const v = window.visualViewport;
  return v
    ? { top: v.offsetTop, left: v.offsetLeft, width: v.width, height: v.height }
    : { top: 0, left: 0, width: innerWidth, height: innerHeight };
}

export function trackViewport(onChange?: () => void) {
  let prev = "";
  const apply = () => {
    const r = vp(), s = document.documentElement.style;
    // skip no-op writes (avoid style invalidation / reflow on every scroll/resize event)
    const key = [r.width, r.height, r.top, r.left].map(Math.round).join(",");
    if (key === prev) return;
    prev = key;
    s.setProperty("--vvh", r.height + "px");
    s.setProperty("--vvw", r.width + "px");
    s.setProperty("--vvt", r.top + "px");
    s.setProperty("--vvl", r.left + "px");
    onChange?.();
  };
  // iOS standalone (black-translucent: short innerHeight): extend #os height to screen.height so it isn't shortened (?tall=0 disables)
  if ((navigator as { standalone?: boolean }).standalone === true && new URLSearchParams(location.search).get("tall") !== "0") {
    document.documentElement.classList.add("ios-tall");
    const setScr = () => document.documentElement.style.setProperty("--scrh", Math.max(innerHeight, screen.height) + "px");
    setScr(); window.addEventListener("resize", setScr);
  }
  apply();
  window.visualViewport?.addEventListener("resize", apply);
  window.visualViewport?.addEventListener("scroll", apply);
  window.addEventListener("resize", apply);
}
