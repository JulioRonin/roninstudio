import { NextResponse } from "next/server";
import { autorizado, DEMO, validarPropuesta } from "@/lib/hermes";

export const dynamic = "force-dynamic";

/** Los agentes dejan aquí sus propuestas; van a la bandeja de aprobación.
 *  POST /api/hermes/propuestas  { agente, tipo, titulo, cuerpo, datos?, modelo?, referencia? }
 *  Hoy se valida y se acusa recibo (202). Con Supabase se inserta en propuestas_ia. */
export async function POST(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const v = validarPropuesta(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const id = "prop_" + Date.now().toString(36);
  console.log("[hermes] propuesta recibida", id, v.p.agente, v.p.tipo, v.p.titulo);
  return NextResponse.json({ ok: true, id, estado: DEMO ? "recibida · modo demo, sin base de datos todavía" : "recibida", propuesta: v.p }, { status: 202 });
}

export async function GET() {
  return NextResponse.json({ ok: true, uso: "POST { agente, tipo, titulo, cuerpo, datos?, modelo?, referencia? } con Authorization: Bearer MUSASHI_API_KEY" });
}
