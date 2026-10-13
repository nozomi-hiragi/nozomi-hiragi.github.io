import type { AppView } from "../os/apps";
import type { Battery } from "../os/battery";
import type { Signal } from "../os/signal";
import { quickSettings } from "../os/quickSettings";
import { updater } from "../os/update";
import { VERSION } from "../version";
import { scrollToBottom } from "../os/scrollBottom";
import { debugParams, isActive, toggleParam, currentParams, setParam } from "../os/debugParams";

/**
 * Provisional Settings (設定) app. To extend: add a function to `sections` returning
 * { title, rows: Row[] }. Rows are label/value pairs, optionally with a button or a toggle.
 */
type Row = { label: string; value?: () => string; button?: { text: string; onClick: () => void | Promise<unknown> }; toggle?: { isOn: () => boolean; onToggle: () => void | Promise<void>; disabled?: () => boolean; note?: string }; choice?: { label: string; active: () => boolean; onSelect: () => void }[]; nav?: () => void; onTap?: () => void };
type Section = { title: string; rows: Row[] };
export type SettingsDeps = { signal: Signal; battery: Battery };

const fmtDate = (d: Date) => d.toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

const DEV_KEY = "phone.devMenu";
const devEnabled = () => localStorage.getItem(DEV_KEY) === "1";
let versionTaps = 0, versionTapTimer = 0;

type Page = { title: string; sections: ((d: SettingsDeps) => Section)[] };

const batteryPage: Page = {
  title: "バッテリー",
  sections: [({ battery }) => ({
    title: "電池",
    rows: [
      { label: "今日の最大", value: () => `${Math.ceil(battery.max)}%` },
      { label: "現在", value: () => `${battery.percent}%` },
      { label: "最終アップデート", value: () => fmtDate(battery.updateDate) },
    ],
  })],
};

const devPage: Page = {
  title: "開発者",
  sections: [() => ({
    title: "開発者",
    rows: [
      { label: "有効なパラメータ", value: () => currentParams().toString() || "なし" },
      { label: "一番下へスクロール", button: { text: "実行", onClick: () => scrollToBottom() } },
      ...debugParams.map((p): Row => p.kind === "choice"
        ? {
          label: p.label,
          choice: p.options.map((o) => ({ label: o.label, active: () => currentParams().get(p.key) === o.value, onSelect: () => setParam(p.key, o.value) })),
        }
        : {
          label: p.label,
          value: p.kind === "input" ? () => currentParams().get(p.key) ?? "" : undefined,
          toggle: { isOn: () => isActive(p), onToggle: () => toggleParam(p) },
        }),
      { label: "開発者項目を隠す", button: { text: "隠す", onClick: () => { localStorage.removeItem(DEV_KEY); nav.back(); } } },
    ],
  })],
};

/** navigation hooks, wired by settingsView */
const nav = { open: (_p: Page) => {}, back: () => {}, rerender: () => {} };

const mainPage: Page = {
  title: "設定",
  sections: [
    () => ({
      title: "画面",
      rows: quickSettings
        .filter((q) => !q.supported || q.supported())
        .map((q): Row => ({ label: q.label, toggle: { isOn: q.isOn, onToggle: q.toggle } }))
    }),
    () => ({ title: "", rows: [{ label: "バッテリー", nav: () => nav.open(batteryPage) }] }),
    () => ({
      title: "アップデート",
      rows: [
        {
          label: "バージョン", value: () => VERSION,
          onTap: () => {
            if (devEnabled()) return;
            clearTimeout(versionTapTimer);
            versionTapTimer = window.setTimeout(() => (versionTaps = 0), 1500); // must be consecutive
            if (++versionTaps >= 10) { versionTaps = 0; localStorage.setItem(DEV_KEY, "1"); nav.rerender(); }
          },
        },
        {
          label: "状態",
          value: () => !updater.supported ? "自動更新なし" : updater.checkError ? updater.checkError : updater.waitingVersion ? `新しいバージョン ${updater.waitingVersion}` : updater.availableVersion ? `${updater.availableVersion} をダウンロード中…` : "最新です",
        },
        {
          label: "アップデート",
          button: { text: "確認 / 適用", onClick: () => (updater.waitingVersion ? updater.apply() : updater.check()) },
        },
        { label: "キャッシュを取り直す", button: { text: "実行", onClick: () => { if (confirm("キャッシュを消して取り直しますか？\nページが再読み込みされます。")) return updater.resetCache(); } } },
      ],
    }),
    () => ({ title: "", rows: devEnabled() ? [{ label: "開発者", nav: () => nav.open(devPage) }] : [] }),
  ],
};

export function settingsView(deps: SettingsDeps): AppView {
  return (root) => {
    root.classList.add("settings");
    const stack: Page[] = [mainPage];
    let refreshers: (() => void)[] = [];
    const render = () => {
      refreshers = [];
      const page = stack[stack.length - 1];
      root.innerHTML = `<div class="sa-spacer"></div>`; // spacer = OS-provided --app-sat
      if (stack.length > 1) {
        const back = document.createElement("button");
        back.className = "nav-back";
        back.textContent = `‹ ${stack[stack.length - 2].title}`;
        back.onclick = () => nav.back();
        root.append(back);
      }
      const h1 = document.createElement("h1");
      h1.textContent = page.title;
      root.append(h1);
      for (const make of page.sections) {
        const sec = make(deps);
        if (!sec.rows.length) continue;
        const el = document.createElement("section");
        el.innerHTML = sec.title ? `<h2></h2><div class="rows"></div>` : `<div class="rows"></div>`;
        if (sec.title) el.querySelector("h2")!.textContent = sec.title;
        const rows = el.querySelector(".rows")!;
        for (const r of sec.rows) rows.append(makeRow(r, refreshers));
        root.append(el);
      }
      root.scrollTop = 0;
    };
    nav.open = (p) => { stack.push(p); render(); };
    nav.back = () => { if (stack.length > 1) stack.pop(); render(); };
    nav.rerender = render;
    render();
    const refreshAll = () => refreshers.forEach((f) => f());
    const timer = setInterval(refreshAll, 1000);
    document.addEventListener("fullscreenchange", refreshAll);
    return () => { clearInterval(timer); document.removeEventListener("fullscreenchange", refreshAll); };
  };
}

function makeRow(r: Row, refreshers: (() => void)[]): HTMLElement {
  const row = document.createElement("div");
  row.className = "row";
  const label = document.createElement("span");
  label.textContent = r.label;
  row.append(label);
  if (r.nav) {
    row.classList.add("nav-row");
    const chev = document.createElement("span");
    chev.className = "val chev";
    chev.textContent = "›";
    row.append(chev);
    row.onclick = r.nav;
  }
  if (r.onTap) row.onclick = r.onTap;
  if (r.value) {
    const v = document.createElement("span");
    v.className = "val";
    const f = () => (v.textContent = r.value!());
    f(); refreshers.push(f);
    row.append(v);
  }
  if (r.button) {
    const b = document.createElement("button");
    b.textContent = r.button.text;
    b.onclick = async () => {
      if (b.disabled) return;
      const text = b.textContent;
      b.disabled = true; b.classList.add("busy");
      b.innerHTML = `<span class="spinner" aria-hidden="true"></span>${text}`;
      const min = new Promise((res) => setTimeout(res, 400));
      try { await Promise.all([Promise.resolve(r.button!.onClick()), min]); }
      catch { await min; }
      b.disabled = false; b.classList.remove("busy"); b.textContent = text;
      refreshers.forEach((f) => f());
    };
    row.append(b);
  }
  if (r.choice) {
    const seg = document.createElement("div");
    seg.className = "segmented";
    for (const c of r.choice) {
      const b = document.createElement("button");
      b.textContent = c.label;
      const f = () => b.classList.toggle("on", c.active());
      b.onclick = () => { if (!c.active()) c.onSelect(); };
      f(); refreshers.push(f);
      seg.append(b);
    }
    row.append(seg);
  }
  if (r.toggle) {
    const t = document.createElement("button");
    t.className = "switch";
    const f = () => t.classList.toggle("on", r.toggle!.isOn());
    if (r.toggle.disabled?.()) { t.disabled = true; t.style.opacity = "0.4"; }
    t.onclick = async () => { if (t.disabled) return; await r.toggle!.onToggle(); f(); };
    f(); refreshers.push(f);
    row.append(t);
  }
  return row;
}
