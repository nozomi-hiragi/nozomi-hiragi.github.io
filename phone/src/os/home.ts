import { apps, AppDef } from "./apps";
import { h, clamp } from "./util";
import { vp } from "./viewport";

/** Home screen: paged icon grid (driven by apps.json) + dots + dock, with momentum swipe. */
export class Home {
  el = h("div", "home");
  private pagesEl = h("div", "pages");
  private dotsEl = h("div", "dots");
  private dockEl = h("div", "dock");
  private page = 0;
  private pageCount = 1;
  onOpen: (app: AppDef, from: DOMRect) => void = () => {};

  constructor() {
    this.el.append(this.pagesEl, this.dotsEl, this.dockEl);
    this.layout();
    window.addEventListener("resize", () => this.layout());
    window.visualViewport?.addEventListener("resize", () => this.layout());
    this.bindSwipe();
  }

  private icon(app: AppDef) {
    const b = h("div", "app-icon");
    const isImg = /^(\/|https?:|\.\/)|\.(png|svg|jpe?g|webp)$/.test(app.icon);
    const g = h("div", "glyph");
    if (isImg) { const img = h("img"); img.src = app.icon; img.alt = ""; g.append(img); } else g.textContent = app.icon;
    const badge = h("span", "badge");
    badge.dataset.app = app.id;
    b.append(g, badge, h("div", "label", ""));
    (b.lastChild as HTMLElement).textContent = app.name;
    b.addEventListener("click", () => { if (!this.moved) this.onOpen(app, g.getBoundingClientRect()); });
    return b;
  }

  layout() {
    const w = Math.min(vp().width, 480), hgt = vp().height - 56 - 200;
    const cols = w < 360 ? 3 : 4, row = 96, rows = Math.max(1, Math.floor(hgt / (row + 8)));
    const per = cols * rows;
    const grid = apps.filter((a) => !a.dock), dock = apps.filter((a) => a.dock).slice(0, 4);
    this.pageCount = Math.max(1, Math.ceil(grid.length / per));
    this.pagesEl.replaceChildren();
    for (let p = 0; p < this.pageCount; p++) {
      const pg = h("div", "page");
      pg.style.setProperty("--cols", String(cols));
      pg.style.setProperty("--row", row + "px");
      grid.slice(p * per, (p + 1) * per).forEach((a) => pg.append(this.icon(a)));
      if (!grid.length && p === 0) pg.append(h("div", "empty-hint", "No apps yet"));
      this.pagesEl.append(pg);
    }
    this.dockEl.replaceChildren(...dock.map((a) => this.icon(a)));
    this.dockEl.style.display = dock.length ? "" : "none";
    this.page = clamp(this.page, 0, this.pageCount - 1);
    this.renderDots();
    this.setBadges(this.badges);
    this.setX(-this.page * this.el.clientWidth || 0, true);
  }

  private badges = new Map<string, number>();
  /** set unread counts per appId (0 hides the badge) */
  setBadges(counts: Map<string, number>) {
    this.badges = counts;
    this.el.querySelectorAll<HTMLElement>(".badge").forEach((b) => {
      const n = counts.get(b.dataset.app!) || 0;
      b.textContent = n ? String(n) : "";
      b.style.display = n ? "" : "none";
    });
  }
  /** icon rect for an app if visible on screen */
  iconRect(appId: string): DOMRect | null {
    const b = this.el.querySelector<HTMLElement>(`.badge[data-app="${CSS.escape(appId)}"]`);
    const g = b?.parentElement?.querySelector(".glyph");
    const r = g?.getBoundingClientRect();
    return r && r.right > 0 && r.left < vp().left + vp().width ? r : null;
  }

  private renderDots() {
    this.dotsEl.replaceChildren(...Array.from({ length: this.pageCount }, (_, i) => h("i", i === this.page ? "on" : "")));
    this.dotsEl.style.display = this.pageCount > 1 ? "" : "none";
  }

  private setX(x: number, anim: boolean) {
    this.pagesEl.style.transition = anim ? "transform .45s cubic-bezier(.2,.9,.25,1)" : "none";
    this.pagesEl.style.transform = `translateX(${x}px)`;
  }

  goTo(p: number) {
    this.page = clamp(p, 0, this.pageCount - 1);
    this.setX(-this.page * this.el.clientWidth, true);
    this.renderDots();
  }

  private moved = false;
  private bindSwipe() {
    let sx = 0, sy = 0, base = 0, active = false, horiz: boolean | null = null, lastX = 0, lastT = 0, vel = 0;
    this.pagesEl.addEventListener("pointerdown", (e) => {
      active = true; horiz = null; this.moved = false;
      sx = lastX = e.clientX; sy = e.clientY; lastT = performance.now(); vel = 0;
      base = -this.page * this.el.clientWidth;
    });
    window.addEventListener("pointermove", (e) => {
      if (!active) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (horiz === null && Math.hypot(dx, dy) > 8) horiz = Math.abs(dx) > Math.abs(dy);
      if (!horiz) return;
      this.moved = true;
      const now = performance.now();
      vel = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
      const edge = (this.page === 0 && dx > 0) || (this.page === this.pageCount - 1 && dx < 0);
      this.setX(base + (edge ? dx * 0.35 : dx), false);
    });
    window.addEventListener("pointerup", (e) => {
      if (!active) return;
      active = false;
      if (!horiz) return;
      const dx = e.clientX - sx, w = this.el.clientWidth;
      // momentum: project position using velocity
      const projected = dx + vel * 250;
      let p = this.page;
      if (projected < -w / 2) p++; else if (projected > w / 2) p--;
      this.goTo(p);
    });
  }
}
