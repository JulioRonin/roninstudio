import { NextResponse } from "next/server";
import { notificar } from "@/lib/push";

export const dynamic = "force-dynamic";

/** Manda una notificación de prueba a todos tus dispositivos. Sólo con sesión. */
export async function POST() {
  const r = await notificar("prueba", { titulo: "Musashi · prueba", cuerpo: "Las notificaciones funcionan en este dispositivo.", url: "/configuracion?sec=notificaciones", tag: "prueba" });
  return NextResponse.json(r, { status: r.enviadas ? 200 : 409 });
}
