"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { PB, SB } from "@/components/ui";
import { useUI, PageHead } from "@/components/shell";
import { datos, eq, fechaCorta, hoyISO } from "@/lib/datos";
import { Cargando, Vacio, Campo, Modal, Kpis, mono10, inp, chip, btn } from "@/components/real";

/* Marketing con datos reales: el tablero de piezas, de la idea a la publicación.
   Las métricas de canal llegan cuando se conecten Meta, TikTok y YouTube. */
const ESTADOS = ["Idea", "Guion", "Producción", "Aprobación", "Programada", "Publicada"] as const;
const COLOR: Record<string, string> = { Idea: C.acero, Guion: C.niebla, "Producción": C.ambar, "Aprobación": C.oxido, Programada: C.papel, Publicada: C.olivo };
const FORMATOS = ["Video 9:16", "Carrusel", "Post", "Foto"], CANALES = ["IG", "TT", "LI", "YT", "FB"];
type Pieza = { id: string; titulo: string; gancho: string | null; formato: string; canal: string; estado: typeof ESTADOS[number]; senal: string | null; publicar_en: string | null };

export default function MarketingReal() {
  const { flash } = useUI();
  const [ps, setPs] = useState<Pieza[] | null>(null);
  const [nueva, setNueva] = useState(false);
  const [f, setF] = useState({ titulo: "", gancho: "", formato: "Video 9:16", canal: "IG", fecha: "" });
  const hoy = hoyISO();
  const cargar = useCallback(() => datos.lista<Pieza>("piezas", "select=id,titulo,gancho,formato,canal,estado,senal,publicar_en&order=creado_en.desc").then((r) => setPs(r.filas)).catch((e) => { flash("No se pudieron cargar las piezas: " + (e as Error).message); setPs([]); }), [flash]);
  useEffect(() => { void cargar(); }, [cargar]);
  if (!ps) return <Cargando />;

  const cambia = async (p: Pieza, c: Partial<Pieza>) => { setPs((x) => (x ?? []).map((y) => (y.id === p.id ? { ...y, ...c } : y))); try { await datos.cambia("piezas", eq("id", p.id), c); } catch (e) { flash("No se guardó: " + (e as Error).message); void cargar(); } };
  const mover = (p: Pieza, d: number) => { const i = ESTADOS.indexOf(p.estado) + d; if (i >= 0 && i < ESTADOS.length) void cambia(p, { estado: ESTADOS[i] }).then(() => flash(`${p.titulo.slice(0, 40)} → ${ESTADOS[i]}`)); };
  const crear = async () => { if (!f.titulo.trim()) return; try { await datos.crea("piezas", { titulo: f.titulo.trim(), gancho: f.gancho.trim() || null, formato: f.formato, canal: f.canal, estado: "Idea", publicar_en: f.fecha ? `${f.fecha}T12:00:00` : null }); setNueva(false); setF({ ...f, titulo: "", gancho: "" }); flash("Idea agregada al tablero"); await cargar(); } catch (e) { flash("No se guardó: " + (e as Error).message); } };
  const borra = async (p: Pieza) => { if (!window.confirm(`¿Eliminar la pieza "${p.titulo}"?`)) return; try { await datos.borra("piezas", eq("id", p.id)); await cargar(); } catch (e) { flash("No se eliminó: " + (e as Error).message); } };
  const mes = hoy.slice(0, 7);
  const enCurso = ps.filter((p) => p.estado !== "Publicada" && p.estado !== "Idea").length;

  return (
    <>
      <PageHead stage={1} eyebrow="02 · MARKETING Y CONTENIDO" title="MARKETING" sub={`${ps.length} piezas · ${enCurso} en proceso · ${ps.filter((p) => p.estado === "Publicada").length} publicadas`} style={{ paddingTop: 34 }}
        right={<div style={{ display: "flex", gap: 8 }}><Link href="/estudio" style={{ ...btn, height: 48, padding: "0 20px", fontSize: 14, display: "flex", alignItems: "center" }}>Abrir Estudio ↗</Link><PB style={{ height: 48, padding: "0 22px", fontSize: 14 }} onClick={() => setNueva(true)}>Nueva idea</PB></div>} />
      <section style={{ padding: "22px 32px 56px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Kpis items={[["IDEAS", String(ps.filter((p) => p.estado === "Idea").length), "por desarrollar", C.acero], ["EN PROCESO", String(enCurso), "guion, producción, aprobación", C.ambar], ["PROGRAMADAS", String(ps.filter((p) => p.estado === "Programada").length), "con fecha de publicación", C.papel], ["PUBLICADAS · MES", String(ps.filter((p) => p.estado === "Publicada" && (p.publicar_en ?? "").slice(0, 7) === mes).length), "este mes", C.olivo]]} />
        {ps.length === 0 && <div style={{ background: "rgba(22,26,33,0.5)", border: "1px solid rgba(238,235,228,0.09)", borderRadius: 24, padding: "4px 22px" }}><Vacio>Todavía no hay piezas. Anota la primera con <strong style={{ color: C.papel }}>Nueva idea</strong> o fabrícala completa en Estudio; aquí la mueves de la idea a la publicación.</Vacio></div>}
        {ps.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 10, alignItems: "start" }}>
            {ESTADOS.map((e) => { const col = ps.filter((p) => p.estado === e); return (
              <div key={e} style={{ minHeight: 360, borderRadius: 22, background: "rgba(22,26,33,0.35)", border: "1px solid rgba(238,235,228,0.07)", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 6px 4px", ...mono10 }}><span style={{ display: "flex", alignItems: "center", gap: 6, color: C.niebla }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: COLOR[e] }} />{e.toUpperCase()}</span><span>{col.length}</span></div>
                {col.map((p) => (
                  <div key={p.id} style={{ background: "rgba(22,26,33,0.7)", border: `1px solid ${e === "Aprobación" ? C.oxido : "rgba(238,235,228,0.09)"}`, borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", ...mono10 }}><span>{p.formato.toUpperCase()}</span><span>{p.canal}</span></div>
                    <div style={{ fontSize: 13, lineHeight: 1.35, textWrap: "pretty" }}>{p.gancho || p.titulo}</div>
                    <input type="date" value={(p.publicar_en ?? "").slice(0, 10)} title="Fecha de publicación" onChange={(ev) => void cambia(p, { publicar_en: ev.target.value ? `${ev.target.value}T12:00:00` : null })} style={{ ...inp, height: 30, padding: "0 8px", fontSize: 11, fontFamily: MONO }} />
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
                      <button type="button" disabled={e === "Idea"} onClick={() => mover(p, -1)} title="Regresar" style={{ ...btn, height: 28, padding: "0 9px", opacity: e === "Idea" ? 0.3 : 1 }}>←</button>
                      <button type="button" onClick={() => void borra(p)} title="Eliminar" style={{ ...btn, height: 28, padding: "0 9px", border: "none", color: C.tenue }}>✕</button>
                      <button type="button" disabled={e === "Publicada"} onClick={() => mover(p, 1)} title="Avanzar" style={{ ...btn, height: 28, padding: "0 9px", background: C.papel, color: C.tinta, borderColor: C.papel, opacity: e === "Publicada" ? 0.3 : 1 }}>→</button>
                    </div>
                  </div>
                ))}
              </div>
            ); })}
          </div>
        )}
        <div style={{ fontSize: 12.5, color: C.tenue, lineHeight: 1.5 }}>Alcance, leads y métricas por canal aparecerán aquí al conectar Meta, TikTok y YouTube (Configuración → Integraciones). Hoy el tablero lleva el estado de cada pieza y su fecha{ps.some((p) => p.publicar_en) ? `; la próxima programada es el ${fechaCorta(ps.filter((p) => p.publicar_en && p.publicar_en.slice(0, 10) >= hoy).map((p) => p.publicar_en!).sort()[0] ?? null)}` : ""}.</div>
      </section>
      {nueva && (
        <Modal titulo="NUEVA IDEA" kicker="ENTRA AL TABLERO COMO IDEA" onClose={() => setNueva(false)}>
          <Campo t="Tema o título"><input autoFocus value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Cuánto cuesta contestar lo mismo todo el día" style={inp} /></Campo>
          <Campo t="Gancho (opcional)"><input value={f.gancho} onChange={(e) => setF({ ...f, gancho: e.target.value })} placeholder="La primera frase de la pieza" style={inp} /></Campo>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Campo t="Formato"><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{FORMATOS.map((x) => <button key={x} type="button" onClick={() => setF({ ...f, formato: x })} style={{ ...chip(f.formato === x), height: 32, fontSize: 12 }}>{x}</button>)}</div></Campo>
            <Campo t="Canal"><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{CANALES.map((x) => <button key={x} type="button" onClick={() => setF({ ...f, canal: x })} style={{ ...chip(f.canal === x), height: 32, fontSize: 12 }}>{x}</button>)}</div></Campo>
          </div>
          <Campo t="Fecha de publicación (opcional)"><input type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} style={inp} /></Campo>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><SB onClick={() => setNueva(false)}>Cancelar</SB><PB disabled={!f.titulo.trim()} onClick={() => void crear()} style={{ opacity: f.titulo.trim() ? 1 : 0.6 }}>Agregar idea</PB></div>
        </Modal>
      )}
    </>
  );
}
