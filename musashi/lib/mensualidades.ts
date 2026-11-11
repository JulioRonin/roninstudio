// Genera las facturas de las mensualidades cuyo día de cobro ya llegó. Sólo servidor.
// Es idempotente: una factura por mensualidad y periodo (lo garantiza un índice único en la base).
import { ErrorDB, sb } from "@/lib/db";
import { siguienteFolio, sumaDias } from "@/lib/datos";
import { fechaCobro, periodosQueTocan, type Mensualidad } from "@/lib/mensualidades-base";

export type Generada = { folio: string; cliente: string; concepto: string; periodo: string; monto: number; vence: string };
export type Resultado = { lista: boolean; generadas: Generada[] };

/** Fecha de hoy en Ciudad Juárez (el servidor corre en UTC). */
export function hoyNegocio() {
  for (const tz of ["America/Ciudad_Juarez", "America/Denver"]) { try { return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch {} }
  return new Date().toISOString().slice(0, 10);
}

type Fila = Mensualidad & { cliente: { nombre: string } | null };
const hechas = async () => new Set((await sb<{ mensualidad_id: string; periodo: string }[]>("facturas?select=mensualidad_id,periodo&mensualidad_id=not.is.null")).map((f) => `${f.mensualidad_id}|${f.periodo}`));
const folios = async () => (await sb<{ folio: string }[]>("facturas?select=folio")).map((f) => f.folio);

/** lista:false significa que falta correr la migración 0002 en Supabase (no es un error). */
export async function generarMensualidades(): Promise<Resultado> {
  let ms: Fila[];
  try { ms = await sb<Fila[]>("mensualidades?select=*,cliente:clientes(nombre)&activa=eq.true"); }
  catch (e) { if (e instanceof ErrorDB && e.status === 404) return { lista: false, generadas: [] }; throw e; }
  const hoy = hoyNegocio();
  const tocan = ms.flatMap((m) => periodosQueTocan(m, hoy).map((periodo) => ({ m, periodo })));
  if (!tocan.length) return { lista: true, generadas: [] };
  let ya = await hechas();
  const faltan = tocan.filter((x) => !ya.has(`${x.m.id}|${x.periodo}`));
  if (!faltan.length) return { lista: true, generadas: [] };
  let usados = await folios();
  const generadas: Generada[] = [];
  for (const { m, periodo } of faltan) {
    const emitida = fechaCobro(periodo, m.dia_cobro), vence = sumaDias(emitida, m.dias_para_pagar);
    for (let intento = 0; intento < 2; intento++) {
      const folio = siguienteFolio("F-", usados);
      try {
        await sb("facturas", { method: "POST", prefer: "return=minimal", body: { folio, cliente_id: m.cliente_id, proyecto_id: m.proyecto_id, monto: m.monto, estado: "Vigente", emitida, vence, mensualidad_id: m.id, periodo } });
        usados.push(folio); generadas.push({ folio, cliente: m.cliente?.nombre ?? "", concepto: m.concepto, periodo, monto: Number(m.monto), vence });
        break;
      } catch (e) {
        // 409: otra pantalla la generó al mismo tiempo o el folio ya se usó. Se vuelve a leer y se decide.
        if (!(e instanceof ErrorDB && e.status === 409) || intento) throw e;
        ya = await hechas(); if (ya.has(`${m.id}|${periodo}`)) break;
        usados = await folios();
      }
    }
  }
  return { lista: true, generadas };
}
