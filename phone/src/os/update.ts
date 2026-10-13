import { VERSION } from "../version";
import { navDebug } from "./debugNav";

/**
 * Service-worker registration + update detection.
 * A new build installs in the background and waits; `waitingVersion` is then the new version
 * (read from version.json, bypassing caches). `apply()` activates it and reloads.
 */
export class Updater {
  readonly current = VERSION;
  waitingVersion: string | null = null;
  supported = "serviceWorker" in navigator && import.meta.env.PROD;
  private reg: ServiceWorkerRegistration | null = null;
  private listeners: (() => void)[] = [];

  onChange(cb: () => void) { this.listeners.push(cb); }
  private emit() { this.listeners.forEach((f) => f()); }

  async start() {
    if (!this.supported) return;
    // self-heal: if this version's cache is missing (e.g. after キャッシュを取り直す), refill it from the page
    // (done before register(), which can stay pending while an unregistration completes)
    void this.refillCache();
    try {
      this.reg = await navigator.serviceWorker.register(import.meta.env.BASE_URL + "sw.js", { scope: import.meta.env.BASE_URL });
    } catch (e) { console.warn("SW register failed", e); this.supported = false; return; }
    const reg = this.reg;
    const watch = (w: ServiceWorker | null) => {
      if (!w) return;
      const check = () => { if (w.state === "installed" && navigator.serviceWorker.controller) this.markWaiting(); };
      w.addEventListener("statechange", check);
      check();
    };
    if (reg.waiting && navigator.serviceWorker.controller) this.markWaiting();
    watch(reg.installing);
    reg.addEventListener("updatefound", () => watch(reg.installing));
    // reload only when an update replaces an existing controller (not on the very first install/claim)
    // the first controllerchange on an uncontrolled page is the initial clients.claim() -> just note it
    let hadController = !!navigator.serviceWorker.controller;
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController) { hadController = true; return; }
      navDebug.log("controllerchange -> reload");
      if (!reloading) { reloading = true; location.reload(); }
    });
    setInterval(() => reg.update().catch(() => {}), 30 * 60_000);
  }

  private async refillCache() {
    const name = "phone-os-" + this.current;
    if (await caches.has(name)) return;
    const urls = [import.meta.env.BASE_URL,
      ...[...document.querySelectorAll<HTMLScriptElement>("script[src]")].map((e) => e.src),
      ...[...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"],link[rel="manifest"],link[rel="icon"]')].map((e) => e.href)];
    try { await (await caches.open(name)).addAll(urls); } catch (e) { console.warn("cache refill failed", e); }
  }

  /** last check result: null = ok, otherwise an error label (e.g. offline) */
  checkError: string | null = null;
  /** newer version seen on the server (may still be downloading until `waitingVersion` is set) */
  availableVersion: string | null = null;

  /**
   * Ask the server directly (version.json, no-store, 8s timeout) and kick off the SW update in the background.
   * (registration.update() alone can stay pending for a long time, so it isn't awaited.)
   */
  async check() {
    this.checkError = null;
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 8000);
      const r = await fetch(import.meta.env.BASE_URL + "version.json", { cache: "no-store", signal: ctl.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const v = (await r.json()).version as string;
      this.availableVersion = v && v !== this.current ? v : null;
      if (this.availableVersion) void this.reg?.update().catch(() => {});
    } catch (e) {
      console.warn("update check failed", e);
      this.checkError = "確認に失敗";
      throw e;
    } finally { this.emit(); }
  }

  private async markWaiting() {
    try {
      const r = await fetch(import.meta.env.BASE_URL + "version.json", { cache: "no-store" });
      this.waitingVersion = (await r.json()).version ?? "?";
    } catch { this.waitingVersion = "?"; }
    if (this.waitingVersion === this.current) this.waitingVersion = null;
    this.emit();
  }

  /** delete phone-os-* caches, unregister the SW, reload (fresh fetch of everything) */
  async resetCache() {
    const timeout = (ms: number) => new Promise((r) => setTimeout(r, ms));
    try {
      for (const k of await caches.keys()) if (k.startsWith("phone-os-")) await caches.delete(k);
      const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
      // unregister() can stay pending while this page is controlled; don't let it block the reload
      await Promise.race([Promise.all(regs.map((r) => r.unregister())), timeout(800)]);
    } catch (e) { console.warn("cache reset failed", e); }
    location.reload();
  }

  /** activate the waiting version; the page reloads on controllerchange (promise stays pending until then) */
  apply(): Promise<void> {
    this.reg?.waiting?.postMessage("skipWaiting");
    return new Promise(() => {});
  }
}

export const updater = new Updater();
