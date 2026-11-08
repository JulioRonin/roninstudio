// Puente Musashi ⇄ Hermes Agent. Del lado del servidor (route handlers).
import { createHmac, timingSafeEqual } from "crypto";

export const ENV = {
  musashiKey: process.env.MUSASHI_API_KEY ?? "",          // la usan los agentes para leer contexto y dejar propuestas
  hermesWebhookUrl: process.env.HERMES_WEBHOOK_URL ?? "", // p. ej. https://hermes.midominio.com:8644 (plataforma webhooks)
  hermesWebhookSecret: process.env.HERMES_WEBHOOK_SECRET ?? "",
  hermesApiUrl: process.env.HERMES_API_URL ?? "",         // p. ej. http://127.0.0.1:8642 (API server, para /health y /v1/runs)
  hermesApiKey: process.env.HERMES_API_KEY ?? "",
};
export const DEMO = !ENV.musashiKey;

export { AGENTES } from "@/lib/hermes-agentes";
import { AGENTES } from "@/lib/hermes-agentes";

export type Propuesta = { agente: string; tipo: string; titulo: string; cuerpo: string; datos?: Record<string, unknown>; modelo?: string; referencia?: string };

export function validarPropuesta(x: unknown): { ok: true; p: Propuesta } | { ok: false; error: string } {
  if (!x || typeof x !== "object") return { ok: false, error: "cuerpo JSON requerido" };
  const o = x as Record<string, unknown>;
  for (const k of ["agente", "tipo", "titulo", "cuerpo"]) if (typeof o[k] !== "string" || !(o[k] as string).trim()) return { ok: false, error: `falta ${k}` };
  if (!AGENTES.some((a) => a.id === (o.agente as string).toLowerCase())) return { ok: false, error: `agente desconocido: ${o.agente}` };
  if ((o.cuerpo as string).length > 8000) return { ok: false, error: "cuerpo demasiado largo (máx 8000)" };
  return { ok: true, p: { agente: (o.agente as string).toLowerCase(), tipo: (o.tipo as string).toUpperCase(), titulo: o.titulo as string, cuerpo: o.cuerpo as string, datos: (o.datos as Record<string, unknown>) ?? undefined, modelo: o.modelo as string | undefined, referencia: o.referencia as string | undefined } };
}

/** Autorización de los agentes hacia Musashi: Bearer MUSASHI_API_KEY. En modo demo (sin llave configurada) se permite y se marca. */
export function autorizado(req: Request): boolean {
  if (DEMO) return true;
  const h = req.headers.get("authorization") ?? "";
  const tok = h.replace(/^Bearer\s+/i, "");
  if (!tok || tok.length !== ENV.musashiKey.length) return false;
  return timingSafeEqual(Buffer.from(tok), Buffer.from(ENV.musashiKey));
}

/** Firma "Generic V2" de la plataforma de webhooks de Hermes: HMAC-SHA256 de "<timestamp>.<body>". */
export function firmarV2(body: string, secret: string) {
  const ts = Math.floor(Date.now() / 1000).toString();
  const sig = createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
  return { "X-Webhook-Timestamp": ts, "X-Webhook-Signature-V2": sig };
}

/** Manda un evento a la ruta `musashi` de la plataforma de webhooks de Hermes. */
export async function enviarAHermes(evento: Record<string, unknown>) {
  const body = JSON.stringify(evento);
  if (!ENV.hermesWebhookUrl || !ENV.hermesWebhookSecret) return { enviado: false, motivo: "HERMES_WEBHOOK_URL o HERMES_WEBHOOK_SECRET sin configurar", body: evento };
  const url = ENV.hermesWebhookUrl.replace(/\/$/, "") + "/webhooks/musashi";
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...firmarV2(body, ENV.hermesWebhookSecret) }, body, signal: AbortSignal.timeout(10000) });
  const text = await res.text().catch(() => "");
  return { enviado: res.ok, status: res.status, respuesta: text.slice(0, 500) };
}
