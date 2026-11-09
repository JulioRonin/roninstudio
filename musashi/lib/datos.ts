// Cliente de la API de datos (/api/datos/<tabla>) para las pantallas de Musashi.
// Si Supabase no está configurado, las respuestas traen db:false y cada pantalla se queda en modo demo.

export type Resp<T> = { db: boolean; filas: T[] };

async function pedir<T>(method: string, tabla: string, qs: string, body?: unknown): Promise<Resp<T>> {
  const r = await fetch(`/api/datos/${tabla}${qs ? `?${qs}` : ""}`, { method, headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) { window.location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search); throw new Error("sesión vencida"); }
  if (!r.ok) throw new Error(d.error ?? `error ${r.status}`);
  return { db: Boolean(d.db), filas: (d.filas ?? []) as T[] };
}

const enc = encodeURIComponent;
export const eq = (col: string, v: string | number) => `${col}=eq.${enc(String(v))}`;

export const datos = {
  lista: <T>(tabla: string, qs = "select=*") => pedir<T>("GET", tabla, qs),
  crea: <T>(tabla: string, fila: object | object[], upsert?: string) => pedir<T>("POST", tabla, upsert ? `upsert=${enc(upsert)}` : "", fila),
  cambia: <T>(tabla: string, filtro: string, cambios: object) => pedir<T>("PATCH", tabla, filtro, cambios),
  borra: (tabla: string, filtro: string) => pedir<unknown>("DELETE", tabla, filtro),
};

/* ---------- Fechas (se guardan como YYYY-MM-DD; se muestran cortas) ---------- */
export const hoyISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
export const sumaDias = (iso: string, n: number) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
export const fechaCorta = (iso?: string | null) => (iso ? new Date(iso.slice(0, 10) + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" }).replace(".", "") : "—");
export const fechaLarga = (iso?: string | null) => (iso ? new Date(iso.slice(0, 10) + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "");
export const mesCorto = (iso?: string | null) => (iso ? new Date(iso.slice(0, 10) + "T12:00:00").toLocaleDateString("es-MX", { month: "short" }).replace(".", "").toUpperCase() : "");
export const mesClave = (iso: string) => iso.slice(0, 7); // 2026-11

/** Siguiente folio con prefijo: C-0001, F-0001, P-0001… a partir de los existentes. */
export function siguienteFolio(prefijo: string, folios: (string | null | undefined)[], ancho = 4) {
  const n = folios.reduce((m, f) => { const x = Number(String(f ?? "").replace(/\D/g, "")); return Number.isFinite(x) && x > m ? x : m; }, 0);
  return `${prefijo}${String(n + 1).padStart(ancho, "0")}`;
}
