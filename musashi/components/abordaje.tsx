"use client";
import React from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { abordajeDe } from "@/lib/abordaje";

/* Tarjeta en papel con la guía de abordaje del sector.
   `resumen` muestra lo esencial (ficha del cliente); completa, todo (mapa de flujos). */
const mono: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.acero };
const linea: React.CSSProperties = { fontSize: 13, lineHeight: 1.45, padding: "7px 0", borderBottom: "1px solid #D6D2C9", textWrap: "pretty" };

export function AbordajeCard({ sector, cliente, resumen = false, onClose }: { sector: string; cliente?: string; resumen?: boolean; onClose?: () => void }) {
  const a = abordajeDe(sector);
  const href = `/documentos/abordaje?s=${encodeURIComponent(sector)}${cliente ? `&c=${encodeURIComponent(cliente)}` : ""}`;
  const Lista = ({ t, items, n }: { t: string; items: string[]; n?: boolean }) => (
    <div>
      <div style={{ ...mono, marginBottom: 2 }}>{t}</div>
      {items.map((x, i) => <div key={x} style={{ ...linea, display: "grid", gridTemplateColumns: n ? "22px 1fr" : "1fr", gap: 6 }}>{n && <span style={{ fontFamily: MONO, fontSize: 11, color: C.acero }}>{String(i + 1).padStart(2, "0")}</span>}<span>{x}</span></div>)}
    </div>
  );
  return (
    <div style={{ background: "rgba(238,235,228,0.94)", color: C.tinta, borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <span style={{ display: "flex", alignItems: "center", gap: 8, ...mono }}><span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)" }} />CÓMO ABORDARLO · {sector.toUpperCase()}</span>
          <div style={{ fontSize: 14, lineHeight: 1.45, marginTop: 8, textWrap: "pretty" }}>{a.perfil}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <Link href={href} target="_blank" style={{ height: 34, padding: "0 14px", borderRadius: 999, background: C.tinta, color: C.papel, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>Guía para imprimir ↗</Link>
          {onClose && <button type="button" onClick={onClose} style={{ height: 34, padding: "0 14px", borderRadius: 999, border: `1px solid ${C.tinta}`, background: "transparent", color: C.tinta, fontSize: 12, cursor: "pointer" }}>Ocultar</button>}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: resumen ? "1fr" : "1fr 1fr", gap: 12 }}>
        <div style={{ background: "#FBF9F4", border: "1px solid #D6D2C9", borderRadius: 14, padding: "10px 14px" }}><div style={mono}>LO QUE PIDE</div><div style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.45 }}>{a.pide}</div></div>
        <div style={{ background: "#FBF9F4", border: "1px solid #D6D2C9", borderRadius: 14, padding: "10px 14px" }}><div style={mono}>LO QUE HAY QUE ENTENDER ANTES</div><div style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.45 }}>{a.entender}</div></div>
      </div>
      {resumen ? (
        <>
          <Lista t="PREGUNTAS DEL PRIMER ACERCAMIENTO" items={a.preguntas.slice(0, 5)} n />
          <div style={{ fontSize: 12.5, color: C.acero }}>{a.preguntas.length > 5 ? `Faltan ${a.preguntas.length - 5} preguntas, ` : ""}qué observar, qué pedirle{a.opciones ? ", la escalera de solución" : ""} y las señales de alerta están en la guía para imprimir.</div>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
            <Lista t="PREGUNTAS DEL PRIMER ACERCAMIENTO" items={a.preguntas} n />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Lista t="QUÉ OBSERVAR EN LA VISITA" items={a.observar} />
              <Lista t="QUÉ PEDIRLE" items={a.pedir} />
            </div>
          </div>
          {a.opciones && (
            <div>
              <div style={{ ...mono, marginBottom: 6 }}>ESCALERA DE SOLUCIÓN · SE SUBE UN ESCALÓN A LA VEZ</div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${a.opciones.length},minmax(0,1fr))`, gap: 10 }}>
                {a.opciones.map((o, i) => (
                  <div key={o.nombre} style={{ background: "#FBF9F4", border: `1px solid ${i === 0 ? C.tinta : "#D6D2C9"}`, borderRadius: 14, padding: "12px 14px" }}>
                    <div style={mono}>ESCALÓN {i + 1}</div>
                    <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: "-0.01em", lineHeight: 1.15, marginTop: 4 }}>{o.nombre}</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.45, marginTop: 8 }}><strong>Conviene cuando:</strong> {o.cuando}</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.45, marginTop: 6, color: "#3A4048" }}><strong>Implica:</strong> {o.implica}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <Lista t="QUICK WINS · SIN SOFTWARE NUEVO" items={a.quick} />
            <Lista t="SEÑALES DE ALERTA" items={a.alertas} />
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5, borderTop: `1px solid ${C.tinta}`, paddingTop: 10 }}><strong>Cómo cerrar:</strong> {a.cierre}</div>
        </>
      )}
    </div>
  );
}
