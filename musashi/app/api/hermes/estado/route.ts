import { NextResponse } from "next/server";
import { ENV, DEMO, AGENTES } from "@/lib/hermes";

export const dynamic = "force-dynamic";

/** Estado del puente: qué variables hay y si Hermes responde. Lo lee Configuración → Hermes Agent. */
export async function GET() {
  const vars = {
    MUSASHI_API_KEY: !!ENV.musashiKey,
    HERMES_WEBHOOK_URL: !!ENV.hermesWebhookUrl,
    HERMES_WEBHOOK_SECRET: !!ENV.hermesWebhookSecret,
    HERMES_API_URL: !!ENV.hermesApiUrl,
    HERMES_API_KEY: !!ENV.hermesApiKey,
  };
  // El host de las URLs públicas no es secreto; ayuda a diagnosticar. Nunca se devuelven llaves.
  const host = (u: string) => { try { const x = new URL(u.trim()); return `${x.protocol}//${x.host}${x.pathname !== "/" ? x.pathname : ""}`; } catch { return "URL inválida"; } };
  const causa = (e: unknown) => { const c = (e as { cause?: { code?: string; message?: string } })?.cause; return c?.code || c?.message || (e instanceof Error ? e.message : "sin respuesta"); };
  const probar = async (base: string, falta: string) => {
    if (!base) return { alcanzable: false, detalle: falta, host: "" };
    try {
      const r = await fetch(base.trim().replace(/\/$/, "") + "/health", { signal: AbortSignal.timeout(6000) });
      return { alcanzable: r.ok, detalle: `${r.status} ${await r.text().then((t) => t.slice(0, 120)).catch(() => "")}`, host: host(base) };
    } catch (e) { return { alcanzable: false, detalle: causa(e), host: host(base) }; }
  };
  const [hermes, webhook] = await Promise.all([probar(ENV.hermesApiUrl, "HERMES_API_URL sin configurar"), probar(ENV.hermesWebhookUrl, "HERMES_WEBHOOK_URL sin configurar")]);
  return NextResponse.json({ demo: DEMO, vars, hermes, webhook, agentes: AGENTES.length, ahora: new Date().toISOString() });
}
