import { NextResponse, after, type NextRequest } from "next/server";
import { notificar } from "@/lib/push";
import { hayDB, sb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Recibe el diagnóstico exprés del sitio público (roninstudio.com.mx lo reenvía desde /api/diagnostico)
 *  y lo guarda en la bandeja exprés. Es público, así que valida tamaño y forma, y limita el volumen por hora. */
const ORIGENES = /^https:\/\/(www\.)?roninstudio\.com\.mx$|^http:\/\/localhost(:\d+)?$/;
const txt = (x: unknown, max: number) => (typeof x === "string" ? x.trim().slice(0, max) : "");
const lista = (x: unknown, n: number, max: number) => (Array.isArray(x) ? x.slice(0, n).map((y) => txt(y, max)).filter(Boolean) : []);

export async function POST(req: NextRequest) {
  const origen = req.headers.get("origin");
  if (origen && !ORIGENES.test(origen)) return NextResponse.json({ error: "origen no permitido" }, { status: 403 });
  const crudo = await req.text();
  if (crudo.length > 24000) return NextResponse.json({ error: "demasiado grande" }, { status: 413 });
  let b: Record<string, unknown>; try { b = JSON.parse(crudo); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  if (txt(b._honey, 10)) return NextResponse.json({ ok: true }); // trampa para bots: se acepta y se descarta
  const nombre = txt(b.nombre, 120), negocio = txt(b.negocio, 140), correo = txt(b.correo ?? b.email, 160), whatsapp = txt(b.whatsapp, 30);
  if (!nombre || !negocio || (!whatsapp && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo))) return NextResponse.json({ error: "faltan nombre, negocio o un medio de contacto" }, { status: 400 });
  if (!hayDB()) return NextResponse.json({ ok: true, guardado: false }, { status: 202 });
  try {
    const hace1h = new Date(Date.now() - 3600000).toISOString();
    const recientes = await sb<{ id: string }[]>(`diagnosticos_expres?select=id&creado_en=gte.${hace1h}&limit=41`);
    if (recientes.length > 40) return NextResponse.json({ error: "demasiados envíos, intenta más tarde" }, { status: 429 });
    await sb("diagnosticos_expres", { method: "POST", prefer: "return=minimal", body: {
      nombre, negocio, sector: txt(b.sector, 60) || null, whatsapp: whatsapp || null, correo: correo || null,
      respuestas: { sector_clave: txt(b.sector_clave, 30), lista: lista(b.respuestas, 30, 700) },
      hallazgos: { lista: lista(b.hallazgos, 12, 300), horas: txt(b.horas, 160), contexto: lista(b.contexto_otro, 12, 500) },
      lectura_interna: { nivel: txt(b.lectura_interna, 80) },
    } });
    after(() => notificar("diagnosticos", { titulo: "Nuevo diagnóstico exprés", cuerpo: `${negocio}${txt(b.sector, 60) ? " · " + txt(b.sector, 60) : ""} · ${nombre}`, url: "/diagnosticos?tab=expres", tag: "diagnostico" }));
    return NextResponse.json({ ok: true, guardado: true }, { status: 201 });
  } catch (e) { console.error("[diagnostico exprés]", e); return NextResponse.json({ error: "no se pudo guardar" }, { status: 502 }); }
}
