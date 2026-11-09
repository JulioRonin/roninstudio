import { NextResponse } from "next/server";
import { autorizado, DEMO, validarPropuesta } from "@/lib/hermes";
import { hayDB, sb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Los agentes dejan aquí sus propuestas; van a la bandeja de aprobación.
 *  POST /api/hermes/propuestas  { agente, tipo, titulo, cuerpo, datos?, modelo?, referencia? }
 *  Con Supabase se inserta en propuestas_ia (201) y aparece en la bandeja; sin Supabase sólo se acusa recibo (202). */
export async function POST(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const v = validarPropuesta(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  if (hayDB()) {
    try {
      const r = await sb<{ id: string }[]>("propuestas_ia?select=id", { method: "POST", prefer: "return=representation", body: { agente: v.p.agente, tipo: v.p.tipo, titulo: v.p.titulo, cuerpo: v.p.cuerpo, datos: v.p.datos ?? null, modelo: v.p.modelo ?? null, referencia: v.p.referencia ?? null } });
      return NextResponse.json({ ok: true, id: r[0]?.id, estado: "en la bandeja de aprobación", propuesta: v.p }, { status: 201 });
    } catch (e) { return NextResponse.json({ error: "no se pudo guardar: " + (e instanceof Error ? e.message : "error") }, { status: 502 }); }
  }
  const id = "prop_" + Date.now().toString(36);
  console.log("[hermes] propuesta recibida", id, v.p.agente, v.p.tipo, v.p.titulo);
  return NextResponse.json({ ok: true, id, estado: DEMO ? "recibida · modo demo, sin base de datos todavía" : "recibida · sin base de datos todavía", propuesta: v.p }, { status: 202 });
}

export async function GET() {
  return NextResponse.json({ ok: true, uso: "POST { agente, tipo, titulo, cuerpo, datos?, modelo?, referencia? } con Authorization: Bearer MUSASHI_API_KEY" });
}
