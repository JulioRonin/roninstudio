// Reglas de fechas de los cobros mensuales. Sin dependencias: lo usan el servidor (para generar
// las facturas) y la pantalla (para mostrar el próximo cobro).

export type Mensualidad = {
  id: string; cliente_id: string; proyecto_id: string | null; concepto: string; monto: number;
  dia_cobro: number; dias_para_pagar: number; inicio: string; fin: string | null; activa: boolean; reanudada: string | null; notas: string | null;
};
type Regla = Pick<Mensualidad, "dia_cobro" | "inicio" | "fin" | "activa" | "reanudada">;

const pad = (n: number) => String(n).padStart(2, "0");
/** Día de cobro de un periodo AAAA-MM. */
export const fechaCobro = (periodo: string, dia: number) => `${periodo}-${pad(dia)}`;
export const sigPeriodo = (p: string) => { const [y, m] = p.split("-").map(Number); return m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`; };
/** Desde qué fecha cuentan los cobros: el inicio o, si se reanudó después de una pausa, la reanudación. */
const desde = (m: Regla) => (m.reanudada && m.reanudada > m.inicio ? m.reanudada : m.inicio);

/** Periodos cuyo día de cobro ya llegó (entre el arranque y hoy, sin pasar de la fecha de término). */
export function periodosQueTocan(m: Regla, hoy: string, max = 12): string[] {
  if (!m.activa) return [];
  const ini = desde(m), tope = m.fin && m.fin < hoy ? m.fin : hoy, out: string[] = [];
  for (let p = ini.slice(0, 7), i = 0; i < 240; i++, p = sigPeriodo(p)) { const f = fechaCobro(p, m.dia_cobro); if (f > tope) break; if (f >= ini) out.push(p); }
  return out.slice(-max);
}

/** Fecha del siguiente cobro que todavía no llega; null si está en pausa o ya terminó. */
export function proximoCobro(m: Regla, hoy: string): string | null {
  if (!m.activa) return null;
  const ini = desde(m);
  for (let p = (hoy > ini ? hoy : ini).slice(0, 7), i = 0; i < 3; i++, p = sigPeriodo(p)) { const f = fechaCobro(p, m.dia_cobro); if (f >= ini && f > hoy) return m.fin && f > m.fin ? null : f; }
  return null;
}

/** "2026-11" → "nov 2026" */
export const periodoCorto = (p?: string | null) => (p ? new Date(p + "-15T12:00:00").toLocaleDateString("es-MX", { month: "short", year: "numeric" }).replace(".", "") : "");
