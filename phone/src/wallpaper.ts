import * as THREE from "three/webgpu";

/**
 * Live animated wallpaper: soft colored blobs drifting behind the UI.
 * WebGPURenderer (auto WebGL2 backend if no WebGPU). If WebGPU init or rendering fails
 * (device lost / uncaptured error), it rebuilds with forceWebGL; if that fails too, the CSS gradient remains.
 */
export async function startWallpaper(host: HTMLElement) {
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
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    await r.init();
    const dev = (r.backend as unknown as { device?: GPUDevice }).device;
    if (dev) {
      dev.lost.then(() => fallback("device lost"));
      dev.addEventListener("uncapturederror", () => fallback("uncaptured error"));
    }
    r.domElement.style.filter = "blur(40px) saturate(1.2)";
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
      try { r.render(scene, camera); } catch (e) { fallback(e); }
    });
  }

  async function fallback(why: unknown) {
    if (failed) return;
    failed = true;
    console.warn("wallpaper: WebGPU failed, switching to WebGL2", why);
    try { await create(true); } catch (e) { console.warn("wallpaper: WebGL failed, CSS fallback", e); renderer?.domElement.remove(); }
  }
  window.addEventListener("unhandledrejection", (e) => {
    if (!failed && renderer && !(renderer.backend as { isWebGLBackend?: boolean }).isWebGLBackend && String(e.reason).includes("Error")) fallback(e.reason);
  });

  function resize() {
    if (!renderer) return;
    const w = host.clientWidth || innerWidth, hh = host.clientHeight || innerHeight;
    camera.aspect = w / hh;
    camera.updateProjectionMatrix();
    renderer.setSize(w, hh);
  }
  window.addEventListener("resize", resize);
  window.visualViewport?.addEventListener("resize", resize);

  try { await create(false); } catch (e) { await fallback(e); }
}
