// Acceso a Supabase desde el servidor (route handlers). Nunca se importa en componentes del navegador.
// Usa la API REST (PostgREST) con la llave secreta; la base tiene RLS sin políticas, así que
// sólo este servidor puede leer y escribir.

const cfg = () => ({ url: (process.env.SUPABASE_URL ?? "").trim().replace(/\/$/, ""), key: (process.env.SUPABASE_SECRET_KEY ?? "").trim() });

export const hayDB = () => { const { url, key } = cfg(); return Boolean(url && key); };

export class ErrorDB extends Error { constructor(public status: number, msg: string) { super(msg); } }

/** Llama a PostgREST: sb("clientes?select=*&order=creado_en.desc"). */
export async function sb<T = unknown>(path: string, o: { method?: string; body?: unknown; prefer?: string } = {}): Promise<T> {
  const { url, key } = cfg();
  if (!url || !key) throw new ErrorDB(503, "Supabase sin configurar (SUPABASE_URL y SUPABASE_SECRET_KEY)");
  const headers: Record<string, string> = { apikey: key, "Content-Type": "application/json" };
  // Las llaves nuevas (sb_secret_…) van sólo en apikey; las legacy (JWT service_role) también en Authorization.
  if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;
  if (o.prefer) headers.Prefer = o.prefer;
  const res = await fetch(`${url}/rest/v1/${path}`, { method: o.method ?? "GET", headers, body: o.body === undefined ? undefined : JSON.stringify(o.body), cache: "no-store", signal: AbortSignal.timeout(15000) });
  const text = await res.text();
  if (!res.ok) {
    let msg = text.slice(0, 400);
    try { const j = JSON.parse(text); msg = [j.message, j.details, j.hint].filter(Boolean).join(" · ") || msg; } catch {}
    throw new ErrorDB(res.status, msg);
  }
  return (text ? JSON.parse(text) : null) as T;
}

/** Tablas y vistas que la API de datos de Musashi puede tocar. */
export const TABLAS = new Set([
  "clientes", "contactos", "diagnosticos_expres", "cotizaciones", "cotizacion_lineas", "proyectos", "hitos", "horas", "riesgos",
  "tareas", "facturas", "movimientos", "mapas_flujo", "configuracion", "piezas", "propuestas_ia", "corridas_agente", "mensualidades",
  "balance_mensual", "saldos_cliente",
]);
export const VISTAS = new Set(["balance_mensual", "saldos_cliente"]);
