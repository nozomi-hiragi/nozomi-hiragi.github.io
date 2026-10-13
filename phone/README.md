# phone/ — nozomi hiragi OS (served at /phone/)

Vite + TypeScript. Fullscreen smartphone-OS UI in plain DOM/CSS, with a Three.js
(`three/webgpu`, WebGL2 fallback) animated wallpaper behind it.

## Layout
- `src/apps.json` — app list (the only file to edit to add apps)
- `src/os/apps.ts` — registry, types, `registerView()` for internal apps
- `src/os/home.ts` — paged icon grid + dots + dock (swipe w/ momentum)
- `src/os/shell.ts` — status bar, lock screen, app windows (zoom open/close), home-bar gesture, notification center
- `src/wallpaper.ts` — Three.js live wallpaper
- `src/style.css`

## Add an app
Append to `src/apps.json`:
```json
{ "id": "zenn", "name": "Zenn", "icon": "📘", "mode": "link", "url": "https://zenn.dev/nozomi_hiragi" }
```
- `mode: "link"` → opens `url` in a new tab.
- `mode: "internal"` → opens an in-OS window. Register its view (e.g. in `src/main.ts`):
  `registerView("about", (root) => { root.innerHTML = "..."; return () => {/* cleanup */}; });`
- `dock: true` → shown in the dock (max 4). Others fill pages automatically (grid size adapts to screen).
- `icon`: emoji, or an image path (put files in `phone/public/`, reference as `/phone/x.png`) / URL.
- Only use real links (from ../src/profile.json or nozomi-hiragi's repos).

## Notifications
`src/notifications.json` (separate from `apps.json`, which stays a pure app list):
```json
{ "id": "n1", "appId": "zenn", "title": "Zenn", "body": "新しい記事", "icon": "📘", "stage": 2 }
```
- `appId` must match an app id; unknown ids are warned about in the console and skipped (`src/os/notifications.ts`).
- `icon?` overrides the app icon on the card; `stage?` = minimum signal generation (1G, 2G...) before it appears (default 1).
- Shown as cards in the Notification Center (pull down anywhere on the status bar) and as red count badges on app icons.
  Tapping a card opens its app; opening an app marks its notifications read for the session.

## Quick settings
Round toggles at the top of the Notification Center are defined in `src/os/quickSettings.ts` (`quickSettings` array:
`{ id, label, icon(on), supported?, isOn, toggle, subscribe? }`). Unsupported ones are hidden (e.g. Fullscreen on iPhone Safari).
Currently: Fullscreen. The gear button opens the Settings app.

## Settings app
`src/apps/settings.ts` (internal app id `settings`, listed in apps.json; also opened by the Notification Center gear).
Sections are an array of functions returning `{ title, rows }`; rows support `value`, `button`, `toggle`. Add a section to extend.
Currently: 画面 (quick-settings toggles e.g. 全画面), 電波 (generation/bars + reset), 電池 (today's max, current, last update),
端末情報 (build time), 壁紙 (placeholder).

## History / deep links
On iOS (iPhone/iPad, incl. iPadOS desktop UA) history entries are NOT created (the iOS back-swipe shows a stale
snapshot and then re-renders); elsewhere: opening an in-OS app pushes state `{os:"app", id}`; opening the Notification Center pushes `{os:"nc"}`. The URL is never changed
(iOS standalone treats URL changes as navigations → repaint / status-bar flicker); `scrollRestoration = "manual"`.
Browser/Android back closes the app (same zoom-back animation) or the panel. Closing via the UI calls `history.back()`,
so history doesn't pile up; the base entry is the home screen, so back from home leaves the site normally (no trap).
Deep link: `/phone/#/app/settings` opens that app (after unlocking if the lock screen is shown); the hash is then removed. Query params are kept.
Debug: `?debug=nav` shows load count / navigation type / popstate, controllerchange, wallpaper-create counters and recent events.
Debug: `?insets=1` shows raw `env(safe-area-inset-*)` (env t/b/l/r), the used `--sa*` vars (0 top/sides in fullscreen) and visualViewport size.

## Version / updates
Version = build time in Asia/Tokyo, `YYYYMMDDHHmm` (e.g. 202610131555), defined ONLY in `vite.config.ts` `appVersion()`
and exposed as `src/version.ts` `VERSION`. It is the service-worker cache version (`phone-os-<version>`); the build emits
`sw.js` and `version.json`. A new deploy installs in the background; when it is waiting, a toast shows the new version and
Settings > アップデート shows it with a button to apply (reload). SW is only registered in production builds.

## PWA / install
`public/manifest.webmanifest` (scope/start_url `/phone/`, display `fullscreen`, override fullscreen→standalone) and
placeholder icons in `public/icons/` (192, 512, maskable 512, apple-touch 180). iOS meta tags are in `index.html`.
When launched installed (display-mode fullscreen/standalone, or iOS standalone) the root gets `.fs` and the fullscreen
toggles are hidden. Settings > アップデート > キャッシュを取り直す deletes `phone-os-*` caches, unregisters the SW and reloads.

## Debug params / 開発者 settings
All URL debug params are listed in `src/os/debugParams.ts` (single registry). Settings > 開発者 shows the active query and a
switch per param; switching reloads `/phone/` with the param added/removed (`location.replace`), identical to editing the URL
(needed in the installed app). Params: demo, unlocked, insets, debug=nav, battHours, signalOpened, resetSignal, hist (`auto`/`on`/`off`: force history integration), wall (`off` = no Three.js, CSS gradient only; `noblur` = no CSS blur filter; choice in Settings).

## iOS status-bar blur (experimental)
`.ios-blur-control` in index.html + `src/os/iosBlur.ts`, after https://zenn.dev/uakihir0/articles/260920-ios27-pwa-blur:
an empty 11px fixed strip (background-clip:text) visible => blur OFF, `.blur-on` (display:none) => blur ON.
Only toggled in the iOS home-screen app; debug `?iosblur=on|off`. Note: the article says this has no effect while
`black-translucent` (edge-to-edge) is used, which we keep. Unverified on device.

## Demo
`?demo=1` uses `src/demo/apps.json` + `src/demo/notifications.json` instead of the real lists (real links only).

## Gestures
Swipe up on lock screen to unlock · swipe pages horizontally · swipe up from bottom bar to close an app / go home ·
pull down anywhere on the status bar for the notification center; drag its bottom handle up (or tap it) to close. The card list scrolls independently. Debug: `?unlocked=1` skips the lock screen.

## Battery
`src/os/battery.ts`: on every load it starts at the day's max = 100 - daysSinceUpdate*100/365 (update date = build time),
then drops 1%/hour of viewing. After 1 continuous hour at 0% the screen goes black (dead). Debug: `?battHours=N`.

## Signal
`src/os/signal.ts`: starts at 1G with 0 bars (greyed bars). Each app id opened for the first time adds a bar (max 4);
opening a new app at 4 bars upgrades the generation (2G, 3G, ...) and resets to 1 bar, with a toast ("2Gにアップグレード").
Opened ids persist in localStorage (`os.signal.opened`). Debug: `?resetSignal=1`, `?signalOpened=N` (simulate N unique opens).

## Dev / build / deploy
- `npm install && npm run dev` (open the printed `/phone/` URL)
- `npm run build` → `dist/` (base `/phone/`)
- CI: `.github/workflows/nextjs.yml` builds Next (`out/`), then builds `phone/` and copies `phone/dist` → `out/phone/`.
