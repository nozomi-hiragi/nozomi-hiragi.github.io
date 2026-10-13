import { navDebug } from "./os/debugNav";
import { onStableResize } from "./os/resize";
import * as THREE from "three/webgpu";

/**
 * Live animated wallpaper: soft colored blobs drifting behind the UI.
 * WebGPURenderer (auto WebGL2 backend if no WebGPU). If WebGPU init or rendering fails
 * (device lost / uncaptured error), it rebuilds with forceWebGL; if that fails too, the CSS gradient remains.
 */
/** Average relative luminance of the wallpaper behind a viewport rect (null = unknown/not ready). */
let sampleReq = false, sampleRect: DOMRect | null = null, lastLum: number | null = null;
const sc = document.createElement("canvas"); sc.width = 16; sc.height = 4;
const sctx = sc.getContext("2d", { willReadFrequently: true });
export function requestWallpaperSample(rect: DOMRect) { sampleRect = rect; sampleReq = true; }
export function wallpaperLuminance() { return lastLum; }
function sampleNow(cv: HTMLCanvasElement) {
  // read right after render (same task) so no preserveDrawingBuffer needed; region widened ~40px to mimic CSS blur
  if (!sctx || !sampleRect) return;
  try {
    const b = cv.getBoundingClientRect(), kx = cv.width / b.width, ky = cv.height / b.height, R = 40;
    const x = (sampleRect.left - R - b.left) * kx, y = (sampleRect.top - R - b.top) * ky;
    const w = (sampleRect.width + 2 * R) * kx, hh = (sampleRect.height + 2 * R) * ky;
    sctx.clearRect(0, 0, 16, 4); sctx.drawImage(cv, x, y, w, hh, 0, 0, 16, 4);
    const d = sctx.getImageData(0, 0, 16, 4).data; let sum = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { sum += relLum(d[i], d[i + 1], d[i + 2]) * 1.1; n++; } // saturate(1.2) ~ slight boost
    if (n) lastLum = Math.min(1, sum / n);
  } catch { /* tainted/unsupported -> keep last */ }
}
export function relLum(r: number, g: number, b: number) {
  const f = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export async function startWallpaper(host: HTMLElement, { blur = true } = {}) {
  // blur: CSS-blurred canvas, oversized by PAD on each side so the blur has no dark edges
  const PAD = blur ? 80 : 0;
  host.classList.toggle("wall-blur", blur);
  let renderer: THREE.WebGPURenderer | null = null;
  let failed = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 10;
  const colors = ["#8d07ed", "#4b2bd6", "#0bb5c9", "#ff4fd8", "#3a0ca3", "#00d2ff"];
  const blobs = colors.map((c, i) => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(2.2 + (i % 3) * 0.8, 32, 32),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.75 }),
    );
    m.userData = { ax: 2 + i * 0.7, ay: 3 + (i % 2) * 2, sx: 0.07 + i * 0.013, sy: 0.05 + i * 0.011, ph: i * 1.7 };
    scene.add(m);
    return m;
  });
  scene.background = new THREE.Color("#1a0b3d");

  async function create(forceWebGL: boolean) {
    renderer?.setAnimationLoop(null);
    renderer?.domElement.remove();
    renderer?.dispose();
    const r = new THREE.WebGPURenderer({ antialias: false, forceWebGL });
    navDebug.count("wpCreate"); navDebug.log(`wallpaper create forceWebGL=${forceWebGL}`);
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    await r.init();
    const dev = (r.backend as unknown as { device?: GPUDevice }).device;
    if (dev) {
      dev.lost.then(() => fallback("device lost"));
      dev.addEventListener("uncapturederror", () => fallback("uncaptured error"));
    }
    if (blur) r.domElement.style.filter = "blur(40px) saturate(1.2)";
    host.append(r.domElement);
    renderer = r;
    resize();
    const timer = new THREE.Timer();
    r.setAnimationLoop(() => {
      timer.update();
      const t = timer.getElapsed();
      blobs.forEach((b, i) => {
        const u = b.userData;
        b.position.set(Math.sin(t * u.sx + u.ph) * u.ax, Math.cos(t * u.sy + u.ph) * u.ay, -i * 0.3);
      });
      try { r.render(scene, camera); } catch (e) { fallback(e); return; }
      if (sampleReq) { sampleReq = false; sampleNow(r.domElement); }
    });
  }

  async function fallback(why: unknown) {
    if (failed) return;
    failed = true;
    console.warn("wallpaper: WebGPU failed, switching to WebGL2", why);
    try { await create(true); } catch (e) { console.warn("wallpaper: WebGL failed, CSS fallback", e); renderer?.domElement.remove(); }
  }
  // only GPU-related rejections may trigger the fallback (previously ANY unhandled rejection whose text contained
  // "Error" rebuilt the renderer -> visible re-render on unrelated failures, e.g. a failed fetch/update check)
  window.addEventListener("unhandledrejection", (e) => {
    const r = e.reason as { name?: string; message?: string } | undefined;
    const gpu = !!r && (r.name === "OperationError" || r.name === "GPUPipelineError" || /GPU|WebGPU|popErrorScope|device/i.test(String(r.message ?? r)));
    if (!failed && gpu && renderer && !(renderer.backend as { isWebGLBackend?: boolean }).isWebGLBackend) fallback(e.reason);
  });

  function resize() {
    if (!renderer) return;
    navDebug.count("wpResize");
    // canvas is 80px larger on each side (see CSS) so the blur filter has no dark edges
    const w = (host.clientWidth || innerWidth) + PAD * 2, hh = (host.clientHeight || innerHeight) + PAD * 2;
    camera.aspect = w / hh;
    camera.updateProjectionMatrix();
    renderer.setSize(w, hh);
  }
  // no canvas reallocation on tiny viewport jitter (e.g. during history navigation on iOS)
  onStableResize(() => ({ w: host.clientWidth, h: host.clientHeight }), resize, { delay: 200, minDh: 40 });

  try { await create(false); } catch (e) { await fallback(e); }
}
