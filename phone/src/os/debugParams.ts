/**
 * Registry of URL debug params. Settings > 開発者 lists these; toggling one reloads /phone/ with the param
 * added/removed (location.replace), exactly like editing the URL (needed in the installed app, which has no URL bar).
 * To add a debug option: append an entry here and read it via URLSearchParams where it is implemented.
 *  - flag:  present/absent (added as `key=1`, or `key=<value>` if `value` is set)
 *  - input: asks for a value (prompt) when turned on
 *  - choice: one of fixed values (null option = param removed)
 */
export type DebugParam =
  | { key: string; label: string; kind: "flag"; value?: string }
  | { key: string; label: string; kind: "input"; hint: string }
  | { key: string; label: string; kind: "choice"; options: { label: string; value: string | null }[] }; // null = param absent

export const debugParams: DebugParam[] = [
  { key: "demo", label: "デモデータ (demo)", kind: "flag" },
  { key: "unlocked", label: "ロック画面をスキップ (unlocked)", kind: "flag" },
  { key: "insets", label: "セーフエリア表示 (insets)", kind: "flag" },
  { key: "debug", label: "ナビゲーションログ (debug=nav)", kind: "flag", value: "nav" },
  { key: "battHours", label: "電池: 経過時間 (battHours)", kind: "input", hint: "経過時間 (時間)" },
  { key: "signalOpened", label: "電波: 開いたアプリ数 (signalOpened)", kind: "input", hint: "ユニークに開いたアプリ数" },
  { key: "resetSignal", label: "電波をリセット (resetSignal)", kind: "flag" },
  { key: "hist", label: "履歴連携 (hist)", kind: "choice", options: [{ label: "auto", value: null }, { label: "on", value: "on" }, { label: "off", value: "off" }] },
  { key: "wall", label: "壁紙 (wall)", kind: "choice", options: [{ label: "通常", value: null }, { label: "noblur", value: "noblur" }, { label: "off", value: "off" }] },
];

export const currentParams = () => new URLSearchParams(location.search);

export function isActive(p: DebugParam) {
  const q = currentParams();
  return p.kind === "flag" && p.value ? q.get(p.key) === p.value : q.has(p.key);
}

/** set a param to a value (null removes it) and reload with the new query */
export function setParam(key: string, value: string | null) {
  const q = currentParams();
  if (value === null) q.delete(key); else q.set(key, value);
  const qs = q.toString();
  location.replace(location.pathname + (qs ? "?" + qs : ""));
}

/** toggle a param and reload with the new query (same as typing the URL) */
export function toggleParam(p: DebugParam) {
  const q = currentParams();
  if (isActive(p)) q.delete(p.key);
  else if (p.kind === "flag") q.set(p.key, p.value ?? "1");
  else if (p.kind === "input") {
    const v = prompt(p.hint, q.get(p.key) ?? "");
    if (v === null || v === "") return;
    q.set(p.key, v);
  }
  const qs = q.toString();
  location.replace(location.pathname + (qs ? "?" + qs : ""));
}
