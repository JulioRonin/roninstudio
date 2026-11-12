"use client";
import React, { useCallback, useEffect, useState } from "react";
import { C, MONO } from "@/lib/tokens";
import { PB, SB } from "@/components/ui";
import { useUI } from "@/components/shell";
import { useAjuste } from "@/lib/ajustes";
import { AVISOS_BASE, AVISOS_TEXTO, type Avisos } from "@/lib/push-base";
import { fechaCorta } from "@/lib/datos";

/* Configuración → Notificaciones y app: instalar Musashi en el teléfono y recibir avisos push. */
type Info = { listo: boolean; publica: string | null; tabla: boolean; cron: boolean; dispositivos: { id: string; dispositivo: string | null; creado_en: string; ultimo_envio: string | null; endpoint: string }[] };
const b64url = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const deB64url = (s: string) => { const p = "=".repeat((4 - (s.length % 4)) % 4); const r = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(r, (c) => c.charCodeAt(0)); };
const nombreDispositivo = () => { const u = navigator.userAgent; const so = /iPhone/.test(u) ? "iPhone" : /iPad/.test(u) ? "iPad" : /Android/.test(u) ? "Android" : /Mac/.test(u) ? "Mac" : /Windows/.test(u) ? "Windows" : "Navegador"; const nav = /Edg\//.test(u) ? "Edge" : /CriOS|Chrome/.test(u) ? "Chrome" : /Firefox/.test(u) ? "Firefox" : /Safari/.test(u) ? "Safari" : ""; return `${so}${nav ? " · " + nav : ""}`; };
const caja: React.CSSProperties = { border: `1px solid ${C.borde}`, borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 10 };
const h = (t: string) => <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>{t}</div>;

export function Notificaciones() {
  const { flash } = useUI();
  const [info, setInfo] = useState<Info | null>(null);
  const [aqui, setAqui] = useState<PushSubscription | null>(null);
  const [soporte, setSoporte] = useState<"si" | "no" | "ios-instalar">("si");
  const [instalada, setInstalada] = useState(false);
  const [permiso, setPermiso] = useState<NotificationPermission | "n/a">("default");
  const [ocupado, setOcupado] = useState(false);
  const [llaves, setLlaves] = useState<[string, string][] | null>(null);
  const [avisos, setAvisos] = useAjuste<Avisos>("notificaciones", AVISOS_BASE);

  const cargar = useCallback(async () => {
    try { setInfo(await (await fetch("/api/push/clave", { cache: "no-store" })).json()); } catch { flash("No se pudo consultar el estado de las notificaciones"); }
    try { const reg = await navigator.serviceWorker?.getRegistration(); setAqui((await reg?.pushManager?.getSubscription()) ?? null); } catch {}
  }, [flash]);
  useEffect(() => {
    const ios = /iPhone|iPad/.test(navigator.userAgent), standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalada(standalone);
    const ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSoporte(ok ? "si" : ios && !standalone ? "ios-instalar" : "no");
    setPermiso("Notification" in window ? Notification.permission : "n/a");
    void cargar();
  }, [cargar]);

  const activar = async () => {
    if (!info?.publica) return;
    setOcupado(true);
    try {
      const p = await Notification.requestPermission(); setPermiso(p);
      if (p !== "granted") { flash(p === "denied" ? "El navegador bloqueó las notificaciones: actívalas en los ajustes del sitio y vuelve a intentar" : "No se dio permiso"); return; }
      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register("/sw.js"));
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: deB64url(info.publica) }));
      const r = await fetch("/api/push/suscribir", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON(), dispositivo: nombreDispositivo() }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? `error ${r.status}`);
      setAqui(sub); flash("Notificaciones activadas en este dispositivo"); await cargar();
    } catch (e) { flash("No se pudieron activar: " + (e as Error).message); } finally { setOcupado(false); }
  };
  const desactivar = async () => {
    if (!aqui) return;
    try { await fetch(`/api/push/suscribir?endpoint=${encodeURIComponent(aqui.endpoint)}`, { method: "DELETE" }); await aqui.unsubscribe(); setAqui(null); flash("Notificaciones desactivadas en este dispositivo"); await cargar(); } catch (e) { flash("No se pudo: " + (e as Error).message); }
  };
  const quitar = async (id: string) => { try { await fetch(`/api/push/suscribir?id=${encodeURIComponent(id)}`, { method: "DELETE" }); await cargar(); flash("Dispositivo quitado"); } catch {} };
  const prueba = async () => { const r = await fetch("/api/push/prueba", { method: "POST" }); const d = await r.json().catch(() => ({})); flash(d.enviadas ? `Prueba enviada a ${d.enviadas} ${d.enviadas === 1 ? "dispositivo" : "dispositivos"}` : `No se envió: ${d.motivo ?? "revisa la configuración"}`); await cargar(); };
  const generar = async () => {
    const k = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    const pub = b64url(new Uint8Array(await crypto.subtle.exportKey("raw", k.publicKey))), jwk = await crypto.subtle.exportKey("jwk", k.privateKey);
    setLlaves([["VAPID_PUBLIC_KEY", pub], ["VAPID_PRIVATE_KEY", jwk.d ?? ""], ["CRON_SECRET", b64url(crypto.getRandomValues(new Uint8Array(24)))]]);
  };
  const copiar = (v: string, n: string) => void navigator.clipboard.writeText(v).then(() => flash(`${n} copiada`)).catch(() => flash("Selecciona el texto y cópialo"));
  const instalar = async () => { const ev = (window as Window & { __instalar?: { prompt: () => Promise<void> } }).__instalar; if (ev) { await ev.prompt(); } else flash("Usa el menú del navegador: Instalar app / Agregar a la pantalla de inicio"); };

  if (!info) return <div style={{ fontFamily: MONO, fontSize: 11, color: C.tenue }}>CONSULTANDO…</div>;
  const ios = typeof navigator !== "undefined" && /iPhone|iPad/.test(navigator.userAgent);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={caja}>
        {h("MUSASHI EN TU TELÉFONO")}
        {instalada ? <div style={{ fontSize: 13.5 }}>Estás usando Musashi como app instalada.</div> : (
          <>
            <div style={{ fontSize: 13.5, color: C.niebla, lineHeight: 1.5 }}>{ios ? <>En iPhone: abre Musashi en <strong style={{ color: C.papel }}>Safari</strong>, toca <strong style={{ color: C.papel }}>Compartir</strong> (el cuadro con la flecha) y luego <strong style={{ color: C.papel }}>Agregar a inicio</strong>. Ábrelo desde el ícono: así funciona como app y puede recibir notificaciones.</> : <>En Android o en la computadora con Chrome o Edge: toca el botón o, en el menú del navegador, <strong style={{ color: C.papel }}>Instalar app</strong>. Queda un ícono de Musashi como cualquier app.</>}</div>
            {!ios && <div><SB small onClick={() => void instalar()}>Instalar Musashi</SB></div>}
          </>
        )}
      </div>

      <div style={caja}>
        {h("NOTIFICACIONES PUSH")}
        {!info.listo ? (
          <div style={{ fontSize: 13.5, color: C.niebla, lineHeight: 1.55 }}>
            <strong style={{ color: C.papel }}>Falta configurar las llaves en Vercel.</strong> Es una sola vez:
            <ol style={{ margin: "8px 0 0", paddingLeft: 20 }}>
              <li>Genera las llaves con el botón. Se crean en tu navegador y no se guardan en ningún lado; no las pegues en chats.</li>
              <li>En Vercel → proyecto <strong style={{ color: C.papel }}>musashi</strong> → Settings → Environment Variables, da de alta las tres en Production.</li>
              <li>Vuelve a publicar (Deployments → Redeploy) y regresa aquí.</li>
            </ol>
            <div style={{ marginTop: 10 }}><SB small onClick={() => void generar()}>Generar llaves</SB></div>
            {llaves && <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>{llaves.map(([n, v]) => (
              <div key={n} style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr) auto", gap: 8, alignItems: "center" }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.papel }}>{n}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n === "VAPID_PUBLIC_KEY" ? v : "•".repeat(24)}</span>
                <button type="button" onClick={() => copiar(v, n)} style={{ height: 30, padding: "0 12px", borderRadius: 999, border: `1px solid ${C.borde2}`, background: "transparent", color: C.papel, fontSize: 12, cursor: "pointer" }}>Copiar</button>
              </div>))}
              <div style={{ fontSize: 12, color: C.tenue }}>Si recargas esta página se generan otras; usa las tres del mismo grupo.</div>
            </div>}
          </div>
        ) : !info.tabla ? (
          <div style={{ fontSize: 13.5, color: C.niebla }}><strong style={{ color: C.papel }}>Falta un paso en Supabase:</strong> corre una vez <span style={{ fontFamily: MONO, fontSize: 12, color: C.papel }}>musashi/supabase/migrations/0005_notificaciones.sql</span> en el SQL Editor.</div>
        ) : soporte === "ios-instalar" ? (
          <div style={{ fontSize: 13.5, color: C.niebla, lineHeight: 1.5 }}>En iPhone las notificaciones sólo funcionan con Musashi instalado (iOS 16.4 o más reciente). Agrégalo a inicio con los pasos de arriba, ábrelo desde el ícono y regresa a esta pantalla.</div>
        ) : soporte === "no" ? (
          <div style={{ fontSize: 13.5, color: C.niebla }}>Este navegador no permite notificaciones push. Usa Chrome, Edge, Firefox o Safari reciente.</div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: aqui ? C.olivo : permiso === "denied" ? C.oxido : C.acero }} />{aqui ? "Activadas en este dispositivo" : permiso === "denied" ? "Bloqueadas por el navegador en este dispositivo" : "Apagadas en este dispositivo"}</span>
              <span style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {aqui ? <SB small onClick={() => void desactivar()}>Desactivar aquí</SB> : <PB small disabled={ocupado} onClick={() => void activar()}>{ocupado ? "Activando…" : "Activar en este dispositivo"}</PB>}
                {info.dispositivos.length > 0 && <SB small onClick={() => void prueba()}>Enviar prueba</SB>}
              </span>
            </div>
            {permiso === "denied" && <div style={{ fontSize: 12.5, color: C.tenue }}>Para desbloquear: candado junto a la dirección (o Ajustes del teléfono → Notificaciones → Musashi) y permite las notificaciones.</div>}
          </>
        )}
      </div>

      {info.listo && info.tabla && (
        <div style={caja}>
          {h("QUÉ TE AVISA")}
          {AVISOS_TEXTO.map(([k, t, d]) => (
            <label key={k} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(238,235,228,0.05)", cursor: "pointer" }}>
              <span><span style={{ fontSize: 13.5 }}>{t}</span><span style={{ display: "block", fontSize: 12, color: C.tenue }}>{d}{k === "resumen" && !info.cron ? " Necesita CRON_SECRET en Vercel." : ""}</span></span>
              <input type="checkbox" checked={avisos[k]} onChange={(e) => setAvisos({ [k]: e.target.checked } as Partial<Avisos>)} style={{ width: 20, height: 20, accentColor: C.oxido }} />
            </label>
          ))}
        </div>
      )}

      {info.dispositivos.length > 0 && (
        <div style={caja}>
          {h(`DISPOSITIVOS · ${info.dispositivos.length}`)}
          {info.dispositivos.map((d) => (
            <div key={d.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", fontSize: 13 }}>
              <span>{d.dispositivo ?? "Dispositivo"}{aqui?.endpoint === d.endpoint ? " · este" : ""}<span style={{ display: "block", fontSize: 12, color: C.tenue }}>Activado {fechaCorta(d.creado_en)}{d.ultimo_envio ? ` · último aviso ${fechaCorta(d.ultimo_envio)}` : ""}</span></span>
              <button type="button" onClick={() => void quitar(d.id)} style={{ height: 30, padding: "0 12px", borderRadius: 999, border: "none", background: "transparent", color: C.tenue, fontSize: 12, cursor: "pointer" }}>Quitar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
