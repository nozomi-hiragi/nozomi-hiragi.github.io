import realNotifs from "../notifications.json";
import demoNotifs from "../demo/notifications.json";
import { apps, isDemo, AppDef } from "./apps";

/**
 * Notifications live in src/notifications.json (apps.json stays a pure app list).
 * Each references an app by `appId`; entries with an unknown appId are warned about and skipped.
 * - icon?: overrides the app icon in the notification card.
 * - stage?: minimum signal generation (1G, 2G, ...) required before it appears. Default 1.
 */
export type NotificationDef = { id: string; appId: string; title: string; body: string; icon?: string; stage?: number };
export type Notification = NotificationDef & { app: AppDef };

export function loadNotifications(list: NotificationDef[] = (isDemo ? demoNotifs : realNotifs) as NotificationDef[]): Notification[] {
  const byId = new Map(apps.map((a) => [a.id, a]));
  const out: Notification[] = [];
  for (const n of list) {
    const app = byId.get(n.appId);
    if (!app) { console.warn(`notifications: unknown appId "${n.appId}" in "${n.id}", skipped`); continue; }
    out.push({ ...n, app });
  }
  return out;
}
