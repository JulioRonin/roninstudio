"use client";
import React, { useEffect, useMemo, useState, type CSSProperties } from "react";
import { C, MONO, SANS } from "@/lib/tokens";
import { H, RGlyph } from "@/components/ui";
import { useUI } from "@/components/shell";

/* ------------------------------------------------------------------ */
/* Pantalla Proyectos · port del prototipo "Ronin OS Proyectos"        */
/* ------------------------------------------------------------------ */

const OXIDO_C = "#F7D6CA"; // Óxido claro (etapa activa en el Gantt)
const GLASS: CSSProperties = { background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: "1px solid rgba(238,235,228,0.09)" };
const LBL: CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue };
const ST: CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em" };

const TABS = ["Lista por etapa", "Resumen", "Acta", "EDT", "Gantt", "Entregables", "Riesgos y cambios", "Horas", "Cierre", "Vista del cliente"] as const;
type Tab = (typeof TABS)[number];

/* Actividades del Gantt (s = inicio en semanas, d = duración, b/bd = línea base, p = % avance) */
type Act = { g: string } | { n: string; s: number; d: number; b: number; bd: number; p: number; done?: boolean; active?: boolean; crit?: boolean };
const ACT: Act[] = [
  { g: "01 MAPEAR" }, { n: "Visita y diagnóstico", s: 0, d: 1, b: 0, bd: 1, p: 100, done: true }, { n: "Mapa de flujo actual", s: 1, d: 1, b: 1, bd: 1, p: 100, done: true },
  { g: "02 DISEÑAR" }, { n: "Flujo de comanda y roles", s: 2, d: 1.5, b: 2, bd: 1, p: 100, done: true, crit: true }, { n: "Prototipo de pantallas", s: 3, d: 1, b: 2.5, bd: 1, p: 100, done: true },
  { g: "03 CONSTRUIR" }, { n: "Comanda digital y cocina", s: 4, d: 2, b: 3.5, bd: 2, p: 70, active: true, crit: true }, { n: "Módulo POS y caja", s: 5, d: 2.5, b: 5, bd: 2, p: 30, active: true, crit: true }, { n: "Cierre automático", s: 7, d: 1.5, b: 7, bd: 1.5, p: 0, crit: true }, { n: "Pruebas con casos reales", s: 8, d: 1, b: 8, bd: 1, p: 0 },
  { g: "04 EVOLUCIONAR" }, { n: "Inventario y tablero", s: 9, d: 2, b: 9, bd: 2, p: 0 }, { n: "Acompañamiento mensual", s: 11, d: 1, b: 11, bd: 1, p: 0 },
];
const N = 12;
const WEEKS = ["5 OCT", "12", "19", "26", "2 NOV", "9", "16", "23", "30", "7 DIC", "14", "21"];
const MONTHS = ["OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
const TODAY_F = (4 + 3 / 7) / N;

/* Lista por etapa */
type PRow = { name: string; client: string; pct: number; next: string; late: boolean; hours: string; bill: string; bc: string };
const R = (name: string, client: string, pct: number, next: string, late: boolean, hours: string, bill: string, bc: string): PRow => ({ name, client, pct, next, late, hours, bill, bc });
const GROUPS: [string, string, PRow[]][] = [
  ["01", "MAPEAR", [R("Diagnóstico completo", "NEGOCIO DEMO 7 · NOTARÍA", 40, "Visita · 7 nov", false, "6 / 16 H", "POR FACTURAR", C.niebla), R("Diagnóstico completo", "NEGOCIO DEMO 8 · TALLER", 20, "Mapa de flujo · 11 nov", false, "3 / 16 H", "POR FACTURAR", C.niebla)]],
  ["02", "DISEÑAR", [R("Agenda y expediente", "NEGOCIO DEMO 4 · CLÍNICA", 35, "Hito 2 atrasado · 3 nov", true, "42 / 60 H", "VENCE 14 NOV", C.ambar), R("Inscripción y cobranza", "NEGOCIO DEMO 1 · ESCUELA", 10, "Plan · 13 nov", false, "4 / 80 H", "AL CORRIENTE", C.olivo)]],
  ["03", "CONSTRUIR", [R("Plataforma de operación", "NEGOCIO DEMO 2 · RESTAURANTE", 62, "Módulo POS · 18 nov", false, "118 / 190 H", "VENCIDA", C.oxido), R("Membresías y accesos", "NEGOCIO DEMO 5 · GIMNASIO", 80, "Pruebas · 20 nov", false, "96 / 110 H", "AL CORRIENTE", C.olivo), R("Órdenes de trabajo", "NEGOCIO DEMO 6 · TALLER", 75, "Entrega · 25 nov", false, "88 / 120 H", "VENCE 10 NOV", C.ambar)]],
  ["04", "EVOLUCIONAR", [R("Acompañamiento mensual", "NEGOCIO DEMO 3 · CLÍNICA", 100, "Reporte · 30 nov", false, "6 / 8 H", "PAGADA", C.olivo)]],
];

/* Resumen */
const FACTS: [string, string][] = [["PRESUPUESTO", "$140,000.00"], ["FECHAS", "5 OCT – 27 DIC"], ["AVANCE", "62 %"], ["HORAS", "118 / 190"]];
const CARDS: { k: string; v: string; s: string; cta: string; tab: Tab; hot?: boolean }[] = [
  { k: "PRÓXIMO HITO · 18 NOV", v: "Módulo POS y caja", s: "Criterio: cobrar una cuenta completa sin recaptura, en las tres sucursales.", cta: "Ver Gantt", tab: "Gantt" },
  { k: "RIESGOS ABIERTOS", v: "3 · 1 alto", s: "Conexión de internet inestable en la sucursal 3.", cta: "Ver riesgos", tab: "Riesgos y cambios", hot: true },
  { k: "HORAS", v: "62 % usado", s: "Dentro de la estimación; Construir lleva 4 horas arriba.", cta: "Ver horas", tab: "Horas" },
  { k: "FACTURAS DEL PROYECTO", v: "1 vencida", s: "F-0112 · $25,000.00 MXN · vencida el 2 de noviembre.", cta: "Ver entregables", tab: "Entregables", hot: true },
];

/* Acta */
const ACTA: [string, string][] = [
  ["OBJETIVO", "Una sola captura de cada orden, de la mesa a la caja, en las tres sucursales."],
  ["ALCANCE", "Comanda digital, pantalla de cocina, punto de venta, cierre automático, inventario por receta y tablero de sucursales."],
  ["FUERA DE ALCANCE", "Pedidos a proveedor, nómina y facturación electrónica de los clientes del restaurante."],
  ["SUPUESTOS", "Internet en las tres sucursales; un responsable por sucursal para pruebas."],
  ["RIESGOS INICIALES", "Conexión inestable en la sucursal 3; rotación de meseros durante la capacitación."],
  ["HITOS Y PRESUPUESTO", "4 hitos · 10 semanas · $140,000.00 MXN; se acredita el diagnóstico."],
];

/* EDT */
type Kid = [string, string, string, string, string, string, string];
const TREE: { id: string; code: string; name: string; crit: string; who: string; h: string; st: string; c: string; kids: Kid[] }[] = [
  { id: "1", code: "1", name: "Comanda digital", crit: "Una orden viaja de mesa a cocina sin papel", who: "JC", h: "40", st: "ACEPTADO", c: C.olivo, kids: [["1.1", "Toma de orden en tableta", "Mesero captura en menos de 1 minuto", "JC", "16", "ACEPTADO", C.olivo], ["1.2", "Pantalla de cocina", "Orden visible en 5 segundos", "JC", "24", "ACEPTADO", C.olivo]] },
  { id: "2", code: "2", name: "Punto de venta y caja", crit: "Cobro sin recaptura", who: "JC", h: "60", st: "EN CURSO", c: C.ambar, kids: [["2.1", "Cuenta desde la comanda", "Total igual a lo servido", "JC", "24", "EN REVISIÓN", C.ambar], ["2.2", "Formas de pago", "Efectivo, tarjeta y transferencia", "JC", "20", "PENDIENTE", C.niebla], ["2.3", "Cierre automático", "Cierre en menos de 5 minutos", "JC", "16", "PENDIENTE", C.niebla]] },
  { id: "3", code: "3", name: "Inventario y tablero", crit: "Inventario baja por receta", who: "JC", h: "48", st: "PENDIENTE", c: C.niebla, kids: [["3.1", "Recetas", "Cada platillo con sus insumos", "JC", "24", "PENDIENTE", C.niebla], ["3.2", "Tablero por sucursal", "Ventas y merma del día", "JC", "24", "PENDIENTE", C.niebla]] },
];

/* Entregables / hitos */
const MI: [string, string, string, string, string, string, string][] = [
  ["m1", "Hito 1 · Diseño del flujo", "12 OCT", "ACEPTADO", C.olivo, "Acta firmada · 3 archivos", "F-0098 · PAGADA"],
  ["m2", "Hito 2 · Comanda digital", "2 NOV", "ACEPTADO", C.olivo, "Video de prueba · 2 archivos", "F-0112 · VENCIDA"],
  ["m3", "Hito 3 · POS y caja", "18 NOV", "EN REVISIÓN", C.ambar, "Pruebas en sucursal 1", "POR EMITIR"],
  ["m4", "Hito 4 · Inventario y tablero", "10 DIC", "PENDIENTE", C.niebla, "—", "POR EMITIR"],
];

/* Riesgos */
const RS: Record<string, string[]> = { "3-2": ["1"], "2-2": ["2"], "1-1": ["3"] };
const RISKS: [string, string, string, string][] = [["1", "Internet inestable en la sucursal 3", "ALTO", C.oxido], ["2", "Rotación de meseros durante la capacitación", "MEDIO", C.ambar], ["3", "Cambio de menú en diciembre", "BAJO", C.niebla]];

/* Horas */
const HOURS: [string, string, number, number][] = [["Comanda digital y cocina", "JC", 40, 38], ["Módulo POS y caja", "JC", 60, 32], ["Flujo y prototipo", "JC", 30, 34], ["Visita y mapa", "JC", 16, 14], ["Gestión del proyecto", "JC", 20, 0]];

/* Cierre */
const CLOSING: [string, string, string][] = [
  ["ACTA DE CIERRE", "Entregables aceptados, horas finales, facturas cobradas.", "DISPONIBLE AL ACEPTAR HITO 4"],
  ["LECCIONES APRENDIDAS", "Qué funcionó, qué cambiaríamos, qué se vuelve plantilla.", "0 REGISTRADAS"],
  ["ENCUESTA AL CLIENTE", "5 preguntas; se envía por WhatsApp al cerrar.", "SIN ENVIAR"],
];

/* Punto de estado (sin glow en las variantes que el prototipo no lo usa) */
function StDot({ c, glow = true }: { c: string; glow?: boolean }) {
  return <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: glow ? `0 0 8px ${c}` : undefined, flexShrink: 0 }} />;
}

export default function Proyectos() {
  const { flash } = useUI();
  const [tab, setTab] = useState<Tab>("Lista por etapa");
  const [groups, setGroups] = useState(GROUPS);
  const [modal, setModal] = useState<"nuevo" | "horas" | null>(null);
  const [nuevo, setNuevo] = useState({ name: "", client: "", sector: "Restaurante con sucursales", next: "" });
  const [horas, setHoras] = useState({ h: "2", que: "" });
  useEffect(() => { if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("nuevo") === "1") setModal("nuevo"); }, []);
  const crearProyecto = () => {
    if (!nuevo.name.trim() || !nuevo.client.trim()) { flash("Falta el nombre del proyecto o el cliente"); return; }
    setGroups((g) => g.map(([n, name, rows], i) => (i === 0 ? [n, name, [R(nuevo.name.trim(), (nuevo.client.trim() + " · " + nuevo.sector).toUpperCase(), 0, nuevo.next.trim() ? "Visita · " + nuevo.next.trim() : "Visita por agendar", false, "0 / 16 H", "POR FACTURAR", C.niebla), ...rows]] : [n, name, rows])) as typeof GROUPS);
    setModal(null); setTab("Lista por etapa"); setNuevo({ name: "", client: "", sector: "Restaurante con sucursales", next: "" });
    flash("Proyecto creado en 01 · Mapear");
  };
  const [zoom, setZoom] = useState<"Semana" | "Mes">("Semana");
  const [open, setOpen] = useState<Record<string, boolean>>({ "1": true, "2": true, "3": true });
  const [accepted, setAccepted] = useState<string[]>([]);

  const inProject = tab !== "Lista por etapa";

  /* --- Valores derivados (equivalente de renderVals) --- */
  const tree = useMemo(() => {
    const out: { key: string; code: string; name: string; crit: string; who: string; h: string; st: string; c: string; caret: string; pad: number; w: number; cursor: string; bg: string; onClick?: () => void }[] = [];
    TREE.forEach((n) => {
      const o = open[n.id];
      out.push({ key: n.id, code: n.code, name: n.name, crit: n.crit, who: n.who, h: n.h, st: n.st, c: n.c, caret: o ? "▾" : "▸", pad: 0, w: 600, cursor: "pointer", bg: "rgba(238,235,228,0.02)", onClick: () => setOpen((x) => ({ ...x, [n.id]: !x[n.id] })) });
      if (o) n.kids.forEach(([code, name, crit, who, h, st, c]) => out.push({ key: code, code, name, crit, who, h, st, c, caret: "", pad: 24, w: 400, cursor: "default", bg: "transparent" }));
    });
    return out;
  }, [open]);

  const ghead = zoom === "Semana" ? WEEKS : MONTHS;

  const gantt = useMemo(() => {
    let di = 0;
    return ACT.map((a) => {
      if ("g" in a) return { bar: false as const, name: a.g, h: 34, font: MONO, fs: 10, ls: "0.14em", tc: a.g.startsWith("03") ? C.papel : C.tenue, pad: 0 };
      return {
        bar: true as const, name: a.n, h: 40, font: SANS, fs: 13, ls: "0", tc: C.papel, pad: 14,
        l: (a.s / N) * 100, w: (a.d / N) * 100, bl: (a.b / N) * 100, bw: (a.bd / N) * 100, p: a.p,
        c: a.done ? C.olivo : a.active ? OXIDO_C : C.niebla,
        crit: a.crit ? C.oxido : "transparent",
        glow: a.active ? "0 0 18px rgba(247,214,202,0.35)" : a.done ? "0 0 12px rgba(76,129,65,0.35)" : "none",
        delay: `${0.05 * di++}s`,
      };
    });
  }, []);

  const miles = useMemo(() => MI.map(([id, name, date, st, c, ev, inv]) => {
    const acc = accepted.includes(id);
    return { id, name, date, dc: C.niebla, st: acc ? "ACEPTADO" : st, c: acc ? C.olivo : c, ev, inv: acc ? "F-0121 · EMITIDA" : inv, can: st === "EN REVISIÓN" && !acc };
  }), [accepted]);

  const clientMiles = useMemo(() => MI.map(([id, t, date, st, c, , inv], i) => {
    const acc = accepted.includes(id);
    return { n: "0" + (i + 1), t: t.split(" · ")[1], date, st: acc ? "ACEPTADO" : st, c: acc ? C.olivo : c, inv: inv.replace("VENCIDA", "POR PAGAR") };
  }), [accepted]);

  /* Matriz 3×3: fila de etiqueta (ALTA/MEDIA/BAJA) + 3 celdas por probabilidad */
  const matrix = useMemo(() => {
    const cells: { label: string; ar: string; bg: string; border: string; items: string[] }[] = [];
    for (let p = 3; p >= 1; p--) {
      cells.push({ label: ["", "BAJA", "MEDIA", "ALTA"][p], ar: "0.5", bg: "transparent", border: "transparent", items: [] });
      for (let i = 1; i <= 3; i++) {
        const v = p + i;
        cells.push({ label: "", ar: "1", items: RS[p + "-" + i] || [], bg: v >= 5 ? "rgba(176,81,57,0.28)" : v === 4 ? "rgba(201,138,60,0.2)" : "rgba(238,235,228,0.04)", border: v >= 5 ? C.oxido : "rgba(238,235,228,0.08)" });
      }
    }
    return cells;
  }, []);

  const hours = HOURS.map(([a, who, e, r]) => ({ a, who, w: Math.min(100, (r / e) * 100), c: r > e ? C.oxido : C.papel, tc: r > e ? C.oxido : C.papel, v: `${r} / ${e} H` }));

  const acceptMile = (id: string) => { setAccepted((x) => [...x, id]); flash("Hito aceptado · factura F-0121 emitida en borrador"); };

  return (
    <>
      {/* Encabezado de pantalla */}
      <section style={{ padding: "34px 32px 0", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
          {inProject && (
            <span style={{ width: 64, height: 64, borderRadius: "50%", border: `1px solid ${C.oxido}`, background: "rgba(176,81,57,0.14)", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulseOx 2.6s infinite", flexShrink: 0 }}>
              <RGlyph active={2} size={30} base={C.papel} />
            </span>
          )}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, ...LBL }}>
              <span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)" }} />
              {inProject ? "05 · PROYECTOS · ETAPA 03 / 04 CONSTRUIR" : "05 · PROYECTOS · NIVEL PMI"}
            </div>
            <h1 style={{ margin: "8px 0 0", fontWeight: 900, fontSize: 44, letterSpacing: "-0.02em", lineHeight: 1 }}>{inProject ? "PLATAFORMA DE OPERACIÓN" : "PROYECTOS"}</h1>
            <div style={{ fontWeight: 300, fontSize: 16, color: C.niebla, marginTop: 6 }}>{inProject ? "Negocio demo 2 · Restaurante con sucursales · 5 oct – 27 dic" : "8 proyectos · 1 hito atrasado · 1 factura vencida"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {inProject && (<>
            <a href="/proyectos/reporte?p=D2" target="_blank" rel="noreferrer" style={{ height: 48, padding: "0 20px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.oxido}`, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center" }}>Descargar reporte</a>
            <button type="button" onClick={() => flash("Enlace de solo lectura copiado")} style={{ height: 48, padding: "0 20px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.borde2}`, fontSize: 14, cursor: "pointer" }}>Copiar enlace del cliente</button>
          </>)}
          <H as="button" type="button" onClick={() => setModal(inProject ? "horas" : "nuevo")}
            style={{ height: 48, padding: "0 22px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 28px rgba(176,81,57,.45)" }}
            hover={{ background: C.oxidoHover }}>
            {inProject ? "Registrar horas" : "Nuevo proyecto"}
          </H>
        </div>
      </section>

      {/* Pestañas */}
      <nav style={{ display: "flex", gap: 4, padding: "22px 32px 0", flexWrap: "wrap" }}>
        {TABS.map((l) => {
          const a = l === tab;
          return (
            <H key={l} as="button" type="button" onClick={() => setTab(l)}
              style={{ height: 42, padding: "0 15px", borderRadius: 999, border: `1px solid ${a ? C.papel : "rgba(238,235,228,0.09)"}`, background: a ? C.papel : "rgba(22,26,33,0.55)", color: a ? C.tinta : C.papel, fontSize: 12.5, cursor: "pointer" }}
              hover={{ borderColor: C.acero }}>
              {l}
            </H>
          );
        })}
      </nav>

      <section style={{ padding: "22px 32px 56px" }}>
        {/* ---------- Lista por etapa ---------- */}
        {tab === "Lista por etapa" && groups.map(([num, name, rows], i) => (
          <div key={num} style={{ marginBottom: 18, animation: "rise .6s ease both", animationDelay: `${0.08 * i}s` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <RGlyph active={i} size={22} base={C.papel} />
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em" }}>{num} / 04 · {name}</span>
              <span style={{ flex: 1, height: 1, background: C.borde }} />
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue }}>{rows.length} PROY.</span>
            </div>
            <div style={{ ...GLASS, borderRadius: 22, overflow: "hidden" }}>
              {rows.map((r, ri) => (
                <H key={ri} onClick={() => setTab("Resumen")}
                  style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1.6fr 1fr 1fr", gap: 16, padding: "15px 22px", borderBottom: "1px solid rgba(238,235,228,0.06)", alignItems: "center", cursor: "pointer" }}
                  hover={{ background: "rgba(238,235,228,0.04)" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.tenue, marginTop: 3 }}>{r.client}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ flex: 1, height: 4, borderRadius: 2, background: C.p3, overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", width: `${r.pct}%`, background: C.oxido, boxShadow: `0 0 10px ${C.oxido}`, transformOrigin: "left", animation: "growX 1s ease both" }} />
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11 }}>{r.pct} %</span>
                  </div>
                  <span style={{ fontSize: 13, color: r.late ? C.oxido : C.papel }}>{r.next}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{r.hours}</span>
                  <span style={ST}><StDot c={r.bc} />{r.bill}</span>
                </H>
              ))}
            </div>
          </div>
        ))}

        {/* ---------- Resumen ---------- */}
        {tab === "Resumen" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, marginBottom: 16 }}>
              {FACTS.map(([k, v]) => (
                <div key={k} style={{ ...GLASS, borderRadius: 22, padding: 18 }}>
                  <div style={LBL}>{k}</div>
                  <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em", marginTop: 8 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}>
              {CARDS.map((c, i) => (
                <div key={c.k} style={{ background: c.hot ? "rgba(176,81,57,0.16)" : "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: `1px solid ${c.hot ? C.oxido : "rgba(238,235,228,0.09)"}`, boxShadow: c.hot ? "0 0 30px rgba(176,81,57,0.3)" : "none", borderRadius: 28, padding: 22, minHeight: 220, display: "flex", flexDirection: "column", gap: 8, animation: "rise .6s ease both", animationDelay: `${0.07 * i}s` }}>
                  <div style={{ ...LBL, color: c.hot ? C.papel : C.tenue }}>{c.k}</div>
                  <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em", textTransform: "uppercase" }}>{c.v}</div>
                  <div style={{ fontSize: 13, color: c.hot ? C.papel : C.niebla, lineHeight: 1.5, flex: 1 }}>{c.s}</div>
                  <button type="button" onClick={() => setTab(c.tab)} style={{ alignSelf: "flex-start", height: 34, padding: "0 14px", borderRadius: 999, background: "transparent", border: `1px solid ${C.borde2}`, color: C.papel, fontSize: 12, cursor: "pointer" }}>{c.cta}</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---------- Acta ---------- */}
        {tab === "Acta" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 16 }}>
            <div style={{ ...GLASS, borderRadius: 28, padding: 28 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", padding: "6px 10px", borderRadius: 999, border: `1px dashed ${C.niebla}` }}>BORRADOR DE IA · PLANEADOR · DESDE EL DIAGNÓSTICO</span>
              {ACTA.map(([k, v]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "180px 1fr auto", gap: 18, padding: "16px 0", borderBottom: "1px solid rgba(238,235,228,0.06)" }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.niebla, paddingTop: 3 }}>{k}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.55, textWrap: "pretty" }}>{v}</span>
                  <button type="button" onClick={() => flash("Abriendo editor del acta")} style={{ height: 30, padding: "0 12px", borderRadius: 999, background: "transparent", border: `1px solid ${C.borde2}`, color: C.niebla, fontSize: 11, cursor: "pointer" }}>Editar</button>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(238,235,228,0.92)", color: C.tinta, borderRadius: 28, padding: 22, alignSelf: "start", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.acero }}>FIRMAS</div>
              <div style={{ fontSize: 14, display: "flex", justifyContent: "space-between" }}><span>Ronin Studio</span><span style={{ color: C.olivo, fontWeight: 600 }}>Firmado</span></div>
              <div style={{ fontSize: 14, display: "flex", justifyContent: "space-between" }}><span>Negocio demo 2</span><span style={{ color: C.oxido, fontWeight: 600 }}>Pendiente</span></div>
              <H as="button" type="button" onClick={() => flash("Acta enviada a firma · Negocio demo 2")} style={{ height: 40, borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 6 }} hover={{ background: C.oxidoHover }}>Enviar a firma</H>
            </div>
          </div>
        )}

        {/* ---------- EDT ---------- */}
        {tab === "EDT" && (
          <div style={{ ...GLASS, borderRadius: 24, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 80px 90px 130px", gap: 16, padding: "14px 22px", borderBottom: "1px solid rgba(238,235,228,0.09)", ...LBL }}>
              <span>ENTREGABLE</span><span>CRITERIO DE ACEPTACIÓN</span><span>RESP.</span><span>HORAS</span><span>ESTADO</span>
            </div>
            {tree.map((n) => (
              <H key={n.key} onClick={n.onClick}
                style={{ display: "grid", gridTemplateColumns: "2fr 2fr 80px 90px 130px", gap: 16, padding: "13px 22px", borderBottom: "1px solid rgba(238,235,228,0.06)", alignItems: "center", cursor: n.cursor, background: n.bg }}
                hover={{ background: "rgba(238,235,228,0.04)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: n.pad, fontSize: 14, fontWeight: n.w }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.tenue, width: 14 }}>{n.caret}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.tenue }}>{n.code}</span>
                  {n.name}
                </span>
                <span style={{ fontSize: 13, color: C.niebla }}>{n.crit}</span>
                <span style={{ fontFamily: MONO, fontSize: 11 }}>{n.who}</span>
                <span style={{ fontFamily: MONO, fontSize: 11 }}>{n.h}</span>
                <span style={ST}><StDot c={n.c} />{n.st}</span>
              </H>
            ))}
          </div>
        )}

        {/* ---------- Gantt ---------- */}
        {tab === "Gantt" && (
          <div style={{ ...GLASS, boxShadow: "inset 0 1px 0 rgba(238,235,228,0.08)", borderRadius: 28, padding: 22, animation: "rise .6s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", padding: 4, borderRadius: 999, background: "rgba(12,15,20,0.5)", border: "1px solid rgba(238,235,228,0.09)" }}>
                {(["Semana", "Mes"] as const).map((z) => (
                  <button key={z} type="button" onClick={() => setZoom(z)} style={{ height: 32, padding: "0 14px", borderRadius: 999, border: "none", background: z === zoom ? C.papel : "transparent", color: z === zoom ? C.tinta : C.niebla, fontSize: 12, cursor: "pointer" }}>{z}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 16, marginLeft: "auto", fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.niebla }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 18, height: 8, borderRadius: 4, background: C.olivo }} />TERMINADO</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 18, height: 8, borderRadius: 4, background: OXIDO_C }} />ETAPA ACTIVA</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 18, height: 8, borderRadius: 4, background: C.niebla }} />PLANEADO</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 18, height: 8, borderRadius: 4, border: `1.5px solid ${C.oxido}` }} />RUTA CRÍTICA</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 18, height: 2, background: C.acero }} />LÍNEA BASE</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "280px minmax(0,1fr)" }}>
              <span />
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${ghead.length},minmax(0,1fr))`, borderBottom: `1px solid ${C.borde}` }}>
                {ghead.map((h) => <span key={h} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue, padding: "0 0 10px 6px", borderLeft: "1px solid rgba(238,235,228,0.06)" }}>{h}</span>)}
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: 0, bottom: 0, left: `calc(280px + (100% - 280px) * ${TODAY_F})`, width: 2, background: C.oxido, boxShadow: `0 0 14px ${C.oxido}`, zIndex: 2 }}>
                <span style={{ position: "absolute", top: -2, left: 6, fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", color: C.papel, background: C.oxido, padding: "3px 6px", borderRadius: 999, whiteSpace: "nowrap" }}>HOY · 5 NOV</span>
              </div>
              {gantt.map((g) => (
                <div key={g.name} style={{ display: "grid", gridTemplateColumns: "280px minmax(0,1fr)", height: g.h, alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.05)" }}>
                  <span style={{ fontFamily: g.font, fontSize: g.fs, letterSpacing: g.ls, color: g.tc, paddingLeft: g.pad, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</span>
                  <div style={{ position: "relative", height: "100%" }}>
                    {g.bar && (
                      <>
                        <span style={{ position: "absolute", top: 28, left: `${g.bl}%`, width: `${g.bw}%`, height: 2, background: C.acero }} />
                        <span style={{ position: "absolute", top: 9, left: `${g.l}%`, width: `${g.w}%`, height: 16, borderRadius: 8, background: g.c, border: `1.5px solid ${g.crit}`, boxShadow: g.glow, transformOrigin: "left", animation: "growX .9s cubic-bezier(.2,.7,.2,1) both", animationDelay: g.delay, overflow: "hidden" }}>
                          <span style={{ display: "block", height: "100%", width: `${g.p}%`, background: "rgba(12,15,20,0.25)" }} />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------- Entregables ---------- */}
        {tab === "Entregables" && (
          <div style={{ ...GLASS, borderRadius: 24, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.1fr 1.3fr 1fr 150px", gap: 16, padding: "14px 22px", borderBottom: "1px solid rgba(238,235,228,0.09)", ...LBL }}>
              <span>HITO</span><span>COMPROMISO</span><span>ESTADO</span><span>EVIDENCIA</span><span>FACTURA</span><span />
            </div>
            {miles.map((m) => (
              <div key={m.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.1fr 1.3fr 1fr 150px", gap: 16, padding: "15px 22px", borderBottom: "1px solid rgba(238,235,228,0.06)", alignItems: "center" }}>
                <span style={{ fontSize: 14 }}>{m.name}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: m.dc }}>{m.date}</span>
                <span style={ST}><StDot c={m.c} />{m.st}</span>
                <span style={{ fontSize: 13, color: C.niebla }}>{m.ev}</span>
                <span style={{ fontFamily: MONO, fontSize: 11 }}>{m.inv}</span>
                {m.can ? (
                  <H as="button" type="button" onClick={() => acceptMile(m.id)} style={{ height: 34, borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 18px rgba(176,81,57,.45)" }} hover={{ background: C.oxidoHover }}>Aceptar hito</H>
                ) : <span />}
              </div>
            ))}
          </div>
        )}

        {/* ---------- Riesgos y cambios ---------- */}
        {tab === "Riesgos y cambios" && (
          <div style={{ display: "grid", gridTemplateColumns: "480px minmax(0,1fr)", gap: 16 }}>
            <div style={{ ...GLASS, borderRadius: 28, padding: 22 }}>
              <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em", marginBottom: 14 }}>MATRIZ 3×3</div>
              <div style={{ display: "grid", gridTemplateColumns: "30px repeat(3,1fr)", gap: 6 }}>
                {matrix.map((c, i) => (
                  <div key={i} style={{ aspectRatio: c.ar, borderRadius: 12, background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: C.tenue }}>
                    {c.items.map((it) => <span key={it} style={{ width: 26, height: 26, borderRadius: "50%", background: C.papel, color: C.tinta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{it}</span>)}
                    {c.label}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", color: C.tenue, margin: "10px 0 0 36px" }}><span>IMPACTO →</span><span>↑ PROBABILIDAD</span></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ ...GLASS, borderRadius: 28, padding: 22 }}>
                <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em" }}>RIESGOS ABIERTOS</div>
                {RISKS.map(([n, t, lvl, c]) => (
                  <div key={n} style={{ display: "grid", gridTemplateColumns: "30px 1fr 110px", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(238,235,228,0.06)", alignItems: "center" }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.tenue }}>{n}</span>
                    <span style={{ fontSize: 14 }}>{t}</span>
                    <span style={ST}><StDot c={c} glow={false} />{lvl}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...GLASS, border: `1px solid ${C.oxido}`, boxShadow: "0 0 28px rgba(176,81,57,0.25)", borderRadius: 28, padding: 22 }}>
                <div style={LBL}>SOLICITUD DE CAMBIO · SC-02</div>
                <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em", marginTop: 6 }}>AGREGAR PEDIDOS PARA LLEVAR</div>
                <div style={{ display: "flex", gap: 24, margin: "12px 0", fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em" }}><span>+1 SEMANA</span><span>+$12,000.00 MXN</span></div>
                <div style={{ display: "flex", gap: 6 }}>
                  <H as="button" type="button" onClick={() => flash("Cambio aprobado · fecha y precio actualizados")} style={{ height: 36, padding: "0 16px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }} hover={{ background: C.oxidoHover }}>Aprobar cambio</H>
                  <button type="button" onClick={() => flash("Solicitud de cambio rechazada")} style={{ height: 36, padding: "0 16px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.borde2}`, fontSize: 12, cursor: "pointer" }}>Rechazar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Horas ---------- */}
        {tab === "Horas" && (
          <div style={{ ...GLASS, borderRadius: 28, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>HORAS CONTRA ESTIMACIÓN</span>
              <span style={{ fontFamily: MONO, fontSize: 12 }}>118 / 190 H · 62 %</span>
            </div>
            {hours.map((h) => (
              <div key={h.a} style={{ display: "grid", gridTemplateColumns: "260px 90px 1fr 110px", gap: 14, alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(238,235,228,0.06)" }}>
                <span style={{ fontSize: 14 }}>{h.a}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{h.who}</span>
                <span style={{ position: "relative", height: 10, borderRadius: 5, background: C.p3, display: "block" }}>
                  <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${h.w}%`, borderRadius: 5, background: h.c, boxShadow: `0 0 10px ${h.c}`, transformOrigin: "left", animation: "growX 1s ease both" }} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 11, textAlign: "right", color: h.tc }}>{h.v}</span>
              </div>
            ))}
          </div>
        )}

        {/* ---------- Cierre ---------- */}
        {tab === "Cierre" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16 }}>
              {CLOSING.map(([t, s, st]) => (
                <div key={t} style={{ ...GLASS, borderRadius: 28, padding: 22, minHeight: 220 }}>
                  <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em" }}>{t}</div>
                  <div style={{ fontSize: 13, color: C.niebla, marginTop: 8, lineHeight: 1.5 }}>{s}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue, marginTop: 16 }}>{st}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, fontSize: 14, color: C.tenue }}>El cierre se habilita cuando el hito 4 se acepta; al cerrar, el proyecto pasa a Evolucionar.</div>
          </>
        )}

        {/* ---------- Vista del cliente ---------- */}
        {tab === "Vista del cliente" && (
          <div style={{ background: C.papel, color: C.tinta, borderRadius: 28, padding: 34, animation: "rise .6s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.acero }}>VISTA DEL CLIENTE · SOLO LECTURA</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.acero }}><RGlyph active={2} size={16} base={C.tinta} /> Ronin Studio</span>
            </div>
            <div style={{ fontWeight: 900, fontSize: 36, letterSpacing: "-0.02em", marginTop: 10 }}>PLATAFORMA DE OPERACIÓN · NEGOCIO DEMO 2</div>
            <div style={{ fontWeight: 300, fontSize: 16, color: C.acero }}>Etapa 03 · Construir · avance 62 %</div>
            <div style={{ height: 4, borderRadius: 2, background: "#D6D2C9", margin: "18px 0 24px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: "62%", background: C.oxido, transformOrigin: "left", animation: "growX 1.2s ease both" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}>
              {clientMiles.map((m) => (
                <div key={m.n} style={{ background: "#F7F5F0", border: "1px solid #D6D2C9", borderRadius: 20, padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.acero }}>HITO {m.n} · {m.date}</span>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{m.t}</span>
                  <span style={ST}><StDot c={m.c} glow={false} />{m.st}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.acero }}>{m.inv}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, borderTop: "1px solid #D6D2C9", paddingTop: 16, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span>Reporte semanal · 2 de noviembre</span>
              <span style={{ color: C.acero }}>Módulo de punto de venta en pruebas con casos reales. Sin cambios de alcance.</span>
            </div>
          </div>
        )}
      </section>
      {modal && (
        <>
          <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(7,9,12,0.6)", zIndex: 60 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 520, background: "rgba(19,23,29,0.92)", backdropFilter: "blur(28px)", border: "1px solid rgba(238,235,228,0.12)", borderRadius: 28, padding: 26, zIndex: 61, display: "flex", flexDirection: "column", gap: 12, animation: "rise .3s ease both" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>{modal === "nuevo" ? "PROYECTOS · ENTRA EN 01 · MAPEAR" : "PLATAFORMA DE OPERACIÓN · NEGOCIO DEMO 2"}</div>
            <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em" }}>{modal === "nuevo" ? "NUEVO PROYECTO" : "REGISTRAR HORAS"}</div>
            {modal === "nuevo" ? (
              <>
                {([["Proyecto", "name", "Plataforma de operación"], ["Cliente", "client", "Negocio demo 14"], ["Siguiente paso · fecha", "next", "12 nov"]] as [string, keyof typeof nuevo, string][]).map(([l, k, ph]) => (
                  <label key={k} style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>{l}
                    <input value={nuevo[k]} onChange={(e) => setNuevo((n) => ({ ...n, [k]: e.target.value }))} placeholder={ph} style={{ height: 44, padding: "0 16px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 13, outline: "none" }} />
                  </label>
                ))}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Sector
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["Restaurante con sucursales", "Clínica", "Escuela privada", "Gimnasio", "Taller", "Manufactura"].map((o) => { const a = nuevo.sector === o; return <button key={o} type="button" onClick={() => setNuevo((n) => ({ ...n, sector: o }))} style={{ height: 36, padding: "0 14px", borderRadius: 999, border: `1px solid ${a ? C.papel : C.borde}`, background: a ? C.papel : "transparent", color: a ? C.tinta : C.papel, fontSize: 12.5, cursor: "pointer" }}>{o}</button>; })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Horas
                  <input value={horas.h} onChange={(e) => setHoras((x) => ({ ...x, h: e.target.value }))} inputMode="decimal" style={{ height: 44, padding: "0 16px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 13, outline: "none" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Qué se hizo
                  <input value={horas.que} onChange={(e) => setHoras((x) => ({ ...x, que: e.target.value }))} placeholder="Pruebas del módulo POS en sucursal 1" style={{ height: 44, padding: "0 16px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 13, outline: "none" }} />
                </label>
                <div style={{ fontSize: 12.5, color: C.tenue }}>Se suman a la pestaña Horas y al margen del proyecto en Finanzas.</div>
              </>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
              <button type="button" onClick={() => setModal(null)} style={{ height: 44, padding: "0 18px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.borde2}`, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <H as="button" type="button" onClick={() => { if (modal === "nuevo") crearProyecto(); else { setModal(null); flash(`${horas.h || "0"} h registradas`); } }} style={{ height: 44, padding: "0 20px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 22px rgba(176,81,57,.4)" }} hover={{ background: C.oxidoHover }}>{modal === "nuevo" ? "Crear proyecto" : "Guardar horas"}</H>
            </div>
          </div>
        </>
      )}
    </>
  );
}
