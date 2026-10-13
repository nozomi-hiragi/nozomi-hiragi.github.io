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
