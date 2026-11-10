"use client";
import MarketingReal from "./real";
import { useModo, Cargando } from "@/components/real";
import React, { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { C, MONO, SANS } from "@/lib/tokens";
import { H, Dot } from "@/components/ui";
import { useUI, PageHead } from "@/components/shell";

/* ---------- Datos demo (idénticos al prototipo) ---------- */
const ST: Record<string, string> = { IDEA: C.tenue, GUION: C.niebla, "PRODUCCIÓN": C.ambar, "APROBACIÓN": C.oxido, PROGRAMADA: C.papel, PUBLICADA: C.olivo };
const DAYS = ["LUN 2", "MAR 3", "MIÉ 4", "JUE 5", "VIE 6", "SÁB 7", "DOM 8"];
const CHN = ["INSTAGRAM", "YOUTUBE", "TIKTOK", "LINKEDIN"];
const MONTH_HEAD = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
type Piece = { c: number; d: number; type: string; hook: string; st: string };
const PIECES: Piece[] = [
  { c: 0, d: 0, type: "CARRUSEL", hook: "El chatbot que nadie usa", st: "PUBLICADA" },
  { c: 3, d: 1, type: "POST", hook: "Primero el flujo. Después la IA.", st: "PUBLICADA" },
  { c: 2, d: 3, type: "VIDEO", hook: "Lo que pierdes copiando la misma orden tres veces", st: "APROBACIÓN" },
  { c: 1, d: 4, type: "VIDEO", hook: "Cómo mapeamos una cocina en una mañana", st: "PRODUCCIÓN" },
  { c: 0, d: 5, type: "CARRUSEL", hook: "Cuatro señales de que tu operación vive en WhatsApp", st: "GUION" },
  { c: 3, d: 6, type: "POST", hook: "Cuánto cuesta no ordenar el flujo", st: "IDEA" },
];
const PROPS = [
  { id: 1, agent: "ESTRATEGA", kind: "CALENDARIO", title: "Calendario de la semana 46", body: "5 piezas sobre el costo de no ordenar el flujo: 2 carruseles (IG), 2 videos (TT, YT) y 1 post (LI). Sector foco: clínicas." },
  { id: 2, agent: "GUIONISTA", kind: "GUION", title: "Video · El chatbot que nadie usa", body: "00:00 Gancho: “Le pusieron IA a un negocio que todavía anota en libreta.” 00:03 Contexto, 00:15 el flujo real, 00:35 cierre con diagnóstico exprés." },
  { id: 3, agent: "PRODUCTOR", kind: "APOYOS", title: "Tomas y voz · Cocina en una mañana", body: "6 tomas B/N generadas, voz en off de 45 segundos y subtítulos en español. Listo para edición final." },
  { id: 4, agent: "PUBLICADOR", kind: "PUBLICACIÓN", title: "Programar en TikTok · jueves 19:00", body: "Publicar “Lo que pierdes copiando la misma orden tres veces” hoy a las 19:00 con texto y hashtags aprobados." },
];
const MONTH_PLAN: Record<number, string[]> = { 2: ["PUBLICADA"], 3: ["PUBLICADA"], 5: ["APROBACIÓN"], 6: ["PRODUCCIÓN"], 7: ["GUION"], 8: ["IDEA"], 10: ["IDEA"], 12: ["IDEA", "IDEA"], 17: ["IDEA"] };

const TABS = ["Calendario", "Campañas", "Pieza", "Aprobación", "Métricas"];
const VIEWS = ["Semana", "Mes"];
const PTABS = ["Gancho y guion", "Textos por red", "Apoyos", "Publicación", "Métricas"];

/* Celdas de tabla (equivalen a tx / mo / ch del prototipo) */
type TCell = { t: string; color: string; font: string; size: string; ls: string; w: number; dot: string | null; align: string };
const tx = (t: string, o: { c?: string; w?: number; a?: string } = {}): TCell => ({ t, color: o.c || C.papel, font: SANS, size: "14px", ls: "0", w: o.w || 400, dot: null, align: o.a || "flex-start" });
const mo = (t: string, o: { c?: string; a?: string } = {}): TCell => ({ t, color: o.c || C.niebla, font: MONO, size: "11px", ls: "0.08em", w: 400, dot: null, align: o.a || "flex-start" });

const W = "1.6fr 1.6fr 1fr 1fr 70px 120px 70px";
const CAMPAIGNS = {
  cols: W,
  head: ["CAMPAÑA", "OBJETIVO", "SECTOR", "FECHAS", "PIEZAS", "PAUTA", "LEADS"],
  rows: ([
    ["Flujo antes que IA", "Diagnósticos exprés", "Restaurantes", "2 – 30 NOV", "8", "$3,000.00 MXN", "5", "ACTIVA", C.olivo],
    ["El chatbot que nadie usa", "Llamadas agendadas", "Clínicas", "9 – 22 NOV", "4", "$2,000.00 MXN", "—", "PROGRAMADA", C.papel],
    ["Escuelas sin libreta", "Diagnósticos exprés", "Escuelas", "16 NOV – 6 DIC", "6", "$2,500.00 MXN", "—", "GUION", C.niebla],
    ["Talleres en orden", "Visitas al perfil", "Talleres", "1 – 31 OCT", "10", "$4,000.00 MXN", "7", "CERRADA", C.tenue],
  ] as string[][]).map((r) => ({ cols: W, cells: [{ ...tx(r[0], { w: 600 }), dot: r[8] }, tx(r[1], { c: C.niebla }), mo(r[2].toUpperCase()), mo(r[3]), mo(r[4], { c: C.papel }), mo(r[5], { c: C.papel }), mo(r[6], { c: C.papel })] })),
};
const W2 = "1.2fr repeat(6,minmax(0,1fr))";
const METRICS = {
  cols: W2,
  head: ["CANAL", "ALCANCE", "REPROD.", "RET. 3S", "COMPLETA", "CLICS", "DIAG. EXPRÉS"],
  rows: ([
    ["INSTAGRAM", "4,000", "—", "—", "—", "60", "2"], ["LINKEDIN", "1,500", "—", "—", "—", "30", "1"],
    ["TIKTOK", "3,000", "3,000", "60 %", "20 %", "20", "1"], ["YOUTUBE", "800", "800", "70 %", "30 %", "10", "0"],
  ] as string[][]).map((r) => ({ cols: W2, cells: r.map((v, i) => (i === 0 ? mo(v, { c: C.papel }) : mo(v, { c: i === 6 && v !== "0" ? C.papel : C.niebla }))) })),
};

const SCRIPT = ([
  ["00:00 – 00:03", "Tres veces. La misma orden. Tres personas distintas.", C.oxido, "20px", 600],
  ["00:03 – 00:12", "El mesero la anota, la cocina la vuelve a escribir y caja la captura otra vez al cobrar.", C.niebla, "16px", 400],
  ["00:12 – 00:28", "Cada copia es un lugar donde se pierde un dato. Ahí nacen las cuentas que no cuadran.", C.niebla, "16px", 400],
  ["00:28 – 00:40", "Primero ordenamos el flujo: una sola captura que llega a todos. Después, la IA.", C.niebla, "16px", 400],
  ["00:40 – 00:45", "Haz el diagnóstico exprés. Son 12 preguntas, 5 minutos.", C.papel, "16px", 600],
] as [string, string, string, string, number][]).map(([time, text, c, size, w]) => ({ time, text, c, size, w }));

const COPIES = ([
  ["INSTAGRAM", 182, 2200, "#restaurantes #juarez #operacion"], ["TIKTOK", 96, 2200, "#restaurantes #negocios"],
  ["LINKEDIN", 540, 3000, "#operaciones #pyme"], ["YOUTUBE", 88, 100, "#restaurantes #flujo"],
] as [string, number, number, string][]).map(([c, n, max, tags]) => ({
  ch: c, count: n.toLocaleString("en-US") + " / " + max.toLocaleString("en-US"), cc: n / max > 0.85 ? C.ambar : C.tenue, pct: Math.round((n / max) * 100), tags,
  text: c === "YOUTUBE" ? "Lo que pierdes copiando la misma orden tres veces · Ronin Studio" : "La misma orden se captura tres veces en muchos restaurantes de la frontera. Cada copia es un error posible. Primero el flujo. Después la IA.",
}));

const ASSETS = ([
  ["TOMA", "Cocina · comanda en papel", "mano anotando comanda, blanco y negro, contraste alto", "HIGGSFIELD"],
  ["TOMA", "Caja · captura doble", "pantalla de punto de venta, blanco y negro", "HIGGSFIELD"],
  ["VOZ", "Voz en off · 45 s", "guion aprobado, tono directo", "ELEVENLABS"],
  ["SUB", "Subtítulos ES", "transcripción del guion con tiempos", "GUIONISTA"],
] as string[][]).map(([kind, name, prompt, src]) => ({ kind, name, prompt, src }));

const PUBS = ([
  ["TIKTOK", "Jueves 5 de noviembre", "19:00", "POR APROBAR", C.oxido], ["INSTAGRAM", "Viernes 6 de noviembre", "13:00", "PROGRAMADA", C.papel],
  ["YOUTUBE", "Sábado 7 de noviembre", "10:00", "PROGRAMADA", C.papel], ["LINKEDIN", "—", "—", "NO APLICA", C.tenue],
] as string[][]).map(([ch, date, time, st, c]) => ({ ch, date, time, st, c }));

const BY_TYPE = ([["VIDEO", 3800, C.papel], ["CARRUSEL", 4000, C.papel], ["POST", 1500, C.acero]] as [string, number, string][]).map(([n, v, c]) => ({ n, v: v.toLocaleString("en-US"), w: v / 40, c }));
const HOOKS = ([["01", "El chatbot que nadie usa", "62 %"], ["02", "Lo que pierdes copiando la misma orden", "60 %"], ["03", "Primero el flujo. Después la IA.", "48 %"]] as string[][]).map(([n, t, r]) => ({ n, t, r }));

const LBL: CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em" };
const GLASS: CSSProperties = { background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: "1px solid rgba(238,235,228,0.09)", boxShadow: "inset 0 1px 0 rgba(238,235,228,0.08)" };

/* ---------- Tabla inline del prototipo ---------- */
function PTable({ table }: { table: { cols: string; head: string[]; rows: { cols: string; cells: TCell[] }[] } }) {
  return (
    <div style={{ ...GLASS, borderRadius: 24, overflow: "hidden", animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}>
      <div style={{ display: "grid", gridTemplateColumns: table.cols, gap: 16, padding: "14px 22px", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>
        {table.head.map((h) => <span key={h} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>{h}</span>)}
      </div>
      {table.rows.map((r, ri) => (
        <H key={ri} style={{ display: "grid", gridTemplateColumns: r.cols, gap: 16, padding: "14px 22px", borderBottom: "1px solid rgba(238,235,228,0.06)", alignItems: "center", transition: "background .2s" }} hover={{ background: "rgba(238,235,228,0.04)" }}>
          {r.cells.map((c, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: c.align, fontFamily: c.font, fontSize: c.size, letterSpacing: c.ls, fontWeight: c.w, color: c.color, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {c.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: c.dot, boxShadow: `0 0 8px ${c.dot}` }} />}
              {c.t}
            </span>
          ))}
        </H>
      ))}
    </div>
  );
}

function MarketingDemo() {
  const { flash } = useUI();
  const [tab, setTab] = useState("Calendario");
  const [view, setView] = useState("Semana");
  const [ptab, setPtab] = useState("Gancho y guion");
  const [propIds, setPropIds] = useState<number[]>(() => PROPS.map((p) => p.id));

  const legend = useMemo(() => Object.entries(ST).map(([n, c]) => ({ n, c })), []);

  /* Semana: 4 canales × 7 días, con retardo progresivo por pieza */
  const cal = useMemo(() => {
    let k = 0;
    return CHN.map((name, ci) => ({
      name,
      cells: DAYS.map((_, di) => {
        const p = PIECES.find((x) => x.c === ci && x.d === di);
        if (!p) return null;
        return { ...p, dot: ST[p.st], delay: `${0.05 * k++}s`, border: p.st === "APROBACIÓN" ? C.oxido : "rgba(238,235,228,0.09)", glow: p.st === "APROBACIÓN" ? "0 0 30px rgba(176,81,57,0.35)" : "none" };
      }),
    }));
  }, []);

  /* Mes: 35 casillas, noviembre, hoy = 5 */
  const month = useMemo(() => Array.from({ length: 35 }, (_, i) => {
    const n = i - 5; const valid = n >= 1 && n <= 30; const today = n === 5;
    return { n: valid ? String(n) : "", dots: valid && MONTH_PLAN[n] ? MONTH_PLAN[n].map((x) => ST[x]) : [], bg: today ? "rgba(238,235,228,0.08)" : valid ? "rgba(22,26,33,0.5)" : "transparent", border: today ? C.papel : valid ? "rgba(238,235,228,0.07)" : "transparent", color: today ? C.papel : C.tenue };
  }), []);

  const props = useMemo(() => PROPS.filter((p) => propIds.includes(p.id)), [propIds]);
  const rmProp = (id: number) => setPropIds((x) => x.filter((y) => y !== id));

  const isCal = tab === "Calendario", isPiece = tab === "Pieza", isApprove = tab === "Aprobación", isMetrics = tab === "Métricas";
  const showTable = tab === "Campañas" || tab === "Métricas";

  return (
    <>
      <PageHead
        stage={1}
        eyebrow="02 · MARKETING Y CONTENIDO"
        title="MARKETING"
        sub="Semana del 2 al 8 de noviembre · 5 piezas planeadas · 1 idea"
        style={{ paddingTop: 34, gap: 24, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}
        right={
          <H as={Link as unknown as "a"} {...({ href: "/estudio" } as object)}
            style={{ height: 48, padding: "0 22px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 28px rgba(176,81,57,.45)", display: "flex", alignItems: "center" }}
            hover={{ background: C.oxidoHover }}>
            Nueva pieza · Estudio
          </H>
        }
      />

      {/* Pestañas */}
      <nav style={{ display: "flex", gap: 6, padding: "22px 32px 0" }}>
        {TABS.map((l) => {
          const a = l === tab;
          return (
            <H key={l} as="button" type="button" onClick={() => setTab(l)}
              style={{ height: 44, padding: "0 18px", borderRadius: 999, border: `1px solid ${a ? C.papel : "rgba(238,235,228,0.09)"}`, background: a ? C.papel : "rgba(22,26,33,0.55)", color: a ? C.tinta : C.papel, fontSize: 13, cursor: "pointer", backdropFilter: "blur(14px)" }}
              hover={a ? {} : { borderColor: C.acero }}>
              {l}
            </H>
          );
        })}
      </nav>

      <section style={{ padding: "24px 32px 56px" }}>
        {/* ---------- Calendario ---------- */}
        {isCal && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ display: "flex", padding: 4, borderRadius: 999, background: "rgba(22,26,33,0.55)", border: "1px solid rgba(238,235,228,0.09)" }}>
                {VIEWS.map((v) => {
                  const a = v === view;
                  return <button key={v} type="button" onClick={() => setView(v)} style={{ height: 34, padding: "0 16px", borderRadius: 999, border: "none", background: a ? C.papel : "transparent", color: a ? C.tinta : C.niebla, fontSize: 12, cursor: "pointer" }}>{v}</button>;
                })}
              </div>
              <div style={{ display: "flex", gap: 14, marginLeft: "auto" }}>
                {legend.map((l) => (
                  <span key={l.n} style={{ display: "flex", alignItems: "center", gap: 6, ...LBL, color: C.niebla }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.c, boxShadow: `0 0 8px ${l.c}` }} />{l.n}
                  </span>
                ))}
              </div>
            </div>

            {view === "Semana" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "120px repeat(7,minmax(0,1fr))", gap: 8 }}>
                  <span />
                  {DAYS.map((label, i) => {
                    const today = i === 3;
                    return <div key={label} style={{ padding: "10px 12px", borderRadius: 14, background: today ? C.papel : "rgba(22,26,33,0.55)", color: today ? C.tinta : C.niebla, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", boxShadow: today ? "0 0 24px rgba(238,235,228,0.3)" : "none" }}>{label}</div>;
                  })}
                </div>
                {cal.map((row) => (
                  <div key={row.name} style={{ display: "grid", gridTemplateColumns: "120px repeat(7,minmax(0,1fr))", gap: 8, marginTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.niebla, borderTop: "1px solid rgba(238,235,228,0.08)" }}>{row.name}</div>
                    {row.cells.map((c, di) => (
                      <div key={di} style={{ minHeight: 136, borderRadius: 18, border: "1px dashed rgba(238,235,228,0.06)", position: "relative" }}>
                        {c && (
                          <H as="button" type="button" onClick={() => setTab("Pieza")}
                            style={{ position: "absolute", inset: 0, textAlign: "left", borderRadius: 18, background: "rgba(22,26,33,0.6)", backdropFilter: "blur(18px)", border: `1px solid ${c.border}`, boxShadow: c.glow, padding: 12, display: "flex", flexDirection: "column", gap: 8, color: C.papel, cursor: "pointer", animation: "rise .5s cubic-bezier(.2,.7,.2,1) both", animationDelay: c.delay, transition: "transform .25s" }}
                            hover={{ transform: "translateY(-3px)" }}>
                            <span style={{ ...LBL, color: C.tenue }}>{c.type}</span>
                            <span style={{ fontSize: 13, lineHeight: 1.35, flex: 1, textWrap: "pretty" }}>{c.hook}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 6, ...LBL }}><Dot color={c.dot} />{c.st}</span>
                          </H>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}

            {view === "Mes" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 8 }}>
                {MONTH_HEAD.map((h) => <span key={h} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue, padding: "0 4px" }}>{h}</span>)}
                {month.map((d, i) => (
                  <div key={i} style={{ height: 96, borderRadius: 16, background: d.bg, border: `1px solid ${d.border}`, padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: d.color }}>{d.n}</span>
                    <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {d.dots.map((x, j) => <span key={j} style={{ width: 8, height: 8, borderRadius: "50%", background: x, boxShadow: `0 0 8px ${x}` }} />)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---------- Campañas / Métricas (tabla) ---------- */}
        {showTable && <PTable table={isMetrics ? METRICS : CAMPAIGNS} />}

        {/* ---------- Pieza ---------- */}
        {isPiece && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 16 }}>
            <div style={{ ...GLASS, borderRadius: 28, padding: 26, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}>
              <div style={{ display: "flex", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}><span>VIDEO</span><span>·</span><span>TIKTOK</span><span>·</span><span>CAMPAÑA FLUJO ANTES QUE IA</span></div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 8 }}>
                <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: "-0.02em", textTransform: "uppercase" }}>Lo que pierdes copiando la misma orden tres veces</div>
                <span style={{ display: "flex", alignItems: "center", gap: 6, ...LBL, padding: "8px 12px", borderRadius: 999, border: `1px solid ${C.oxido}`, whiteSpace: "nowrap" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.oxido, animation: "blink 1.6s infinite" }} />APROBACIÓN
                </span>
              </div>
              <div style={{ display: "flex", gap: 4, margin: "20px 0 18px", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>
                {PTABS.map((l) => {
                  const a = l === ptab;
                  return <button key={l} type="button" onClick={() => setPtab(l)} style={{ height: 40, padding: "0 14px", background: "none", border: "none", borderBottom: `2px solid ${a ? C.oxido : "transparent"}`, color: a ? C.papel : C.tenue, fontSize: 13, cursor: "pointer" }}>{l}</button>;
                })}
              </div>

              {ptab === "Gancho y guion" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {SCRIPT.map((l) => (
                    <div key={l.time} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 18, padding: "12px 0", borderBottom: "1px solid rgba(238,235,228,0.06)" }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: l.c }}>{l.time}</span>
                      <span style={{ fontSize: l.size, lineHeight: 1.45, fontWeight: l.w, textWrap: "pretty" }}>{l.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {ptab === "Textos por red" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
                  {COPIES.map((c) => (
                    <div key={c.ch} style={{ background: "rgba(12,15,20,0.45)", border: "1px solid rgba(238,235,228,0.08)", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", ...LBL, color: C.tenue }}><span>{c.ch}</span><span style={{ color: c.cc }}>{c.count}</span></div>
                      <div style={{ fontSize: 13, lineHeight: 1.5, color: C.papel, textWrap: "pretty" }}>{c.text}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: C.niebla }}>{c.tags}</div>
                      <div style={{ height: 3, borderRadius: 2, background: C.p3, overflow: "hidden" }}><div style={{ height: "100%", width: `${c.pct}%`, background: C.papel, transformOrigin: "left", animation: "growX .9s ease both" }} /></div>
                    </div>
                  ))}
                </div>
              )}

              {ptab === "Apoyos" && ASSETS.map((a) => (
                <div key={a.name} style={{ display: "grid", gridTemplateColumns: "52px 1fr auto", gap: 16, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(238,235,228,0.06)" }}>
                  <span style={{ width: 52, height: 52, borderRadius: 14, background: C.p3, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.niebla }}>{a.kind}</span>
                  <div><div style={{ fontSize: 14 }}>{a.name}</div><div style={{ fontSize: 12, color: C.tenue, marginTop: 3 }}>Prompt: {a.prompt}</div></div>
                  <span style={{ ...LBL, color: C.niebla }}>{a.src}</span>
                </div>
              ))}

              {ptab === "Publicación" && PUBS.map((p) => (
                <div key={p.ch} style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr auto", gap: 16, alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(238,235,228,0.06)" }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.niebla }}>{p.ch}</span>
                  <span style={{ fontSize: 14 }}>{p.date}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12 }}>{p.time}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, ...LBL }}><Dot color={p.c} />{p.st}</span>
                </div>
              ))}

              {ptab === "Métricas" && <div style={{ padding: "30px 0", fontSize: 14, color: C.tenue }}>Las métricas aparecen aquí 24 horas después de publicar la pieza.</div>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ aspectRatio: "9/14", borderRadius: 28, background: `linear-gradient(160deg,${C.p3},${C.tinta})`, border: "1px solid rgba(238,235,228,0.09)", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", padding: 20 }}>
                <span style={{ position: "absolute", top: 16, left: 16, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>VISTA PREVIA · 9:16 · 0:45</span>
                <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 64, height: 64, borderRadius: "50%", background: "rgba(238,235,228,0.14)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>▶</span>
                <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em", textTransform: "uppercase", lineHeight: 1.05 }}>Tres veces la misma orden.</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <H as="button" type="button" onClick={() => flash("Pieza aprobada · se publica a las 19:00")}
                  style={{ flex: 1, height: 48, borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 24px rgba(176,81,57,.45)" }}
                  hover={{ background: C.oxidoHover }}>
                  Aprobar pieza
                </H>
                <button type="button" onClick={() => flash("Borrador guardado")} style={{ height: 48, padding: "0 18px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.borde2}`, fontSize: 14, cursor: "pointer" }}>Editar</button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Aprobación ---------- */}
        {isApprove && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16 }}>
              {props.map((p, i) => (
                <div key={p.id} style={{ background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: `1px solid ${i === 0 ? C.oxido : "rgba(238,235,228,0.09)"}`, boxShadow: i === 0 ? "0 0 30px rgba(176,81,57,0.3)" : "none", borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 12, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both", animationDelay: `${0.06 * i}s` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", ...LBL, color: C.tenue }}><span>BORRADOR DE IA · {p.agent} · CLAUDE</span><span>{p.kind}</span></div>
                  <div style={{ fontWeight: 900, fontSize: 19, letterSpacing: "-0.01em", textTransform: "uppercase" }}>{p.title}</div>
                  <div style={{ background: "rgba(12,15,20,0.5)", border: `1px dashed ${C.borde2}`, borderRadius: 16, padding: 14, fontSize: 13, lineHeight: 1.5, color: C.niebla, textWrap: "pretty" }}>{p.body}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <H as="button" type="button" onClick={() => { rmProp(p.id); flash("Aprobado · " + p.agent.toLowerCase()); }}
                      style={{ height: 38, padding: "0 18px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                      hover={{ background: C.oxidoHover }}>
                      Aprobar
                    </H>
                    <button type="button" onClick={() => flash("Abriendo editor de la propuesta")} style={{ height: 38, padding: "0 18px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.borde2}`, fontSize: 13, cursor: "pointer" }}>Editar</button>
                    <button type="button" onClick={() => { rmProp(p.id); flash("Propuesta descartada"); }} style={{ height: 38, padding: "0 14px", borderRadius: 999, background: "transparent", color: C.niebla, border: "none", fontSize: 13, cursor: "pointer" }}>Descartar</button>
                  </div>
                </div>
              ))}
            </div>
            {props.length === 0 && <div style={{ fontSize: 14, color: C.tenue, padding: "20px 0" }}>Nada por aprobar. El Estratega propone el calendario cada viernes.</div>}
          </>
        )}

        {/* ---------- Métricas (paneles) ---------- */}
        {isMetrics && (
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
            <div style={{ background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: "1px solid rgba(238,235,228,0.09)", borderRadius: 28, padding: 24 }}>
              <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>ALCANCE POR TIPO DE PIEZA</div>
              {BY_TYPE.map((b) => (
                <div key={b.n} style={{ display: "grid", gridTemplateColumns: "100px 1fr 70px", gap: 12, alignItems: "center", marginTop: 16 }}>
                  <span style={{ ...LBL, color: C.niebla }}>{b.n}</span>
                  <span style={{ height: 22, borderRadius: 999, background: C.p2, overflow: "hidden", display: "block" }}>
                    <span style={{ display: "block", height: "100%", width: `${b.w}%`, background: b.c, borderRadius: 999, transformOrigin: "left", animation: "growX 1s cubic-bezier(.2,.7,.2,1) both" }} />
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 12, textAlign: "right" }}>{b.v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: "1px solid rgba(238,235,228,0.09)", borderRadius: 28, padding: 24 }}>
              <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>MEJORES GANCHOS DE LA SEMANA</div>
              {HOOKS.map((h) => (
                <div key={h.n} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(238,235,228,0.06)", alignItems: "center" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.tenue }}>{h.n}</span>
                  <span style={{ fontSize: 14 }}>{h.t}</span>
                  <span style={{ ...LBL, color: C.niebla }}>RET. 3S {h.r}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default function Marketing() {
  const modo = useModo();
  if (modo === "cargando") return <Cargando />;
  return modo === "db" ? <MarketingReal /> : <MarketingDemo />;
}
