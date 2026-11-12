import { NextResponse, type NextRequest } from "next/server";
import { hayDB, sb } from "@/lib/db";
import { notificar } from "@/lib/push";
import { generarMensualidades, hoyNegocio } from "@/lib/mensualidades";

export const dynamic = "force-dynamic";

/** Resumen de la mañana como notificación (Vercel Cron, una vez al día).
 *  Vercel manda Authorization: Bearer CRON_SECRET; sin esa variable no corre. */
export async function GET(req: NextRequest) {
  const secreto = (process.env.CRON_SECRET ?? "").trim();
  if (!secreto) return NextResponse.json({ error: "falta CRON_SECRET en Vercel" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secreto}`) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  if (!hayDB()) return NextResponse.json({ ok: false, motivo: "sin base de datos" });
  const hoy = hoyNegocio();
  await generarMensualidades().catch(() => null); // las mensualidades del día quedan facturadas aunque no abras Musashi
  const [tareas, facturas, props] = await Promise.all([
    sb<{ id: string }[]>(`tareas?select=id&estado=eq.Pendiente&fecha=lte.${hoy}`),
    sb<{ monto: number; vence: string | null; estado: string }[]>("facturas?select=monto,vence,estado&estado=in.(Vigente,Vencida)"),
    sb<{ id: string }[]>("propuestas_ia?select=id&estado=eq.Pendiente"),
  ]);
  const vencidas = facturas.filter((f) => f.estado === "Vencida" || (f.vence && f.vence < hoy));
  const partes = [tareas.length && `${tareas.length} ${tareas.length === 1 ? "tarea" : "tareas"} para hoy`, props.length && `${props.length} ${props.length === 1 ? "propuesta" : "propuestas"} por aprobar`,
    vencidas.length && `${vencidas.length} ${vencidas.length === 1 ? "factura vencida" : "facturas vencidas"} por $${Math.round(vencidas.reduce((s, f) => s + Number(f.monto), 0)).toLocaleString("en-US")}`].filter(Boolean) as string[];
  if (!partes.length) return NextResponse.json({ ok: true, enviado: false, motivo: "nada pendiente" });
  const r = await notificar("resumen", { titulo: "Buenos días · tu día en Musashi", cuerpo: partes.join(" · "), url: tareas.length ? "/tareas" : props.length ? "/agentes" : "/facturacion", tag: "resumen" });
  return NextResponse.json({ ok: true, enviado: r.enviadas > 0, ...r });
}
