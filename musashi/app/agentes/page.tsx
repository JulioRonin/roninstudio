"use client";
import React, { useMemo, useState } from "react";
import { C, MONO } from "@/lib/tokens";
import { H } from "@/components/ui";
import { useUI } from "@/components/shell";

/* ---------- Datos demo (los mismos del prototipo) ---------- */
// [grupo, nombre, qué hace, disparo, modelo, última, costo, tope, actúa solo, trabajando]
type AgentRow = [string, string, string, string, string, string, number, number, string | false, boolean];
const AG: AgentRow[] = [
  ["OPERACIÓN", "Perfilador", "Resume cada cliente en cinco líneas", "Nuevo lead o llamada", "CLAUDE", "HOY 09:10", 80, 200, false, false],
  ["OPERACIÓN", "Seguimiento", "Prepara mensajes del siguiente paso", "Tarea con canal", "CLAUDE", "HOY 08:00", 150, 250, false, true],
  ["OPERACIÓN", "Mapeador", "Primer borrador del mapa de flujo", "Visita terminada", "CLAUDE", "22 OCT", 120, 250, false, false],
  ["OPERACIÓN", "Planeador", "Acta, EDT y Gantt desde el diagnóstico", "Plan aprobado", "CLAUDE", "05 OCT", 90, 200, false, false],
  ["OPERACIÓN", "Reportero", "Reporte semanal para cada cliente", "Lunes 9:00", "CLAUDE", "02 NOV", 60, 150, false, false],
  ["OPERACIÓN", "Cobrador", "Recordatorios de factura", "Vencimiento de factura", "CLAUDE", "HOY 07:30", 40, 150, "SEGUNDO AVISO", false],
  ["OPERACIÓN", "Analista", "Margen y desviaciones por proyecto", "Cierre de semana", "CLAUDE", "01 NOV", 50, 150, false, false],
  ["INVESTIGACIÓN", "Investigador", "Informe semanal de prácticas y competencia", "Viernes 7:00", "CLAUDE", "30 OCT", 180, 250, false, true],
  ["MARKETING", "Estratega", "Calendario editorial de la semana", "Viernes 12:00", "CLAUDE", "30 OCT", 90, 200, false, false],
  ["MARKETING", "Guionista", "Ganchos y guiones con tiempos", "Pieza en guion", "CLAUDE", "HOY 10:20", 140, 250, false, true],
  ["MARKETING", "Productor", "Tomas, voz y subtítulos", "Guion aprobado", "HIGGSFIELD · ELEVENLABS", "04 NOV", 120, 300, false, false],
  ["MARKETING", "Publicador", "Publica a la hora aprobada", "Pieza programada", "CLAUDE", "03 NOV", 30, 100, "HORA APROBADA", false],
  ["MARKETING", "Analista de canal", "Métricas por canal y mejores ganchos", "Lunes 8:00", "CLAUDE", "02 NOV", 50, 150, false, false],
];
const GROUPS = ["OPERACIÓN", "INVESTIGACIÓN", "MARKETING"];
const TABS = ["Panel", "Historial de propuestas", "Informe del Investigador", "Prueba de modelos"];

// [fecha, agente, cliente, propuesta, resultado, color, costo, antes, después]
type HistRow = [string, string, string, string, string, string, string, string, string];
const HIST: HistRow[] = [
  ["05 NOV", "COBRADOR", "Negocio demo 2", "Recordatorio F-0112 por WhatsApp", "POR APROBAR", C.oxido, "$0.40", "Hola, te comparto el recordatorio de la factura F-0112 por $25,000.00 MXN, vencida el 2 de noviembre.", "Pendiente de aprobación."],
  ["04 NOV", "GUIONISTA", "Campaña Flujo antes que IA", "Guion · la misma orden tres veces", "CAMBIADO", C.ambar, "$1.20", "Gancho: “¿Cuántas veces escribes la misma orden?”", "Gancho: “Tres veces. La misma orden. Tres personas distintas.”"],
  ["04 NOV", "PERFILADOR", "Negocio demo 1", "Resumen de cinco líneas", "APROBADO", C.olivo, "$0.30", "Escuela privada de 60 personas con dos planteles en Juárez…", "Aprobado sin cambios."],
  ["03 NOV", "SEGUIMIENTO", "Negocio demo 9", "Agendar llamada de 15 minutos", "APROBADO", C.olivo, "$0.20", "¿Te queda bien el jueves a las 11:30 para una llamada de 15 minutos?", "Aprobado sin cambios · enviado por WhatsApp."],
  ["02 NOV", "REPORTERO", "Negocio demo 2", "Reporte semanal", "CAMBIADO", C.ambar, "$0.60", "Avance 60 %, hito 3 en curso.", "Avance 62 %, hito 3 en curso, sin cambios de alcance."],
  ["30 OCT", "ESTRATEGA", "Semana 45", "Calendario de 5 piezas", "APROBADO", C.olivo, "$0.90", "5 piezas: 2 carruseles, 2 videos, 1 post.", "Aprobado sin cambios."],
  ["29 OCT", "PUBLICADOR", "Campaña Talleres en orden", "Publicar carrusel en LinkedIn", "DESCARTADO", C.acero, "$0.10", "Publicar hoy a las 13:00.", "Descartado: la campaña ya había cerrado."],
];
const HIST_GRID = "70px 110px 1.1fr 1.6fr 110px 70px";

const WEEKS = ["SEMANA 45", "SEMANA 44", "SEMANA 43", "SEMANA 42"];
const PRACTICES: [string, string, string][] = [
  ["01", "Publicar el precio del diagnóstico completo en la página de clínicas; dos competidores ya lo muestran.", "2 FUENTES · SITIOS DE COMPETIDORES"],
  ["02", "Responder leads de Instagram en menos de una hora; los que esperan más de un día rara vez agendan.", "1 FUENTE · HISTORIAL DEL EMBUDO"],
  ["03", "Probar un carrusel por sector con el costo de no actuar en pesos al mes.", "3 FUENTES · MÉTRICAS DE CANAL"],
];

type Stat = { k: string; v: string; w: number; c: string };
const st = (k: string, v: string, w: number, c: string): Stat => ({ k, v, w, c });
const MODELS = [
  { name: "MODELO A", win: true, border: C.oxido, glow: "0 0 30px rgba(176,81,57,0.25)", stats: [st("APROBADAS SIN CAMBIOS", "18 / 24", 75, C.olivo), st("COSTO POR PROPUESTA", "$1.20", 40, C.papel), st("TIEMPO PROMEDIO", "14 S", 35, C.papel)] },
  { name: "MODELO B", win: false, border: "rgba(238,235,228,0.09)", glow: "none", stats: [st("APROBADAS SIN CAMBIOS", "12 / 24", 50, C.niebla), st("COSTO POR PROPUESTA", "$0.60", 20, C.papel), st("TIEMPO PROMEDIO", "9 S", 22, C.papel)] },
];

const GLASS_EDGE = "rgba(238,235,228,0.09)";
const glass = { background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" } as const;
const lbl = (extra?: React.CSSProperties): React.CSSProperties => ({ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue, ...extra });

export default function Agentes() {
  const { flash } = useUI();
  const [tab, setTab] = useState("Panel");
  const [off, setOff] = useState<string[]>(["Analista"]);
  const [hsel, setHsel] = useState(0);
  const [week, setWeek] = useState("SEMANA 45");
  const [done, setDone] = useState<number[]>([]);

  const subtitle = "13 agentes · " + (13 - off.length) + " activos · ninguno actúa hacia afuera sin aprobación, salvo dos excepciones";
  const toggle = (name: string, on: boolean) => {
    setOff((x) => (on ? [...x, name] : x.filter((n) => n !== name)));
    flash(name + (on ? " desactivado" : " activado"));
  };

  /* Grupos de agentes con sus valores calculados (equivale a renderVals) */
  const groups = useMemo(() => {
    let k = 0;
    return GROUPS.map((g) => {
      const list = AG.filter((a) => a[0] === g);
      return {
        name: g, n: list.length + " AGENTES",
        agents: list.map(([, name, does, trigger, model, last, cost, cap, auto, running]) => {
          const on = !off.includes(name); const run = on && running;
          return {
            name, does, trigger: trigger.toUpperCase(), model, last, cost: "$" + cost + " / $" + cap, pct: (cost / cap) * 100, cc: cost / cap > 0.7 ? C.ambar : C.papel, running: run, on,
            state: !on ? "INACTIVO" : run ? "TRABAJANDO" : "EN ESPERA", dot: !on ? C.acero : run ? C.oxido : C.olivo, sc: !on ? C.tenue : C.papel, anim: run ? "blink 1.2s infinite" : "none",
            border: run ? C.oxido : GLASS_EDGE, glow: run ? "0 0 28px rgba(176,81,57,0.25)" : "none", op: on ? 1 : 0.5, tb: on ? C.olivo : "#2A2F36", tl: on ? 21 : 3,
            auto: auto ? "ACTÚA SOLO · " + auto : "SIEMPRE CON APROBACIÓN", ab: auto ? C.ambar : C.borde2, ac: auto ? C.papel : C.tenue, delay: `${0.04 * k++}s`,
          };
        }),
      };
    });
  }, [off]);

  const h = HIST[hsel];
  const cur = { a: h[1], c: h[2], r: h[4], rc: h[5], k: h[6], m: "CLAUDE", before: h[7], after: h[8] };

  const tPanel = tab === "Panel", tHist = tab === "Historial de propuestas", tInf = tab === "Informe del Investigador", tTest = tab === "Prueba de modelos";

  return (
    <>
      <style>{`@keyframes scanAg{from{transform:translateX(-100%)}to{transform:translateX(300%)}}`}</style>

      {/* Encabezado de pantalla */}
      <section style={{ padding: "34px 32px 0", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, ...lbl() }}>
            <span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)" }} />09 · AGENTES · SOBRE HERMES AGENT
          </div>
          <h1 style={{ margin: "8px 0 0", fontWeight: 900, fontSize: 44, letterSpacing: "-0.02em", lineHeight: 1 }}>AGENTES</h1>
          <div style={{ fontWeight: 300, fontSize: 16, color: C.niebla, marginTop: 6 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 999, background: "rgba(22,26,33,0.55)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(238,235,228,0.1)" }}>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.niebla }}>COSTO DEL MES</span>
          <span style={{ fontWeight: 900, fontSize: 20 }}>$1,200</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.tenue }}>/ $3,000 MXN</span>
        </div>
      </section>

      {/* Pestañas */}
      <nav style={{ display: "flex", gap: 6, padding: "22px 32px 0" }}>
        {TABS.map((l) => {
          const a = l === tab;
          return (
            <H key={l} as="button" type="button" onClick={() => setTab(l)}
              style={{ height: 44, padding: "0 18px", borderRadius: 999, border: `1px solid ${a ? C.papel : GLASS_EDGE}`, background: a ? C.papel : "rgba(22,26,33,0.55)", color: a ? C.tinta : C.papel, fontSize: 13, cursor: "pointer" }}
              hover={{ borderColor: C.acero }}>{l}</H>
          );
        })}
      </nav>

      <section style={{ padding: "22px 32px 56px" }}>
        {/* ---------- PANEL ---------- */}
        {tPanel && groups.map((g) => (
          <React.Fragment key={g.name}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0 12px" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em" }}>{g.name}</span>
              <span style={{ flex: 1, height: 1, background: C.borde }} />
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue }}>{g.n}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, marginBottom: 22 }}>
              {g.agents.map((a) => (
                <div key={a.name} style={{ position: "relative", overflow: "hidden", ...glass, border: `1px solid ${a.border}`, boxShadow: a.glow, borderRadius: 24, padding: 18, display: "flex", flexDirection: "column", gap: 10, opacity: a.op, transition: "opacity .3s,border-color .3s", animation: "rise .55s cubic-bezier(.2,.7,.2,1) both", animationDelay: a.delay }}>
                  {a.running && <span style={{ position: "absolute", top: 0, left: 0, width: "40%", height: 2, background: `linear-gradient(90deg,transparent,${C.oxido},transparent)`, animation: "scanAg 2s linear infinite" }} />}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: a.sc }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: a.dot, boxShadow: `0 0 10px ${a.dot}`, animation: a.anim }} />{a.state}
                    </span>
                    <button type="button" onClick={() => toggle(a.name, a.on)} title={a.on ? "Desactivar" : "Activar"}
                      style={{ width: 42, height: 24, borderRadius: 999, border: "none", background: a.tb, position: "relative", cursor: "pointer", transition: "background .25s", padding: 0 }}>
                      <span style={{ position: "absolute", top: 3, left: a.tl, width: 18, height: 18, borderRadius: "50%", background: C.papel, transition: "left .25s" }} />
                    </button>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 19, letterSpacing: "-0.01em", textTransform: "uppercase" }}>{a.name}</div>
                  <div style={{ fontSize: 13, color: C.niebla, lineHeight: 1.45, minHeight: 38, textWrap: "pretty" }}>{a.does}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: C.tenue }}>
                    <span>DISPARO · {a.trigger}</span><span>MODELO · {a.model} · ÚLTIMA · {a.last}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1, height: 4, borderRadius: 2, background: C.p3, overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", width: `${a.pct}%`, background: a.cc, transformOrigin: "left", animation: "growX 1s ease both" }} />
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: C.niebla }}>{a.cost}</span>
                  </div>
                  <span style={{ alignSelf: "flex-start", fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", padding: "4px 8px", borderRadius: 999, border: `1px solid ${a.ab}`, color: a.ac }}>{a.auto}</span>
                </div>
              ))}
            </div>
          </React.Fragment>
        ))}

        {/* ---------- HISTORIAL DE PROPUESTAS ---------- */}
        {tHist && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 420px", gap: 16, alignItems: "start" }}>
            <div style={{ ...glass, border: `1px solid ${GLASS_EDGE}`, borderRadius: 24, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: HIST_GRID, gap: 14, padding: "14px 22px", borderBottom: `1px solid ${GLASS_EDGE}`, ...lbl() }}>
                <span>FECHA</span><span>AGENTE</span><span>CLIENTE</span><span>PROPUESTA</span><span>RESULTADO</span><span>COSTO</span>
              </div>
              {HIST.map(([d, a, c, p, r, rc, kk], i) => (
                <H key={i} onClick={() => setHsel(i)}
                  style={{ display: "grid", gridTemplateColumns: HIST_GRID, gap: 14, padding: "13px 22px", borderBottom: "1px solid rgba(238,235,228,0.06)", alignItems: "center", cursor: "pointer", background: i === hsel ? "rgba(238,235,228,0.05)" : "transparent" }}
                  hover={{ background: "rgba(238,235,228,0.04)" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{d}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em" }}>{a}</span>
                  <span style={{ fontSize: 13 }}>{c}</span>
                  <span style={{ fontSize: 13, color: C.niebla, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: rc }} />{r}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{kk}</span>
                </H>
              ))}
            </div>
            <div key={hsel} style={{ ...glass, border: `1px solid ${GLASS_EDGE}`, borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 12, animation: "rise .4s ease both" }}>
              <div style={lbl()}>{cur.a} · {cur.m} · {cur.k}</div>
              <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.01em", textTransform: "uppercase" }}>{cur.c}</div>
              <div style={lbl()}>ANTES · BORRADOR DE IA</div>
              <div style={{ background: "rgba(12,15,20,0.5)", border: `1px dashed ${C.borde2}`, borderRadius: 14, padding: 12, fontSize: 13, lineHeight: 1.5, color: C.niebla }}>{cur.before}</div>
              <div style={lbl()}>DESPUÉS · {cur.r}</div>
              <div style={{ background: "rgba(12,15,20,0.5)", border: `1px solid ${cur.rc}`, borderRadius: 14, padding: 12, fontSize: 13, lineHeight: 1.5 }}>{cur.after}</div>
            </div>
          </div>
        )}

        {/* ---------- INFORME DEL INVESTIGADOR ---------- */}
        {tInf && (
          <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0,1fr)", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {WEEKS.map((l) => {
                const a = l === week;
                return (
                  <button key={l} type="button" onClick={() => setWeek(l)}
                    style={{ height: 44, borderRadius: 14, border: `1px solid ${a ? C.papel : GLASS_EDGE}`, background: a ? C.papel : "rgba(22,26,33,0.55)", color: a ? C.tinta : C.niebla, fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", cursor: "pointer", textAlign: "left", padding: "0 14px" }}>{l}</button>
                );
              })}
            </div>
            <div key={week} style={{ background: C.papel, color: C.tinta, borderRadius: 28, padding: 34, maxWidth: 900, animation: "rise .5s ease both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.acero }}>
                <span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)" }} />BORRADOR DE IA · INVESTIGADOR · {week}
              </div>
              <div style={{ fontWeight: 900, fontSize: 32, letterSpacing: "-0.02em", marginTop: 8 }}>INFORME SEMANAL</div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.acero, margin: "24px 0 4px" }}>TRES PRÁCTICAS QUE APLICAR</div>
              {PRACTICES.map(([n, t, src], i) => {
                const d = done.includes(i);
                return (
                  <div key={n} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 12, alignItems: "start", borderTop: "1px solid #D6D2C9", padding: "14px 0" }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.acero }}>{n}</span>
                    <div>
                      <div style={{ fontSize: 14, lineHeight: 1.45 }}>{t}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.acero, marginTop: 4 }}>{src}</div>
                    </div>
                    <button type="button" onClick={() => { if (d) return; setDone((x) => [...x, i]); flash("Tarea creada en Hoy"); }}
                      style={{ height: 34, padding: "0 14px", borderRadius: 999, background: d ? "transparent" : C.tinta, color: d ? C.olivo : C.papel, border: `1px solid ${d ? C.olivo : C.tinta}`, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{d ? "Tarea creada" : "Convertir en tarea"}</button>
                  </div>
                );
              })}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.acero, marginBottom: 8 }}>QUÉ HICIERON LOS COMPETIDORES</div>
                  <div style={{ fontSize: 14, lineHeight: 1.55 }}>Dos estudios publicaron casos de restaurantes con video corto; uno lanzó un paquete de automatización por WhatsApp sin diagnóstico previo.</div>
                </div>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.acero, marginBottom: 8 }}>QUÉ OFRECEN Y A QUÉ PRECIO</div>
                  <div style={{ fontSize: 14, lineHeight: 1.55 }}>Diagnóstico desde $5,000.00 MXN; proyectos de punto de venta desde $60,000.00 MXN con licencia mensual.</div>
                </div>
              </div>
              <div style={{ marginTop: 22, background: C.tinta, color: C.papel, borderRadius: 18, padding: 18 }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.niebla }}>RECOMENDACIÓN CONCRETA</div>
                <div style={{ fontSize: 15, marginTop: 6, lineHeight: 1.5 }}>Mostrar el precio del diagnóstico completo en las páginas por sector y aclarar que se acredita al proyecto.</div>
              </div>
            </div>
          </div>
        )}

        {/* ---------- PRUEBA DE MODELOS ---------- */}
        {tTest && (
          <>
            <div style={lbl({ marginBottom: 12 })}>GUIONISTA · 19 OCT – 1 NOV · 24 PROPUESTAS POR MODELO</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16 }}>
              {MODELS.map((m) => (
                <div key={m.name} style={{ ...glass, border: `1px solid ${m.border}`, boxShadow: m.glow, borderRadius: 28, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em" }}>{m.name}</span>
                    {m.win && <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", padding: "6px 10px", borderRadius: 999, background: C.papel, color: C.tinta }}>RECOMENDADO</span>}
                  </div>
                  {m.stats.map((x) => (
                    <div key={x.k} style={{ display: "grid", gridTemplateColumns: "200px 1fr 90px", gap: 12, alignItems: "center", marginTop: 16 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.niebla }}>{x.k}</span>
                      <span style={{ height: 10, borderRadius: 5, background: C.p3, overflow: "hidden" }}>
                        <span style={{ display: "block", height: "100%", width: `${x.w}%`, background: x.c, transformOrigin: "left", animation: "growX 1s ease both" }} />
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 12, textAlign: "right" }}>{x.v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <H as="button" type="button" onClick={() => flash("Modelo A asignado al Guionista")}
                style={{ height: 46, padding: "0 20px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 24px rgba(176,81,57,.45)" }}
                hover={{ background: C.oxidoHover }}>Asignar modelo recomendado</H>
            </div>
          </>
        )}
      </section>
    </>
  );
}
