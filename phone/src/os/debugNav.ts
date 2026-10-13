/**
 * ?debug=nav — on-device navigation diagnostics. Shows:
 *  loads (sessionStorage counter, survives reloads in the tab/app session), navigation type,
 *  counters (popstate, hashchange, pageshow persisted, controllerchange, wallpaper renderer creations,
 *  home layouts, app opens/closes) and the last few events with timestamps.
 * Other modules call `navDebug.count(name)` / `navDebug.log(msg)`; they are no-ops unless enabled.
 */
const enabled = new URLSearchParams(location.search).get("debug") === "nav";
const counts: Record<string, number> = {};
const events: string[] = [];
let box: HTMLElement | null = null;

const render = () => {
  if (!box) return;
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  box.textContent =
    `loads ${sessionStorage.getItem("os.debug.loads")}  nav ${nav?.type ?? "?"}\n` +
    Object.entries(counts).map(([k, v]) => `${k} ${v}`).join("  ") + "\n" +
    events.slice(-6).join("\n");
};

export const navDebug = {
  enabled,
  count(name: string) { if (!enabled) return; counts[name] = (counts[name] || 0) + 1; render(); },
  log(msg: string) {
    if (!enabled) return;
    const t = new Date().toLocaleTimeString("ja-JP", { hour12: false }) + "." + String(Date.now() % 1000).padStart(3, "0");
    events.push(`${t} ${msg}`);
    render();
  },
};

export function startNavDebug() {
  if (!enabled) return;
  const n = Number(sessionStorage.getItem("os.debug.loads") || 0) + 1;
  sessionStorage.setItem("os.debug.loads", String(n));
  box = document.createElement("div");
  box.className = "nav-debug";
  document.body.append(box);
  window.addEventListener("popstate", (e) => { navDebug.count("popstate"); navDebug.log(`popstate ${JSON.stringify(e.state)}`); });
  window.addEventListener("hashchange", () => { navDebug.count("hashchange"); navDebug.log(`hashchange ${location.hash}`); });
  window.addEventListener("pageshow", (e) => { navDebug.count("pageshow"); navDebug.log(`pageshow persisted=${e.persisted}`); });
  window.addEventListener("pagehide", (e) => navDebug.log(`pagehide persisted=${e.persisted}`));
  window.addEventListener("beforeunload", () => navDebug.log("beforeunload"));
  document.addEventListener("visibilitychange", () => navDebug.log(`visibility ${document.visibilityState}`));
  navigator.serviceWorker?.addEventListener("controllerchange", () => { navDebug.count("ctrlchange"); navDebug.log("controllerchange"); });
  navDebug.log(`load #${n}`);
}
