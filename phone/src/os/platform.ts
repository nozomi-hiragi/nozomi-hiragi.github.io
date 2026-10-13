/** iPhone / iPod / iPad, including iPadOS which reports a desktop Mac UA (detected via touch points). */
export const isIOS = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

/** data-device on <html>: "ios-safari" (iOS/iPadOS in Safari browser tab), "ios-standalone" (home-screen app),
 *  "ios-other" (other iOS browsers / in-app webviews), "android", or "other". */
export function detectDevice(): string {
  const ua = navigator.userAgent;
  if (isIOS()) {
    const standalone = (navigator as { standalone?: boolean }).standalone === true ||
      matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches;
    if (standalone) return "ios-standalone";
    const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA\/|YaBrowser|DuckDuckGo|Line\/|FBAN|FBAV|Instagram/.test(ua);
    return !otherBrowser && /Safari\//.test(ua) ? "ios-safari" : "ios-other";
  }
  return /Android/.test(ua) ? "android" : "other";
}
export function applyDeviceAttr() { document.documentElement.dataset.device = detectDevice(); }
