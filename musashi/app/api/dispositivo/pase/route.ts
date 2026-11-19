import { NextResponse } from "next/server";
import { ligaBase } from "@/lib/liga";
import { DURACION_PASE_S, firmar } from "@/lib/sesion";

export const dynamic = "force-dynamic";

/** Pase de 30 minutos para marcar un navegador como tuyo. Sólo con sesión (lo exige el middleware).
 *  La liga apunta al dominio público porque ahí vive la cookie que leen las cotizaciones. */
export async function GET() {
  if (!process.env.MUSASHI_SESSION_SECRET) return NextResponse.json({ error: "Falta MUSASHI_SESSION_SECRET." }, { status: 503 });
  const pase = await firmar("pase-propio", DURACION_PASE_S);
  const base = ligaBase();
  return NextResponse.json({ url: `${base}/api/publico/dispositivo?p=${encodeURIComponent(pase)}`, revisar: `${base}/api/publico/dispositivo`, minutos: DURACION_PASE_S / 60 });
}
