"use client";
import React, { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { C, MONO } from "@/lib/tokens";
import { Glass } from "@/components/ui";
import { datos } from "@/lib/datos";

/* Piezas compartidas por las pantallas con datos reales (Tareas, Proyectos, Facturación, Finanzas, Agentes, Marketing). */

// ¿Hay base de datos? Se pregunta una sola vez por carga de la app.
let consulta: Promise<boolean> | null = null;
export function useModo(): "cargando" | "db" | "demo" {
  const [m, setM] = useState<"cargando" | "db" | "demo">("cargando");
  useEffect(() => {
    consulta ??= datos.lista("configuracion", "select=clave&limit=1").then((r) => r.db).catch(() => true);
    let vivo = true; void consulta.then((db) => { if (vivo) setM(db ? "db" : "demo"); });
    return () => { vivo = false; };
  }, []);
  return m;
}

export const mono10: CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue };
export const inp: CSSProperties = { height: 44, padding: "0 16px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 13, outline: "none", width: "100%", colorScheme: "dark" };
export const chip = (a: boolean): CSSProperties => ({ height: 36, padding: "0 14px", borderRadius: 999, border: `1px solid ${a ? C.papel : "rgba(238,235,228,0.12)"}`, background: a ? C.papel : "rgba(22,26,33,0.55)", color: a ? C.tinta : C.papel, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap", fontWeight: a ? 600 : 400 });
export const btn: CSSProperties = { height: 34, padding: "0 12px", borderRadius: 999, background: "transparent", border: `1px solid ${C.borde2}`, color: C.papel, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" };
export const mxn = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const mxn0 = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export const Cargando = () => <section style={{ padding: "60px 32px", ...mono10, fontSize: 11 }}>CARGANDO…</section>;
export const Vacio = ({ children }: { children: ReactNode }) => <div style={{ padding: "22px 0", fontSize: 13.5, color: C.niebla, lineHeight: 1.5, textWrap: "pretty" }}>{children}</div>;

export function Kpis({ items }: { items: [string, string, string, string?][] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length},minmax(0,1fr))`, gap: 12 }}>
      {items.map(([k, v, s, c], i) => (
        <Glass key={k} pad={18} radius={22} delay={`${i * 0.05}s`}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, ...mono10 }}>{c && <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}` }} />}{k}</div>
          <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em", marginTop: 8 }}>{v}</div>
          <div style={{ fontSize: 12, color: C.niebla, marginTop: 4 }}>{s}</div>
        </Glass>
      ))}
    </div>
  );
}

export function Campo({ t, children, style }: { t: string; children: ReactNode; style?: CSSProperties }) {
  return <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla, ...style }}>{t}{children}</label>;
}

export function Modal({ titulo, kicker, onClose, children, ancho = 560 }: { titulo: string; kicker: string; onClose: () => void; children: ReactNode; ancho?: number }) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(7,9,12,0.65)", zIndex: 40 }} />
      <div role="dialog" aria-label={titulo} style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: ancho, maxWidth: "calc(100vw - 32px)", maxHeight: "calc(100vh - 32px)", overflow: "auto", zIndex: 41, background: "rgba(19,23,29,0.94)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(238,235,228,0.1)", borderRadius: 28, padding: 26, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={mono10}>{kicker}</div>
        <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em" }}>{titulo}</div>
        {children}
      </div>
    </>
  );
}

/* Tabla en vidrio: encabezados mono y filas en rejilla. */
export function Tabla({ cols, heads, children, titulo, extra }: { cols: string; heads: string[]; children: ReactNode; titulo?: ReactNode; extra?: ReactNode }) {
  return (
    <Glass pad="4px 22px 10px" radius={24}>
      {(titulo || extra) && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "16px 0 6px" }}><div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>{titulo}</div>{extra}</div>}
      <div className="m-thead" style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>{heads.map((h) => <div key={h} style={mono10}>{h}</div>)}</div>
      {children}
    </Glass>
  );
}
export const fila = (cols: string): CSSProperties => ({ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "12px 0", alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.06)", fontSize: 13.5 });
