import "./style.css";
import { applyDeviceAttr } from "./os/platform";
applyDeviceAttr();
import { Shell } from "./os/shell";
import { startWallpaper } from "./wallpaper";
import { trackViewport } from "./os/viewport";
import { scrollFromParam } from "./os/scrollBottom";
import { startInsetsDebug } from "./os/debugInsets";
import { startNavDebug } from "./os/debugNav";


startNavDebug();

trackViewport();
scrollFromParam();

const os = document.getElementById("os")!;
const wp = document.createElement("div");
wp.className = "wallpaper";
os.append(wp);

const params = new URLSearchParams(location.search);
new Shell(os, { unlocked: params.has("unlocked") });
// ?wall=off: no Three.js at all (CSS gradient only); ?wall=noblur: render without the CSS blur filter
const wall = params.get("wall");
if (wall !== "off") startWallpaper(wp, { blur: wall !== "noblur" });

if (params.has("insets")) startInsetsDebug();
try { localStorage.removeItem("statusBar"); localStorage.removeItem("iosBlur"); } catch { /* ignore */ }
