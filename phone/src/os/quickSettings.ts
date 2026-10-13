/**
 * Quick-settings toggles shown in the Notification Center (round buttons under the time row).
 * To add one, append an object to `quickSettings`:
 *   { id, label, icon: (on) => "emoji/svg", supported?: () => bool, isOn: () => bool,
 *     toggle: () => void | Promise<void>, subscribe?: (cb) => void }
 * Unsupported toggles are hidden.
 */
export type QuickSetting = {
  id: string;
  label: string;
  icon: (on: boolean) => string; // innerHTML (emoji or inline svg)
  supported?: () => boolean;
  isOn: () => boolean;
  toggle: () => void | Promise<void>;
  subscribe?: (cb: () => void) => void; // re-render when external state changes
};

import { isAppDisplayMode } from "./displayMode";

const svg = (d: string) =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;

export const quickSettings: QuickSetting[] = [
  {
    id: "fullscreen",
    label: "全画面",
    icon: (on) => svg(on
      ? "M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" // exit
      : "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"), // enter
    // hidden when unsupported (iPhone Safari) or when already running as an installed fullscreen/standalone app
    supported: () => !isAppDisplayMode() && !!(document.fullscreenEnabled && document.documentElement.requestFullscreen),
    isOn: () => !!document.fullscreenElement,
    toggle: async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen({ navigationUI: "hide" });
      } catch (e) { console.warn("fullscreen toggle failed", e); }
    },
    subscribe: (cb) => document.addEventListener("fullscreenchange", cb),
  },
];
