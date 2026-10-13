import "./style.css";
import { Shell } from "./os/shell";
import { startWallpaper } from "./wallpaper";
import { trackViewport } from "./os/viewport";

trackViewport();

const os = document.getElementById("os")!;
const wp = document.createElement("div");
wp.className = "wallpaper";
os.append(wp);

const params = new URLSearchParams(location.search);
new Shell(os, { unlocked: params.has("unlocked") });
startWallpaper(wp);
