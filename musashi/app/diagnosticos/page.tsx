"use client";
import { useModo, Vacio } from "@/components/real";
import { datos, eq, fechaCorta } from "@/lib/datos";
import React, { useEffect, useState } from "react";
import { Flujos } from "@/components/flujos";
import { C, MONO } from "@/lib/tokens";
import { H, PB } from "@/components/ui";
import { useUI, PageHead } from "@/components/shell";

/* ---------- Datos demo (idénticos al prototipo) ---------- */
type Step = { id: string; lane: number; col: number; label: string; meta: string; tool: string; who: string; time: string; stuck?: boolean; why?: string };
const STEPS: Step[] = [
  { id: "s1", lane: 0, col: 0, label: "Toma la orden en libreta", meta: "PAPEL · 2 MIN", tool: "Libreta", who: "Mesero", time: "2 min" },
  { id: "s2", lane: 0, col: 1, label: "Lleva la comanda a cocina", meta: "A PIE · 1 MIN", tool: "Papel", who: "Mesero", time: "1 min" },
  { id: "s3", lane: 1, col: 2, label: "Reescribe la orden en el tablero", meta: "CAPTURA DOBLE · 3 MIN", tool: "Pizarrón", who: "Cocina", time: "3 min", stuck: true, why: "La misma orden se copia por segunda vez; aquí nacen los platillos equivocados." },
  { id: "s4", lane: 1, col: 3, label: "Prepara y avisa en voz alta", meta: "VOZ · 12 MIN", tool: "—", who: "Cocina", time: "12 min" },
  { id: "s5", lane: 2, col: 4, label: "Captura la cuenta en el POS", meta: "CAPTURA TRIPLE · 4 MIN", tool: "POS genérico", who: "Caja", time: "4 min", stuck: true, why: "Tercera captura de la misma orden; diferencias entre lo servido y lo cobrado." },
  { id: "s6", lane: 2, col: 5, label: "Cierre de caja en hoja de cálculo", meta: "MANUAL · 40 MIN", tool: "Hoja de cálculo", who: "Caja", time: "40 min al día", stuck: true, why: "El cierre no cuadra con el inventario y se revisa a mano cada noche." },
];
const LANES = ["MESERO", "COCINA", "CAJA"];

const TABS = ["Bandeja exprés", "Flujos de trabajo", "Diagnóstico completo"] as const;
type Tab = (typeof TABS)[number];
const SUBTABS = ["Guía de visita", "Mapa de flujo", "Hallazgos", "Plan", "PDF"] as const;
type Sub = (typeof SUBTABS)[number];

type Inb = { id: number; name: string; sector: string; date: string; finds: string[]; other: string; hours: number; status: string; dot: string; exists: boolean };
const INB: Inb[] = [
  { id: 1, name: "Negocio demo 11", sector: "RESTAURANTE CON SUCURSALES", date: "04 NOV", finds: ["Captura doble de órdenes", "Inventario en hoja de cálculo", "Cierre de caja manual"], other: "Tres sucursales con sistemas distintos", hours: 30, status: "SIN CONTACTAR", dot: C.oxido, exists: true },
  { id: 2, name: "Negocio demo 14", sector: "CLÍNICA", date: "03 NOV", finds: ["Citas por WhatsApp sin registro", "Expedientes en papel", "Cobranza a fin de mes"], other: "—", hours: 25, status: "CONTACTADO", dot: C.ambar, exists: false },
  { id: 3, name: "Negocio demo 12", sector: "ESCUELA PRIVADA", date: "02 NOV", finds: ["Inscripciones en formularios sueltos", "Colegiaturas sin recordatorio", "Reportes tardíos"], other: "Quieren app para padres", hours: 20, status: "LLAMADA AGENDADA", dot: C.olivo, exists: true },
  { id: 4, name: "Negocio demo 15", sector: "TALLER", date: "31 OCT", finds: ["Cotizaciones en Excel", "Órdenes de trabajo en papel", "Sin control de horas"], other: "—", hours: 35, status: "SIN CONTACTAR", dot: C.oxido, exists: false },
];

const GUIDE = ([
  ["¿Cómo entra una orden hoy?", "Libreta del mesero; se lleva a cocina en papel.", ["3 FOTOS", "AUDIO 2:10"], true],
  ["¿Quién la vuelve a capturar?", "Cocina la copia al pizarrón; caja la captura en el POS.", ["2 FOTOS"], true],
  ["¿Cómo se hace el cierre de caja?", "Hoja de cálculo, 40 minutos cada noche.", ["1 FOTO"], true],
  ["¿Cómo se controla el inventario?", "Conteo semanal; sin relación con las ventas.", [], false],
  ["¿Qué ya intentaron automatizar?", "—", [], false],
] as [string, string, string[], boolean][]).map(([q, note, att, done], i) => ({ n: "0" + (i + 1), q, note, att, border: done ? C.olivo : C.borde2, bg: done ? "rgba(76,129,65,0.18)" : "transparent", c: done ? C.papel : C.tenue }));
const PHOTOS = ["COMANDA · LIBRETA", "PIZARRÓN · COCINA", "CAJA · POS", "CIERRE · HOJA"];
const PALETTE = ([["Paso", "3px", "none"], ["Decisión", "2px", "rotate(45deg)"], ["Espera", "50%", "none"], ["Herramienta", "2px", "none"], ["Carril", "0", "scaleX(1.6)"]] as [string, string, string][]).map(([n, r, tf]) => ({ n, r, tf }));

const FINDINGS = ([
  ["Captura triple de cada orden (mesero, cocina, caja)", "ALTA", C.oxido, "Comanda digital", "40 h"],
  ["Cierre de caja manual que no cuadra", "ALTA", C.oxido, "Cierre automático", "24 h"],
  ["Inventario sin relación con ventas", "MEDIA", C.ambar, "Inventario por receta", "32 h"],
  ["Sin reporte por sucursal", "MEDIA", C.ambar, "Tablero de sucursales", "16 h"],
  ["Pedidos a proveedor por teléfono", "BAJA", C.niebla, "Fuera de alcance", "—"],
] as [string, string, string, string, string][]).map(([t, p, c, m, h], i) => ({ n: "0" + (i + 1), t, p, c, m, h, delay: 0.05 * i + "s" }));

const PLAN = ([
  ["01", "DISEÑAR", "Flujo de comanda y roles", 2, "$30,000.00"],
  ["02", "CONSTRUIR", "Comanda digital y cocina", 3, "$45,000.00"],
  ["03", "CONSTRUIR", "Caja y cierre automático", 3, "$40,000.00"],
  ["04", "EVOLUCIONAR", "Inventario y tablero", 2, "$25,000.00"],
] as [string, string, string, number, string][]).map(([n, stage, t, w, price], i) => ({ n, stage, t, w, price, delay: 0.07 * i + "s", border: i === 0 ? C.oxido : "rgba(238,235,228,0.09)", glow: i === 0 ? "0 0 28px rgba(176,81,57,0.3)" : "none" }));

const L = (arr: [number, string][]) => arr.map(([w, c]) => ({ w, c }));
const PAGES = [
  { n: "01", title: "Negocio demo 2", size: 34, sub: "Diagnóstico completo · 22 de octubre de 2026", lines: L([[30, C.oxido], [80, C.acero], [60, C.acero]]) },
  { n: "02", title: "Mapa del flujo actual", size: 24, sub: "3 responsables · 6 pasos · 3 puntos donde se atora", lines: L([[90, C.acero], [45, C.oxido], [70, C.acero], [55, C.acero]]) },
  { n: "03", title: "Hallazgos y plan", size: 24, sub: "4 hitos · 10 semanas · $140,000.00 MXN", lines: L([[85, C.tinta], [70, C.acero], [50, C.acero], [30, C.olivo]]) },
].map((p, i) => ({ ...p, delay: 0.1 * i + "s" }));

/* ---------- Helpers locales ---------- */
const MONO10: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue };
const GLASS: React.CSSProperties = { background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: "1px solid rgba(238,235,228,0.09)" };

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <H as="button" type="button" onClick={onClick}
      style={{ height: 44, padding: "0 18px", borderRadius: 999, border: `1px solid ${active ? C.papel : "rgba(238,235,228,0.09)"}`, background: active ? C.papel : "rgba(22,26,33,0.55)", color: active ? C.tinta : C.papel, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}
      hover={{ borderColor: C.acero }}>
      {label}
    </H>
  );
}

export default function Diagnosticos() {
  const { flash } = useUI();
  const [tab, setTab] = useState<Tab>("Flujos de trabajo");
  useEffect(() => { try { const t = new URLSearchParams(window.location.search).get("tab"); if (t === "flujos") setTab("Flujos de trabajo"); else if (t === "expres") setTab("Bandeja exprés"); else if (t === "completo") setTab("Diagnóstico completo"); } catch {} }, []);
  const [sub, setSub] = useState<Sub>("Mapa de flujo");
  const [sel, setSel] = useState("s3");
  const [created, setCreated] = useState<number[]>([]);

  const db = useModo() === "db";
  type Expres = { id: string; nombre: string; negocio: string; sector: string | null; whatsapp: string | null; correo: string | null; hallazgos: unknown; contactado: boolean; creado_en: string };
  const [expres, setExpres] = useState<Expres[]>([]);
  useEffect(() => { if (db) void datos.lista<Expres>("diagnosticos_expres", "select=*&order=creado_en.desc").then((r) => setExpres(r.filas)).catch(() => {}); }, [db]);
  const contactar = (x: Expres) => { setExpres((l) => l.map((y) => (y.id === x.id ? { ...y, contactado: true } : y))); void datos.cambia("diagnosticos_expres", eq("id", x.id), { contactado: true }).then(() => flash("Marcado como contactado")).catch(() => flash("No se guardó")); };
  useEffect(() => { if (db && tab === "Diagnóstico completo") setTab("Flujos de trabajo"); }, [db, tab]);
  const isFull = tab === "Diagnóstico completo";
  const subtitle = db ? (tab === "Flujos de trabajo" ? "Un mapa por cliente · de aquí salen el reporte, el filtro y la cotización" : `${expres.length} diagnósticos exprés recibidos · ${expres.filter((x) => !x.contactado).length} sin contactar`) : isFull ? "Negocio demo 2 · visita del 22 de octubre · en redacción" : tab === "Flujos de trabajo" ? "Negocio demo 2 · 7 procesos mapeados · de aquí salen el reporte, el filtro y la cotización" : "4 diagnósticos exprés esta semana · 2 sin contactar";
  const toQuote = () => flash("Cotización creada en Facturación · borrador");
  const openFull = () => { setTab("Diagnóstico completo"); setSub("Mapa de flujo"); };

  const ss = STEPS.find((x) => x.id === sel) ?? STEPS[0];
  const selFields = [["RESPONSABLE", ss.who], ["HERRAMIENTA", ss.tool], ["TIEMPO", ss.time], ["ORIGEN", "Mapeador · revisado por JC"]];

  return (
    <>
      <style>{`@keyframes flow{from{background-position:0 0}to{background-position:40px 0}}`}</style>

      <PageHead stage={0} eyebrow="04 · DIAGNÓSTICOS · ETAPA 01 MAPEAR" title="DIAGNÓSTICOS" sub={subtitle} style={{ padding: "34px 32px 0", animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}
        right={isFull ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", padding: "10px 14px", borderRadius: 999, border: `1px solid ${C.ambar}` }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.ambar, boxShadow: `0 0 8px ${C.ambar}` }} />EN REDACCIÓN
            </span>
            <PB style={{ height: 48, padding: "0 22px", fontSize: 14, boxShadow: "0 0 28px rgba(176,81,57,.45)" }} onClick={toQuote}>Generar cotización</PB>
          </div>
        ) : undefined} />

      <nav style={{ display: "flex", gap: 6, padding: "22px 32px 0", alignItems: "center" }}>
        {TABS.filter((t) => !db || t !== "Diagnóstico completo").map((t) => <Pill key={t} label={t} active={tab === t} onClick={() => setTab(t)} />)}
        {isFull && (
          <>
            <span style={{ width: 1, height: 24, background: C.borde2, margin: "0 8px" }} />
            {SUBTABS.map((t) => (
              <button key={t} type="button" onClick={() => setSub(t)} style={{ height: 40, padding: "0 14px", background: "none", border: "none", borderBottom: `2px solid ${sub === t ? C.oxido : "transparent"}`, color: sub === t ? C.papel : C.tenue, fontSize: 13, cursor: "pointer" }}>{t}</button>
            ))}
          </>
        )}
      </nav>

      {tab === "Flujos de trabajo" && <Flujos />}

      <section style={{ padding: "22px 32px 56px" }}>
        {/* ---------- BANDEJA EXPRÉS ---------- */}
        {tab === "Bandeja exprés" && db && (
          <div style={{ ...GLASS, borderRadius: 24, padding: "8px 22px 12px" }}>
            {expres.length === 0 && <Vacio>Todavía no llega ningún diagnóstico exprés. Cuando el formulario del sitio público se conecte a Musashi, cada respuesta caerá aquí con sus hallazgos y un botón para darla de alta como cliente. Mientras tanto, da de alta al cliente en Clientes y mapea sus flujos en la pestaña de al lado.</Vacio>}
            {expres.map((x) => (
              <div key={x.id} style={{ display: "grid", gridTemplateColumns: "90px 1.4fr 1fr 1fr auto", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(238,235,228,0.06)", fontSize: 13.5 }}>
                <span style={{ ...MONO10 }}>{fechaCorta(x.creado_en).toUpperCase()}</span>
                <div><div>{x.negocio}</div><div style={{ ...MONO10, marginTop: 2 }}>{(x.sector ?? "").toUpperCase()}</div></div>
                <span style={{ color: C.niebla }}>{x.nombre}</span>
                <span style={{ color: C.niebla }}>{x.whatsapp ?? x.correo ?? "—"}</span>
                {x.contactado ? <span style={{ ...MONO10, color: C.olivo }}>CONTACTADO</span> : <button type="button" onClick={() => contactar(x)} style={{ height: 34, padding: "0 12px", borderRadius: 999, background: "transparent", border: `1px solid ${C.borde2}`, color: C.papel, fontSize: 12, cursor: "pointer" }}>Marcar contactado</button>}
              </div>
            ))}
          </div>
        )}
        {tab === "Bandeja exprés" && !db && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16 }}>
            {INB.map((d, i) => {
              const hot = d.dot === C.oxido;
              const canCreate = !d.exists && !created.includes(d.id);
              return (
                <div key={d.id} style={{ ...GLASS, border: `1px solid ${hot ? C.oxido : "rgba(238,235,228,0.09)"}`, boxShadow: hot ? "0 0 28px rgba(176,81,57,0.28)" : "none", borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 12, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both", animationDelay: 0.06 * i + "s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div style={MONO10}>{d.sector} · {d.date}</div>
                      <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.01em", marginTop: 4 }}>{d.name}</div>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", whiteSpace: "nowrap" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: d.dot, boxShadow: `0 0 8px ${d.dot}` }} />{d.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {d.finds.map((t, j) => (
                      <div key={t} style={{ display: "flex", gap: 10, fontSize: 13 }}><span style={{ fontFamily: MONO, color: C.tenue }}>{"0" + (j + 1)}</span><span>{t}</span></div>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: C.niebla, borderTop: "1px solid rgba(238,235,228,0.06)", paddingTop: 10 }}>Otro: {d.other}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: C.papel }}>{d.hours} H / MES ESTIMADAS</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {canCreate && (
                        <button type="button" onClick={() => { setCreated((x) => [...x, d.id]); flash("Cliente creado · " + d.name); }} style={{ height: 36, padding: "0 14px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.borde2}`, fontSize: 12, cursor: "pointer" }}>Crear cliente</button>
                      )}
                      <button type="button" onClick={openFull} style={{ height: 36, padding: "0 14px", borderRadius: 999, background: C.papel, color: C.tinta, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Abrir</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ---------- DIAGNÓSTICO COMPLETO ---------- */}
        {isFull && (
          <>
            <div style={{ display: "flex", gap: 18, ...MONO10, marginBottom: 16 }}>
              <span style={{ color: C.papel }}>NEGOCIO DEMO 2 · RESTAURANTE CON SUCURSALES</span><span>VISITA 22 OCT</span><span>GUÍA · RESTAURANTES V3</span>
            </div>

            {/* Guía de visita */}
            {sub === "Guía de visita" && (
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: 16 }}>
                <div style={{ ...GLASS, borderRadius: 28, padding: 24 }}>
                  {GUIDE.map((g) => (
                    <div key={g.n} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(238,235,228,0.06)" }}>
                      <span style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${g.border}`, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 10, color: g.c }}>{g.n}</span>
                      <div>
                        <div style={{ fontSize: 15 }}>{g.q}</div>
                        <div style={{ fontSize: 13, color: C.niebla, marginTop: 6, lineHeight: 1.5 }}>{g.note}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          {g.att.map((a) => <span key={a} style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", padding: "4px 8px", borderRadius: 999, border: `1px solid ${C.borde2}`, color: C.niebla }}>{a}</span>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignContent: "start" }}>
                  {PHOTOS.map((p) => (
                    <div key={p} style={{ aspectRatio: "1", borderRadius: 18, background: "linear-gradient(140deg,#2A2F36,#101318)", filter: "grayscale(1) contrast(1.2)", border: "1px solid rgba(238,235,228,0.08)", display: "flex", alignItems: "flex-end", padding: 10, fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", color: C.niebla }}>{p}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Mapa de flujo */}
            {sub === "Mapa de flujo" && (
              <div style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr) 280px", gap: 12, height: 600 }}>
                <div style={{ ...GLASS, borderRadius: 24, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ ...MONO10, marginBottom: 4 }}>PALETA</div>
                  {PALETTE.map((p) => (
                    <H key={p.n} style={{ height: 42, borderRadius: 12, border: `1px solid ${C.borde2}`, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", fontSize: 13, cursor: "grab", background: "rgba(12,15,20,0.4)" }} hover={{ borderColor: C.niebla }}>
                      <span style={{ width: 12, height: 12, border: `1.5px solid ${C.papel}`, borderRadius: p.r, transform: p.tf, flexShrink: 0 }} />{p.n}
                    </H>
                  ))}
                </div>
                <div style={{ position: "relative", borderRadius: 24, border: "1px solid rgba(238,235,228,0.09)", backgroundColor: "rgba(16,19,24,0.7)", backgroundImage: "radial-gradient(rgba(238,235,228,0.08) 1px,transparent 1px)", backgroundSize: "20px 20px", overflow: "hidden", padding: "46px 18px 18px" }}>
                  <span style={{ position: "absolute", top: 14, left: 14, display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", padding: "6px 10px", borderRadius: 999, border: `1px dashed ${C.niebla}`, color: C.papel }}>BORRADOR DE IA · MAPEADOR · CAPA EDITABLE</span>
                  <span style={{ position: "absolute", top: 14, right: 14, ...MONO10 }}>3 PUNTOS DONDE SE ATORA</span>
                  {LANES.map((name, li) => {
                    const laneCols = STEPS.filter((x) => x.lane === li).map((x) => x.col);
                    const mn = Math.min(...laneCols), mx = Math.max(...laneCols);
                    return (
                      <div key={name} style={{ display: "grid", gridTemplateColumns: "96px repeat(6,minmax(0,1fr))", gap: 10, alignItems: "center", height: 168, borderTop: "1px solid rgba(238,235,228,0.07)", position: "relative" }}>
                        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.niebla }}>{name}</span>
                        {Array.from({ length: 6 }, (_, ci) => {
                          const st = STEPS.find((x) => x.lane === li && x.col === ci);
                          const line = ci > mn && ci <= mx;
                          const isSel = !!st && sel === st.id;
                          return (
                            <div key={ci} style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
                              {line && <span style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 2, backgroundImage: `linear-gradient(90deg,${C.acero} 50%,transparent 50%)`, backgroundSize: "10px 2px", animation: "flow 1.2s linear infinite" }} />}
                              {st && (
                                <button type="button" onClick={() => setSel(st.id)}
                                  style={{ position: "relative", width: "100%", minHeight: 76, borderRadius: 14, background: st.stuck ? "rgba(176,81,57,0.22)" : "rgba(22,26,33,0.85)", border: `1px solid ${isSel ? C.papel : st.stuck ? C.oxido : C.borde2}`, boxShadow: isSel ? "0 0 0 3px rgba(238,235,228,0.15)" : "none", color: C.papel, padding: 10, textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6, animation: st.stuck ? "pulseOx 2.4s infinite" : "none" }}>
                                  <span style={{ fontSize: 12, lineHeight: 1.3 }}>{st.label}</span>
                                  <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: st.stuck ? C.papel : C.tenue }}>{st.meta}</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                <div style={{ ...GLASS, borderRadius: 24, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={MONO10}>PROPIEDADES</div>
                  <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.01em", textTransform: "uppercase" }}>{ss.label}</div>
                  {selFields.map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", color: C.tenue, marginBottom: 4 }}>{k}</div>
                      <div style={{ height: 38, borderRadius: 10, background: C.p2, border: `1px solid ${C.borde}`, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 13 }}>{v}</div>
                    </div>
                  ))}
                  {ss.stuck && <div style={{ border: `1px solid ${C.oxido}`, borderRadius: 14, padding: 12, fontSize: 13, lineHeight: 1.45, background: "rgba(176,81,57,0.12)" }}>Punto donde se atora. {ss.why}</div>}
                </div>
              </div>
            )}

            {/* Hallazgos */}
            {sub === "Hallazgos" && (
              <div style={{ ...GLASS, borderRadius: 24, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "40px 2.4fr 110px 1.2fr 120px", gap: 16, padding: "14px 22px", borderBottom: "1px solid rgba(238,235,228,0.09)", ...MONO10 }}>
                  <span>#</span><span>HALLAZGO</span><span>PRIORIDAD</span><span>MÓDULO PROPUESTO</span><span>ESTIMACIÓN</span>
                </div>
                {FINDINGS.map((f) => (
                  <div key={f.n} style={{ display: "grid", gridTemplateColumns: "40px 2.4fr 110px 1.2fr 120px", gap: 16, padding: "15px 22px", borderBottom: "1px solid rgba(238,235,228,0.06)", alignItems: "center", animation: "rise .5s ease both", animationDelay: f.delay }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.tenue }}>{f.n}</span>
                    <span style={{ fontSize: 14 }}>{f.t}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: f.c, boxShadow: `0 0 8px ${f.c}` }} />{f.p}
                    </span>
                    <span style={{ fontSize: 13, color: C.niebla }}>{f.m}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12 }}>{f.h}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Plan */}
            {sub === "Plan" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}>
                  {PLAN.map((p) => (
                    <div key={p.n} style={{ ...GLASS, border: `1px solid ${p.border}`, boxShadow: p.glow, borderRadius: 24, padding: 20, display: "flex", flexDirection: "column", gap: 10, minHeight: 220, animation: "rise .6s ease both", animationDelay: p.delay }}>
                      <span style={MONO10}>HITO {p.n} · {p.stage}</span>
                      <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.01em", textTransform: "uppercase", flex: 1 }}>{p.t}</span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{p.w} SEMANAS</span>
                      <span style={{ fontWeight: 300, fontSize: 26, letterSpacing: "-0.02em" }}>{p.price}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", ...GLASS, borderRadius: 999, padding: "10px 10px 10px 26px" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: C.niebla }}>TOTAL · 10 SEMANAS · SE ACREDITA EL DIAGNÓSTICO</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em" }}>$140,000.00 MXN</span>
                    <PB style={{ boxShadow: "0 0 24px rgba(176,81,57,.45)" }} onClick={toQuote}>Generar cotización</PB>
                  </div>
                </div>
              </>
            )}

            {/* PDF */}
            {sub === "PDF" && (
              <div style={{ display: "flex", gap: 24, justifyContent: "center", padding: "10px 0" }}>
                {PAGES.map((p) => (
                  <div key={p.n} style={{ width: 340, aspectRatio: "8.5 / 11", background: C.papel, color: C.tinta, borderRadius: 6, padding: 28, display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 30px 60px rgba(0,0,0,0.45)", animation: "rise .6s ease both", animationDelay: p.delay }}>
                    <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.16em", color: C.acero }}>RONIN STUDIO · DIAGNÓSTICO · {p.n} / 03</span>
                    <span style={{ fontWeight: 900, fontSize: p.size, letterSpacing: "-0.02em", lineHeight: 1, textTransform: "uppercase" }}>{p.title}</span>
                    <span style={{ fontWeight: 300, fontSize: 12, color: C.acero }}>{p.sub}</span>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, justifyContent: "flex-end" }}>
                      {p.lines.map((l, i) => <div key={i} style={{ height: 8, borderRadius: 2, background: l.c, width: `${l.w}%` }} />)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
