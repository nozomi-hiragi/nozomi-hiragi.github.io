/** ?insets=1: overlay showing raw env(safe-area-inset-*), the used --sat/--sab/--sal/--sar, and visualViewport size. */
export function startInsetsDebug() {
  const box = document.createElement("div");
  box.className = "insets-debug";
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;visibility:hidden;pointer-events:none;padding:var(--sat) var(--sar) var(--sab) var(--sal);";
  // raw env() probe: not affected by the fullscreen override of the --sa* vars
  const envProbe = document.createElement("div");
  envProbe.style.cssText = "position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px);";
  document.body.append(probe, envProbe, box);
  const update = () => {
    const cs = getComputedStyle(probe), ev = getComputedStyle(envProbe), v = window.visualViewport;
    const trbl = (c: CSSStyleDeclaration) => [c.paddingTop, c.paddingBottom, c.paddingLeft, c.paddingRight].map((x) => parseFloat(x)).join("/");
    box.textContent =
      `env  t/b/l/r ${trbl(ev)}\n` +
      `used --sat/sab/sal/sar ${trbl(cs)}\n` +
      `vv ${v ? `${Math.round(v.width)}x${Math.round(v.height)} @${Math.round(v.offsetLeft)},${Math.round(v.offsetTop)} s${v.scale.toFixed(2)}` : "n/a"}\n` +
      `device ${document.documentElement.dataset.device ?? "?"}\n` +
      `inner ${innerWidth}x${innerHeight}  fs ${document.fullscreenElement ? "on" : "off"}`;
  };
  update();
  window.visualViewport?.addEventListener("resize", update);
  window.visualViewport?.addEventListener("scroll", update);
  window.addEventListener("resize", update);
  document.addEventListener("fullscreenchange", update);
  setInterval(update, 1000);
}
