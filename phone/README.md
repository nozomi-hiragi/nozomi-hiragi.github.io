# phone/ — nozomi hiragi OS (served at /phone/)

Vite + TypeScript. Fullscreen smartphone-OS UI in plain DOM/CSS, with a Three.js
(`three/webgpu`, WebGL2 fallback) animated wallpaper behind it.

## Layout
- `src/apps.json` — app list (the only file to edit to add apps)
- `src/os/apps.ts` — registry, types, `registerView()` for internal apps
- `src/os/home.ts` — paged icon grid + dots + dock (swipe w/ momentum)
- `src/os/shell.ts` — OS layer (notification pill + home bar), lock screen, app windows (zoom open/close), home-bar gesture, notification center
- `src/os/linkOpen.ts` — opens link apps per their `open` mode
- `src/wallpaper.ts` — Three.js live wallpaper
- `src/style.css`

## Add an app
Append to `src/apps.json`:
```json
{ "id": "zenn", "name": "Zenn", "icon": "📘", "mode": "link", "url": "https://zenn.dev/nozomi_hiragi" }
```
- `mode: "link"` → opens `url` outside the OS. `open` picks where (default `"app"`):
  - `"app"` → `window.open` new tab. In the installed iOS app this opens inside the PWA (in-app browser overlay).
  - `"browser"` → in the installed iOS app, navigates to `x-safari-https://…`, which hands the URL to Safari (iOS 17+).
    On Android / PC a new tab already is the browser, so same as `"app"`.
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
- Shown as cards in the Notification Center (pull down the top notification pill) and as red count badges on app icons.
  Tapping a card opens its app; opening an app marks its notifications read for the session.

## Quick settings
Round toggles at the top of the Notification Center are defined in `src/os/quickSettings.ts` (`quickSettings` array:
`{ id, label, icon(on), supported?, isOn, toggle, subscribe? }`). Unsupported ones are hidden (e.g. Fullscreen on iPhone Safari).
Currently: Fullscreen. The gear button opens the Settings app.

## Settings app
`src/apps/settings.ts` (internal app id `settings`, listed in apps.json; also opened by the Notification Center gear).
Pages are `{ title, sections }`; sections are functions returning `{ title, rows }`; rows support `value`, `button`, `toggle`,
`choice` (segmented), `nav` (opens a sub-page, shows ›) and `onTap`. Sub-pages have a `‹ 設定` back button.
Top page: 画面 (quick-settings toggles e.g. 全画面), バッテリー › (today's max, current, last update), アップデート
(version, status, check/apply, キャッシュを取り直す with a confirm dialog), 開発者 › (hidden, see below).
Hidden developer menu: tap バージョン 10 times in a row (≤1.5s apart) → `localStorage["phone.devMenu"]="1"` → 開発者 row appears.
The 開発者 page has a 隠す button that clears the flag.

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
`public/manifest.webmanifest` (scope/start_url `/phone/`, display `standalone` so the real Android status bar shows; reinstall after changing) and
placeholder icons in `public/icons/` (192, 512, maskable 512, apple-touch 180). iOS meta tags are in `index.html`.
The Fullscreen quick setting still goes true fullscreen (`.fs` only for Fullscreen API / display-mode fullscreen).
iOS: `apple-mobile-web-app-status-bar-style` = `black-translucent` (meta read only at install). In the installed iOS app
the OS fills the whole screen (no safe-area subtraction) and scrolls to the bottom on launch (`src/os/scrollBottom.ts`, `?scroll=off`). Settings > アップデート > キャッシュを取り直す deletes `phone-os-*` caches, unregisters the SW and reloads.

## Debug params / 開発者 settings
All URL debug params are listed in `src/os/debugParams.ts` (single registry). Settings > 開発者 (hidden menu) shows the active query and a
switch per param; switching reloads `/phone/` with the param added/removed (`location.replace`), identical to editing the URL
(needed in the installed app). Params: demo, unlocked, insets, debug=nav, battHours, signalOpened, resetSignal, hist (`auto`/`on`/`off`: force history integration), wall (`off` = no Three.js, CSS gradient only; `noblur` = no CSS blur filter; choice in Settings).

## OS layer / safe areas
No status bar, clock or battery at the top: the only top UI is the notification pill (pull it down for the Notification Center).
The OS layer (pill + home bar) uses the site safe areas `--sat`/`--sab` directly. Content layers (home, Notification Center,
lock screen, app windows) get `--app-sat = --sat + --nbar-h(27px)` and `--app-sab = --sab + --hbar-h(27px) + 5px`
(`Shell.applyAppInsets`) and lay themselves out from those (Settings puts a `.sa-spacer` above its title).
Pill and NC handle: 40×5px; the pill hides on grab and the NC handle shows at once; when the NC starts closing the handle hides and the pill fades in.
The pill's hit area = `--sat + --nbar-h` (matches what is shown).
Home bar: solid white/black picked from the average brightness behind it (`src/os/homebar.ts`). Bottom offset: `--sab + 16px`,
iOS Safari `+ 44px`, Android = the NC handle grip position (`--sab + --hbar-h + 5px + (40px - grab-h)/2`).
Bottom blur (`.bottom-blur`): same look as the NC (tint rgba(10,5,30,.4) + blur 24px), height `--sab*1.6+8px`, smootherstep mask
that starts at ~72% at the bottom edge (as if the curve continued off-screen) and fades upward.
`src/os/platform.ts` sets `html[data-device]` = ios-standalone / ios-safari / ios-other / android / other.

## Demo
`?demo=1` uses `src/demo/apps.json` + `src/demo/notifications.json` instead of the real lists (real links only).

## Gestures
Swipe up on lock screen to unlock · swipe pages horizontally · swipe up from bottom bar to close an app / go home ·
pull down the top notification pill for the notification center; drag its bottom handle up (or tap it) to close. The card list scrolls independently. Debug: `?unlocked=1` skips the lock screen.

## Battery
`src/os/battery.ts`: on every load it starts at the day's max = 100 - daysSinceUpdate*100/365 (update date = build time),
then drops 1%/hour of viewing. After 1 continuous hour at 0% the screen goes black (dead). Debug: `?battHours=N`.

## Signal
(No longer shown in the UI; logic kept.) `src/os/signal.ts`: starts at 1G with 0 bars (greyed bars). Each app id opened for the first time adds a bar (max 4);
opening a new app at 4 bars upgrades the generation (2G, 3G, ...) and resets to 1 bar, with a toast ("2Gにアップグレード").
Opened ids persist in localStorage (`os.signal.opened`). Debug: `?resetSignal=1`, `?signalOpened=N` (simulate N unique opens).

## Dev / build / deploy
- `npm install && npm run dev` (open the printed `/phone/` URL)
- `npm run build` → `dist/` (base `/phone/`)
- CI: `.github/workflows/nextjs.yml` builds Next (`out/`), then builds `phone/` and copies `phone/dist` → `out/phone/`.
