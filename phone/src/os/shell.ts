import { openExternal } from "./linkOpen";
import { initHomeBar } from "./homebar";
import { Home } from "./home";
import { AppDef, apps, getView, registerView } from "./apps";
import { settingsView } from "../apps/settings";
import { updater } from "./update";
import { isAppDisplayMode } from "./displayMode";
import { navDebug } from "./debugNav";
import { isIOS } from "./platform";
import { h, fmtTime, clamp } from "./util";
import { Battery } from "./battery";
import { vp } from "./viewport";
import { quickSettings } from "./quickSettings";
import { Signal } from "./signal";
import { loadNotifications, Notification } from "./notifications";

/** OS shell: status bar, lock screen, home, app windows, home gesture, notification center. */
export class Shell {
  private home = new Home();
  private lock = h("div", "lock", `<div class="date"></div><div class="clock"></div><div class="hint">⌃ Swipe up to unlock</div>`);
  private nc = h("div", "nc", `<div class="nc-scroll"><div class="nc-head"><span class="nc-clock"></span><span class="nc-date"></span><button class="nc-gear" aria-label="設定"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1L11 21h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg></button></div><div class="qs"></div><div class="nc-list"></div></div><div class="nc-handle" aria-label="drag to close"><i></i></div>`);
  private notifs: Notification[] = loadNotifications();
  private read = new Set<string>();
  private homeZone = h("div", "home-bar-zone", `<div class="home-bar"></div>`);
  private ncZone = h("div", "nc-zone", `<div class="top-pill"></div>`);
  private battery = new Battery();
  private signal = new Signal();
  private toastEl = h("div", "toast");
  private dead = h("div", "dead");
  private win: { el: HTMLElement; from: DOMRect; cleanup?: () => void } | null = null;

  // ---- browser history integration ----
  // States: {os:"home"} (base entry, replaced on load), {os:"app", id}, {os:"nc"} (URL unchanged).
  // Back closes the app / panel; UI closes call history.back() so history doesn't grow. Query (?demo=1) is preserved.
  private ignorePop = 0;
  private pendingDeepLink: string | null = null;
  private base = () => location.pathname + location.search;
  /**
   * Whether app / Notification Center opens create history entries. iOS shows a stale snapshot during its
   * back-swipe and then re-renders (visible hitch), so it's off on iOS by default. ?hist=on|off forces it.
   */
  private useHistory = (() => {
    const q = new URLSearchParams(location.search).get("hist");
    if (q === "on") return true;
    if (q === "off") return false;
    return !isIOS();
  })();
  private push(state: object) { if (this.useHistory) history.pushState(state, ""); }
  private leaveHistory(kind: "app" | "nc") {
    if (!this.useHistory) return;
    if (history.state?.os === kind) { this.ignorePop++; history.back(); }
  }
  private onPop() {
    if (this.ignorePop > 0) { this.ignorePop--; return; }
    let st = history.state as { os?: string; id?: string } | null;
    // manual hash edit / link to #/app/<id> within the page (state is null)
    const m = !st && /^#\/app\/([^/?#]+)/.exec(location.hash);
    if (m) { st = { os: "app", id: decodeURIComponent(m[1]) }; history.replaceState(st, "", this.base()); } // clean URL
    if (this.nc.classList.contains("open") && st?.os !== "nc") this.closeNC(true);
    if (this.win && st?.os !== "app") this.closeApp(true);
    if (st?.os === "app" && st.id && !this.win) this.openById(st.id, true); // forward button
  }
  private openById(id: string, fromHistory = false) {
    const app = apps.find((a) => a.id === id && a.mode === "internal");
    if (!app) return false;
    const r = this.home.iconRect(id) ?? new DOMRect(vp().width / 2 - 30, vp().height / 2 - 30, 60, 60);
    this.openApp(app, r, fromHistory);
    return true;
  }

  constructor(private root: HTMLElement, opts: { unlocked?: boolean } = {}) {
    const deep = /^#\/app\/([^/?#]+)/.exec(location.hash)?.[1];
    // iOS standalone treats URL changes as navigations (repaint / status-bar treatment), so the URL stays clean:
    // history entries carry only state; #/app/<id> is read once as a deep link and then removed.
    history.scrollRestoration = "manual";
    history.replaceState({ os: "home" }, "", this.base());
    window.addEventListener("popstate", () => this.onPop());
    root.append(this.home.el, this.nc, this.ncZone, h("div", "bottom-blur"), this.homeZone);
    initHomeBar(this.homeZone.querySelector(".home-bar") as HTMLElement);
    initHomeBar(this.ncZone.querySelector(".top-pill") as HTMLElement, ".nc-zone");
    // OS -> content-layer safe-area contract (Home, NC, lock, app windows all lay out from --app-sat/--app-sab)
    for (const el of [this.home.el, this.nc, this.lock]) this.applyAppInsets(el);
    if (!opts.unlocked) root.append(this.lock);
    this.home.onOpen = (a, r) => this.openApp(a, r);
    this.battery.onChange = (_pct, dead) => {
      if (dead && !this.dead.isConnected) root.append(this.dead);
    };
    root.append(this.toastEl);
    this.signal.onChange = (st, up) => { this.renderNotifications(); if (up) this.toast(`${st.gen}Gにアップグレード`); };
    this.renderNotifications();
    registerView("settings", settingsView({ signal: this.signal, battery: this.battery }));
    this.renderQuickSettings();
    this.bindFullscreenClass();
    updater.onChange(() => { if (updater.waitingVersion) this.toast(`新しいバージョン ${updater.waitingVersion} があります（設定 > アップデート）`); });
    updater.start();
    this.tick();
    setInterval(() => this.tick(), 1000);
    this.bindLock();
    if (deep) {
      const id = decodeURIComponent(deep);
      if (opts.unlocked) requestAnimationFrame(() => this.openById(id)); else this.pendingDeepLink = id; // after unlock
    }
    this.bindHomeGesture();
    this.bindNotificationCenter();
  }

  /** Content layers get the site safe areas plus the OS bars (notification pill on top, home bar at bottom). */
  private applyAppInsets(el: HTMLElement) {
    el.style.setProperty("--app-sat", "calc(var(--sat) + var(--nbar-h))");
    el.style.setProperty("--app-sab", "calc(var(--sab) + var(--hbar-h) + 5px)");
  }

  toast(msg: string) {
    this.toastEl.textContent = msg;
    this.toastEl.classList.add("show");
    clearTimeout((this.toastEl as unknown as { t?: number }).t);
    (this.toastEl as unknown as { t?: number }).t = window.setTimeout(() => this.toastEl.classList.remove("show"), 2600);
  }

  private tick() {
    const d = new Date();
    this.battery.tick();
    this.lock.querySelector(".clock")!.textContent = fmtTime(d);
    this.nc.querySelector(".nc-clock")!.textContent = fmtTime(d);
    this.nc.querySelector(".nc-date")!.textContent = d.toLocaleDateString("ja-JP", { month: "long", day: "numeric" }) + `(${d.toLocaleDateString("ja-JP", { weekday: "short" })})`;
    this.lock.querySelector(".date")!.textContent = d.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "long" });
  }

  /** vertical drag helper */
  private drag(el: HTMLElement, move: (dy: number, e: PointerEvent) => void, end: (dy: number, vy: number, e: PointerEvent) => void, lazyCapture = false) {
    let sy = 0, ly = 0, lt = 0, vy = 0, on = false;
    let cap = false;
    el.addEventListener("pointerdown", (e) => { on = true; cap = false; sy = ly = e.clientY; lt = performance.now(); vy = 0; if (!lazyCapture) { cap = true; el.setPointerCapture(e.pointerId); } });
    el.addEventListener("pointermove", (e) => {
      if (!on) return;
      // capture only once it is a real drag, so taps still reach child elements (e.g. notification cards)
      if (!cap && Math.abs(e.clientY - sy) > 5) { cap = true; el.setPointerCapture(e.pointerId); }
      const t = performance.now(); vy = (e.clientY - ly) / Math.max(1, t - lt); ly = e.clientY; lt = t;
      move(e.clientY - sy, e);
    });
    const up = (e: PointerEvent) => { if (!on) return; on = false; end(e.clientY - sy, vy, e); };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  private bindLock() {
    this.drag(this.lock, (dy) => {
      this.lock.classList.remove("anim");
      const y = Math.min(0, dy);
      this.lock.style.transform = `translateY(${y}px)`;
      this.lock.style.opacity = String(1 + y / vp().height);
    }, (dy, vy) => {
      this.lock.classList.add("anim");
      if (dy < -vp().height / 4 || vy < -0.5) this.unlock();
      else { this.lock.style.transform = ""; this.lock.style.opacity = ""; }
    });
  }

  unlock() {
    this.lock.classList.add("anim");
    this.lock.style.transform = "translateY(-100%)";
    this.lock.style.opacity = "0";
    setTimeout(() => this.lock.remove(), 420);
    if (this.pendingDeepLink) { const id = this.pendingDeepLink; this.pendingDeepLink = null; setTimeout(() => this.openById(id), 300); }
  }

  private bindHomeGesture() {
    this.drag(this.homeZone, (dy) => {
      if (this.win && dy < 0) {
        const s = clamp(1 + dy / vp().height, 0.5, 1);
        this.win.el.classList.remove("anim");
        this.win.el.style.transform = `translate(${(1 - s) * vp().width / 2}px, ${(1 - s) * vp().height / 2 + dy * 0.3}px) scale(${s})`;
        this.win.el.style.borderRadius = "32px";
      }
    }, (dy, vy) => {
      if (this.win) {
        if (dy < -60 || vy < -0.5) this.closeApp();
        else { this.win.el.classList.add("anim"); this.win.el.style.transform = ""; this.win.el.style.borderRadius = ""; }
      } else if (dy < -30 || Math.abs(dy) < 5) this.home.goTo(0); // tap/swipe on home bar = go to first page
      if (this.nc.classList.contains("open")) this.closeNC();
    });
  }

  /** visible = stage <= current generation, not yet read */
  private visibleNotifs() {
    const gen = this.signal.state.gen;
    return this.notifs.filter((n) => (n.stage ?? 1) <= gen && !this.read.has(n.id));
  }

  private renderNotifications() {
    const list = this.nc.querySelector<HTMLElement>(".nc-list")!;
    const vis = this.visibleNotifs();
    list.replaceChildren();
    if (!vis.length) list.append(h("div", "nc-empty", "通知はありません"));
    for (const n of vis) {
      const card = h("div", "notif");
      const ic = h("div", "notif-icon"); ic.textContent = n.icon ?? n.app.icon;
      const tx = h("div", "notif-text");
      const ap = h("div", "notif-app"); ap.textContent = n.app.name;
      const ti = h("div", "notif-title"); ti.textContent = n.title;
      const bo = h("div", "notif-body"); bo.textContent = n.body;
      tx.append(ap, ti, bo); card.append(ic, tx);
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeNC(false, n.app.mode === "internal");
        const r = this.home.iconRect(n.app.id) ?? new DOMRect(vp().width / 2 - 30, vp().height / 2 - 30, 60, 60);
        this.openApp(n.app, r);
      });
      list.append(card);
    }
    const counts = new Map<string, number>();
    for (const n of vis) counts.set(n.appId, (counts.get(n.appId) || 0) + 1);
    this.home.setBadges(counts);
  }

  /** root .fs class mirrors fullscreen state (CSS drops safe-area insets in fullscreen) */
  private bindFullscreenClass() {
    // .fs also when installed and launched in fullscreen/standalone display mode
    // .fs (drop top/side insets) only for TRUE fullscreen: Fullscreen API or display-mode fullscreen (Android install).
    // iOS home-screen apps run "standalone" with the system status bar still drawn over the page -> keep the top inset.
    // .standalone: installed app of any kind -> size #os to the full screen instead of the visual viewport.
    const sync = () => {
      const fsMode = matchMedia("(display-mode: fullscreen)").matches;
      document.documentElement.classList.toggle("fs", !!document.fullscreenElement || fsMode);
      document.documentElement.classList.toggle("standalone", isAppDisplayMode());
    };
    document.addEventListener("fullscreenchange", sync);
    for (const q of ["(display-mode: fullscreen)", "(display-mode: standalone)"]) matchMedia(q).addEventListener("change", () => { sync(); this.renderQuickSettings(); });
    sync();
  }

  private renderQuickSettings() {
    const row = this.nc.querySelector<HTMLElement>(".qs")!;
    row.replaceChildren();
    for (const q of quickSettings) {
      if (q.supported && !q.supported()) continue; // e.g. Fullscreen API on iPhone Safari
      const b = h("button", "qs-btn");
      b.setAttribute("aria-label", q.label);
      const paint = () => { const on = q.isOn(); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); b.innerHTML = q.icon(on); };
      b.addEventListener("click", async (e) => { e.stopPropagation(); await q.toggle(); paint(); });
      q.subscribe?.(paint);
      paint();
      row.append(b);
    }
    row.style.display = row.children.length ? "" : "none";
    // settings: placeholder until a Settings app exists
    this.nc.querySelector(".nc-gear")!.addEventListener("click", (e) => {
      e.stopPropagation();
      this.closeNC(false, true);
      const app = apps.find((a) => a.id === "settings") ?? { id: "settings", name: "設定", icon: "⚙️", mode: "internal" as const };
      const r = this.home.iconRect("settings") ?? (e.currentTarget as HTMLElement).getBoundingClientRect();
      this.openApp(app, r);
    });
  }

  /** a tap (no drag) on the invisible pull-down strip goes to the element underneath it */
  private forwardTap(e: MouseEvent) {
    this.ncZone.style.pointerEvents = "none";
    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    this.ncZone.style.pointerEvents = "";
    target?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: e.clientX, clientY: e.clientY }));
  }

  /** fromHistory: triggered by back (don't touch history); keepHistory: an app is about to replace the nc entry */
  private closeNC(fromHistory = false, keepHistory = false) {
    if (!fromHistory && !keepHistory) this.leaveHistory("nc");
    this.nc.classList.add("anim"); this.nc.classList.remove("open"); this.nc.style.transform = ""; this.nc.style.removeProperty("--nc-o");
  }

  /** Notification Center: the whole status bar width pulls it down (follows the finger); swipe up / tap to dismiss. */
  private bindNotificationCenter() {
    // Finger position inside the OS (visible area): clientY minus #os top (= visualViewport offsetTop).
    // The panel is exactly the visible height, so translateY = fingerY - height puts its bottom edge under the finger.
    const fingerY = (e: PointerEvent) => e.clientY - this.root.getBoundingClientRect().top;
    const H = () => this.nc.getBoundingClientRect().height || vp().height;
    // same tracking for status bar (pull down) and handle (drag up/down while open)
    const move = (_dy: number, e: PointerEvent) => {
      this.nc.classList.remove("anim");
      const h = H(), y = clamp(fingerY(e), 0, h);
      // keep the handle (its center) under the finger; panel bottom stays at handleCenter-to-bottom below it
      const handle = this.nc.querySelector<HTMLElement>(".nc-handle")!;
      const handleCenter = handle.offsetTop + handle.offsetHeight / 2; // layout pos, unaffected by transform
      this.nc.style.transform = `translateY(${clamp(y - handleCenter, -h, 0)}px)`;
      this.nc.style.setProperty("--nc-o", String(clamp(y / (h * 0.5), 0, 1)));
    };
    const end = (dy: number, vy: number, e: PointerEvent) => {
      this.nc.classList.add("anim");
      this.nc.style.transform = ""; this.nc.style.removeProperty("--nc-o");
      const open = Math.abs(dy) < 5 && this.nc.classList.contains("open")
        ? false // tap on handle closes
        : vy < -0.5 ? false : vy > 0.5 ? true : fingerY(e) > H() * 0.3;
      const was = this.nc.classList.contains("open");
      this.nc.classList.toggle("open", open);
      if (open && !was) this.push({ os: "nc" }); // same URL
      if (!open && was) this.leaveHistory("nc");
    };
    this.bindPillVisibility();
    let zoneTap = false;
    this.drag(this.ncZone, move, (dy, vy, e) => {
      zoneTap = Math.abs(dy) < 5;
      if (zoneTap) { this.nc.classList.add("anim"); this.nc.style.transform = ""; this.nc.style.removeProperty("--nc-o"); return; }
      end(dy, vy, e);
    });
    // a plain tap on the strip is forwarded to whatever is underneath (home icons etc.)
    this.ncZone.addEventListener("click", (e) => { if (zoneTap) this.forwardTap(e); zoneTap = false; });
    this.drag(this.nc.querySelector<HTMLElement>(".nc-handle")!, move, end);
    // tapping empty background (not a card) closes; the card list itself only scrolls
    this.nc.querySelector(".nc-scroll")!.addEventListener("click", (e) => {
      if (!(e.target as HTMLElement).closest(".notif")) this.closeNC();
    });
  }

  /** Top pill (status bar OFF) <-> NC handle handover. Each animation frame while dragging/animating, the handle bar's
   * center (getBoundingClientRect) is compared with the pill's center: below it => handle shown, pill hidden instantly;
   * at/above it (after having been below, or not held) => handle hidden instantly, pill fades in (.4s) right away. */
  private bindPillVisibility() {
    const pill = this.ncZone.querySelector<HTMLElement>(".top-pill")!;
    const handle = this.nc.querySelector<HTMLElement>(".nc-handle")!;
    const bar = handle.querySelector<HTMLElement>("i") || handle;
    const cy = (el: HTMLElement) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
    let dragging = false, armed = false, raf = 0, last = NaN, still = 0;
    const setPulled = (p: boolean) => {
      pill.classList.toggle("pill-hidden", p);
      this.nc.classList.toggle("pill-pull", p);
      this.nc.classList.toggle("handle-off", !p);
    };
    const frame = () => {
      raf = 0;
      const y = cy(bar), rel = y - cy(pill);
      if (!dragging) setPulled(this.nc.classList.contains("open")); // released/programmatic: closing => handover now
      else if (rel > 1) { armed = true; setPulled(true); }
      else setPulled(!armed); // initial peek while held stays "pulled"
      still = Math.abs(y - last) < 0.1 ? still + 1 : 0; last = y;
      if (dragging || still < 3) raf = requestAnimationFrame(frame);
    };
    const kick = () => { still = 0; if (!raf) raf = requestAnimationFrame(frame); };
    // grabbing the top pill: pill hides and NC handle appears instantly at the pill's spot
    this.ncZone.addEventListener("pointerdown", () => {
      if (this.nc.classList.contains("open")) return;
      const r = pill.getBoundingClientRect(), y = r.top + r.height / 2 - this.root.getBoundingClientRect().top;
      const h = this.nc.getBoundingClientRect().height || vp().height;
      this.nc.classList.remove("anim");
      dragging = true; armed = false; setPulled(true);
      this.nc.style.transform = `translateY(${clamp(y - (handle.offsetTop + handle.offsetHeight / 2), -h, 0)}px)`;
      kick();
    }, true);
    handle.addEventListener("pointerdown", () => { dragging = true; armed = true; kick(); }, true);
    for (const el of [this.ncZone, handle]) {
      const up = () => { dragging = false; kick(); };
      el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    }
    new MutationObserver(kick).observe(this.nc, { attributes: true, attributeFilter: ["class", "style"] });
    kick();
  }

  private zoomFrom(r: DOMRect) {
    const o = this.root.getBoundingClientRect();
    const sx = r.width / o.width, sy = r.height / o.height;
    return `translate(${r.left - o.left}px, ${r.top - o.top}px) scale(${sx}, ${sy})`;
  }

  openApp(app: AppDef, from: DOMRect, fromHistory = false) {
    this.signal.open(app.id);
    // opening an app marks its notifications read
    let changed = false;
    for (const n of this.notifs) if (n.appId === app.id && !this.read.has(n.id)) { this.read.add(n.id); changed = true; }
    if (changed) this.renderNotifications();
    if (app.mode === "link") { if (app.url) openExternal(app.url, app.open); return; }
    if (this.win) return;
    navDebug.count("open"); navDebug.log(`open ${app.id}${fromHistory ? " (history)" : ""}`);
    if (!fromHistory) {
      const st = { os: "app", id: app.id }; // state only, URL unchanged
      if (history.state?.os === "nc") history.replaceState(st, ""); else this.push(st);
    }
    const el = h("div", "app-window");
    // OS -> app safe-area contract: the window has no OS padding; apps read these vars and lay out themselves
    this.applyAppInsets(el);
    const body = h("div", "app-body");
    el.append(body);
    const view = getView(app.id);
    const cleanup = view ? view(body) || undefined : (body.textContent = `“${app.name}” has no view yet.`, undefined);
    el.style.transform = this.zoomFrom(from);
    el.style.borderRadius = "60px";
    el.style.opacity = "0";
    this.root.insertBefore(el, this.nc);
    this.win = { el, from, cleanup };
    this.home.el.classList.add("behind");
    this.root.classList.add("app-open"); // dark status bar over light app content
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.add("anim");
      el.style.transform = ""; el.style.borderRadius = ""; el.style.opacity = "1";
    }));
  }

  closeApp(fromHistory = false) {
    const w = this.win;
    if (!w) return;
    navDebug.count("close"); navDebug.log(`close${fromHistory ? " (history)" : ""}`);
    if (!fromHistory) this.leaveHistory("app");
    this.win = null;
    w.el.classList.add("anim");
    w.el.style.transform = this.zoomFrom(w.from);
    w.el.style.borderRadius = "60px";
    w.el.style.opacity = "0";
    this.home.el.classList.remove("behind");
    this.root.classList.remove("app-open");
    setTimeout(() => { w.cleanup?.(); w.el.remove(); }, 400);
  }
}
