"use client";
import React, { useState } from "react";
import { C, MONO } from "@/lib/tokens";
import { PB, SB } from "@/components/ui";
import { useUI } from "@/components/shell";

/* Configuración → Tus dispositivos: marcar los navegadores desde los que abres tus propias ligas
   de cotización, para que esas aperturas no cuenten como del cliente. La marca es una cookie en el
   dominio de la liga (www.roninstudio.com.mx), así que se pone abriendo una liga ahí, desde cada navegador. */
const caja: React.CSSProperties = { border: `1px solid ${C.borde}`, borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 10 };
const h = (t: string) => <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>{t}</div>;
const txt: React.CSSProperties = { fontSize: 13.5, color: C.niebla, lineHeight: 1.55 };
const fuerte = (t: string) => <strong style={{ color: C.papel }}>{t}</strong>;

type Pase = { url: string; revisar: string; minutos: number };

export function Dispositivos() {
  const { flash } = useUI();
  const [pase, setPase] = useState<Pase | null>(null);

  const pedir = async (): Promise<Pase | null> => {
    try {
      const r = await fetch("/api/dispositivo/pase", { cache: "no-store" }); const d = await r.json();
      if (!r.ok) { flash(d.error ?? "No se pudo generar la liga"); return null; }
      setPase(d); return d;
    } catch { flash("No se pudo generar la liga"); return null; }
  };
  // La ventana se abre antes de pedir la liga para que el navegador no la bloquee.
  const abrirEn = async (destino: (p: Pase) => string) => {
    const w = window.open("about:blank", "_blank");
    const p = await pedir();
    if (!p) { w?.close(); return; }
    if (w) w.location.href = destino(p); else window.location.href = destino(p);
  };
  const copiar = async () => { const p = await pedir(); if (p) void navigator.clipboard.writeText(p.url).then(() => flash("Liga copiada · vence en 30 minutos")).catch(() => flash("Selecciona la liga y cópiala")); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={caja}>
        {h("PARA QUÉ SIRVE")}
        <div style={txt}>Cuando tú abres la liga de una cotización (por ejemplo, para revisar el mensaje que mandaste), Musashi no sabe que eres tú y la cuenta como apertura del cliente. Si marcas tus navegadores, esas aperturas se guardan como {fuerte("tuyas")}: aparecen en la cotización, pero no suman, no cambian el estado y no te mandan notificación.</div>
        <div style={txt}>Para revisar una cotización sin que cuente, también puedes usar {fuerte("Ver como cliente")} en el detalle de cada cotización.</div>
      </div>

      <div style={caja}>
        {h("MARCAR UN NAVEGADOR")}
        <div style={txt}>Cada navegador guarda su marca por separado: Safari, Chrome y el navegador que se abre {fuerte("dentro de WhatsApp")} son distintos. Marca cada uno desde donde abres ligas.</div>
        <ol style={{ ...txt, margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
          <li>{fuerte("Este navegador:")} toca el botón y se abre una página que lo marca.</li>
          <li>{fuerte("El de WhatsApp:")} mándate la liga en el chat {fuerte("Tú")} (mensaje a ti mismo) y tócala ahí.</li>
          <li>{fuerte("Otro navegador o equipo:")} copia la liga y ábrela ahí.</li>
        </ol>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <PB small onClick={() => void abrirEn((p) => p.url)}>Marcar este navegador</PB>
          <SB small onClick={() => void abrirEn((p) => `https://wa.me/?text=${encodeURIComponent(`Liga para marcar este navegador como mío en Musashi (vence en 30 minutos): ${p.url}`)}`)}>Mandármela por WhatsApp</SB>
          <SB small onClick={() => void copiar()}>Copiar liga</SB>
        </div>
        <div style={{ fontSize: 12.5, color: C.tenue, lineHeight: 1.5 }}>La liga para marcar vence en 30 minutos; la marca dura poco más de un año en cada navegador. Si borras los datos del navegador, se pierde y hay que marcarlo otra vez.</div>
      </div>

      <div style={caja}>
        {h("REVISAR O QUITAR")}
        <div style={txt}>Abre esta página desde el navegador que quieras revisar: te dice si está marcado y te deja quitar la marca.</div>
        <div><SB small onClick={() => void abrirEn((p) => p.revisar)}>Revisar un navegador</SB></div>
        {pase && <div style={{ fontFamily: MONO, fontSize: 11, color: C.tenue, wordBreak: "break-all" }}>{pase.revisar}</div>}
      </div>
    </div>
  );
}
