import { detectDevice } from "./platform";

export type OpenTarget = "app" | "browser";

/**
 * Open an external URL according to the app's `open` mode.
 * - "app": window.open in a new tab (inside the PWA's in-app browser on installed iOS).
 * - "browser": on installed iOS, x-safari-https://… hands the URL to Safari (iOS 17+);
 *   on Android / PC a new tab already is the browser, so same as "app".
 */
export function openExternal(url: string, open: OpenTarget = "app") {
  if (open === "browser" && detectDevice() === "ios-standalone" && /^https?:\/\//.test(url)) {
    location.href = "x-safari-" + url;
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
