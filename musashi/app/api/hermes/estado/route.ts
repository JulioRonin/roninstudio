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
  let hermes: { alcanzable: boolean; detalle: string } = { alcanzable: false, detalle: "HERMES_API_URL sin configurar" };
  if (ENV.hermesApiUrl) {
    try {
      const r = await fetch(ENV.hermesApiUrl.replace(/\/$/, "") + "/health", { signal: AbortSignal.timeout(5000) });
      hermes = { alcanzable: r.ok, detalle: `${r.status} ${await r.text().then((t) => t.slice(0, 120)).catch(() => "")}` };
    } catch (e) { hermes = { alcanzable: false, detalle: e instanceof Error ? e.message : "sin respuesta" }; }
  }
  let webhook: { alcanzable: boolean; detalle: string } = { alcanzable: false, detalle: "HERMES_WEBHOOK_URL sin configurar" };
  if (ENV.hermesWebhookUrl) {
    try {
      const r = await fetch(ENV.hermesWebhookUrl.replace(/\/$/, "") + "/health", { signal: AbortSignal.timeout(5000) });
      webhook = { alcanzable: r.ok, detalle: `${r.status} ${await r.text().then((t) => t.slice(0, 120)).catch(() => "")}` };
    } catch (e) { webhook = { alcanzable: false, detalle: e instanceof Error ? e.message : "sin respuesta" }; }
  }
  return NextResponse.json({ demo: DEMO, vars, hermes, webhook, agentes: AGENTES.length, ahora: new Date().toISOString() });
}
