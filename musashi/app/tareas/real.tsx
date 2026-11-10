"use client";
import React, { useCallback, useEffect, useState } from "react";
import { C, MONO } from "@/lib/tokens";
import { Glass, PB, SB, Dot } from "@/components/ui";
import { useUI, PageHead } from "@/components/shell";
import { datos, eq, fechaCorta, hoyISO, sumaDias } from "@/lib/datos";
import { Cargando, Vacio, Campo, Modal, mono10, inp, chip, btn } from "@/components/real";

/* Tareas con datos reales: nacen de cotizaciones, proyectos y del Investigador, o se crean a mano. */
type Tarea = { id: string; titulo: string; fecha: string; hora: string | null; estado: "Pendiente" | "Hecha" | "Cancelada"; origen: string | null; canal: string | null; borrador_ia: string | null; agente: string | null; cliente_id: string | null; cliente?: { nombre: string } | null; proyecto?: { codigo: string } | null };
const CANALES = ["WhatsApp", "Llamada", "Correo", "Presencial", "Interno"];
const ORIGENES = ["Lead", "Llamada", "Diagnóstico", "Cotización", "Hito", "Factura", "Acompañamiento", "Interno"];

export default function TareasReal() {
  const { flash } = useUI();
  const [tareas, setTareas] = useState<Tarea[] | null>(null);
  const [clientes, setClientes] = useState<{ id: string; nombre: string }[]>([]);
  const [tab, setTab] = useState<"Pendientes" | "Hechas">("Pendientes");
  const [nueva, setNueva] = useState(false);
  const [f, setF] = useState({ titulo: "", cliente: "", fecha: hoyISO(), hora: "", canal: "WhatsApp", origen: "Interno" });
  const hoy = hoyISO();

  const cargar = useCallback(() => {
    datos.lista<Tarea>("tareas", "select=*,cliente:clientes(nombre),proyecto:proyectos(codigo)&order=fecha.asc").then((r) => setTareas(r.filas)).catch((e) => { flash("No se pudieron cargar las tareas: " + (e as Error).message); setTareas([]); });
  }, [flash]);
  useEffect(() => { cargar(); void datos.lista<{ id: string; nombre: string }>("clientes", "select=id,nombre&order=nombre").then((r) => setClientes(r.filas)).catch(() => {}); }, [cargar]);

  const cambia = async (t: Tarea, c: Partial<Tarea>, msg: string) => {
    setTareas((x) => (x ?? []).map((y) => (y.id === t.id ? { ...y, ...c } : y)));
    try { await datos.cambia("tareas", eq("id", t.id), c); flash(msg); } catch (e) { flash("No se guardó: " + (e as Error).message); cargar(); }
  };
  const borra = async (t: Tarea) => { if (!window.confirm(`¿Eliminar la tarea "${t.titulo}"?`)) return; try { await datos.borra("tareas", eq("id", t.id)); setTareas((x) => (x ?? []).filter((y) => y.id !== t.id)); flash("Tarea eliminada"); } catch (e) { flash("No se eliminó: " + (e as Error).message); } };
  const crear = async () => {
    if (!f.titulo.trim()) return;
    try { await datos.crea("tareas", { titulo: f.titulo.trim(), cliente_id: f.cliente || null, fecha: f.fecha || hoy, hora: f.hora || null, canal: f.canal, origen: f.origen }); setNueva(false); setF({ ...f, titulo: "" }); flash("Tarea creada"); cargar(); } catch (e) { flash("No se guardó: " + (e as Error).message); }
  };

  if (!tareas) return <Cargando />;
  const pend = tareas.filter((t) => t.estado === "Pendiente");
  const en7 = sumaDias(hoy, 7);
  const grupos: [string, Tarea[], string][] = [
    ["VENCIDAS", pend.filter((t) => t.fecha < hoy), C.oxido], ["HOY", pend.filter((t) => t.fecha === hoy), C.papel],
    ["PRÓXIMOS 7 DÍAS", pend.filter((t) => t.fecha > hoy && t.fecha <= en7), C.niebla], ["DESPUÉS", pend.filter((t) => t.fecha > en7), C.acero],
  ];
  const hechas = tareas.filter((t) => t.estado === "Hecha").reverse().slice(0, 40);

  return (
    <>
      <PageHead stage={1} eyebrow="07 · TAREAS Y SEGUIMIENTOS" title="TAREAS" sub={`${grupos[0][1].length} vencidas · ${grupos[1][1].length} para hoy · ${grupos[2][1].length + grupos[3][1].length} próximas`} style={{ paddingTop: 34 }}
        right={<PB style={{ height: 48, padding: "0 22px", fontSize: 14 }} onClick={() => setNueva(true)}>Nueva tarea</PB>} />
      <nav style={{ display: "flex", gap: 6, padding: "22px 32px 0" }}>{(["Pendientes", "Hechas"] as const).map((l) => <button key={l} type="button" onClick={() => setTab(l)} style={{ ...chip(tab === l), height: 44, padding: "0 18px", fontSize: 13 }}>{l}{l === "Pendientes" ? ` · ${pend.length}` : ""}</button>)}</nav>

      <section style={{ padding: "22px 32px 56px", display: "flex", flexDirection: "column", gap: 16 }}>
        {tab === "Pendientes" && pend.length === 0 && <Glass><Vacio>No hay tareas pendientes. Nacen solas al enviar o aceptar una cotización y al convertir una recomendación del Investigador; también puedes crear una con <strong style={{ color: C.papel }}>Nueva tarea</strong>.</Vacio></Glass>}
        {tab === "Pendientes" && grupos.filter(([, ts]) => ts.length).map(([titulo, ts, color]) => (
          <Glass key={titulo} pad="18px 22px 8px" radius={24}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, ...mono10, color: C.papel, marginBottom: 6 }}><Dot color={color} anim={titulo === "VENCIDAS" ? "pulseOx 2s infinite" : undefined} />{titulo} · {ts.length}</div>
            {ts.map((t) => (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "84px 1fr auto", gap: 14, alignItems: "start", padding: "12px 0", borderTop: `1px solid ${C.borde}` }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: t.fecha < hoy ? C.oxido : C.niebla, paddingTop: 2 }}>{fechaCorta(t.fecha).toUpperCase()}{t.hora ? <><br />{t.hora.slice(0, 5)}</> : null}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5 }}>{t.titulo}</div>
                  <div style={{ ...mono10, marginTop: 4 }}>{[t.cliente?.nombre, t.proyecto?.codigo, t.origen, t.canal, t.agente].filter(Boolean).join(" · ").toUpperCase() || "RONIN STUDIO"}</div>
                  {t.borrador_ia && <div style={{ marginTop: 8, background: C.p2, border: `1px dashed ${C.borde2}`, borderRadius: 14, padding: "8px 12px", fontSize: 13, color: C.niebla, textWrap: "pretty" }}>{t.borrador_ia}</div>}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="date" value={t.fecha} title="Reprogramar" onChange={(e) => e.target.value && void cambia(t, { fecha: e.target.value }, "Tarea reprogramada")} style={{ ...inp, width: 150, height: 34, padding: "0 10px", fontSize: 12 }} />
                  <button type="button" onClick={() => void cambia(t, { estado: "Hecha" }, "Tarea hecha")} style={{ ...btn, background: C.papel, color: C.tinta, borderColor: C.papel, fontWeight: 600 }}>Hecha</button>
                  <button type="button" onClick={() => void borra(t)} title="Eliminar" style={{ ...btn, border: "none", color: C.tenue }}>✕</button>
                </div>
              </div>
            ))}
          </Glass>
        ))}
        {tab === "Hechas" && (
          <Glass pad="18px 22px 8px" radius={24}>
            <div style={{ ...mono10, marginBottom: 6 }}>ÚLTIMAS {hechas.length} HECHAS</div>
            {hechas.length === 0 && <Vacio>Todavía no hay tareas hechas.</Vacio>}
            {hechas.map((t) => (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "84px 1fr auto", gap: 14, alignItems: "center", padding: "11px 0", borderTop: `1px solid ${C.borde}` }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: C.tenue }}>{fechaCorta(t.fecha).toUpperCase()}</div>
                <div><div style={{ fontSize: 14, color: C.niebla, textDecoration: "line-through", textDecorationColor: C.acero }}>{t.titulo}</div><div style={{ ...mono10, marginTop: 3 }}>{[t.cliente?.nombre, t.origen, t.canal].filter(Boolean).join(" · ").toUpperCase()}</div></div>
                <button type="button" onClick={() => void cambia(t, { estado: "Pendiente" }, "Tarea reabierta")} style={btn}>Reabrir</button>
              </div>
            ))}
          </Glass>
        )}
      </section>

      {nueva && (
        <Modal titulo="NUEVA TAREA" kicker="SEGUIMIENTO · CON FECHA Y CANAL" onClose={() => setNueva(false)}>
          <Campo t="Qué hay que hacer"><input autoFocus value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") void crear(); }} placeholder="Llamar para confirmar la visita" style={inp} /></Campo>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 0.8fr", gap: 10 }}>
            <Campo t="Cliente"><select value={f.cliente} onChange={(e) => setF({ ...f, cliente: e.target.value })} style={{ ...inp, appearance: "none" }}><option value="">Sin cliente · interno</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></Campo>
            <Campo t="Fecha"><input type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} style={inp} /></Campo>
            <Campo t="Hora"><input type="time" value={f.hora} onChange={(e) => setF({ ...f, hora: e.target.value })} style={inp} /></Campo>
          </div>
          <Campo t="Canal del siguiente paso"><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{CANALES.map((c) => <button key={c} type="button" onClick={() => setF({ ...f, canal: c })} style={chip(f.canal === c)}>{c}</button>)}</div></Campo>
          <Campo t="Nace de"><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{ORIGENES.map((c) => <button key={c} type="button" onClick={() => setF({ ...f, origen: c })} style={{ ...chip(f.origen === c), height: 32, fontSize: 12 }}>{c}</button>)}</div></Campo>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}><SB onClick={() => setNueva(false)}>Cancelar</SB><PB disabled={!f.titulo.trim()} onClick={() => void crear()} style={{ opacity: f.titulo.trim() ? 1 : 0.6 }}>Crear tarea</PB></div>
        </Modal>
      )}
    </>
  );
}
