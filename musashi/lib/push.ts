// Notificaciones push a los dispositivos de Julio (Web Push con llaves VAPID). Sólo servidor.
// Nunca truena a quien la llama: si falta configuración o un envío falla, regresa el conteo y sigue.
import webpush from "web-push";
import { ErrorDB, hayDB, sb } from "@/lib/db";

import { AVISOS_BASE, type Avisos, type TipoAviso } from "@/lib/push-base";
export { AVISOS_BASE, type Avisos, type TipoAviso };
export type Aviso = { titulo: string; cuerpo: string; url?: string; tag?: string };
type Sus = { id: string; endpoint: string; p256dh: string; auth: string };

const llaves = () => ({ publica: (process.env.VAPID_PUBLIC_KEY ?? "").trim(), privada: (process.env.VAPID_PRIVATE_KEY ?? "").trim() });
export const clavePublica = () => llaves().publica;
export const pushListo = () => { const k = llaves(); return Boolean(k.publica && k.privada && hayDB()); };

/** Lista las suscripciones; null si falta la tabla (migración 0005 sin correr). */
export async function suscripciones(): Promise<(Sus & { dispositivo: string | null; creado_en: string; ultimo_envio: string | null })[] | null> {
  try { return await sb("push_suscripciones?select=*&order=creado_en.desc"); }
  catch (e) { if (e instanceof ErrorDB && e.status === 404) return null; throw e; }
}

/** Manda un aviso a todos los dispositivos, si ese tipo de aviso está activo. `prueba` ignora las preferencias. */
export async function notificar(tipo: TipoAviso | "prueba", a: Aviso): Promise<{ enviadas: number; fallidas: number; motivo?: string }> {
  if (!pushListo()) return { enviadas: 0, fallidas: 0, motivo: "faltan VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en Vercel" };
  try {
    if (tipo !== "prueba") {
      const cfg = (await sb<{ valor: Partial<Avisos> }[]>("configuracion?select=valor&clave=eq.notificaciones"))[0]?.valor;
      if ({ ...AVISOS_BASE, ...(cfg ?? {}) }[tipo] === false) return { enviadas: 0, fallidas: 0, motivo: "aviso desactivado" };
    }
    const subs = await suscripciones();
    if (!subs?.length) return { enviadas: 0, fallidas: 0, motivo: subs ? "ningún dispositivo activado" : "falta correr 0005_notificaciones.sql" };
    const k = llaves();
    webpush.setVapidDetails((process.env.VAPID_SUBJECT || "mailto:project@roninstudio.com.mx").trim(), k.publica, k.privada);
    const carga = JSON.stringify({ titulo: a.titulo.slice(0, 120), cuerpo: a.cuerpo.slice(0, 300), url: a.url ?? "/", tag: a.tag });
    let enviadas = 0, fallidas = 0;
    await Promise.all(subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, carga, { TTL: 60 * 60 * 24, urgency: "normal" });
        enviadas++; await sb(`push_suscripciones?id=eq.${s.id}`, { method: "PATCH", body: { ultimo_envio: new Date().toISOString() } }).catch(() => {});
      } catch (e) {
        fallidas++;
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await sb(`push_suscripciones?id=eq.${s.id}`, { method: "DELETE" }).catch(() => {}); // el dispositivo ya no existe
        else console.error("[push]", code, (e as Error).message);
      }
    }));
    return { enviadas, fallidas };
  } catch (e) { console.error("[push]", e); return { enviadas: 0, fallidas: 0, motivo: e instanceof Error ? e.message : "error" }; }
}
