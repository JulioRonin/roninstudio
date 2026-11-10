import { NextResponse, type NextRequest } from "next/server";
import { folioDe } from "@/lib/liga";
import { hayDB, sb } from "@/lib/db";
import { COOKIE, tokenValido } from "@/lib/sesion";

export const dynamic = "force-dynamic";

/** El cliente abrió su cotización desde la liga privada: suma una apertura y, si estaba "Enviada", pasa a "Abierta".
 *  No cuenta cuando quien la abre tiene sesión de Musashi (tú revisando cómo se ve). */
export async function POST(req: NextRequest) {
  let ref = ""; try { ref = String((await req.json()).ref ?? ""); } catch {}
  const folio = folioDe(ref);
  if (!folio || !hayDB()) return NextResponse.json({ ok: false }, { status: 404 });
  if (await tokenValido(req.cookies.get(COOKIE)?.value)) return NextResponse.json({ ok: true, contada: false });
  try {
    const f = (await sb<{ id: string; estado: string; abierta_veces: number }[]>(`cotizaciones?select=id,estado,abierta_veces&folio=eq.${encodeURIComponent(folio)}`))[0];
    if (!f) return NextResponse.json({ ok: false }, { status: 404 });
    await sb(`cotizaciones?id=eq.${f.id}`, { method: "PATCH", body: { abierta_veces: (f.abierta_veces ?? 0) + 1, abierta_ultima: new Date().toISOString(), ...(f.estado === "Enviada" ? { estado: "Abierta" } : {}) } });
    return NextResponse.json({ ok: true, contada: true });
  } catch { return NextResponse.json({ ok: false }, { status: 502 }); }
}
