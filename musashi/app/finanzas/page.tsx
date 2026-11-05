"use client";
import React, { useMemo, useState } from "react";
import { C, MONO } from "@/lib/tokens";
import { H } from "@/components/ui";

/* ---------- Helpers locales (equivalen al script del prototipo) ---------- */
const f = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const GLASS: React.CSSProperties = { background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: "1px solid rgba(238,235,228,0.09)" };
const LEG: React.CSSProperties = { display: "flex", gap: 14, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.niebla };

const TABS = ["Estado de resultados", "Margen por proyecto", "Flujo de efectivo", "Costo de IA", "Reportes programados"];
const KPIS: [string, string, string, string][] = [["COBRADO", "$40,000", "+$10,000 VS OCT", C.olivo], ["MARGEN BRUTO", "45 %", "+5 PTS VS OCT", C.niebla], ["UTILIDAD", "$10,000", "+$6,000 VS OCT", C.olivo]];

/* Estado de resultados */
type LOpts = { total?: boolean; sub?: boolean; cost?: boolean };
const L = (k: string, a: number, b: number, o: LOpts = {}) => {
  const d = b ? Math.round(((a - b) / Math.abs(b)) * 100) : 0;
  return {
    k, a: f(a), b: f(b), d: (d > 0 ? "+" : "") + d + " %",
    dc: o.cost ? (d > 0 ? C.oxido : C.olivo) : d >= 0 ? C.olivo : C.oxido,
    fs: o.total ? 15 : 14, w: o.total ? 700 : 400, ind: o.sub ? 16 : 0, tc: o.sub ? C.niebla : C.papel,
    pad: o.total ? "14px 0" : "10px 0", line: o.total ? "rgba(238,235,228,0.16)" : "rgba(238,235,228,0.05)",
  };
};
const ER = [
  L("Ingresos cobrados", 40000, 30000, { total: true }),
  L("Horas al costo", 14000, 12000, { sub: true, cost: true }),
  L("Subcontratos", 5000, 4000, { sub: true, cost: true }),
  L("Herramientas por proyecto", 3000, 2000, { sub: true, cost: true }),
  L("Margen bruto", 18000, 12000, { total: true }),
  L("Gastos generales", 8000, 8000, { cost: true }),
  L("Utilidad", 10000, 4000, { total: true }),
];

/* 12 meses */
const MS = ["DIC", "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV"];
const IN = [20, 18, 22, 25, 24, 28, 26, 30, 28, 32, 30, 40];
const UT = [4, 3, 5, 6, 5, 7, 6, 8, 6, 8, 4, 10];
const MONTHS = MS.map((n, i) => ({
  n, a: (IN[i] / 40) * 100, b: (UT[i] / 40) * 100,
  ac: i === 11 ? C.olivo : "rgba(76,129,65,0.55)", bc: i === 11 ? C.papel : "rgba(238,235,228,0.4)",
  glow: i === 11 ? "0 0 20px rgba(76,129,65,.6)" : "none", lc: i === 11 ? C.papel : C.tenue, delay: 0.04 * i + "s",
}));

/* Margen por proyecto */
const PROJ: [string, string, number, number, number][] = [
  ["Plataforma de operación", "NEGOCIO DEMO 2", 60000, 90, 22000],
  ["Membresías y accesos", "NEGOCIO DEMO 5", 50000, 96, 28000],
  ["Órdenes de trabajo", "NEGOCIO DEMO 6", 45000, 88, 26000],
  ["Agenda y expediente", "NEGOCIO DEMO 4", 30000, 42, 14000],
  ["Acompañamiento mensual", "NEGOCIO DEMO 3", 20000, 6, 2000],
  ["Diagnóstico completo", "NEGOCIO DEMO 7", 10000, 6, 2500],
];
type PRow = { p: string; c: string; i: number; h: number; k: number; m: number; pct: number };
const KEYS: (keyof PRow)[] = ["p", "i", "h", "k", "m", "pct"];
const MHEAD = ["PROYECTO", "INGRESO", "HORAS", "COSTO", "MARGEN $", "MARGEN %"];
const MGRID = "1.8fr 1fr 0.7fr 1fr 1fr 1.3fr";

/* Flujo de efectivo */
const FL: [string, number, number, string][] = [["9 NOV", 18000, 6000, "F-0118"], ["16 NOV", 12500, 8000, "F-0120"], ["23 NOV", 0, 6000, "—"], ["30 NOV", 20000, 9000, "Acompañamiento"], ["7 DIC", 40000, 6000, "Hito 3"], ["14 DIC", 0, 8000, "—"], ["21 DIC", 25000, 6000, "Hito 4"], ["28 DIC", 20000, 12000, "Acompañamiento"]];
const FLOW = FL.map(([w, a, b, src], i) => ({
  w, src, a: (a / 40000) * 100, b: (b / 40000) * 100,
  net: (a - b >= 0 ? "+" : "−") + "$" + Math.abs(a - b).toLocaleString("en-US"), nc: a - b >= 0 ? C.papel : C.oxido, delay: 0.05 * i + "s",
}));

/* Costo de IA */
const AG: [string, number, number][] = [["Perfilador", 80, 200], ["Seguimiento", 150, 250], ["Mapeador", 120, 250], ["Planeador", 90, 200], ["Reportero", 60, 150], ["Cobrador", 40, 150], ["Analista", 50, 150], ["Investigador", 180, 250], ["Estratega", 90, 200], ["Guionista", 140, 250], ["Productor", 120, 300], ["Publicador", 30, 100], ["Analista de canal", 50, 150]];
const AI = AG.map(([n, v, t], i) => { const r = v / t; return { n, w: r * 100, c: r > 0.7 ? C.ambar : C.papel, tc: r > 0.7 ? C.ambar : C.niebla, v: "$" + v + " / $" + t, delay: 0.03 * i + "s" }; });

/* Reportes programados */
const RP: [number, string, string, string, string, string][] = [
  [1, "LUNES 8:00", "CORREO", "Resumen semanal", "Leads, llamadas, avance de proyectos y cobranza de la semana.", "Julio"],
  [2, "DÍA 1 · 9:00", "CORREO", "Estado de resultados mensual", "Ingresos, costos, margen y utilidad contra el mes anterior.", "Julio"],
  [3, "LUNES 9:00", "WHATSAPP", "Reporte semanal al cliente", "Avance, hitos y siguiente paso para cada proyecto activo.", "Clientes activos"],
  [4, "VIERNES 17:00", "CORREO", "Costo de IA por agente", "Tokens y costo de la semana contra el tope.", "Julio"],
];

export default function Finanzas() {
  const [tab, setTab] = useState(TABS[0]);
  const [sort, setSort] = useState(5);
  const [dir, setDir] = useState(-1);
  const [rep, setRep] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: false });

  const mrows = useMemo(() => {
    const rows: PRow[] = PROJ.map(([p, c, i, h, k]) => ({ p, c, i, h, k, m: i - k, pct: Math.round(((i - k) / i) * 100) }));
    const key = KEYS[sort];
    rows.sort((a, b) => (a[key] > b[key] ? 1 : -1) * dir);
    return rows.map((r) => ({ p: r.p, c: r.c, i: f(r.i), h: r.h + " H", k: f(r.k), m: f(r.m), pct: r.pct, pc: r.pct < 50 ? C.ambar : C.olivo, tc: r.pct < 50 ? C.ambar : C.papel }));
  }, [sort, dir]);

  const onSort = (i: number) => { setDir(sort === i ? -dir : -1); setSort(i); };

  return (
    <div style={{ paddingBottom: 56 }}>
      {/* Encabezado de pantalla + KPIs */}
      <section style={{ padding: "34px 32px 0", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}><span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)" }} />07 · FINANZAS · NOVIEMBRE 2026</div>
          <h1 style={{ margin: "8px 0 0", fontWeight: 900, fontSize: 44, letterSpacing: "-0.02em", lineHeight: 1 }}>FINANZAS</h1>
          <div style={{ fontWeight: 300, fontSize: 16, color: C.niebla, marginTop: 6 }}>Cifras de ejemplo en modo demo · pesos mexicanos</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {KPIS.map(([k, v, d, c]) => (
            <div key={k} style={{ minWidth: 170, padding: "14px 18px", borderRadius: 22, background: "rgba(34,39,46,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: "1px solid rgba(238,235,228,0.1)", boxShadow: "inset 0 1px 0 rgba(238,235,228,0.12)" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.niebla }}>{k}</div>
              <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em", marginTop: 4 }}>{v}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: c, marginTop: 2 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pestañas */}
      <nav style={{ display: "flex", gap: 6, padding: "22px 32px 0" }}>
        {TABS.map((l) => {
          const a = l === tab;
          return (
            <H key={l} as="button" type="button" onClick={() => setTab(l)}
              style={{ height: 44, padding: "0 18px", borderRadius: 999, border: `1px solid ${a ? C.papel : "rgba(238,235,228,0.09)"}`, background: a ? C.papel : "rgba(22,26,33,0.55)", color: a ? C.tinta : C.papel, fontSize: 13, cursor: "pointer" }}
              hover={{ borderColor: C.acero }}>
              {l}
            </H>
          );
        })}
      </nav>

      <section style={{ padding: "22px 32px 0" }}>
        {/* Estado de resultados */}
        {tab === "Estado de resultados" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)", gap: 16 }}>
            <div style={{ ...GLASS, borderRadius: 28, padding: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 80px", gap: 12, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue, paddingBottom: 10, borderBottom: "1px solid rgba(238,235,228,0.09)" }}>
                <span>CONCEPTO</span><span style={{ textAlign: "right" }}>NOVIEMBRE</span><span style={{ textAlign: "right" }}>OCTUBRE</span><span style={{ textAlign: "right" }}>VAR.</span>
              </div>
              {ER.map((r) => (
                <div key={r.k} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 80px", gap: 12, padding: r.pad, borderBottom: `1px solid ${r.line}`, alignItems: "center" }}>
                  <span style={{ fontSize: r.fs, fontWeight: r.w, paddingLeft: r.ind, color: r.tc }}>{r.k}</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, textAlign: "right", fontWeight: r.w }}>{r.a}</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, textAlign: "right", color: C.niebla }}>{r.b}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, textAlign: "right", color: r.dc }}>{r.d}</span>
                </div>
              ))}
            </div>
            <div style={{ ...GLASS, borderRadius: 28, padding: 24, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>12 MESES</span>
                <span style={LEG}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: C.olivo }} />COBRADO</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: C.papel }} />UTILIDAD</span>
                </span>
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(12,minmax(0,1fr))", gap: 10, alignItems: "end", marginTop: 20, minHeight: 300, borderBottom: `1px solid ${C.borde}` }}>
                {MONTHS.map((m) => (
                  <div key={m.n} style={{ height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, position: "relative" }}>
                    <span style={{ width: "42%", height: `${m.a}%`, borderRadius: "6px 6px 0 0", background: m.ac, boxShadow: m.glow, transformOrigin: "bottom", animation: "grow .9s cubic-bezier(.2,.7,.2,1) both", animationDelay: m.delay }} />
                    <span style={{ width: "42%", height: `${m.b}%`, borderRadius: "6px 6px 0 0", background: m.bc, transformOrigin: "bottom", animation: "grow .9s cubic-bezier(.2,.7,.2,1) both", animationDelay: m.delay }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12,minmax(0,1fr))", gap: 10, marginTop: 8 }}>
                {MONTHS.map((m) => <span key={m.n} style={{ textAlign: "center", fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: m.lc }}>{m.n}</span>)}
              </div>
            </div>
          </div>
        )}

        {/* Margen por proyecto */}
        {tab === "Margen por proyecto" && (
          <div style={{ ...GLASS, borderRadius: 24, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: MGRID, gap: 16, padding: "14px 22px", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>
              {MHEAD.map((label, i) => (
                <button key={label} type="button" onClick={() => onSort(i)} style={{ background: "none", border: "none", padding: 0, textAlign: i === 0 || i === 5 ? "left" : "right", fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: sort === i ? C.papel : C.tenue, cursor: "pointer" }}>
                  {label + (sort === i ? (dir < 0 ? " ↓" : " ↑") : "")}
                </button>
              ))}
            </div>
            {mrows.map((r) => (
              <div key={r.p} style={{ display: "grid", gridTemplateColumns: MGRID, gap: 16, padding: "14px 22px", borderBottom: "1px solid rgba(238,235,228,0.06)", alignItems: "center" }}>
                <div><div style={{ fontSize: 14 }}>{r.p}</div><div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.tenue, marginTop: 3 }}>{r.c}</div></div>
                <span style={{ fontFamily: MONO, fontSize: 12, textAlign: "right" }}>{r.i}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, textAlign: "right", color: C.niebla }}>{r.h}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, textAlign: "right", color: C.niebla }}>{r.k}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, textAlign: "right" }}>{r.m}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ flex: 1, height: 6, borderRadius: 3, background: C.p3, overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${r.pct}%`, background: r.pc, transformOrigin: "left", animation: "growX .9s ease both" }} />
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 12, width: 40, textAlign: "right", color: r.tc }}>{r.pct} %</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Flujo de efectivo */}
        {tab === "Flujo de efectivo" && (
          <div style={{ ...GLASS, borderRadius: 28, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>PRÓXIMAS 8 SEMANAS</span>
              <span style={LEG}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: C.olivo }} />COBROS POR HITO</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: C.acero }} />GASTOS PREVISTOS</span>
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8,minmax(0,1fr))", gap: 14, alignItems: "end", height: 320, marginTop: 22, borderBottom: `1px solid ${C.borde}` }}>
              {FLOW.map((fl) => (
                <div key={fl.w} style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: fl.nc }}>{fl.net}</span>
                  <div style={{ width: "100%", height: "85%", display: "flex", alignItems: "flex-end", gap: 4, justifyContent: "center" }}>
                    <span style={{ width: "38%", height: `${fl.a}%`, borderRadius: "8px 8px 0 0", background: C.olivo, boxShadow: "0 0 16px rgba(76,129,65,.4)", transformOrigin: "bottom", animation: "grow .9s ease both", animationDelay: fl.delay }} />
                    <span style={{ width: "38%", height: `${fl.b}%`, borderRadius: "8px 8px 0 0", background: C.acero, transformOrigin: "bottom", animation: "grow .9s ease both", animationDelay: fl.delay }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8,minmax(0,1fr))", gap: 14, marginTop: 10 }}>
              {FLOW.map((fl) => (
                <div key={fl.w} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.niebla }}>{fl.w}</div>
                  <div style={{ fontSize: 11, color: C.tenue, marginTop: 2 }}>{fl.src}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Costo de IA */}
        {tab === "Costo de IA" && (
          <div style={{ ...GLASS, borderRadius: 28, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>TOKENS POR AGENTE · NOVIEMBRE</span>
              <span style={{ fontFamily: MONO, fontSize: 12 }}>$1,200.00 / $3,000.00 MXN</span>
            </div>
            {AI.map((a) => (
              <div key={a.n} style={{ display: "grid", gridTemplateColumns: "160px 1fr 150px", gap: 14, alignItems: "center", padding: "8px 0" }}>
                <span style={{ fontSize: 13 }}>{a.n}</span>
                <span style={{ position: "relative", height: 12, borderRadius: 6, background: C.p3 }}>
                  <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${a.w}%`, borderRadius: 6, background: a.c, boxShadow: `0 0 10px ${a.c}`, transformOrigin: "left", animation: "growX 1s ease both", animationDelay: a.delay }} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 11, textAlign: "right", color: a.tc }}>{a.v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reportes programados */}
        {tab === "Reportes programados" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16 }}>
            {RP.map(([id, when, ch, t, d, to]) => {
              const on = rep[id];
              return (
                <div key={id} style={{ ...GLASS, borderRadius: 26, padding: 22, display: "flex", flexDirection: "column", gap: 10, opacity: on ? 1 : 0.55, transition: "opacity .3s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>{when} · {ch}</span>
                    <button type="button" onClick={() => setRep((x) => ({ ...x, [id]: !x[id] }))} style={{ width: 46, height: 26, borderRadius: 999, border: "none", background: on ? C.olivo : "#2A2F36", position: "relative", cursor: "pointer", transition: "background .25s" }}>
                      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: C.papel, transition: "left .25s" }} />
                    </button>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.01em", textTransform: "uppercase" }}>{t}</div>
                  <div style={{ fontSize: 13, color: C.niebla }}>{d}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.niebla }}>PARA: {to}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
