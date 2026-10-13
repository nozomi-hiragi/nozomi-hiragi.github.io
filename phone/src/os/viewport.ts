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
  const apply = () => {
    const r = vp(), s = document.documentElement.style;
    s.setProperty("--vvh", r.height + "px");
    s.setProperty("--vvw", r.width + "px");
    s.setProperty("--vvt", r.top + "px");
    s.setProperty("--vvl", r.left + "px");
    onChange?.();
  };
  apply();
  window.visualViewport?.addEventListener("resize", apply);
  window.visualViewport?.addEventListener("scroll", apply);
  window.addEventListener("resize", apply);
}
