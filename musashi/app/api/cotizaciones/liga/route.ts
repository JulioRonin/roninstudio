import { NextResponse, type NextRequest } from "next/server";
import { refDe } from "@/lib/liga";
import { hayDB, sb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Liga privada de una cotización y datos para compartirla. Sólo con sesión (lo exige el middleware).
 *  GET /api/cotizaciones/liga?f=C-0001 → { url, contacto, whatsapp, mensaje } */
export async function GET(req: NextRequest) {
  const folio = req.nextUrl.searchParams.get("f") ?? "";
  if (!/^[A-Za-z0-9-]{1,24}$/.test(folio)) return NextResponse.json({ error: "folio inválido" }, { status: 400 });
  if (!process.env.MUSASHI_SESSION_SECRET || !hayDB()) return NextResponse.json({ error: "La liga privada necesita la base de datos y MUSASHI_SESSION_SECRET." }, { status: 503 });
  try {
    const c = (await sb<{ cliente_id: string; proyecto_nombre: string; vigencia: string | null; cliente: { nombre: string } | null }[]>(`cotizaciones?select=cliente_id,proyecto_nombre,vigencia,cliente:clientes(nombre)&folio=eq.${encodeURIComponent(folio)}`))[0];
    if (!c) return NextResponse.json({ error: "no existe esa cotización" }, { status: 404 });
    const con = (await sb<{ nombre: string; whatsapp: string | null }[]>(`contactos?select=nombre,whatsapp&cliente_id=eq.${c.cliente_id}&order=decide.desc&limit=1`))[0];
    // Siempre el dominio público: si Musashi se abrió desde una dirección interna de Vercel, esa pide login.
    const base = (process.env.LIGA_BASE_URL || "https://www.roninstudio.com.mx").trim().replace(/\/$/, "");
    const url = `${base}/c/${refDe(folio)}`;
    const nombre = con?.nombre?.split(/\s+/)[0];
    const vig = c.vigencia ? new Date(c.vigencia + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long" }) : null;
    const mensaje = `Hola${nombre ? " " + nombre : ""}, te comparto la cotización ${folio} de ${c.proyecto_nombre}:\n${url}\n${vig ? `Está vigente hasta el ${vig}. ` : ""}Cualquier duda la vemos por aquí.`;
    return NextResponse.json({ url, contacto: con?.nombre ?? null, whatsapp: (con?.whatsapp ?? "").replace(/\D/g, "").replace(/^(\d{10})$/, "52$1") || null, mensaje });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 }); }
}
