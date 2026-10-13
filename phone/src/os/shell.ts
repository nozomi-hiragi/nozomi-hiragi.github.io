import { Home } from "./home";
import { AppDef, getView } from "./apps";
import { h, fmtTime, clamp } from "./util";
import { Battery } from "./battery";
import { vp } from "./viewport";
import { Signal, SignalState } from "./signal";
import { loadNotifications, Notification } from "./notifications";

/** OS shell: status bar, lock screen, home, app windows, home gesture, notification center. */
export class Shell {
  private home = new Home();
  private status = h("div", "statusbar",
    `<span class="time"></span><span class="icons"><span class="signal"><i style="height:4px"></i><i style="height:6px"></i><i style="height:8px"></i><i style="height:11px"></i></span><span class="gen"></span><span class="battery"><span class="fill"></span><b class="num"></b><b class="num on-fill"></b></span></span>`);
  private lock = h("div", "lock", `<div class="date"></div><div class="clock"></div><div class="hint">⌃ Swipe up to unlock</div>`);
  private nc = h("div", "nc", `<div class="nc-scroll"><div class="nc-date"></div><div class="nc-clock"></div><div class="nc-list"></div></div><div class="nc-handle" aria-label="drag to close"><i></i></div>`);
  private notifs: Notification[] = loadNotifications();
  private read = new Set<string>();
  private homeZone = h("div", "home-bar-zone", `<div class="home-bar"></div>`);
  private ncZone = h("div", "nc-zone");
  private battery = new Battery();
  private signal = new Signal();
  private toastEl = h("div", "toast");
  private dead = h("div", "dead");
  private win: { el: HTMLElement; from: DOMRect; cleanup?: () => void } | null = null;

  constructor(private root: HTMLElement, opts: { unlocked?: boolean } = {}) {
    root.append(this.home.el, this.status, this.nc, this.ncZone, this.homeZone);
    if (!opts.unlocked) root.append(this.lock);
    this.home.onOpen = (a, r) => this.openApp(a, r);
    this.battery.onChange = (pct, dead) => {
      const batt = this.status.querySelector<HTMLElement>(".battery")!;
      batt.style.setProperty("--level", pct + "%");
      batt.classList.toggle("low", pct <= 20);
      batt.querySelectorAll<HTMLElement>(".num").forEach((n) => (n.textContent = String(pct)));
      batt.setAttribute("aria-label", `battery ${pct}%`);
      if (dead && !this.dead.isConnected) root.append(this.dead);
    };
    root.append(this.toastEl);
    this.signal.onChange = (st, up) => { this.renderSignal(st); this.renderNotifications(); if (up) this.toast(`${st.gen}Gにアップグレード`); };
    this.renderSignal(this.signal.state);
    this.renderNotifications();
    this.tick();
    setInterval(() => this.tick(), 1000);
    this.bindLock();
    this.bindHomeGesture();
    this.bindNotificationCenter();
  }

  private renderSignal(st: SignalState) {
    const bars = this.status.querySelectorAll<HTMLElement>(".signal i");
    bars.forEach((b, i) => b.classList.toggle("off", i >= st.bars));
    const gen = this.status.querySelector<HTMLElement>(".gen")!;
    gen.textContent = `${st.gen}G`;
    this.status.querySelector(".signal")!.classList.toggle("none", st.bars === 0);
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
    this.status.querySelector(".time")!.textContent = fmtTime(d);
    this.lock.querySelector(".clock")!.textContent = fmtTime(d);
    this.nc.querySelector(".nc-clock")!.textContent = fmtTime(d);
    this.nc.querySelector(".nc-date")!.textContent = d.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "long" });
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
      this.nc.classList.remove("open");
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
        this.closeNC();
        const r = this.home.iconRect(n.app.id) ?? new DOMRect(vp().width / 2 - 30, vp().height / 2 - 30, 60, 60);
        this.openApp(n.app, r);
      });
      list.append(card);
    }
    const counts = new Map<string, number>();
    for (const n of vis) counts.set(n.appId, (counts.get(n.appId) || 0) + 1);
    this.home.setBadges(counts);
  }

  private closeNC() {
    this.nc.classList.add("anim"); this.nc.classList.remove("open"); this.nc.style.transform = ""; this.nc.style.opacity = "";
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
      this.nc.style.transform = `translateY(${y - h}px)`;
      this.nc.style.opacity = String(clamp(y / (h * 0.5), 0, 1));
    };
    const end = (dy: number, vy: number, e: PointerEvent) => {
      this.nc.classList.add("anim");
      this.nc.style.transform = ""; this.nc.style.opacity = "";
      const open = Math.abs(dy) < 5 && this.nc.classList.contains("open")
        ? false // tap on handle closes
        : vy < -0.5 ? false : vy > 0.5 ? true : fingerY(e) > H() * 0.3;
      this.nc.classList.toggle("open", open);
    };
    this.drag(this.ncZone, move, end);
    this.drag(this.nc.querySelector<HTMLElement>(".nc-handle")!, move, end);
    // tapping empty background (not a card) closes; the card list itself only scrolls
    this.nc.querySelector(".nc-scroll")!.addEventListener("click", (e) => {
      if (!(e.target as HTMLElement).closest(".notif")) this.closeNC();
    });
  }

  private zoomFrom(r: DOMRect) {
    const o = this.root.getBoundingClientRect();
    const sx = r.width / o.width, sy = r.height / o.height;
    return `translate(${r.left - o.left}px, ${r.top - o.top}px) scale(${sx}, ${sy})`;
  }

  openApp(app: AppDef, from: DOMRect) {
    this.signal.open(app.id);
    // opening an app marks its notifications read
    let changed = false;
    for (const n of this.notifs) if (n.appId === app.id && !this.read.has(n.id)) { this.read.add(n.id); changed = true; }
    if (changed) this.renderNotifications();
    if (app.mode === "link") { if (app.url) window.open(app.url, "_blank", "noopener,noreferrer"); return; }
    if (this.win) return;
    const el = h("div", "app-window");
    const body = h("div", "app-body");
    el.append(body);
    const view = getView(app.id);
    const cleanup = view ? view(body) || undefined : (body.textContent = `“${app.name}” has no view yet.`, undefined);
    el.style.transform = this.zoomFrom(from);
    el.style.borderRadius = "60px";
    el.style.opacity = "0";
    this.root.insertBefore(el, this.status);
    this.win = { el, from, cleanup };
    this.home.el.classList.add("behind");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.add("anim");
      el.style.transform = ""; el.style.borderRadius = ""; el.style.opacity = "1";
    }));
  }

  closeApp() {
    const w = this.win;
    if (!w) return;
    this.win = null;
    w.el.classList.add("anim");
    w.el.style.transform = this.zoomFrom(w.from);
    w.el.style.borderRadius = "60px";
    w.el.style.opacity = "0";
    this.home.el.classList.remove("behind");
    setTimeout(() => { w.cleanup?.(); w.el.remove(); }, 400);
  }
}
