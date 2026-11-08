import { NextResponse } from "next/server";
import { autorizado, DEMO } from "@/lib/hermes";
import { TASKS, TRAY } from "@/lib/demo";
import { COTS, FACTURAS, PAGOS, total } from "@/lib/cotizaciones";
import { RESUMENES } from "@/lib/proyectos";

export const dynamic = "force-dynamic";

/** Lo que un agente necesita leer antes de proponer. Hoy: datos demo; con Supabase, consultas reales.
 *  GET /api/hermes/contexto?para=cobrador|seguimiento|reportero|estratega|... */
export async function GET(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  const para = new URL(req.url).searchParams.get("para") ?? "general";
  const hoy = "2026-11-06";
  const base = { demo: DEMO, hoy, agente: para, reglas: ["Ninguna acción hacia terceros sin aprobación humana.", "Cifras sólo si están en estos datos.", "Nombrar clientes sólo como vienen aquí (en demo: 'Negocio demo N')."] };
  switch (para) {
    case "cobrador":
      return NextResponse.json({ ...base, facturas: FACTURAS.filter((f) => f.estado === "Vencida" || f.estado === "Vigente"), pagos_recientes: PAGOS.filter((p) => p.tipo === "Cobro").slice(0, 5) });
    case "seguimiento":
      return NextResponse.json({ ...base, tareas: TASKS.filter((t) => t.channel !== "INTERNO"), cotizaciones_abiertas: COTS.filter((c) => ["Enviada", "Abierta"].includes(c.estado)).map((c) => ({ folio: c.folio, cliente: c.cliente, proyecto: c.proyecto, total: total(c), vigencia: c.vigencia, abierta: c.abierta ?? null })) });
    case "reportero":
      return NextResponse.json({ ...base, proyectos: Object.values(RESUMENES) });
    case "analista":
      return NextResponse.json({ ...base, pagos: PAGOS, facturas: FACTURAS, proyectos: Object.values(RESUMENES).map((r) => ({ code: r.code, cliente: r.cliente, horas: r.horas, cobranza: r.cobranza, avance: r.avance })) });
    case "estratega":
    case "guionista":
    case "analista-canal":
      return NextResponse.json({ ...base, propuestas_pendientes: TRAY.filter((t) => ["ESTRATEGA", "GUIONISTA"].includes(t.agent)), tema_de_marca: "Primero el flujo. Después la IA.", lineas_rojas: ["No prometer porcentajes ni plazos", "No nombrar clientes sin permiso", "No usar 'revoluciona', 'potencia', 'impulsa'"] });
    default:
      return NextResponse.json({ ...base, tareas: TASKS, bandeja: TRAY, cotizaciones: COTS.map((c) => ({ folio: c.folio, cliente: c.cliente, estado: c.estado, total: total(c) })), facturas: FACTURAS });
  }
}
