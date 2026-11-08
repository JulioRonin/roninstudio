import { NextResponse } from "next/server";
import { enviarAHermes } from "@/lib/hermes";

export const dynamic = "force-dynamic";

/** Musashi manda trabajo a Hermes (p. ej. el Estudio al Productor).
 *  POST /api/hermes/jobs { agente: "productor", evento: "producir", pieza: {...}, tomas: [...] }
 *  Se firma con HMAC (Generic V2) y se entrega a la ruta `musashi` de la plataforma de webhooks de Hermes. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const agente = String(body.agente ?? "").toLowerCase();
  if (!agente) return NextResponse.json({ error: "falta agente" }, { status: 400 });
  const evento = { event_type: `musashi.${agente}.${String(body.evento ?? "run")}`, agente, enviado_en: new Date().toISOString(), ...body };
  try {
    const r = await enviarAHermes(evento);
    return NextResponse.json(r, { status: r.enviado ? 202 : 200 });
  } catch (e) {
    return NextResponse.json({ enviado: false, motivo: e instanceof Error ? e.message : "error" }, { status: 502 });
  }
}
