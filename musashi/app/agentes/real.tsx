"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { Glass, Dot } from "@/components/ui";
import { useUI, PageHead } from "@/components/shell";
import { AGENTES } from "@/lib/hermes-agentes";
import { datos, fechaCorta } from "@/lib/datos";
import { accionDe, resolver as resolverPropuesta } from "@/lib/propuestas";
import { Cargando, Vacio, Tabla, Kpis, fila, mono10, chip, btn, mxn0 } from "@/components/real";

/* Agentes con datos reales: el catálogo de 13 agentes de Hermes, lo que han propuesto
   (propuestas_ia) y lo que han corrido (corridas_agente). */
type Prop = { id: string; agente: string; tipo: string; titulo: string; cuerpo: string; datos: Record<string, unknown> | null; referencia: string | null; estado: "Pendiente" | "Aprobada" | "Editada" | "Descartada"; creado_en: string; resuelta_en: string | null };
type Corrida = { agente: string; inicio: string; costo_mxn: number | null; resultado: string | null };
type Estado = { hermes: { alcanzable: boolean }; webhook: { alcanzable: boolean } };
const COLOR: Record<string, string> = { Pendiente: C.ambar, Aprobada: C.olivo, Editada: C.olivo, Descartada: C.acero };

export default function AgentesReal() {
  const { flash, toggleTray } = useUI();
  const [props, setProps] = useState<Prop[] | null>(null);
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [estado, setEstado] = useState<Estado | null>(null);
  const [tab, setTab] = useState<"Panel" | "Historial de propuestas">("Panel");
  const [filtro, setFiltro] = useState("Todas");

  const cargar = useCallback(() => {
    datos.lista<Prop>("propuestas_ia", "select=id,agente,tipo,titulo,cuerpo,datos,referencia,estado,creado_en,resuelta_en&order=creado_en.desc&limit=200").then((r) => setProps(r.filas)).catch((e) => { flash("No se pudieron cargar las propuestas: " + (e as Error).message); setProps([]); });
    datos.lista<Corrida>("corridas_agente", "select=agente,inicio,costo_mxn,resultado&order=inicio.desc&limit=300").then((r) => setCorridas(r.filas)).catch(() => {});
  }, [flash]);
  useEffect(() => { cargar(); fetch("/api/hermes/estado", { cache: "no-store" }).then((r) => r.json()).then(setEstado).catch(() => {}); }, [cargar]);

  if (!props) return <Cargando />;
  const mes = new Date().toISOString().slice(0, 7);
  const enLinea = estado ? estado.hermes.alcanzable && estado.webhook.alcanzable : null;
  const pend = props.filter((p) => p.estado === "Pendiente").length;
  const resueltas = props.filter((p) => p.estado !== "Pendiente");
  const aprob = resueltas.filter((p) => p.estado === "Aprobada" || p.estado === "Editada").length;
  const gasto = corridas.filter((c) => c.inicio.slice(0, 7) === mes).reduce((s, c) => s + Number(c.costo_mxn ?? 0), 0);
  const grupos = [...new Set(AGENTES.map((a) => a.grupo))];
  const lista = props.filter((p) => filtro === "Todas" || p.estado === filtro.replace(/s$/, ""));
  const resolver = (p: Prop, e: "Aprobada" | "Descartada") => { const v = e === "Aprobada" && accionDe(p).clave === "whatsapp" ? window.open("", "_blank") : null; resolverPropuesta(p, e, undefined, v).then((m) => { flash(m); cargar(); }).catch((x) => { v?.close(); flash("No se pudo completar: " + (x as Error).message); }); };
  const W = "90px 130px 110px 1fr 120px auto";

  return (
    <>
      <PageHead stage={2} eyebrow="09 · AGENTES · SOBRE HERMES AGENT" title="AGENTES" sub={`13 agentes configurados · ${enLinea === null ? "consultando a Hermes…" : enLinea ? "Hermes en línea" : "Hermes sin conexión (la PC está apagada o sin internet)"}`} style={{ paddingTop: 34 }}
        right={<Link href="/configuracion?sec=hermes" style={{ ...btn, height: 48, padding: "0 20px", fontSize: 14, display: "flex", alignItems: "center" }}>Conexión con Hermes ↗</Link>} />
      <nav style={{ display: "flex", gap: 6, padding: "22px 32px 0" }}>{(["Panel", "Historial de propuestas"] as const).map((l) => <button key={l} type="button" onClick={() => setTab(l)} style={{ ...chip(tab === l), height: 44, padding: "0 18px", fontSize: 13 }}>{l}{l !== "Panel" ? ` · ${props.length}` : ""}</button>)}</nav>
      <section style={{ padding: "22px 32px 56px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Kpis items={[["HERMES", enLinea === null ? "…" : enLinea ? "EN LÍNEA" : "SIN CONEXIÓN", "API y webhook en tu PC", enLinea ? C.olivo : enLinea === false ? C.oxido : C.acero], ["POR APROBAR", String(pend), "en la bandeja", C.ambar], ["APROBADAS", resueltas.length ? `${Math.round((aprob / resueltas.length) * 100)} %` : "—", `${aprob} de ${resueltas.length} resueltas`, C.olivo], ["GASTO EN TOKENS · MES", mxn0(gasto), `${corridas.filter((c) => c.inicio.slice(0, 7) === mes).length} corridas reportadas`, C.papel]]} />

        {tab === "Panel" && grupos.map((g) => (
          <div key={g}>
            <div style={{ ...mono10, margin: "6px 0 10px" }}>{g.toUpperCase()} · {AGENTES.filter((a) => a.grupo === g).length} AGENTES</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}>
              {AGENTES.filter((a) => a.grupo === g).map((a) => {
                const mias = props.filter((p) => p.agente === a.id), ult = corridas.find((c) => c.agente === a.id), pe = mias.filter((p) => p.estado === "Pendiente").length;
                return (
                  <Glass key={a.id} pad={16} radius={20} style={{ display: "flex", flexDirection: "column", gap: 8, borderColor: pe ? C.oxido : undefined }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-0.01em", textTransform: "uppercase" }}>{a.nombre}</span><span style={{ ...mono10, color: a.aprobacion ? C.tenue : C.ambar }}>{a.aprobacion ? "CON APROBACIÓN" : "ACTÚA SOLO"}</span></div>
                    <div style={{ fontSize: 12.5, color: C.niebla, lineHeight: 1.4 }}>Se dispara con: {a.disparo}. Deja: {a.salida.toLowerCase()}.</div>
                    <div style={{ ...mono10, color: a.cron === "webhook" ? C.oxido : a.cron === "manual" ? C.ambar : C.papel }}>{a.cron.toUpperCase()}</div>
                    <div style={{ borderTop: `1px solid ${C.borde}`, paddingTop: 8, display: "flex", justifyContent: "space-between", ...mono10 }}>
                      <span style={{ color: pe ? C.papel : C.tenue }}>{pe ? `${pe} POR APROBAR` : `${mias.length} PROPUESTAS`}</span>
                      <span>{ult ? `CORRIÓ ${fechaCorta(ult.inicio).toUpperCase()}` : mias[0] ? `ÚLTIMA ${fechaCorta(mias[0].creado_en).toUpperCase()}` : "SIN ACTIVIDAD"}</span>
                    </div>
                  </Glass>
                );
              })}
            </div>
          </div>
        ))}
        {tab === "Panel" && <div style={{ fontSize: 12.5, color: C.tenue, lineHeight: 1.5 }}>Los horarios y las skills de cada agente viven en Hermes, en tu PC. Aquí ves lo que proponen y apruebas. Mientras los agentes no reporten sus corridas, el gasto en tokens aparece en cero.</div>}

        {tab === "Historial de propuestas" && (
          <Tabla cols={W} heads={["FECHA", "AGENTE", "TIPO", "PROPUESTA", "ESTADO", ""]} titulo="PROPUESTAS"
            extra={<div style={{ display: "flex", gap: 6 }}>{["Todas", "Pendientes", "Aprobadas", "Descartadas"].map((x) => <button key={x} type="button" onClick={() => setFiltro(x)} style={{ ...chip(filtro === x), height: 32, padding: "0 12px", fontSize: 12 }}>{x}</button>)}<button type="button" onClick={toggleTray} style={{ ...btn, height: 32 }}>Abrir bandeja</button></div>}>
            {lista.length === 0 && <Vacio>{props.length === 0 ? "Los agentes todavía no dejan propuestas. Cuando corran en Hermes, lo que propongan llega a la bandeja de aprobación y queda registrado aquí." : "Ninguna en este filtro."}</Vacio>}
            {lista.map((p) => (
              <div key={p.id} style={{ ...fila(W), alignItems: "start" }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{fechaCorta(p.creado_en).toUpperCase()}</span>
                <span style={{ ...mono10, color: C.papel }}>{(AGENTES.find((a) => a.id === p.agente)?.nombre ?? p.agente).toUpperCase()}</span>
                <span style={mono10}>{p.tipo.toUpperCase()}</span>
                <div style={{ minWidth: 0 }}><div>{p.titulo}</div><div style={{ fontSize: 12.5, color: C.niebla, marginTop: 3, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.cuerpo}</div></div>
                <span style={{ display: "flex", alignItems: "center", gap: 6, ...mono10, color: C.papel }}><Dot color={COLOR[p.estado]} />{p.estado.toUpperCase()}</span>
                <span style={{ display: "flex", gap: 6, justifyContent: "flex-end", minWidth: 230 }}>{p.estado === "Pendiente" && <><button type="button" onClick={() => void resolver(p, "Aprobada")} style={{ ...btn, background: C.papel, color: C.tinta, borderColor: C.papel, fontWeight: 600 }}>{accionDe(p).etiqueta}</button><button type="button" onClick={() => void resolver(p, "Descartada")} style={{ ...btn, border: "none", color: C.tenue }}>Descartar</button></>}</span>
              </div>
            ))}
          </Tabla>
        )}
      </section>
    </>
  );
}
