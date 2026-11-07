// Capa de datos de Musashi.
// Hoy: modo demo, persistencia en el navegador (localStorage).
// Mañana: Supabase. Las pantallas sólo hablan con load/save, así el cambio
// de origen no las toca. El esquema está en supabase/migrations/.
export const DEMO = process.env.NEXT_PUBLIC_SUPABASE_URL ? false : true;

export function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem("musashi:" + key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
export function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("musashi:" + key, JSON.stringify(value)); } catch {}
}
export function reset(key?: string) {
  if (typeof window === "undefined") return;
  try {
    if (key) localStorage.removeItem("musashi:" + key);
    else Object.keys(localStorage).filter((k) => k.startsWith("musashi:")).forEach((k) => localStorage.removeItem(k));
  } catch {}
}
