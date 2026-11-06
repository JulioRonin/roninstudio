"use client";
import React, { useState, type CSSProperties } from "react";
import { C, MONO } from "@/lib/tokens";
import { useUI, PageHead } from "@/components/shell";

/* ---------- Datos demo (idénticos al prototipo; sin claves reales) ---------- */
const SECS: [string, string][] = [
  ["Usuarios y roles", "3 USUARIOS"], ["Sectores y guías", "6 SECTORES"], ["Plantillas de documentos", "6 PLANTILLAS"],
  ["Datos fiscales", "EMISOR CFDI"], ["Integraciones", "10 SERVICIOS"], ["Tope de tokens", "POR AGENTE Y TOTAL"],
];
const USERS = ([
  ["JC", "Julio César Ibarra", "DUEÑO", "Todos los módulos", "ACTIVO", C.papel, C.tinta],
  ["OP", "Operación", "EQUIPO", "Proyectos, Tareas, Diagnósticos", "ACTIVO", C.p3, C.papel],
  ["MK", "Contenido", "EQUIPO", "Marketing y contenido", "INVITADO", C.p3, C.papel],
] as string[][]).map(([ini, n, role, mods, st, bg, fc]) => ({ ini, n, role, mods, st, bg, fc }));
const SECTORS = ([["Escuela privada", "V2", 18], ["Restaurante con sucursales", "V3", 22], ["Clínica", "V2", 20], ["Gimnasio", "V1", 14], ["Notaría", "V1", 16], ["Taller", "V2", 19]] as [string, string, number][]).map(([n, g, q]) => ({ n, g, q }));
const TEMPLATES: { n: string; v: string; href?: string }[] = [
  { n: "Contrato de servicios", v: "V1 · PLANTILLA EDITABLE", href: "/documentos/contrato" },
  { n: "Términos y condiciones", v: "V1 · PLANTILLA EDITABLE", href: "/documentos/terminos" },
  { n: "Reporte para el cliente", v: "V3 · REPORTERO", href: "/proyectos/reporte?p=D2" },
  { n: "Acta de constitución", v: "V4 · PLANEADOR" },
  { n: "Cotización", v: "V6 · TEMA PAPEL" },
  { n: "PDF del diagnóstico", v: "V5 · TEMA PAPEL" },
];
/* Datos fiscales: placeholders de ejemplo (RFC genérico del SAT), nada real. */
const FISCAL = ([["RAZÓN SOCIAL", "Ronin Studio (datos de ejemplo)"], ["RFC", "XAXX010101000"], ["RÉGIMEN FISCAL", "612 · Personas Físicas con Actividades Empresariales"], ["CÓDIGO POSTAL", "32000"], ["SERIE DE FACTURAS", "F"], ["MONEDAS", "MXN · USD"]] as string[][]).map(([k, v]) => ({ k, v }));
const INTEGRATIONS: [string, string, string][] = [
  ["SB", "Supabase", "Base de datos y autenticación"], ["FA", "Facturapi", "Emisión de CFDI"], ["ST", "Stripe", "Cobros en dólares"], ["WA", "WhatsApp Business", "Mensajes a clientes"],
  ["MT", "Meta", "Instagram y métricas"], ["YT", "YouTube", "Publicación y métricas"], ["TT", "TikTok", "Publicación y métricas"], ["HF", "Higgsfield", "Imagen y video"],
  ["EL", "ElevenLabs", "Voz en off"], ["HA", "Hermes Agent", "Ejecución de los 13 agentes"],
];
const AG: [string, number][] = [
  ["Perfilador", 200], ["Seguimiento", 250], ["Mapeador", 250], ["Planeador", 200], ["Reportero", 150], ["Cobrador", 150], ["Analista", 150],
  ["Investigador", 250], ["Estratega", 200], ["Guionista", 250], ["Productor", 300], ["Publicador", 100], ["Analista de canal", 150],
];
const USED = 1200;

const LBL: CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em" };
const GLASS: CSSProperties = { background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: "1px solid rgba(238,235,228,0.09)" };

/* Campo de sólo lectura con borde Óxido al enfocar (equivale a style-focus). */
function FiscalField({ k, v }: { k: string; v: string }) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>{k}</span>
      <input value={v} readOnly onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ height: 44, borderRadius: 12, background: C.p2, border: `1px solid ${focus ? C.oxido : C.borde}`, color: C.papel, padding: "0 14px", fontSize: 14, outline: "none" }} />
    </label>
  );
}

export default function Configuracion() {
  const { flash } = useUI();
  const [sec, setSec] = useState("Integraciones");
  const [fixed, setFixed] = useState(false);
  const [cap, setCap] = useState(3000);

  const note = SECS.find((x) => x[0] === sec)?.[1] ?? "";
  const capPct = (USED / cap) * 100;
  const circ: CSSProperties = { width: 40, height: 40, borderRadius: "50%", background: "transparent", border: `1px solid ${C.borde2}`, color: C.papel, fontSize: 18, cursor: "pointer" };

  return (
    <>
      <PageHead stage={3} eyebrow="10 · CONFIGURACIÓN" title="CONFIGURACIÓN" style={{ paddingTop: 34, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }} />

      <section style={{ display: "grid", gridTemplateColumns: "240px minmax(0,1fr)", gap: 20, padding: "26px 32px 56px" }}>
        {/* Menú lateral */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, alignSelf: "start", ...GLASS, borderRadius: 24, padding: 10 }}>
          {SECS.map(([l]) => {
            const a = l === sec;
            const dot = l === "Integraciones" && !fixed ? C.oxido : "transparent";
            return (
              <button key={l} type="button" onClick={() => setSec(l)}
                style={{ height: 44, borderRadius: 14, border: "none", background: a ? C.papel : "transparent", color: a ? C.tinta : C.papel, fontSize: 13, cursor: "pointer", textAlign: "left", padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {l}<span style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />
              </button>
            );
          })}
        </nav>

        {/* Panel de sección */}
        <div style={{ ...GLASS, boxShadow: "inset 0 1px 0 rgba(238,235,228,0.08)", borderRadius: 28, padding: 26, animation: "rise .5s ease both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", textTransform: "uppercase" }}>{sec}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>{note}</span>
          </div>

          {sec === "Usuarios y roles" && USERS.map((u) => (
            <div key={u.ini} style={{ display: "grid", gridTemplateColumns: "44px 1fr 1.6fr 120px", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(238,235,228,0.06)" }}>
              <span style={{ width: 40, height: 40, borderRadius: "50%", background: u.bg, color: u.fc, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12 }}>{u.ini}</span>
              <div><div style={{ fontSize: 14 }}>{u.n}</div><div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.tenue, marginTop: 3 }}>{u.role}</div></div>
              <span style={{ fontSize: 13, color: C.niebla }}>{u.mods}</span>
              <span style={{ ...LBL, textAlign: "right" }}>{u.st}</span>
            </div>
          ))}

          {sec === "Sectores y guías" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
              {SECTORS.map((x) => (
                <div key={x.n} style={{ background: "rgba(12,15,20,0.45)", border: "1px solid rgba(238,235,228,0.08)", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontWeight: 900, fontSize: 16, textTransform: "uppercase" }}>{x.n}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.niebla }}>GUÍA {x.g} · {x.q} PREGUNTAS DE VISITA</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.tenue }}>12 PREGUNTAS DEL EXPRÉS</span>
                </div>
              ))}
            </div>
          )}

          {sec === "Plantillas de documentos" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14 }}>
              {TEMPLATES.map((t) => (
                <a key={t.n} href={t.href ?? "#"} target={t.href ? "_blank" : undefined} rel="noreferrer" onClick={(e) => { if (!t.href) { e.preventDefault(); flash("Plantilla pendiente de redactar"); } }} style={{ display: "flex", flexDirection: "column", gap: 10, cursor: "pointer" }}>
                  <div style={{ aspectRatio: "8.5/11", background: C.papel, borderRadius: 6, padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.16em", color: C.acero }}>RONIN STUDIO</span>
                    <span style={{ fontWeight: 900, fontSize: 15, color: C.tinta, lineHeight: 1, textTransform: "uppercase" }}>{t.n}</span>
                    <span style={{ height: 3, width: "30%", background: C.oxido, marginTop: 4 }} />
                    <span style={{ flex: 1 }} />
                    <span style={{ height: 6, background: "#D6D2C9", borderRadius: 2 }} />
                    <span style={{ height: 6, width: "70%", background: "#D6D2C9", borderRadius: 2 }} />
                  </div>
                  <span style={{ ...LBL, color: C.niebla }}>{t.v}</span>
                </a>
              ))}
            </div>
          )}

          {sec === "Datos fiscales" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 }}>
              {FISCAL.map((f) => <FiscalField key={f.k} k={f.k} v={f.v} />)}
            </div>
          )}

          {sec === "Integraciones" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
              {INTEGRATIONS.map(([ab, n, use]) => {
                const err = ab === "MT" && !fixed;
                const c = err ? C.oxido : C.olivo;
                return (
                  <div key={ab} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 18, background: "rgba(12,15,20,0.45)", border: `1px solid ${err ? C.oxido : "rgba(238,235,228,0.08)"}`, boxShadow: err ? "0 0 24px rgba(176,81,57,0.3)" : "none" }}>
                    <span style={{ width: 40, height: 40, borderRadius: 12, background: C.p3, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11 }}>{ab}</span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 14 }}>{n}</div><div style={{ fontSize: 12, color: C.tenue, marginTop: 2 }}>{use}</div></div>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, ...LBL }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}`, animation: err ? "blink 1.4s infinite" : "none" }} />{err ? "DESCONECTADO" : "CONECTADO"}
                    </span>
                    {err && <button type="button" onClick={() => { setFixed(true); flash("Meta reconectado"); }} style={{ height: 32, padding: "0 12px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Reconectar</button>}
                  </div>
                );
              })}
            </div>
          )}

          {sec === "Tope de tokens" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "8px 0 20px", borderBottom: "1px solid rgba(238,235,228,0.08)" }}>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>TOPE TOTAL MENSUAL</span>
                <button type="button" onClick={() => setCap((x) => Math.max(1500, x - 500))} style={circ}>−</button>
                <span style={{ fontWeight: 900, fontSize: 32, letterSpacing: "-0.02em" }}>{"$" + cap.toLocaleString("en-US")}</span>
                <button type="button" onClick={() => setCap((x) => x + 500)} style={circ}>+</button>
                <span style={{ flex: 1, height: 6, borderRadius: 3, background: C.p3, overflow: "hidden", display: "block" }}>
                  <span style={{ display: "block", height: "100%", width: `${capPct}%`, background: C.oxido, boxShadow: `0 0 10px ${C.oxido}`, transition: "width .4s" }} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 11 }}>${USED.toLocaleString("en-US")} USADO</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "4px 28px", marginTop: 10 }}>
                {AG.map(([n, v]) => (
                  <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(238,235,228,0.05)", fontSize: 13 }}>
                    <span>{n}</span><span style={{ fontFamily: MONO, color: C.niebla }}>{"$" + v + " / MES"}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
