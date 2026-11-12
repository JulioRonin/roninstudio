"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { Glass, Eyebrow, H, RGlyph, Dot, Circle, Chips, PB } from "@/components/ui";
import { useUI } from "@/components/shell";
import { TASKS } from "@/lib/demo";
import { useTablero, type P, type TareaHoy } from "@/lib/tablero";
import { datos, eq } from "@/lib/datos";

const FILTERS = ["Todo", "Lead", "Llamada", "Hito", "Factura", "Acompañamiento"];

/* Interpolación de entrada (los números "crecen" al cargar) */
function useEase(ms = 1400) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const iv = setInterval(() => { const v = Math.min(1, Math.max(0, (Date.now() - t0 - 200) / ms)); setT(v); if (v >= 1) clearInterval(iv); }, 16);
    return () => clearInterval(iv);
  }, [ms]);
  return 1 - Math.pow(1 - t, 3);
}

export default function Dashboard() {
  const { modo, t: real, refrescar } = useTablero();
  if (modo === "cargando") return <section style={{ padding: "60px 32px", fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: C.tenue }}>CARGANDO…</section>;
  if (modo === "error") return <section style={{ padding: "60px 32px", fontSize: 14, color: C.niebla }}>No se pudo leer la base de datos. Revisa Configuración → Hermes Agent → Probar conexión y recarga la página.</section>;
  return <Tablero real={real} refrescar={refrescar} />;
}

function Tablero({ real, refrescar }: { real: ReturnType<typeof useTablero>["t"]; refrescar: () => void }) {
  const { flash, tray, toggleTray } = useUI();
  const e = useEase();
  const [filter, setFilter] = useState("Todo");
  const [done, setDone] = useState<(string | number)[]>([]);
  const [researched, setResearched] = useState<number[]>([]);
  const [win, setWin] = useState({ start: 9, len: 3 });
  const [dragging, setDragging] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const cn = (v: number) => Math.round(v * e);
  const money = (v: number) => "$" + cn(v).toLocaleString("en-US");
  const sp = (a: number[]) => a.map((v, i) => `${i * 11},${20 - v}`).join(" ");

  const G = (a: number) => ({ bg: `rgba(34,39,46,${a})`, edge: "rgba(238,235,228,0.10)", shadow: "inset 0 1px 0 rgba(238,235,228,0.12), 0 10px 30px rgba(0,0,0,0.25)" });
  const KV = real ? real.kpis.map((k) => ({ name: k.name, value: k.dinero ? money(k.value) : String(cn(k.value)), unit: k.unit ?? "", delta: k.delta, a: k.serie ?? null })) : [
    { name: "TAREAS VENCIDAS", value: String(cn(3)), unit: "", delta: "+1 VS AYER", a: null as number[] | null },
    { name: "COBRADO · NOVIEMBRE", value: money(40000), unit: "MXN", delta: "+$10,000 VS OCT", a: [6, 8, 7, 11, 10, 14, 16] },
    { name: "MARGEN DEL MES", value: String(cn(45)), unit: "%", delta: "+5 PTS VS OCT", a: [10, 9, 11, 10, 12, 13, 14] },
    { name: "LEADS · SEMANA", value: String(cn(12)), unit: "", delta: "8 IG · 3 LI · 1 TT", a: [4, 6, 5, 9, 8, 12, 13] },
    { name: "LLAMADAS", value: cn(5) + "/" + cn(3), unit: "", delta: "AGENDADAS / HECHAS", a: null },
    { name: "PIEZAS", value: cn(3) + "/" + cn(5), unit: "", delta: "PUBLICADAS / PLAN", a: null },
  ];
  const hayVencidas = real ? real.kpis[0].value > 0 : true;
  const FORMA = [
    hayVencidas ? { bg: "rgba(176,81,57,0.78)", edge: "rgba(247,214,202,0.35)", shadow: "inset 0 1px 0 rgba(247,214,202,0.35), 0 0 50px rgba(176,81,57,0.45), 0 0 120px rgba(176,81,57,0.18)", label: C.papel, h: 156, flex: 1.7, r: 30, size: 56, arrow: true, stroke: "" } : { ...G(0.6), label: C.niebla, h: 156, flex: 1.7, r: 30, size: 56, arrow: true, stroke: "" },
    { ...G(0.55), label: C.niebla, h: 138, flex: 1.6, r: 26, size: 34, arrow: false, stroke: C.olivo },
    { ...G(0.45), label: C.niebla, h: 126, flex: 1.1, r: 24, size: 34, arrow: false, stroke: C.papel },
    { ...G(0.38), label: C.niebla, h: 116, flex: 1, r: 22, size: 30, arrow: false, stroke: C.papel },
    { ...G(0.3), label: C.tenue, h: 116, flex: 0.9, r: 20, size: 24, arrow: false, stroke: "" },
    { ...G(0.24), label: C.tenue, h: 110, flex: 0.85, r: 20, size: 24, arrow: false, stroke: "" },
  ];
  const kpis = KV.map((k, i) => ({ ...FORMA[i], ...k }));

  // ---- Línea de tiempo: 26 semanas desde el lunes 31 de agosto de 2026 ----
  const W = 26, DAY = 86400000, BASE = real?.base ?? Date.UTC(2026, 7, 31);
  const d = (m: number, day: number, y = 2026) => Date.UTC(y, m, day);
  const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const fmt = (t: number) => { const x = new Date(t); return `${x.getUTCDate()} ${MONTHS[x.getUTCMonth()]}`; };
  const isoWeek = (t: number) => { const x = new Date(t); const dn = (x.getUTCDay() + 6) % 7; x.setUTCDate(x.getUTCDate() - dn + 3); const y1 = Date.UTC(x.getUTCFullYear(), 0, 4); return 1 + Math.round(((x.getTime() - y1) / DAY - 3 + ((new Date(y1).getUTCDay() + 6) % 7)) / 7); };
  const winStart = BASE + win.start * 7 * DAY, winEnd = winStart + win.len * 7 * DAY - 1;
  const TODAY = real?.hoy ?? d(10, 5);

  const stageDefs: [string, string, P[]][] = real ? real.stageDefs : [
    ["01", "MAPEAR", [
      { code: "D7", name: "Negocio demo 7 · Notaría", meta: "VISITA · 07 NOV", from: d(10, 2), to: d(10, 20), next: d(10, 7) },
      { code: "D8", name: "Negocio demo 8 · Taller", meta: "MAPA DE FLUJO · 11 NOV", badge: 2, from: d(10, 9), to: d(11, 4), next: d(10, 11) },
      { code: "D9", name: "Negocio demo 9 · Gimnasio", meta: "VISITA · 14 DIC", from: d(11, 7), to: d(0, 15, 2027), next: d(11, 14) },
    ]],
    ["02", "DISEÑAR", [
      { code: "D4", name: "Negocio demo 4 · Clínica", meta: "HITO 2 ATRASADO · 03 NOV", late: true, badge: 3, from: d(9, 5), to: d(11, 18), next: d(10, 3) },
      { code: "D1", name: "Negocio demo 1 · Escuela", meta: "PLAN · 13 NOV", from: d(9, 26), to: d(11, 11), next: d(10, 13) },
      { code: "D10", name: "Negocio demo 10 · Taller", meta: "PLAN · 20 ENE", from: d(0, 4, 2027), to: d(1, 26, 2027), next: d(0, 20, 2027) },
    ]],
    ["03", "CONSTRUIR", [
      { code: "D2", name: "Negocio demo 2 · Restaurante", meta: "MÓDULO POS · 18 NOV", badge: 2, from: d(9, 5), to: d(11, 27), next: d(10, 18) },
      { code: "D5", name: "Negocio demo 5 · Gimnasio", meta: "PRUEBAS · 20 NOV", from: d(8, 14), to: d(10, 27), next: d(10, 20) },
      { code: "D6", name: "Negocio demo 6 · Taller", meta: "ENTREGA · 25 NOV", from: d(8, 28), to: d(10, 27), next: d(10, 25) },
    ]],
    ["04", "EVOLUCIONAR", [
      { code: "D3", name: "Negocio demo 3 · Clínica", meta: "REPORTE · 30 NOV", ok: true, from: d(7, 31), to: d(1, 26, 2027), next: d(10, 30) },
      { code: "D12", name: "Negocio demo 12 · Escuela", meta: "REPORTE · 15 SEP", ok: true, from: d(7, 31), to: d(8, 30), next: d(8, 15) },
    ]],
  ];
  const inWin = (p: P) => p.from <= winEnd && p.to >= winStart;
  const stages = stageDefs.map(([num, name, pr]) => [num, name, pr.filter(inWin)] as [string, string, P[]]);
  const visibles = stages.reduce((n, [, , pr]) => n + pr.length, 0);

  // Actividad por semana: hitos (fila 1), proyectos activos (fila 2), vencimientos de facturas (fila 3)
  const allP = stageDefs.flatMap(([, , pr]) => pr);
  const INV = real ? real.inv : [d(10, 2), d(10, 10), d(10, 14), d(10, 2)];
  const weeks = Array.from({ length: W }, (_, i) => {
    const s = BASE + i * 7 * DAY, e = s + 7 * DAY - 1;
    const sel = i >= win.start && i < win.start + win.len;
    let label: string | null = null;
    for (let k = 0; k < 7; k++) { const x = new Date(s + k * DAY); if (x.getUTCDate() === 1) label = MONTHS[x.getUTCMonth()] + (x.getUTCMonth() === 0 ? " " + String(x.getUTCFullYear()).slice(2) : ""); }
    const hitos = allP.filter((p) => p.next >= s && p.next <= e);
    const activos = allP.filter((p) => p.from <= e && p.to >= s).length;
    const facturas = INV.filter((t) => t >= s && t <= e).length;
    const late = hitos.some((p) => p.late);
    const on = (v: boolean) => (v ? (sel ? C.tinta : C.niebla) : sel ? "rgba(12,15,20,0.22)" : "#2A2F36");
    return { sel, label, c1: late ? C.oxido : on(hitos.length > 0), c2: on(activos >= 3), c3: on(facturas > 0), anim: late && !sel ? "blink 2.4s infinite" : "none", today: TODAY >= s && TODAY <= e, labelColor: sel ? C.tinta : C.tenue, title: `${fmt(s)} – ${fmt(e)} · ${hitos.length} hitos · ${activos} proyectos · ${facturas} facturas` };
  });
  const setLen = (n: number) => setWin((w) => { const len = Math.max(1, Math.min(13, n)); return { start: Math.min(w.start, W - len), len }; });
  const setStart = (n: number) => setWin((w) => ({ ...w, start: Math.max(0, Math.min(W - w.len, n)) }));
  const idxAt = (clientX: number) => { const r = stripRef.current!.getBoundingClientRect(); return Math.floor((clientX - r.left - 18) / ((r.width - 36) / W)); };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const i = idxAt(e.clientX);
    if (i >= win.start && i < win.start + win.len) { drag.current = { x: e.clientX, start: win.start }; setDragging(true); e.currentTarget.setPointerCapture(e.pointerId); }
    else setStart(i - Math.floor(win.len / 2));
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => { if (!drag.current) return; const r = stripRef.current!.getBoundingClientRect(); setStart(drag.current.start + Math.round((e.clientX - drag.current.x) / ((r.width - 36) / W))); };
  const onUp = () => { drag.current = null; setDragging(false); };

  const TODAS: TareaHoy[] = real ? real.tasks : TASKS;
  const fT = useMemo(() => TODAS.filter((t) => !done.includes(t.id) && (filter === "Todo" || t.origin === filter)), [done, filter, TODAS]);
  const hecha = (t: TareaHoy, msg: string) => { setDone((x) => [...x, t.id]); flash(msg); if (real) void datos.cambia("tareas", eq("id", String(t.id)), { estado: "Hecha" }).then(refrescar).catch(() => flash("No se guardó la tarea")); };
  const groups = useMemo(() => {
    const sorted = [...fT].sort((a, b) => (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0));
    const gm: Record<string, TareaHoy[]> = {};
    sorted.forEach((t) => { (gm[t.client] = gm[t.client] || []).push(t); });
    return Object.entries(gm);
  }, [fT]);

  const invoices: { client: string; amount: string; status: string; dot: string; id: string; reminder?: boolean }[] = real ? real.invoices : [
    { client: "Negocio demo 2", amount: "$25,000.00", status: "VENCIDA · 3 DÍAS", dot: C.oxido, id: "F-0112", reminder: true },
    { client: "Negocio demo 6", amount: "$18,000.00", status: "VENCE 10 NOV", dot: C.ambar, id: "F-0118" },
    { client: "Negocio demo 4", amount: "$12,500.00", status: "VENCE 14 NOV", dot: C.niebla, id: "F-0120" },
    { client: "Negocio demo 3", amount: "$20,000.00", status: "PAGADA · 2 NOV", dot: C.olivo, id: "F-0109" },
  ];
  const fd: [string, number][] = real ? real.fd : [["LEAD", 12], ["CONTACTADO", 8], ["LLAMADA", 5], ["DIAGNÓSTICO", 3], ["PROPUESTA", 2], ["CLIENTE", 1]];
  const content: { day: string; channel: string; hook: string; type: string; status: string; dot: string; metrics?: string }[] = real ? real.content : [
    { day: "LUN 2", channel: "IG", hook: "El chatbot que nadie usa", type: "CARRUSEL", status: "PUBLICADA", dot: C.olivo, metrics: "ALCANCE 4,000 · 2 LEADS" },
    { day: "MAR 3", channel: "LI", hook: "Primero el flujo. Después la IA.", type: "POST", status: "PUBLICADA", dot: C.olivo, metrics: "ALCANCE 1,500 · 1 LEAD" },
    { day: "JUE 5", channel: "TT", hook: "Lo que pierdes copiando la misma orden tres veces", type: "VIDEO", status: "APROBACIÓN", dot: C.oxido },
    { day: "VIE 6", channel: "YT", hook: "Cómo mapeamos una cocina en una mañana", type: "VIDEO", status: "PRODUCCIÓN", dot: C.ambar },
    { day: "SÁB 7", channel: "IG", hook: "Cuatro señales de que tu operación vive en WhatsApp", type: "CARRUSEL", status: "GUION", dot: C.niebla },
  ];
  const rs = real ? real.rs : [
    { n: "01", text: "Publicar el precio del diagnóstico completo en la página de clínicas; dos competidores ya lo muestran.", src: "2 FUENTES · SITIOS DE COMPETIDORES" },
    { n: "02", text: "Responder leads de Instagram en menos de una hora; los que esperan más de un día rara vez agendan.", src: "1 FUENTE · HISTORIAL DEL EMBUDO" },
    { n: "03", text: "Probar un carrusel por sector con el costo de no actuar en pesos al mes.", src: "3 FUENTES · MÉTRICAS DE CANAL" },
  ];

  let pi = 0;
  return (
    <>
      {/* Saludo + KPIs */}
      <section style={{ display: "grid", gridTemplateColumns: "268px 1fr", gap: 28, padding: "30px 32px 0" }}>
        <Glass pad={22} style={{ display: "flex", flexDirection: "column", gap: 10, animation: "rise .7s cubic-bezier(.2,.7,.2,1) both" }}>
          <Eyebrow>{real?.fecha ?? "JUEVES 5 NOV 2026"}</Eyebrow>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.niebla }}><Dot color={C.olivo} size={7} anim="blink 1.8s ease-in-out infinite" />{real?.agentes ?? "13 AGENTES EN LÍNEA"}</div>
          <div style={{ fontWeight: 300, fontSize: 15, color: C.niebla }}>{real?.saludo ?? "Buenos días,"}</div>
          <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: "-0.02em", lineHeight: 1, marginTop: -6 }}>JULIO</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.p3, borderRadius: 16, padding: "10px 14px" }}>
              <div><div style={{ fontSize: 11, color: C.tenue }}>Propuestas de IA</div><div style={{ fontSize: 14 }}>{tray.length} por aprobar</div></div>
              <button type="button" onClick={toggleTray} style={{ background: "none", border: "none", color: C.papel, fontSize: 16, cursor: "pointer" }}>↗</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.p3, borderRadius: 16, padding: "10px 14px" }}>
              <div><div style={{ fontSize: 11, color: C.tenue }}>Siguiente</div><div style={{ fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 }}>{real?.siguiente ?? "Llamada · 11:30"}</div></div>
              <Link href="/tareas" style={{ fontSize: 16 }}>↗</Link>
            </div>
          </div>
        </Glass>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div className="m-kpis" style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 156 }}>
            {kpis.map((k, i) => (
              <H key={k.name} style={{ flex: k.flex, height: k.h, background: k.bg, backdropFilter: "blur(24px) saturate(150%)", WebkitBackdropFilter: "blur(24px) saturate(150%)", border: `1px solid ${k.edge}`, boxShadow: k.shadow, borderRadius: k.r, padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", minWidth: 0, overflow: "hidden", animation: "rise .7s cubic-bezier(.2,.7,.2,1) both", animationDelay: `${0.08 * i}s`, transition: "transform .3s" }} hover={{ transform: "translateY(-4px)" }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", background: "linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0) 45%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "40%", background: "linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.10),rgba(255,255,255,0))", animation: "shine 6s ease-in-out infinite", animationDelay: `${1.2 * i}s`, pointerEvents: "none" }} />
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: k.label, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.name}</div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: k.size, letterSpacing: "-0.02em", lineHeight: 1 }}>{k.value}<span style={{ fontWeight: 300, fontSize: 13, marginLeft: 4 }}>{k.unit}</span></div>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: k.label, marginTop: 6 }}>{k.delta}</div>
                  </div>
                  {k.arrow && <Link href="/tareas" title="Ver tareas vencidas" style={{ width: 52, height: 52, borderRadius: "50%", background: C.tinta, color: C.papel, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, animation: "pulsePa 2.4s infinite" }}>↗</Link>}
                  {k.a && (
                    <svg width="60" height="24" viewBox="-2 -2 70 26" style={{ flexShrink: 0, overflow: "visible", filter: `drop-shadow(0 0 4px ${k.stroke})` }}>
                      <polyline points={sp(k.a)} fill="none" stroke={k.stroke} strokeWidth="1.6" strokeDasharray="140" style={{ animation: "draw 1.6s ease-out both", animationDelay: `${0.08 * i}s` }} />
                      <circle cx="66" cy={20 - k.a[6]} r="2.6" fill={k.stroke} style={{ animation: "blink 1.6s infinite" }} />
                    </svg>
                  )}
                </div>
              </H>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 48, height: 48, borderRadius: "50%", background: C.panel, border: `1px solid ${C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 14 }}>≡</span>
            <Chips items={real ? real.filters : FILTERS} value={filter} onChange={setFilter} />
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>FILTRA TAREAS Y LÍNEA DE TIEMPO</span>
          </div>
        </div>
      </section>

      {/* Etapas del método */}
      <section style={{ marginTop: 34, borderTop: `1px solid ${C.borde}`, position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 34, height: 4, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            <div style={{ width: 280, height: 4, borderRadius: 2, background: "linear-gradient(90deg,rgba(176,81,57,0),#B05139,rgba(238,235,228,.9),rgba(176,81,57,0))", filter: "blur(1px)", boxShadow: `0 0 14px ${C.oxido}`, animation: "sweep 5s cubic-bezier(.5,0,.5,1) infinite" }} />
          </div>
          {stages.map(([num, name, pr], i) => {
            const hot = real ? pr.some((p) => p.late) : i === 1;
            return (
              <div key={num} style={{ borderRight: "1px solid #1A1E24", padding: "0 0 18px", position: "relative", minHeight: 330 }}>
                <div style={{ height: 72, display: "flex", alignItems: "center", paddingLeft: 32, position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 36, height: 1, background: C.borde2 }} />
                  <div style={{ position: "relative", zIndex: 1, width: 52, height: 52, borderRadius: "50%", background: hot ? "rgba(176,81,57,0.18)" : "rgba(22,26,33,0.8)", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${hot ? C.oxido : C.borde}`, boxShadow: hot ? "0 0 30px rgba(176,81,57,0.5)" : "none", animation: hot ? "pulseOx 2.4s infinite" : "none" }}><RGlyph active={i} size={26} /></div>
                  <div style={{ position: "relative", marginLeft: 12, background: C.tinta, padding: "0 10px" }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: C.tenue }}>{num} / 04</div>
                    <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: "-0.01em" }}>{name}</div>
                  </div>
                  <div style={{ position: "relative", marginLeft: "auto", marginRight: i === 3 ? 96 : 20, background: C.tinta, padding: "0 8px", fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.niebla }}>{pr.length} PROY.</div>
                </div>
                <div style={{ position: "relative", marginLeft: 57, borderLeft: `1px solid ${C.borde2}`, padding: "14px 20px 4px 0", display: "flex", flexDirection: "column", gap: 14 }}>
                  {pr.map((p) => {
                    const d = 0.4 + 0.07 * pi++;
                    return (
                      <div key={p.code} style={{ display: "flex", alignItems: "center", position: "relative", animation: "rise .6s cubic-bezier(.2,.7,.2,1) both", animationDelay: `${d}s` }}>
                        <div style={{ width: 22, height: 1, background: C.borde2 }} />
                        <H as={Link as unknown as "a"} {...({ href: "/proyectos" } as object)} style={{ display: "flex", alignItems: "center", gap: 10, background: p.late ? "rgba(176,81,57,0.16)" : "rgba(22,26,33,0.55)", backdropFilter: "blur(14px)", border: `1px solid ${p.late ? C.oxido : "rgba(238,235,228,0.09)"}`, boxShadow: p.late ? "0 0 28px rgba(176,81,57,0.35)" : "none", borderRadius: 999, padding: "4px 16px 4px 4px", position: "relative", cursor: "pointer", flex: 1, minWidth: 0, transition: "transform .25s,border-color .25s", color: C.papel }} hover={{ borderColor: C.niebla, transform: "translateX(4px)" }}>
                          <span style={{ width: 40, height: 40, borderRadius: "50%", background: p.late ? C.oxido : p.ok ? C.olivo : "#2A2F36", color: C.papel, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, fontWeight: 500, flexShrink: 0, boxShadow: p.ok ? "0 0 16px rgba(76,129,65,.7)" : "none", animation: p.late ? "pulseOx 2s infinite" : "none" }}>{p.code}</span>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: p.late ? C.papel : C.tenue, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.meta}</div>
                          </div>
                          {p.badge && <span style={{ position: "absolute", top: -6, left: 30, minWidth: 18, height: 18, borderRadius: 999, background: C.papel, color: C.tinta, fontFamily: MONO, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{p.badge}</span>}
                        </H>
                      </div>
                    );
                  })}
                  {pr.length === 0 && <div style={{ fontSize: 13, color: C.tenue, padding: "8px 0 0 22px", maxWidth: 240, textWrap: "pretty" }}>{real && stageDefs.every(([, , x]) => x.length === 0) ? (i === 0 ? "Aún no hay proyectos. Nacen al aceptar una cotización." : "") : "Sin proyectos en este rango."}</div>}
                </div>
              </div>
            );
          })}
          <Link href="/proyectos?nuevo=1" title="Nuevo proyecto" style={{ position: "absolute", right: 28, top: 10, width: 52, height: 52, borderRadius: "50%", background: C.papel, color: C.tinta, fontSize: 22, boxShadow: "0 0 24px rgba(238,235,228,.35)", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>+</Link>
        </div>

        {/* Línea de tiempo · 26 semanas · ventana arrastrable */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 32px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>
            <span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)" }} />
            VIENDO · <span style={{ color: C.papel }}>{fmt(winStart)} – {fmt(winEnd)}</span> · SEMANAS {isoWeek(winStart)}–{isoWeek(winEnd)} · {visibles} {visibles === 1 ? "PROYECTO" : "PROYECTOS"} EN EL RANGO
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue, marginRight: 6 }}>RANGO</span>
            {([["2 sem", 2], ["4 sem", 4], ["8 sem", 8], ["13 sem", 13]] as [string, number][]).map(([l, n]) => {
              const a = win.len === n;
              return <H key={l} as="button" type="button" onClick={() => setLen(n)} style={{ height: 34, padding: "0 14px", borderRadius: 999, border: `1px solid ${a ? C.papel : C.borde}`, background: a ? C.papel : C.panel, color: a ? C.tinta : C.niebla, fontSize: 12, cursor: "pointer" }} hover={a ? {} : { borderColor: C.borde2 }}>{l}</H>;
            })}
            <H as="button" type="button" onClick={() => setStart(9 - Math.floor(win.len / 2))} style={{ height: 34, padding: "0 14px", borderRadius: 999, border: `1px solid ${C.oxido}`, background: "transparent", color: C.papel, fontSize: 12, cursor: "pointer", marginLeft: 6 }} hover={{ background: "rgba(176,81,57,0.15)" }}>Hoy</H>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 32px 0" }}>
          <button type="button" title="Una semana más de rango" onClick={() => setLen(win.len + 1)} style={{ width: 48, height: 48, borderRadius: "50%", background: C.panel, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 18, cursor: "pointer" }}>+</button>
          <button type="button" title="Una semana menos de rango" onClick={() => setLen(win.len - 1)} style={{ width: 48, height: 48, borderRadius: "50%", background: C.panel, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 18, cursor: "pointer" }}>−</button>
          <div ref={stripRef} tabIndex={0} title="Arrastra la ventana o haz clic en una semana · ← → mueven · + − cambian el rango"
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            onWheel={(e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) setStart(win.start + Math.sign(e.deltaX)); }}
            onKeyDown={(e) => { if (e.key === "ArrowLeft") setStart(win.start - 1); else if (e.key === "ArrowRight") setStart(win.start + 1); else if (e.key === "+") setLen(win.len + 1); else if (e.key === "-") setLen(win.len - 1); }}
            style={{ flex: 1, height: 56, borderRadius: 999, background: "rgba(22,26,33,0.55)", backdropFilter: "blur(20px)", border: "1px solid rgba(238,235,228,0.09)", display: "flex", alignItems: "stretch", padding: "0 18px", position: "relative", overflow: "hidden", cursor: dragging ? "grabbing" : "grab", userSelect: "none", touchAction: "none", outline: "none" }}>
            <div style={{ position: "absolute", top: 6, bottom: 6, left: `calc(18px + (100% - 36px) * ${win.start / W})`, width: `calc((100% - 36px) * ${win.len / W})`, borderRadius: 999, background: C.papel, boxShadow: "0 0 26px rgba(238,235,228,0.35)", transition: dragging ? "none" : "left .18s cubic-bezier(.2,.7,.2,1), width .18s cubic-bezier(.2,.7,.2,1)", pointerEvents: "none" }} />
            {weeks.map((w, i) => (
              <div key={i} title={w.title} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, position: "relative", pointerEvents: "none" }}>
                {w.today && <span style={{ position: "absolute", top: 5, width: 4, height: 4, borderRadius: "50%", background: C.oxido, boxShadow: `0 0 8px ${C.oxido}` }} />}
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: w.c1, animation: w.anim }} />
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: w.c2 }} />
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: w.c3 }} />
                {w.label && <span style={{ position: "absolute", bottom: 4, left: 0, fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: w.labelColor, whiteSpace: "nowrap" }}>{w.label}</span>}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, padding: "8px 32px 0 138px", fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", color: C.tenue }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: C.niebla }} />HITOS</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: C.niebla }} />3+ PROYECTOS ACTIVOS</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: C.niebla }} />FACTURAS</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: C.oxido }} />HITO ATRASADO · HOY</span>
        </div>
      </section>

      {/* Rejilla 12 */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(12,minmax(0,1fr))", gap: 16, padding: "28px 32px 40px" }}>
        <Glass delay=".35s" style={{ gridColumn: "span 6" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <Eyebrow>LO DE HOY · {fT.length} {fT.length === 1 ? "TAREA" : "TAREAS"}</Eyebrow>
              <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", marginTop: 6 }}>HOY · TAREAS Y SEGUIMIENTOS</div>
            </div>
            <Link href="/tareas"><Circle bg={C.papel} color={C.tinta}>↗</Circle></Link>
          </div>
          {groups.length > 0 ? groups.map(([client, ts]) => (
            <div key={client} style={{ borderTop: `1px solid ${C.borde}`, padding: "12px 0 6px" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue, marginBottom: 6 }}>{client}</div>
              {ts.map((t) => (
                <div key={t.id} style={{ display: "grid", gridTemplateColumns: "56px 1fr auto", gap: 14, alignItems: "center", padding: "8px 0" }}>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: t.overdue ? C.oxido : C.niebla }}>{t.time}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: t.overdue ? C.oxido : C.acero, flexShrink: 0, animation: t.overdue ? "pulseOx 2s infinite" : "none" }} /><span style={{ fontSize: 14 }}>{t.title}</span></div>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.tenue, margin: "4px 0 0 15px" }}>{(t.overdue ? "VENCIDA · " : "") + t.origin.toUpperCase() + " · " + t.channel}</div>
                    {t.ai && <div style={{ margin: "8px 0 0 15px", background: C.p2, border: `1px dashed ${C.borde2}`, borderRadius: 14, padding: "8px 12px", fontSize: 13, color: C.niebla, textWrap: "pretty" }}>{t.ai}</div>}
                  </div>
                  {real ? <button type="button" onClick={() => hecha(t, "Tarea marcada como hecha")} style={{ alignSelf: "start", height: 36, padding: "0 14px", borderRadius: 999, background: "transparent", border: `1px solid ${C.borde2}`, color: C.papel, fontSize: 12, cursor: "pointer" }}>Hecha</button> : t.ai && <PB small style={{ alignSelf: "start", padding: "0 14px" }} onClick={() => hecha(t, "Mensaje aprobado y enviado")}>Aprobar y enviar</PB>}
                </div>
              ))}
            </div>
          )) : <div style={{ borderTop: `1px solid ${C.borde}`, padding: "22px 0 12px", fontSize: 14, color: C.tenue }}>{real && real.tasks.length === 0 ? "Nada vencido ni para hoy. Las tareas nacen al enviar cotizaciones o las creas en Tareas." : "Sin tareas para este filtro."}</div>}
        </Glass>

        <Glass delay=".35s" style={{ gridColumn: "span 3", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em" }}>COBRANZA</div>
            <Link href="/cotizaciones?tab=cobros"><Circle>↗</Circle></Link>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "14px 0 4px" }}><span style={{ fontWeight: 300, fontSize: 40, letterSpacing: "-0.02em" }}>{real ? "$" + Math.round(real.porCobrar).toLocaleString("en-US") : "$55,500"}</span><span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue }}>MXN POR COBRAR</span></div>
          <div style={{ display: "flex", height: 4, borderRadius: 2, overflow: "hidden", gap: 2, marginBottom: 10 }}><span style={{ flex: real ? real.barra[0] : 25, background: C.oxido }} /><span style={{ flex: real ? real.barra[1] : 30.5, background: C.acero }} /><span style={{ flex: real ? real.barra[2] : 20, background: C.olivo }} />{real && real.barra.every((x) => !x) && <span style={{ flex: 1, background: C.p3 }} />}</div>
          {real && invoices.length === 0 && <div style={{ borderTop: `1px solid ${C.borde}`, padding: "14px 0", fontSize: 13, color: C.tenue }}>Sin facturas por cobrar.</div>}
          {invoices.map((iv) => (
            <div key={iv.id} style={{ borderTop: `1px solid ${C.borde}`, padding: "12px 0", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span style={{ fontSize: 13 }}>{iv.client}</span><span style={{ fontFamily: MONO, fontSize: 12 }}>{iv.amount}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.niebla }}><Dot color={iv.dot} />{iv.status}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.tenue }}>{iv.id}</span>
              </div>
              {iv.reminder && <button type="button" onClick={toggleTray} style={{ alignSelf: "flex-start", height: 32, padding: "0 12px", borderRadius: 999, background: "transparent", border: `1px solid ${C.oxido}`, color: C.papel, fontSize: 12, cursor: "pointer" }}>Recordatorio listo · revisar</button>}
            </div>
          ))}
        </Glass>

        <Glass delay=".35s" style={{ gridColumn: "span 3", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em" }}>EMBUDO</div>
            <Link href="/clientes"><Circle>↗</Circle></Link>
          </div>
          {fd.map(([label, n], i) => (
            <div key={label} style={{ display: "grid", gridTemplateColumns: "92px 1fr 28px", alignItems: "center", gap: 10, padding: "7px 0" }}>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.niebla }}>{label}</span>
              <span style={{ height: 22, borderRadius: 999, background: C.p2, overflow: "hidden", display: "block" }}><span style={{ display: "block", height: "100%", width: `${(n ? Math.max(6, (n / Math.max(1, ...fd.map((x) => x[1]))) * 100) : 0) * e}%`, background: i === 5 ? C.olivo : i === 4 ? C.oxido : C.acero, borderRadius: 999, boxShadow: i >= 4 ? `0 0 14px ${i === 5 ? "rgba(76,129,65,.6)" : "rgba(176,81,57,.55)"}` : "none" }} /></span>
              <span style={{ fontFamily: MONO, fontSize: 13, textAlign: "right" }}>{cn(n)}</span>
            </div>
          ))}
          <div style={{ marginTop: "auto", borderTop: `1px solid ${C.borde}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue }}>PERDIDOS · {real ? real.perdidos : 2}</span>
            {(!real || real.objecion) && <span style={{ fontSize: 13, color: C.niebla }}>Objeción principal: <span style={{ color: C.papel }}>{real ? real.objecion : "Precio"}</span></span>}
          </div>
        </Glass>

        <Glass delay=".35s" style={{ gridColumn: "span 7" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em" }}>CONTENIDO DE LA SEMANA</div>
              <div style={{ fontWeight: 300, fontSize: 14, color: C.niebla, marginTop: 2 }}>{real ? real.contentSub : "2 al 8 de noviembre · 5 piezas planeadas"}</div>
            </div>
            <Link href="/marketing"><Circle>↗</Circle></Link>
          </div>
          {real && content.length === 0 && <div style={{ borderTop: `1px solid ${C.borde}`, padding: "18px 0 6px", fontSize: 14, color: C.tenue }}>Sin piezas programadas esta semana. Se planean en Marketing y se fabrican en Estudio.</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 10 }}>
            {content.map((c) => (
              <div key={c.day} style={{ background: "rgba(12,15,20,0.45)", border: `1px solid ${c.dot === C.oxido ? C.oxido : C.borde}`, boxShadow: c.dot === C.oxido ? "0 0 26px rgba(176,81,57,0.3)" : c.dot === C.olivo ? "0 0 22px rgba(76,129,65,0.12)" : "none", borderRadius: 20, padding: 14, display: "flex", flexDirection: "column", gap: 10, minHeight: 170 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue }}><span>{c.day}</span><span>{c.channel}</span></div>
                <div style={{ fontSize: 13, lineHeight: 1.35, textWrap: "pretty", flex: 1 }}>{c.hook}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.tenue }}>{c.type}</div>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.papel }}><Dot color={c.dot} />{c.status}</span>
                {c.metrics && <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: C.niebla, borderTop: `1px solid ${C.borde}`, paddingTop: 8 }}>{c.metrics}</div>}
              </div>
            ))}
          </div>
        </Glass>

        <div style={{ gridColumn: "span 5", background: "rgba(238,235,228,0.92)", backdropFilter: "blur(20px)", color: C.tinta, borderRadius: 28, padding: 24, animation: "rise .8s cubic-bezier(.2,.7,.2,1) both", animationDelay: ".5s", boxShadow: "0 0 60px rgba(238,235,228,0.08)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <Eyebrow color={C.acero}>{real ? real.rsEyebrow : "BORRADOR DE IA · INVESTIGADOR · SEMANA 45"}</Eyebrow>
              <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", marginTop: 6 }}>INFORME DEL INVESTIGADOR</div>
            </div>
            <Link href="/agentes"><Circle bg={C.tinta} color={C.papel}>↗</Circle></Link>
          </div>
          {real && rs.length === 0 && <div style={{ borderTop: "1px solid #D6D2C9", padding: "14px 0", fontSize: 14, lineHeight: 1.5, color: C.acero }}>El Investigador todavía no entrega su informe. Corre desde Hermes los lunes y deja aquí sus tres recomendaciones para aprobar.</div>}
          {rs.map((r, i) => {
            const d = researched.includes(i);
            return (
              <div key={r.n} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 12, alignItems: "start", borderTop: "1px solid #D6D2C9", padding: "14px 0" }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.acero, paddingTop: 2 }}>{r.n}</span>
                <div>
                  <div style={{ fontSize: 14, lineHeight: 1.4, textWrap: "pretty" }}>{r.text}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.acero, marginTop: 4 }}>{r.src}</div>
                </div>
                <button type="button" onClick={() => { if (d) return; setResearched((x) => [...x, i]); flash("Tarea creada en Hoy"); if (real) void datos.crea("tareas", { titulo: r.text.slice(0, 140), origen: "Investigación", canal: "Interno" }).then(refrescar).catch(() => flash("No se guardó la tarea")); }} style={{ height: 34, padding: "0 14px", borderRadius: 999, background: d ? "transparent" : C.tinta, color: d ? C.olivo : C.papel, border: `1px solid ${d ? C.olivo : C.tinta}`, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{d ? "Tarea creada" : "Convertir en tarea"}</button>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
