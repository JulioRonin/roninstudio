import { NextResponse } from "next/server";
import { hayDB } from "@/lib/db";
import { clavePublica, pushListo, suscripciones } from "@/lib/push";

export const dynamic = "force-dynamic";

/** Estado de las notificaciones y llave pública para suscribir este dispositivo. Sólo con sesión. */
export async function GET() {
  let dispositivos: { id: string; dispositivo: string | null; creado_en: string; ultimo_envio: string | null; endpoint: string }[] | null = [];
  try { dispositivos = hayDB() ? await suscripciones() : []; } catch { dispositivos = []; }
  return NextResponse.json({ listo: pushListo(), publica: clavePublica() || null, tabla: dispositivos !== null, cron: Boolean(process.env.CRON_SECRET),
    dispositivos: (dispositivos ?? []).map((d) => ({ id: d.id, dispositivo: d.dispositivo, creado_en: d.creado_en, ultimo_envio: d.ultimo_envio, endpoint: d.endpoint })) });
}
