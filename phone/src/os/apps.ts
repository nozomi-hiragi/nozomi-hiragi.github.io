import realApps from "../apps.json";
import demoApps from "../demo/apps.json";

/** ?demo=1 swaps in src/demo/*.json (demo apps + demo notifications) */
export const isDemo = new URLSearchParams(location.search).has("demo");

/**
 * App registry.
 * - mode "link": opens `url` in a new tab.
 * - mode "internal": opens an in-OS app window rendered by a view registered with `registerView(id, ...)`.
 * `dock: true` puts the app in the dock (max 4); others fill home pages in order.
 */
export type AppDef = {
  id: string;
  name: string;
  icon: string; // emoji, or image path (relative to /phone/ public dir) / URL
  mode: "link" | "internal";
  url?: string;
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
