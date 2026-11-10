import { NextResponse } from "next/server";
import { autorizado, AGENTES } from "@/lib/hermes";
import { hayDB, sb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Cada agente reporta aquí su corrida al terminar; alimenta Agentes y el tope de tokens de Configuración.
 *  POST /api/hermes/corridas (Bearer MUSASHI_API_KEY)
 *  { agente, disparo?, inicio?, fin?, tokens_entrada?, tokens_salida?, costo_mxn?, resultado? } */
export async function POST(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  let b: Record<string, unknown>; try { b = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const agente = String(b.agente ?? "").toLowerCase();
  if (!AGENTES.some((a) => a.id === agente)) return NextResponse.json({ error: `agente desconocido: ${b.agente}` }, { status: 400 });
  const num = (x: unknown, max: number) => { const n = Number(x); return Number.isFinite(n) && n >= 0 && n <= max ? n : null; };
  const fecha = (x: unknown) => { const t = typeof x === "string" ? Date.parse(x) : NaN; return Number.isFinite(t) ? new Date(t).toISOString() : null; };
  const fila = { agente, disparo: typeof b.disparo === "string" ? b.disparo.slice(0, 80) : null, inicio: fecha(b.inicio) ?? new Date().toISOString(), fin: fecha(b.fin) ?? new Date().toISOString(),
    tokens_entrada: num(b.tokens_entrada, 1e9), tokens_salida: num(b.tokens_salida, 1e9), costo_mxn: num(b.costo_mxn, 1e6), resultado: typeof b.resultado === "string" ? b.resultado.slice(0, 500) : null };
  if (!hayDB()) return NextResponse.json({ ok: true, guardada: false, nota: "sin base de datos todavía" }, { status: 202 });
  try { const r = await sb<{ id: string }[]>("corridas_agente?select=id", { method: "POST", prefer: "return=representation", body: fila }); return NextResponse.json({ ok: true, guardada: true, id: r[0]?.id }, { status: 201 }); }
  catch (e) { return NextResponse.json({ error: "no se pudo guardar: " + (e as Error).message }, { status: 502 }); }
}
