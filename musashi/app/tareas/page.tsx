"use client";
import TareasReal from "./real";
import { useModo, Cargando } from "@/components/real";
import React, { useMemo, useState } from "react";
import { C, MONO } from "@/lib/tokens";
import { H } from "@/components/ui";
import { useUI } from "@/components/shell";

/* ---------- Datos demo (los mismos del prototipo) ---------- */
type Task = {
  id: number; client: string; time: string; title: string; origin: string; channel: string;
  overdue?: boolean; agent?: string; ai?: string; day: number; col: string; done?: boolean;
};
const TASKS: Task[] = [
  { id: 1, client: "NEGOCIO DEMO 2 · RESTAURANTE CON SUCURSALES", time: "09:00", title: "Recordatorio de factura F-0112", origin: "FACTURA", channel: "WHATSAPP", overdue: true, agent: "COBRADOR", ai: "Hola, te comparto el recordatorio de la factura F-0112 por $25,000.00 MXN, vencida el 2 de noviembre. ¿Te ayudo con el complemento de pago?", day: 3, col: "EN CURSO" },
  { id: 2, client: "NEGOCIO DEMO 4 · CLÍNICA", time: "10:00", title: "Hito 2 atrasado · mapa de flujo", origin: "HITO", channel: "INTERNO", overdue: true, day: 3, col: "POR HACER" },
  { id: 3, client: "NEGOCIO DEMO 1 · ESCUELA PRIVADA", time: "11:30", title: "Llamada de 15 minutos", origin: "LLAMADA", channel: "LLAMADA", day: 3, col: "POR HACER" },
  { id: 4, client: "NEGOCIO DEMO 1 · ESCUELA PRIVADA", time: "13:00", title: "Confirmar visita de diagnóstico", origin: "LLAMADA", channel: "WHATSAPP", agent: "SEGUIMIENTO", ai: "Confirmo la visita del martes 10 a las 9:00. Llevamos la guía de escuelas; calcula una hora y media con dirección y control escolar.", day: 3, col: "POR HACER" },
  { id: 5, client: "NEGOCIO DEMO 11 · RESTAURANTE", time: "16:00", title: "Primer contacto con lead de Instagram", origin: "LEAD NUEVO", channel: "WHATSAPP", agent: "SEGUIMIENTO", ai: "Gracias por hacer el diagnóstico exprés. Vi que la captura doble es lo que más les pesa; ¿te late una llamada de 15 minutos esta semana?", day: 3, col: "POR HACER" },
  { id: 6, client: "NEGOCIO DEMO 5 · GIMNASIO", time: "17:30", title: "Reporte mensual de acompañamiento", origin: "ACOMPAÑAMIENTO", channel: "CORREO", day: 3, col: "EN REVISIÓN" },
  { id: 7, client: "RONIN STUDIO", time: "18:00", title: "Revisar recomendación 01 del Investigador", origin: "INVESTIGACIÓN", channel: "INTERNO", day: 3, col: "POR HACER" },
  { id: 8, client: "NEGOCIO DEMO 7 · NOTARÍA", time: "10:00", title: "Visita de diagnóstico", origin: "LLAMADA", channel: "PRESENCIAL", day: 4, col: "POR HACER" },
  { id: 9, client: "NEGOCIO DEMO 2 · RESTAURANTE", time: "12:00", title: "Pruebas del POS en sucursal 1", origin: "HITO", channel: "PRESENCIAL", day: 1, col: "HECHO", done: true },
  { id: 10, client: "NEGOCIO DEMO 6 · TALLER", time: "09:00", title: "Revisión de órdenes de trabajo", origin: "HITO", channel: "LLAMADA", day: 0, col: "HECHO", done: true },
  { id: 11, client: "NEGOCIO DEMO 3 · CLÍNICA", time: "11:00", title: "Ajuste de tablero mensual", origin: "ACOMPAÑAMIENTO", channel: "INTERNO", day: 2, col: "HECHO", done: true },
];
const DAYS = ["LUN 2", "MAR 3", "MIÉ 4", "JUE 5", "VIE 6", "SÁB 7", "DOM 8"];
const KCOLS = ["POR HACER", "EN CURSO", "EN REVISIÓN", "HECHO"];
const TABS = ["Hoy", "Semana", "Tablero por proyecto"];
const FIELDS: [string, string][] = [
  ["TÍTULO", "Llamar para confirmar visita"],
  ["CLIENTE O PROYECTO", "Negocio demo 1"],
  ["FECHA", "Jueves 5 de noviembre · 15:00"],
  ["CANAL DEL SIGUIENTE PASO", "WhatsApp, llamada, correo o presencial"],
];
const GLASS_EDGE = "rgba(238,235,228,0.09)";

/* Campo del formulario con style-focus (borde Óxido al enfocar) */
function FInput({ placeholder }: { placeholder: string }) {
  const [f, setF] = useState(false);
  return (
    <input placeholder={placeholder} onFocus={() => setF(true)} onBlur={() => setF(false)}
      style={{ height: 44, borderRadius: 12, background: C.p2, border: `1px solid ${f ? C.oxido : C.borde}`, color: C.papel, padding: "0 14px", fontSize: 14, outline: "none" }} />
  );
}

function TareasDemo() {
  const { flash } = useUI();
  const [tab, setTab] = useState("Hoy");
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [over, setOver] = useState<string | null>(null);
  const [form, setForm] = useState(false);

  const patch = (id: number, p: Partial<Task>) => { setTasks((s) => s.map((t) => (t.id === id ? { ...t, ...p } : t))); setOver(null); };

  /* ---------- Hoy ---------- */
  const today = useMemo(() => tasks.filter((t) => t.day === 3), [tasks]);
  const open = useMemo(() => today.filter((t) => !t.done).sort((a, b) => (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0)), [today]);
  const groups = useMemo(() => {
    const gm: Record<string, Task[]> = {};
    open.forEach((t) => { (gm[t.client] = gm[t.client] || []).push(t); });
    return Object.entries(gm);
  }, [open]);
  const doneN = today.filter((t) => t.done).length;
  const totalN = today.length;
  const pct = totalN ? (doneN / totalN) * 100 : 0;
  const origins = useMemo(() => {
    const oc: Record<string, number> = {};
    today.forEach((t) => { oc[t.origin] = (oc[t.origin] || 0) + 1; });
    return Object.entries(oc).map(([n, v]) => ({ n: n.charAt(0) + n.slice(1).toLowerCase(), v }));
  }, [today]);
  const subtitle = "Jueves 5 de noviembre · " + open.length + " pendientes · " + open.filter((t) => t.overdue).length + " vencidas";

  /* ---------- Tableros (Semana / Por proyecto) ---------- */
  const isSemana = tab === "Semana", isProj = tab === "Tablero por proyecto", isHoy = tab === "Hoy";
  type ColDef = { name: string; list: Task[]; isToday: boolean; drop: (id: number) => void };
  const cols: ColDef[] = isSemana
    ? DAYS.map((d, i) => ({ name: d, list: tasks.filter((t) => t.day === i), isToday: i === 3, drop: (id) => patch(id, { day: i }) }))
    : KCOLS.map((k) => ({ name: k, list: tasks.filter((t) => t.col === k), isToday: false, drop: (id) => patch(id, { col: k, done: k === "HECHO" }) }));
  const colN = isSemana ? 7 : 4;

  return (
    <>
      {/* Encabezado de pantalla */}
      <section style={{ padding: "34px 32px 0", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>
            <span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)" }} />06 · TAREAS Y SEGUIMIENTO
          </div>
          <h1 style={{ margin: "8px 0 0", fontWeight: 900, fontSize: 44, letterSpacing: "-0.02em", lineHeight: 1 }}>LO DE HOY</h1>
          <div style={{ fontWeight: 300, fontSize: 16, color: C.niebla, marginTop: 6 }}>{subtitle}</div>
        </div>
        <H as="button" type="button" onClick={() => setForm(true)}
          style={{ height: 48, padding: "0 22px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 28px rgba(176,81,57,.45)" }}
          hover={{ background: C.oxidoHover }}>Crear tarea</H>
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
        {/* ---------- HOY ---------- */}
        {isHoy && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {groups.map(([client, ts], i) => {
                const late = ts.some((t) => t.overdue);
                return (
                  <div key={client} style={{ background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: `1px solid ${late ? C.oxido : GLASS_EDGE}`, boxShadow: late ? "0 0 30px rgba(176,81,57,0.25)" : "none", borderRadius: 26, padding: "18px 22px", animation: "rise .55s cubic-bezier(.2,.7,.2,1) both", animationDelay: `${0.06 * i}s` }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue, marginBottom: 4 }}>{client}</div>
                    {ts.map((t) => (
                      <div key={t.id} style={{ display: "grid", gridTemplateColumns: "30px 60px 1fr auto", gap: 14, alignItems: "start", padding: "12px 0", borderTop: "1px solid rgba(238,235,228,0.05)" }}>
                        <H as="button" type="button" title="Marcar como hecha"
                          onClick={() => { patch(t.id, { done: true, col: "HECHO" }); flash("Tarea hecha"); }}
                          style={{ width: 24, height: 24, borderRadius: "50%", border: `1.5px solid ${t.overdue ? C.oxido : C.acero}`, background: "transparent", cursor: "pointer", marginTop: 1, animation: t.overdue ? "pulseOx 2.2s infinite" : "none" }}
                          hover={{ background: "rgba(76,129,65,0.4)" }} />
                        <span style={{ fontFamily: MONO, fontSize: 13, color: t.overdue ? C.oxido : C.niebla, paddingTop: 3 }}>{t.time}</span>
                        <div>
                          <div style={{ fontSize: 15 }}>{t.title}</div>
                          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue, marginTop: 4 }}>{(t.overdue ? "VENCIDA · " : "") + t.origin + " · " + t.channel}</div>
                          {t.ai && (
                            <div style={{ marginTop: 10, background: "rgba(12,15,20,0.5)", border: `1px dashed ${C.borde2}`, borderRadius: 14, padding: "10px 12px" }}>
                              <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", color: C.tenue, marginBottom: 4 }}>BORRADOR DE IA · {t.agent} · CLAUDE</div>
                              <div style={{ fontSize: 13, color: C.niebla, lineHeight: 1.5 }}>{t.ai}</div>
                            </div>
                          )}
                        </div>
                        {t.ai ? (
                          <H as="button" type="button"
                            onClick={() => { patch(t.id, { done: true, col: "HECHO" }); flash("Mensaje aprobado y enviado por " + t.channel.toLowerCase()); }}
                            style={{ height: 36, padding: "0 14px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 18px rgba(176,81,57,.45)" }}
                            hover={{ background: C.oxidoHover }}>Aprobar y enviar</H>
                        ) : <span />}
                      </div>
                    ))}
                  </div>
                );
              })}
              {groups.length === 0 && <div style={{ fontSize: 14, color: C.tenue, padding: "20px 0" }}>Todo listo por hoy. Las tareas aparecen aquí cuando registres una llamada o entre un lead.</div>}
            </div>

            <div style={{ background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: `1px solid ${GLASS_EDGE}`, borderRadius: 26, padding: 22, alignSelf: "start" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>AVANCE DEL DÍA</div>
              <div style={{ fontWeight: 900, fontSize: 44, letterSpacing: "-0.02em", marginTop: 6 }}>{doneN}<span style={{ fontWeight: 300, fontSize: 18, color: C.niebla }}> / {totalN}</span></div>
              <div style={{ height: 4, borderRadius: 2, background: C.p3, margin: "10px 0 18px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: C.oxido, boxShadow: `0 0 10px ${C.oxido}`, transition: "width .6s cubic-bezier(.2,.7,.2,1)" }} />
              </div>
              {origins.map((o) => (
                <div key={o.n} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 13, borderBottom: "1px solid rgba(238,235,228,0.05)" }}>
                  <span style={{ color: C.niebla }}>{o.n}</span><span style={{ fontFamily: MONO }}>{o.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------- SEMANA / TABLERO POR PROYECTO ---------- */}
        {!isHoy && (
          <>
            {isSemana && <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue, marginBottom: 12 }}>ARRASTRA PARA MOVER DE DÍA</div>}
            {isProj && <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue, marginBottom: 12 }}>PLATAFORMA DE OPERACIÓN · NEGOCIO DEMO 2 · ARRASTRA PARA CAMBIAR DE ESTADO</div>}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${colN},minmax(0,1fr))`, gap: 10, alignItems: "start" }}>
              {cols.map((c) => {
                const isOver = over === c.name;
                return (
                  <div key={c.name}
                    onDragOver={(e) => { e.preventDefault(); if (over !== c.name) setOver(c.name); }}
                    onDrop={(e) => { e.preventDefault(); const id = +e.dataTransfer.getData("text/plain"); if (id) { c.drop(id); flash("Tarea movida a " + c.name.toLowerCase()); } else setOver(null); }}
                    style={{ minHeight: 480, borderRadius: 22, background: isOver ? "rgba(176,81,57,0.12)" : c.isToday ? "rgba(238,235,228,0.05)" : "rgba(22,26,33,0.35)", border: `1px solid ${isOver ? C.oxido : c.isToday ? "rgba(238,235,228,0.25)" : "rgba(238,235,228,0.07)"}`, padding: 10, display: "flex", flexDirection: "column", gap: 8, transition: "background .2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 6px 8px" }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: c.isToday ? C.papel : C.niebla }}>{c.name}</span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{c.list.length}</span>
                    </div>
                    {c.list.map((t) => {
                      const hot = !!t.overdue && !t.done;
                      return (
                        <div key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", String(t.id))}
                          style={{ background: "rgba(22,26,33,0.72)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${hot ? C.oxido : GLASS_EDGE}`, boxShadow: hot ? "0 0 18px rgba(176,81,57,0.3)" : "none", borderRadius: 16, padding: 12, cursor: "grab", display: "flex", flexDirection: "column", gap: 6, animation: "rise .4s ease both" }}>
                          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: hot ? C.oxido : C.niebla }}>{t.time}</span>
                          <span style={{ fontSize: 13, lineHeight: 1.35 }}>{t.title}</span>
                          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: C.tenue }}>{t.origin + " · " + t.channel}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ---------- Formulario: nueva tarea ---------- */}
      {form && (
        <>
          <div onClick={() => setForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(7,9,12,0.65)", zIndex: 40 }} />
          <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 500, zIndex: 41, background: "rgba(19,23,29,0.88)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(238,235,228,0.1)", borderRadius: 28, padding: 26, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em" }}>NUEVA TAREA</div>
            {FIELDS.map(([k, p]) => (
              <label key={k} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>{k}</span>
                <FInput placeholder={p} />
              </label>
            ))}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <button type="button" onClick={() => setForm(false)} style={{ height: 42, padding: "0 18px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.borde2}`, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button type="button" onClick={() => { setForm(false); flash("Tarea creada para hoy"); }} style={{ height: 42, padding: "0 18px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Guardar tarea</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* Con Supabase se muestran los datos reales; sin base, la versión de ejemplo del prototipo. */
export default function Tareas() {
  const modo = useModo();
  if (modo === "cargando") return <Cargando />;
  return modo === "db" ? <TareasReal /> : <TareasDemo />;
}
