"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { Glass, PB, SB, Eyebrow } from "@/components/ui";
import { useUI, PageHead } from "@/components/shell";
import { datos, eq, fechaCorta, hoyISO, sumaDias, siguienteFolio } from "@/lib/datos";
import { useTarifas } from "@/lib/tarifas";
import { Cargando, Vacio, Campo, Modal, Tabla, fila, mono10, inp, chip, btn, mxn, mxn0 } from "@/components/real";

/* Proyectos con datos reales. Nacen al aceptar una cotización (con sus hitos) o se crean a mano.
   Aquí se mueven de etapa, se aceptan hitos, se registran horas y riesgos, y se factura. */
const ETAPAS = ["Mapear", "Diseñar", "Construir", "Evolucionar"] as const;
const ESTADOS = ["Planeado", "En curso", "En revisión", "Aceptado", "Atrasado"] as const;
const COLOR: Record<string, string> = { Aceptado: C.olivo, "En revisión": C.ambar, "En curso": C.papel, Planeado: C.acero, Atrasado: C.oxido };
type Hito = { id: string; proyecto_id: string; orden: number; nombre: string; etapa: string; fecha: string | null; estado: string; monto: number | null };
type Hora = { id: string; fecha: string; horas: number; que_se_hizo: string | null; hito_id: string | null };
type Riesgo = { id: string; descripcion: string; plan: string | null; abierto: boolean; probabilidad: number; impacto: number };
type Proyecto = { id: string; codigo: string; nombre: string; objetivo: string | null; etapa: string; inicio: string | null; fin: string | null; avance: number; horas_estimadas: number; presupuesto: number; cliente_id: string; cotizacion_id: string | null; cliente?: { nombre: string; sector: string } | null; hitos?: Hito[]; horas?: Hora[]; riesgos?: Riesgo[]; cotizacion?: { folio: string; anticipo_pct: number; credito: number } | null };
type Factura = { id: string; folio: string; proyecto_id: string | null; hito_id: string | null; monto: number; estado: string };
const SEL = "select=*,cliente:clientes(nombre,sector),hitos(*),horas(*),riesgos(*),cotizacion:cotizaciones(folio,anticipo_pct,credito)&order=creado_en.desc";

export default function ProyectosReal() {
  const { flash } = useUI();
  const [tarifas] = useTarifas();
  const [ps, setPs] = useState<Proyecto[] | null>(null);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [clientes, setClientes] = useState<{ id: string; nombre: string }[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [np, setNp] = useState({ cliente: "", nombre: "", objetivo: "", inicio: hoyISO(), horas: "40" });
  const [hr, setHr] = useState({ fecha: hoyISO(), horas: "", que: "", hito: "" });
  const [rg, setRg] = useState({ d: "", plan: "" });
  const [fac, setFac] = useState<{ hito: Hito | null; monto: string; vence: string } | null>(null);
  const hoy = hoyISO();

  const cargar = useCallback(async () => {
    try {
      const [p, f] = await Promise.all([datos.lista<Proyecto>("proyectos", SEL), datos.lista<Factura>("facturas", "select=id,folio,proyecto_id,hito_id,monto,estado")]);
      setPs(p.filas); setFacturas(f.filas); setSel((s) => s ?? p.filas[0]?.id ?? null);
    } catch (e) { flash("No se pudieron cargar los proyectos: " + (e as Error).message); setPs([]); }
  }, [flash]);
  useEffect(() => { void cargar(); void datos.lista<{ id: string; nombre: string }>("clientes", "select=id,nombre&order=nombre").then((r) => setClientes(r.filas)).catch(() => {}); try { if (new URLSearchParams(window.location.search).get("nuevo")) setNuevo(true); } catch {} }, [cargar]);

  const guarda = async (tabla: string, id: string, c: object, msg?: string) => { try { await datos.cambia(tabla, eq("id", id), c); if (msg) flash(msg); await cargar(); } catch (e) { flash("No se guardó: " + (e as Error).message); } };
  const hitosDe = (p: Proyecto) => [...(p.hitos ?? [])].sort((a, b) => a.orden - b.orden);
  const usadas = (p: Proyecto) => (p.horas ?? []).reduce((s, h) => s + Number(h.horas), 0);
  const avanceDe = (hs: Hito[]) => { if (!hs.length) return 0; const t = hs.reduce((s, h) => s + Number(h.monto ?? 0), 0); return t > 0 ? Math.round((hs.filter((h) => h.estado === "Aceptado").reduce((s, h) => s + Number(h.monto ?? 0), 0) / t) * 100) : Math.round((hs.filter((h) => h.estado === "Aceptado").length / hs.length) * 100); };

  if (!ps) return <Cargando />;
  const cur = ps.find((p) => p.id === sel) ?? ps[0];
  const hs = cur ? hitosDe(cur) : [];
  const atrasado = (h: Hito) => h.estado !== "Aceptado" && !!h.fecha && h.fecha < hoy;

  const setHito = async (h: Hito, c: Partial<Hito>) => {
    try {
      await datos.cambia("hitos", eq("id", h.id), { ...c, ...(c.estado === "Aceptado" ? { aceptado_en: new Date().toISOString() } : c.estado ? { aceptado_en: null } : {}) });
      if (c.estado && cur) await datos.cambia("proyectos", eq("id", cur.id), { avance: avanceDe(hs.map((x) => (x.id === h.id ? { ...x, ...c } : x))) });
      if (c.estado === "Aceptado") flash("Hito aceptado · ya puedes facturarlo");
      await cargar();
    } catch (e) { flash("No se guardó: " + (e as Error).message); }
  };
  const addHito = async () => { if (!cur) return; try { await datos.crea("hitos", { proyecto_id: cur.id, orden: hs.length + 1, nombre: `Hito ${hs.length + 1} · `, etapa: cur.etapa, monto: 0 }); await cargar(); } catch (e) { flash("No se guardó: " + (e as Error).message); } };
  const addHoras = async () => { const n = Number(hr.horas.replace(",", ".")); if (!cur || !n) return; try { await datos.crea("horas", { proyecto_id: cur.id, hito_id: hr.hito || null, fecha: hr.fecha || hoy, horas: n, que_se_hizo: hr.que.trim() || null }); setHr({ ...hr, horas: "", que: "" }); flash(`${n} h registradas en ${cur.codigo}`); await cargar(); } catch (e) { flash("No se guardó: " + (e as Error).message); } };
  const addRiesgo = async () => { if (!cur || !rg.d.trim()) return; try { await datos.crea("riesgos", { proyecto_id: cur.id, descripcion: rg.d.trim(), plan: rg.plan.trim() || null }); setRg({ d: "", plan: "" }); await cargar(); } catch (e) { flash("No se guardó: " + (e as Error).message); } };
  const crear = async () => {
    if (!np.cliente || !np.nombre.trim()) return;
    try {
      const codigo = siguienteFolio("P", ps.map((p) => p.codigo), 2);
      const r = await datos.crea<{ id: string }>("proyectos", { codigo, cliente_id: np.cliente, nombre: np.nombre.trim(), objetivo: np.objetivo.trim() || null, etapa: "Mapear", inicio: np.inicio || hoy, horas_estimadas: Number(np.horas) || 0 });
      setNuevo(false); setNp({ ...np, nombre: "", objetivo: "" }); setSel(r.filas[0]?.id ?? null); flash(`Proyecto ${codigo} creado en Mapear`); await cargar();
    } catch (e) { flash("No se guardó: " + (e as Error).message); }
  };
  // Monto a facturar: lo que paga el cliente, con IVA. Anticipo = % del total; cada hito, su parte del resto.
  const iva = 1 + tarifas.ivaPct / 100;
  const sub = hs.reduce((s, h) => s + Number(h.monto ?? 0), 0);
  const pct = (cur?.cotizacion?.anticipo_pct ?? 0) / 100, neto = Math.max(0, sub - Number(cur?.cotizacion?.credito ?? 0));
  const montoAnticipo = Math.round(neto * pct * iva * 100) / 100;
  const montoHito = (h: Hito) => Math.round((sub ? (Number(h.monto ?? 0) / sub) * neto * (1 - pct) : 0) * iva * 100) / 100;
  const facturaDe = (hitoId: string | null) => facturas.find((f) => f.proyecto_id === cur?.id && f.hito_id === hitoId && f.estado !== "Cancelada");
  const facturar = async () => {
    if (!cur || !fac) return; const m = Number(fac.monto.replace(/[^0-9.]/g, "")); if (!m) return;
    try {
      const folio = siguienteFolio(`F-`, facturas.map((f) => f.folio));
      await datos.crea("facturas", { folio, cliente_id: cur.cliente_id, proyecto_id: cur.id, hito_id: fac.hito?.id ?? null, cotizacion_id: cur.cotizacion_id, monto: m, estado: "Vigente", emitida: hoy, vence: fac.vence || null });
      setFac(null); flash(`Factura ${folio} por ${mxn(m)} creada · cuando te paguen, registra el pago en Facturación`); await cargar();
    } catch (e) { flash("No se guardó: " + (e as Error).message); }
  };

  const u = cur ? usadas(cur) : 0, costo = u * tarifas.costoHora, pres = Number(cur?.presupuesto ?? 0);
  const W = "64px 1.6fr 110px 1fr 1.2fr 110px";

  return (
    <>
      <PageHead stage={2} eyebrow="06 · PROYECTOS · LAS CUATRO ETAPAS" title="PROYECTOS" sub={`${ps.length} ${ps.length === 1 ? "proyecto" : "proyectos"} · ${ps.filter((p) => hitosDe(p).some(atrasado)).length} con hito atrasado`} style={{ paddingTop: 34 }}
        right={<PB style={{ height: 48, padding: "0 22px", fontSize: 14 }} onClick={() => setNuevo(true)}>Nuevo proyecto</PB>} />
      <section style={{ padding: "22px 32px 56px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Tabla cols={W} heads={["CÓDIGO", "CLIENTE · PROYECTO", "ETAPA", "AVANCE", "PRÓXIMO HITO", "HORAS"]} titulo="LISTA POR ETAPA">
          {ps.length === 0 && <Vacio>Todavía no hay proyectos. Nacen solos al marcar una cotización como aceptada, con sus hitos; también puedes crear uno con <strong style={{ color: C.papel }}>Nuevo proyecto</strong>.</Vacio>}
          {[...ps].sort((a, b) => ETAPAS.indexOf(a.etapa as typeof ETAPAS[number]) - ETAPAS.indexOf(b.etapa as typeof ETAPAS[number])).map((p) => {
            const h = hitosDe(p), prox = h.find((x) => x.estado !== "Aceptado"), late = !!prox && atrasado(prox);
            return (
              <div key={p.id} onClick={() => setSel(p.id)} style={{ ...fila(W), cursor: "pointer", background: p.id === cur?.id ? "rgba(238,235,228,0.05)" : "transparent" }}>
                <span style={{ width: 40, height: 40, borderRadius: "50%", background: late ? C.oxido : p.etapa === "Evolucionar" ? C.olivo : "#2A2F36", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11 }}>{p.codigo}</span>
                <div style={{ minWidth: 0 }}><div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.cliente?.nombre ?? "—"}</div><div style={{ ...mono10, fontSize: 9.5, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nombre.toUpperCase()}</div></div>
                <span style={{ ...mono10, color: C.papel }}>0{ETAPAS.indexOf(p.etapa as typeof ETAPAS[number]) + 1} · {p.etapa.toUpperCase()}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ flex: 1, height: 6, borderRadius: 3, background: C.p3, overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${p.avance}%`, background: C.papel }} /></span><span style={{ fontFamily: MONO, fontSize: 11 }}>{p.avance} %</span></div>
                <span style={{ fontSize: 13, color: late ? C.oxido : C.niebla, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prox ? `${prox.nombre.replace(/^Hito\s+\d+\s*·\s*/i, "")}${prox.fecha ? " · " + fechaCorta(prox.fecha) : ""}` : h.length ? "Todos aceptados" : "Sin hitos"}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: usadas(p) > Number(p.horas_estimadas) && Number(p.horas_estimadas) > 0 ? C.oxido : C.niebla }}>{usadas(p)} / {Number(p.horas_estimadas)} H</span>
              </div>
            );
          })}
        </Tabla>

        {cur && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 400px", gap: 16, alignItems: "start" }}>
            <Glass style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <Eyebrow>{cur.codigo} · {(cur.cliente?.nombre ?? "").toUpperCase()}{cur.cotizacion ? ` · COTIZACIÓN ${cur.cotizacion.folio}` : ""}</Eyebrow>
                  <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em", marginTop: 6, textTransform: "uppercase" }}>{cur.nombre}</div>
                </div>
                <Link href={`/proyectos/reporte?p=${encodeURIComponent(cur.codigo)}`} target="_blank" style={{ ...btn, height: 40, display: "flex", alignItems: "center", borderColor: C.oxido, flexShrink: 0 }}>Reporte para el cliente ↗</Link>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ ...mono10, marginRight: 4 }}>ETAPA</span>
                {ETAPAS.map((e, i) => <button key={e} type="button" onClick={() => cur.etapa !== e && void guarda("proyectos", cur.id, { etapa: e }, `${cur.codigo} pasa a ${e}`)} style={chip(cur.etapa === e)}>0{i + 1} · {e}</button>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 150px 110px", gap: 10 }}>
                <Campo t="Objetivo en una frase"><input key={cur.id + "o"} defaultValue={cur.objetivo ?? ""} placeholder="Que la orden entre una sola vez…" onBlur={(e) => e.target.value !== (cur.objetivo ?? "") && void guarda("proyectos", cur.id, { objetivo: e.target.value.trim() || null }, "Objetivo guardado")} style={inp} /></Campo>
                <Campo t="Inicio"><input type="date" value={cur.inicio ?? ""} onChange={(e) => void guarda("proyectos", cur.id, { inicio: e.target.value || null })} style={inp} /></Campo>
                <Campo t="Fin"><input type="date" value={cur.fin ?? ""} onChange={(e) => void guarda("proyectos", cur.id, { fin: e.target.value || null })} style={inp} /></Campo>
                <Campo t="Horas estimadas"><input key={cur.id + "h"} defaultValue={Number(cur.horas_estimadas)} inputMode="numeric" onBlur={(e) => Number(e.target.value) !== Number(cur.horas_estimadas) && void guarda("proyectos", cur.id, { horas_estimadas: Number(e.target.value) || 0 }, "Horas estimadas guardadas")} style={{ ...inp, fontFamily: MONO }} /></Campo>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em" }}>HITOS Y ENTREGABLES</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {cur.cotizacion && pct > 0 && (facturaDe(null) ? <span style={{ ...mono10, color: C.olivo, alignSelf: "center" }}>ANTICIPO · {facturaDe(null)!.folio}</span> : <button type="button" onClick={() => setFac({ hito: null, monto: String(montoAnticipo), vence: sumaDias(hoy, 5) })} style={{ ...btn, borderColor: C.oxido }}>Facturar anticipo · {mxn0(montoAnticipo)}</button>)}
                    <SB small onClick={() => void addHito()}>+ Hito</SB>
                  </div>
                </div>
                {hs.length === 0 && <Vacio>Sin hitos. Agrega el primero: cada hito es un entregable que el cliente acepta por escrito.</Vacio>}
                {hs.map((h, i) => { const f = facturaDe(h.id); return (
                  <div key={h.id} style={{ display: "grid", gridTemplateColumns: "34px 1fr 150px 150px 110px auto", gap: 8, alignItems: "center", padding: "8px 0", borderTop: `1px solid ${C.borde}` }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.tenue }}>H{i + 1}</span>
                    <input key={h.id + h.nombre} defaultValue={h.nombre} onBlur={(e) => e.target.value.trim() && e.target.value !== h.nombre && void setHito(h, { nombre: e.target.value.trim() })} style={{ ...inp, height: 38 }} />
                    <input type="date" value={h.fecha ?? ""} onChange={(e) => void setHito(h, { fecha: e.target.value || null })} style={{ ...inp, height: 38, padding: "0 10px", fontSize: 12, borderColor: atrasado(h) ? C.oxido : C.borde }} />
                    <select value={atrasado(h) && h.estado === "Planeado" ? "Atrasado" : h.estado} onChange={(e) => void setHito(h, { estado: e.target.value })} style={{ ...inp, height: 38, appearance: "none", color: COLOR[atrasado(h) ? "Atrasado" : h.estado] ?? C.papel }}>{ESTADOS.map((x) => <option key={x}>{x}</option>)}</select>
                    <input key={h.id + "m" + h.monto} defaultValue={Number(h.monto ?? 0)} inputMode="numeric" title="Monto del hito sin IVA" onBlur={(e) => Number(e.target.value) !== Number(h.monto ?? 0) && void setHito(h, { monto: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 })} style={{ ...inp, height: 38, fontFamily: MONO, textAlign: "right", padding: "0 12px" }} />
                    {f ? <span style={{ ...mono10, color: f.estado === "Pagada" ? C.olivo : C.ambar, minWidth: 84, textAlign: "right" }}>{f.folio} · {f.estado.toUpperCase()}</span> : h.estado === "Aceptado" ? <button type="button" onClick={() => setFac({ hito: h, monto: String(montoHito(h) || Math.round(Number(h.monto ?? 0) * iva * 100) / 100), vence: sumaDias(hoy, 5) })} style={{ ...btn, borderColor: C.oxido }}>Facturar</button> : <span style={{ minWidth: 84 }} />}
                  </div>
                ); })}
              </div>

              <div>
                <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.02em", marginBottom: 6 }}>RIESGOS</div>
                {(cur.riesgos ?? []).map((r) => (
                  <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", padding: "9px 0", borderTop: `1px solid ${C.borde}` }}>
                    <div><div style={{ fontSize: 13.5, color: r.abierto ? C.papel : C.tenue, textDecoration: r.abierto ? "none" : "line-through" }}>{r.descripcion}</div>{r.plan && <div style={{ fontSize: 12.5, color: C.niebla, marginTop: 2 }}>Plan: {r.plan}</div>}</div>
                    <button type="button" onClick={() => void guarda("riesgos", r.id, { abierto: !r.abierto })} style={btn}>{r.abierto ? "Cerrar" : "Reabrir"}</button>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, paddingTop: 8, borderTop: `1px solid ${C.borde}` }}>
                  <input value={rg.d} onChange={(e) => setRg({ ...rg, d: e.target.value })} placeholder="Riesgo: qué puede salir mal" style={{ ...inp, height: 38 }} />
                  <input value={rg.plan} onChange={(e) => setRg({ ...rg, plan: e.target.value })} placeholder="Plan: cómo se atiende" style={{ ...inp, height: 38 }} />
                  <SB small onClick={() => void addRiesgo()}>Agregar</SB>
                </div>
              </div>
            </Glass>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "rgba(238,235,228,0.94)", color: C.tinta, borderRadius: 28, padding: 22, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ ...mono10, color: C.acero }}>NÚMEROS DEL PROYECTO · SIN IVA</div>
                {[["Presupuesto", mxn0(pres)], [`Horas usadas`, `${u} de ${Number(cur.horas_estimadas)} h`], [`Costo de horas · ${tarifas.costoHora}/h`, mxn0(costo)], ["Margen a la fecha", pres ? `${mxn0(pres - costo)} · ${Math.round(((pres - costo) / pres) * 100)} %` : "—"], ["Avance por hitos", `${cur.avance} %`]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 0", borderTop: "1px solid #D6D2C9", fontSize: 13 }}><span style={{ color: C.acero }}>{k}</span><span style={{ fontWeight: 900, fontSize: 15, letterSpacing: "-0.01em", color: k === "Margen a la fecha" && pres - costo < 0 ? C.oxido : C.tinta }}>{v}</span></div>
                ))}
              </div>
              <Glass style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Eyebrow>REGISTRAR HORAS · {cur.codigo}</Eyebrow>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 8 }}>
                  <input type="date" value={hr.fecha} onChange={(e) => setHr({ ...hr, fecha: e.target.value })} style={{ ...inp, height: 40 }} />
                  <input value={hr.horas} onChange={(e) => setHr({ ...hr, horas: e.target.value })} placeholder="h" inputMode="decimal" style={{ ...inp, height: 40, fontFamily: MONO, textAlign: "right" }} />
                </div>
                <select value={hr.hito} onChange={(e) => setHr({ ...hr, hito: e.target.value })} style={{ ...inp, height: 40, appearance: "none" }}><option value="">Sin hito</option>{hs.map((h, i) => <option key={h.id} value={h.id}>H{i + 1} · {h.nombre.replace(/^Hito\s+\d+\s*·\s*/i, "")}</option>)}</select>
                <input value={hr.que} onChange={(e) => setHr({ ...hr, que: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") void addHoras(); }} placeholder="Qué se hizo (sale en el reporte al cliente)" style={{ ...inp, height: 40 }} />
                <PB small disabled={!Number(hr.horas.replace(",", "."))} onClick={() => void addHoras()}>Registrar horas</PB>
                {[...(cur.horas ?? [])].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 6).map((h) => (
                  <div key={h.id} style={{ display: "grid", gridTemplateColumns: "56px 1fr 44px", gap: 8, padding: "7px 0", borderTop: `1px solid ${C.borde}`, fontSize: 12.5 }}><span style={{ fontFamily: MONO, fontSize: 11, color: C.tenue }}>{fechaCorta(h.fecha).toUpperCase()}</span><span style={{ color: C.niebla }}>{h.que_se_hizo ?? "—"}</span><span style={{ fontFamily: MONO, fontSize: 11, textAlign: "right" }}>{Number(h.horas)} H</span></div>
                ))}
              </Glass>
            </div>
          </div>
        )}
      </section>

      {nuevo && (
        <Modal titulo="NUEVO PROYECTO" kicker="ENTRA EN 01 · MAPEAR" onClose={() => setNuevo(false)}>
          {clientes.length === 0 ? <Vacio>Primero da de alta al cliente en <Link href="/clientes" style={{ color: C.papel, textDecoration: "underline" }}>Clientes</Link>.</Vacio> : <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Campo t="Cliente"><select value={np.cliente} onChange={(e) => setNp({ ...np, cliente: e.target.value })} style={{ ...inp, appearance: "none" }}><option value="">Elige un cliente</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></Campo>
              <Campo t="Proyecto"><input value={np.nombre} onChange={(e) => setNp({ ...np, nombre: e.target.value })} placeholder="Catálogo en línea" style={inp} /></Campo>
              <Campo t="Inicio"><input type="date" value={np.inicio} onChange={(e) => setNp({ ...np, inicio: e.target.value })} style={inp} /></Campo>
              <Campo t="Horas estimadas"><input value={np.horas} inputMode="numeric" onChange={(e) => setNp({ ...np, horas: e.target.value })} style={{ ...inp, fontFamily: MONO }} /></Campo>
            </div>
            <Campo t="Objetivo en una frase"><input value={np.objetivo} onChange={(e) => setNp({ ...np, objetivo: e.target.value })} style={inp} /></Campo>
            <div style={{ fontSize: 12.5, color: C.tenue }}>Si el proyecto viene de una cotización, mejor márcala como aceptada en Cotizaciones: crea el proyecto con sus hitos y montos.</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><SB onClick={() => setNuevo(false)}>Cancelar</SB><PB disabled={!np.cliente || !np.nombre.trim()} onClick={() => void crear()} style={{ opacity: np.cliente && np.nombre.trim() ? 1 : 0.6 }}>Crear proyecto</PB></div>
          </>}
        </Modal>
      )}

      {fac && cur && (
        <Modal titulo={fac.hito ? "FACTURAR HITO" : "FACTURAR ANTICIPO"} kicker={`${cur.codigo} · ${(cur.cliente?.nombre ?? "").toUpperCase()}`} onClose={() => setFac(null)} ancho={460}>
          <div style={{ fontSize: 13.5, color: C.niebla, lineHeight: 1.5 }}>{fac.hito ? fac.hito.nombre : `Anticipo de ${Math.round(pct * 100)} % de la cotización ${cur.cotizacion?.folio ?? ""}`}. Monto sugerido con IVA de {tarifas.ivaPct} %{fac.hito && pct > 0 ? `, descontando la parte ya cubierta por el anticipo` : ""}.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Campo t="Monto con IVA (MXN)"><input value={fac.monto} inputMode="decimal" onChange={(e) => setFac({ ...fac, monto: e.target.value })} style={{ ...inp, fontFamily: MONO }} /></Campo>
            <Campo t="Vence"><input type="date" value={fac.vence} onChange={(e) => setFac({ ...fac, vence: e.target.value })} style={inp} /></Campo>
          </div>
          <div style={{ fontSize: 12.5, color: C.tenue }}>Se registra la factura en Musashi para llevar la cobranza. El CFDI se emite aparte hasta conectar Facturapi.</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><SB onClick={() => setFac(null)}>Cancelar</SB><PB onClick={() => void facturar()}>Crear factura</PB></div>
        </Modal>
      )}
    </>
  );
}
