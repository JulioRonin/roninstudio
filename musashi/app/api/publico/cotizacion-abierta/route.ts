import { NextResponse, after, type NextRequest } from "next/server";
import { notificar } from "@/lib/push";
import { folioDe } from "@/lib/liga";
import { hayDB, sb } from "@/lib/db";
import { COOKIE, COOKIE_PROPIO, firmaValida, tokenValido } from "@/lib/sesion";
import { ciudadDe, dispositivoDe, navegadorDe } from "@/lib/aperturas-base";

export const dynamic = "force-dynamic";

/** Alguien abrió la liga privada de una cotización. Tres casos:
 *  - Con sesión de Musashi (tú, con "Ver como cliente"): no se cuenta ni se registra.
 *  - Desde un navegador marcado como tuyo (Configuración → Tus dispositivos): se registra como "tú",
 *    pero no suma, no cambia el estado y no manda notificación.
 *  - Cualquier otro: suma una apertura del cliente, se registra con dispositivo y ciudad aproximada,
 *    pasa de "Enviada" a "Abierta" y te avisa. */
export async function POST(req: NextRequest) {
  let ref = ""; try { ref = String((await req.json()).ref ?? ""); } catch {}
  const folio = folioDe(ref);
  if (!folio || !hayDB()) return NextResponse.json({ ok: false }, { status: 404 });
  if (await tokenValido(req.cookies.get(COOKIE)?.value)) return NextResponse.json({ ok: true, contada: false, interna: true });
  const propia = await firmaValida("propio", req.cookies.get(COOKIE_PROPIO)?.value);
  try {
    const f = (await sb<{ id: string; estado: string; abierta_veces: number; proyecto_nombre: string; cliente: { nombre: string } | null }[]>(`cotizaciones?select=id,estado,abierta_veces,proyecto_nombre,cliente:clientes(nombre)&folio=eq.${encodeURIComponent(folio)}`))[0];
    if (!f) return NextResponse.json({ ok: false }, { status: 404 });
    const ua = req.headers.get("user-agent") ?? "";
    const registro = { cotizacion_id: f.id, propia, dispositivo: dispositivoDe(ua), navegador: navegadorDe(ua), ciudad: ciudadDe(req.headers) };
    // El detalle va aparte: si la migración 0006 aún no corre, la apertura del cliente se cuenta igual.
    const detalle = sb("cotizacion_aperturas", { method: "POST", prefer: "return=minimal", body: registro }).catch(() => null);
    if (propia) { await detalle; return NextResponse.json({ ok: true, contada: false, propia: true }); }
    await sb(`cotizaciones?id=eq.${f.id}`, { method: "PATCH", body: { abierta_veces: (f.abierta_veces ?? 0) + 1, abierta_ultima: new Date().toISOString(), ...(f.estado === "Enviada" ? { estado: "Abierta" } : {}) } });
    await detalle;
    const vez = (f.abierta_veces ?? 0) + 1;
    const desde = [registro.dispositivo, registro.ciudad].filter(Boolean).join(" · ");
    after(() => notificar("aperturas", { titulo: `${f.cliente?.nombre ?? "Tu cliente"} abrió la cotización`, cuerpo: `${folio} · ${f.proyecto_nombre}${vez > 1 ? ` · la ha abierto ${vez} veces` : " · primera vez"}${desde ? ` · ${desde}` : ""}`, url: "/cotizaciones", tag: `abierta-${folio}` }));
    return NextResponse.json({ ok: true, contada: true });
  } catch { return NextResponse.json({ ok: false }, { status: 502 }); }
}
