/** true when launched as an installed app in fullscreen/standalone display mode (or iOS home-screen app) */
export const isAppDisplayMode = () =>
  matchMedia("(display-mode: fullscreen)").matches ||
  matchMedia("(display-mode: standalone)").matches ||
  (navigator as { standalone?: boolean }).standalone === true;
