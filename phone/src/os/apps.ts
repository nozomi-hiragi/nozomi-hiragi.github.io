import realApps from "../apps.json";
import demoApps from "../demo/apps.json";

/** ?demo=1 swaps in src/demo/*.json (demo apps + demo notifications) */
export const isDemo = new URLSearchParams(location.search).has("demo");

/**
 * App registry.
 * - mode "link": opens `url` outside the OS. `open` picks where (default "app"):
 *     "app"     = new tab / in-app browser overlay (iOS installed PWA keeps it inside the PWA)
 *     "browser" = hand off to the real browser (iOS installed PWA: x-safari- scheme -> Safari)
 * - mode "internal": opens an in-OS app window rendered by a view registered with `registerView(id, ...)`.
 * `dock: true` puts the app in the dock (max 4); others fill home pages in order.
 */
export type AppDef = {
  id: string;
  name: string;
  icon: string; // emoji, or image path (relative to /phone/ public dir) / URL
  mode: "link" | "internal";
  url?: string;
  open?: "app" | "browser";
  dock?: boolean;
};

export type AppView = (root: HTMLElement) => void | (() => void);

export const apps: AppDef[] = (isDemo ? demoApps : realApps) as AppDef[];
const views = new Map<string, AppView>();

export function registerView(id: string, view: AppView) {
  views.set(id, view);
}
export function getView(id: string): AppView | undefined {
  return views.get(id);
}
