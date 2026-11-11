"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { PB, SB, Dot } from "@/components/ui";
import { useUI, PageHead } from "@/components/shell";
import { datos, eq, fechaCorta, hoyISO, sumaDias, siguienteFolio } from "@/lib/datos";
import { fechaCobro, periodoCorto, periodosQueTocan, proximoCobro, type Mensualidad } from "@/lib/mensualidades-base";
import { Cargando, Vacio, Campo, Modal, Tabla, Kpis, fila, mono10, inp, chip, btn, mxn } from "@/components/real";

/* Facturación con datos reales: lleva la cobranza (qué se facturó, qué vence, qué se pagó)
   y las mensualidades, que generan solas la factura de cada mes el día de cobro.
   El CFDI todavía se emite fuera de Musashi; se conecta con Facturapi. */
type Factura = { id: string; folio: string; cliente_id: string; proyecto_id: string | null; hito_id: string | null; monto: number; estado: "Borrador" | "Vigente" | "Vencida" | "Pagada" | "Cancelada"; emitida: string | null; vence: string | null; uuid_sat: string | null; mensualidad_id?: string | null; periodo?: string | null; cliente?: { nombre: string } | null; proyecto?: { codigo: string } | null; hito?: { nombre: string } | null };
type Mens = Mensualidad & { cliente?: { nombre: string } | null };
type FormaM = { id?: string; cliente: string; concepto: string; monto: string; dia: string; plazo: string; inicio: string; fin: string; notas: string };
const METODOS = ["Transferencia", "Efectivo", "Tarjeta", "Stripe"];
const TABS = ["Facturas", "Mensualidades"] as const;
const num = (s: string) => Number(String(s).replace(/[^0-9.]/g, "")) || 0;

export default function FacturacionReal() {
  const { flash } = useUI();
  const [fs, setFs] = useState<Factura[] | null>(null);
  const [ms, setMs] = useState<Mens[]>([]);
  const [lista, setLista] = useState<boolean | null>(null); // false = falta correr la migración de mensualidades
  const [clientes, setClientes] = useState<{ id: string; nombre: string }[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Facturas");
  const [filtro, setFiltro] = useState("Por cobrar");
  const [nueva, setNueva] = useState(false);
  const [f, setF] = useState({ cliente: "", monto: "", vence: sumaDias(hoyISO(), 5) });
  const [pago, setPago] = useState<{ f: Factura; fecha: string; metodo: string } | null>(null);
  const [fm, setFm] = useState<FormaM | null>(null);
  const hoy = hoyISO();

  const cargar = useCallback(() => datos.lista<Factura>("facturas", "select=*,cliente:clientes(nombre),proyecto:proyectos(codigo),hito:hitos(nombre)&order=creado_en.desc").then((r) => setFs(r.filas)).catch((e) => { flash("No se pudieron cargar las facturas: " + (e as Error).message); setFs([]); }), [flash]);
  const cargarMens = useCallback(() => datos.lista<Mens>("mensualidades", "select=*,cliente:clientes(nombre)&order=creado_en.desc").then((r) => setMs(r.filas)).catch(() => setMs([])), []);
  /** Pide al servidor las facturas de mensualidad que ya tocan. Repetirlo no duplica nada. */
  const generar = useCallback(async () => {
    try {
      const r = await fetch("/api/mensualidades/generar", { method: "POST" }); const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `error ${r.status}`);
      setLista(Boolean(d.lista));
      const g = (d.generadas ?? []) as { folio: string; cliente: string; periodo: string }[];
      if (g.length) flash(g.length === 1 ? `Se generó ${g[0].folio} · mensualidad de ${g[0].cliente} · ${periodoCorto(g[0].periodo)}` : `Se generaron ${g.length} facturas de mensualidad`);
      if (d.lista) await cargarMens();
      return g.length;
    } catch (e) { flash("No se pudieron revisar las mensualidades: " + (e as Error).message); return 0; }
  }, [flash, cargarMens]);
  useEffect(() => {
    void generar().then(() => cargar());
    void datos.lista<{ id: string; nombre: string }>("clientes", "select=id,nombre&order=nombre").then((r) => setClientes(r.filas)).catch(() => {});
    if (new URLSearchParams(window.location.search).get("tab") === "mensualidades") setTab("Mensualidades");
  }, [cargar, generar]);

  if (!fs) return <Cargando />;
  const vencida = (x: Factura) => x.estado === "Vencida" || (x.estado === "Vigente" && !!x.vence && x.vence < hoy);
  const abiertas = fs.filter((x) => x.estado === "Vigente" || x.estado === "Vencida");
  const porCobrar = abiertas.reduce((s, x) => s + Number(x.monto), 0), vencido = abiertas.filter(vencida).reduce((s, x) => s + Number(x.monto), 0);
  const mes = hoy.slice(0, 7);
  const facturadoMes = fs.filter((x) => x.estado !== "Cancelada" && x.estado !== "Borrador" && (x.emitida ?? "").slice(0, 7) === mes).reduce((s, x) => s + Number(x.monto), 0);
  const listaF = fs.filter((x) => filtro === "Todas" || (filtro === "Por cobrar" ? x.estado === "Vigente" || x.estado === "Vencida" : filtro === "Vencidas" ? vencida(x) : x.estado === filtro.replace(/s$/, "")));
  const mensDe = (x: Factura) => (x.periodo ? `${ms.find((m) => m.id === x.mensualidad_id)?.concepto ?? "Mensualidad"} · ${periodoCorto(x.periodo)}` : null);
  const conceptoDe = (x: Factura) => mensDe(x) ?? x.hito?.nombre ?? (x.proyecto ? `Anticipo · ${x.proyecto.codigo}` : "Factura directa");

  /* ---------- Mensualidades ---------- */
  const sinFacturas = (m: Mens) => !fs.some((x) => x.mensualidad_id === m.id);
  const estadoM = (m: Mens) => (m.fin && m.fin < hoy ? "Terminada" : m.activa ? "Activa" : sinFacturas(m) ? "Por activar" : "En pausa");
  const vivas = ms.filter((m) => estadoM(m) === "Activa");
  const recurrente = vivas.reduce((s, m) => s + Number(m.monto), 0);
  const prox = vivas.map((m) => ({ m, f: proximoCobro(m, hoy) })).filter((x) => x.f).sort((a, b) => (a.f! < b.f! ? -1 : 1))[0];
  const abiertasM = abiertas.filter((x) => x.periodo);
  const borrador = (x: FormaM) => ({ dia_cobro: Math.min(28, Math.max(1, Math.round(num(x.dia)) || 1)), inicio: x.inicio || hoy, fin: x.fin || null, activa: true, reanudada: null });
  const primer = (x: FormaM) => { const r = borrador(x), toca = periodosQueTocan(r, hoy); return toca.length ? { fecha: fechaCobro(toca[0], r.dia_cobro), ya: toca.length } : { fecha: proximoCobro(r, hoy), ya: 0 }; };

  const crear = async () => {
    const m = num(f.monto); if (!f.cliente || !m) return;
    try { const folio = siguienteFolio("F-", fs.map((x) => x.folio)); await datos.crea("facturas", { folio, cliente_id: f.cliente, monto: m, estado: "Vigente", emitida: hoy, vence: f.vence || null }); setNueva(false); setF({ ...f, monto: "" }); flash(`Factura ${folio} registrada`); await cargar(); } catch (e) { flash("No se guardó: " + (e as Error).message); }
  };
  const cobrar = async () => {
    if (!pago) return; const x = pago.f;
    try {
      await datos.crea("movimientos", { tipo: "Cobro", fecha: pago.fecha, cliente_id: x.cliente_id, factura_id: x.id, concepto: `Pago de ${x.folio}${mensDe(x) ? " · " + mensDe(x) : x.hito ? " · " + x.hito.nombre : ""}`, metodo: pago.metodo, referencia: x.folio, monto: Number(x.monto) });
      await datos.cambia("facturas", eq("id", x.id), { estado: "Pagada" });
      setPago(null); flash(`Cobro de ${mxn(Number(x.monto))} registrado · ${x.folio} pagada`); await cargar();
    } catch (e) { flash("No se guardó: " + (e as Error).message); }
  };
  const cancelar = async (x: Factura) => { if (!window.confirm(`¿Cancelar la factura ${x.folio}?${x.periodo ? " La mensualidad no vuelve a generar la de ese mes." : ""}`)) return; try { await datos.cambia("facturas", eq("id", x.id), { estado: "Cancelada" }); flash(`${x.folio} cancelada`); await cargar(); } catch (e) { flash("No se guardó: " + (e as Error).message); } };

  const abrirM = (m?: Mens) => setFm(m ? { id: m.id, cliente: m.cliente_id, concepto: m.concepto, monto: String(Number(m.monto)), dia: String(m.dia_cobro), plazo: String(m.dias_para_pagar), inicio: m.inicio, fin: m.fin ?? "", notas: m.notas ?? "" } : { cliente: "", concepto: "Mensualidad · hospedaje y soporte", monto: "", dia: "1", plazo: "5", inicio: hoy, fin: "", notas: "" });
  const guardarM = async () => {
    if (!fm) return; const monto = num(fm.monto); if (!fm.cliente || !monto || !fm.concepto.trim()) return;
    const b = borrador(fm);
    const fila = { cliente_id: fm.cliente, concepto: fm.concepto.trim(), monto, dia_cobro: b.dia_cobro, dias_para_pagar: Math.min(90, Math.round(num(fm.plazo))), inicio: b.inicio, fin: b.fin, notas: fm.notas.trim() || null };
    try {
      if (fm.id) await datos.cambia("mensualidades", eq("id", fm.id), fila); else await datos.crea("mensualidades", fila);
      setFm(null); if (!(await generar())) flash(fm.id ? "Mensualidad actualizada" : "Mensualidad creada"); await cargar();
    } catch (e) { flash("No se guardó: " + (e as Error).message); }
  };
  const pausar = async (m: Mens) => {
    try {
      await datos.cambia("mensualidades", eq("id", m.id), m.activa ? { activa: false } : { activa: true, reanudada: hoy });
      if (m.activa) { flash("Mensualidad en pausa: no genera facturas hasta que la reanudes"); await cargarMens(); }
      else { const nueva = sinFacturas(m), p = proximoCobro({ ...m, activa: true, reanudada: hoy }, hoy); if (!(await generar())) flash(nueva ? `Mensualidad activa · primer cobro ${fechaCorta(p)}` : "Mensualidad reanudada: los meses en pausa no se cobran"); await cargar(); }
    } catch (e) { flash("No se guardó: " + (e as Error).message); }
  };
  const borrarM = async () => {
    if (!fm?.id || !window.confirm("¿Eliminar esta mensualidad? Las facturas que ya generó se conservan.")) return;
    try { await datos.borra("mensualidades", eq("id", fm.id)); setFm(null); flash("Mensualidad eliminada"); await cargarMens(); await cargar(); } catch (e) { flash("No se eliminó: " + (e as Error).message); }
  };
  const W = "80px 1.4fr 1.3fr 110px 130px 130px 190px";
  const WM = "1.3fr 1.5fr 130px 90px 150px 120px 170px";
  const okM = fm && fm.cliente && num(fm.monto) > 0 && fm.concepto.trim();

  return (
    <>
      <PageHead stage={3} eyebrow="09 · FACTURACIÓN Y COBRANZA" title="FACTURACIÓN" sub={`${abiertas.length} por cobrar · ${abiertas.filter(vencida).length} vencidas · ${vivas.length} ${vivas.length === 1 ? "mensualidad activa" : "mensualidades activas"}`} style={{ paddingTop: 34 }}
        right={tab === "Facturas" ? <PB style={{ height: 48, padding: "0 22px", fontSize: 14 }} onClick={() => setNueva(true)}>Nueva factura</PB> : lista ? <PB style={{ height: 48, padding: "0 22px", fontSize: 14 }} onClick={() => abrirM()}>Nueva mensualidad</PB> : undefined} />
      <nav style={{ display: "flex", gap: 6, padding: "22px 32px 0" }}>{TABS.map((l) => <button key={l} type="button" onClick={() => setTab(l)} style={{ ...chip(tab === l), height: 44, padding: "0 18px", fontSize: 13 }}>{l}{l === "Mensualidades" && vivas.length ? ` · ${vivas.length}` : ""}</button>)}</nav>

      {tab === "Facturas" && (
        <section style={{ padding: "22px 32px 56px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Kpis items={[["POR COBRAR", mxn(porCobrar), `${abiertas.length} ${abiertas.length === 1 ? "factura" : "facturas"}`, C.ambar], ["VENCIDO", mxn(vencido), `${abiertas.filter(vencida).length} vencidas`, C.oxido], ["FACTURADO ESTE MES", mxn(facturadoMes), "montos con IVA", C.papel], ["PAGADAS", String(fs.filter((x) => x.estado === "Pagada").length), "en total", C.olivo]]} />
          <Tabla cols={W} heads={["FOLIO", "CLIENTE", "CONCEPTO", "EMITIDA", "VENCE", "MONTO", ""]} titulo="FACTURAS"
            extra={<div style={{ display: "flex", gap: 6 }}>{["Por cobrar", "Vencidas", "Pagadas", "Canceladas", "Todas"].map((x) => <button key={x} type="button" onClick={() => setFiltro(x)} style={{ ...chip(filtro === x), height: 32, padding: "0 12px", fontSize: 12 }}>{x}</button>)}</div>}>
            {listaF.length === 0 && <Vacio>{fs.length === 0 ? <>Todavía no hay facturas. Se crean desde <Link href="/proyectos" style={{ color: C.papel, textDecoration: "underline" }}>Proyectos</Link> al facturar el anticipo o un hito aceptado, solas cada mes desde una mensualidad, o aquí con <strong style={{ color: C.papel }}>Nueva factura</strong>.</> : "Ninguna en este filtro."}</Vacio>}
            {listaF.map((x) => { const v = vencida(x); return (
              <div key={x.id} style={fila(W)}>
                <span style={{ fontFamily: MONO, fontSize: 11 }}>{x.folio}</span>
                <span>{x.cliente?.nombre ?? "—"}</span>
                <span style={{ fontSize: 13, color: C.niebla, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conceptoDe(x)}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{fechaCorta(x.emitida).toUpperCase()}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, ...mono10, color: C.papel }}><Dot color={x.estado === "Pagada" ? C.olivo : x.estado === "Cancelada" ? C.acero : v ? C.oxido : C.ambar} anim={v ? "pulseOx 2s infinite" : undefined} />{x.estado === "Pagada" ? "PAGADA" : x.estado === "Cancelada" ? "CANCELADA" : v ? "VENCIDA" : fechaCorta(x.vence).toUpperCase()}</span>
                <span style={{ fontFamily: MONO, fontSize: 12 }}>{mxn(Number(x.monto))}</span>
                <span style={{ display: "flex", gap: 6, justifyContent: "flex-end", minWidth: 170 }}>
                  {(x.estado === "Vigente" || x.estado === "Vencida") && <><button type="button" onClick={() => setPago({ f: x, fecha: hoy, metodo: "Transferencia" })} style={{ ...btn, background: C.papel, color: C.tinta, borderColor: C.papel, fontWeight: 600 }}>Registrar pago</button><button type="button" onClick={() => void cancelar(x)} style={{ ...btn, border: "none", color: C.tenue }}>Cancelar</button></>}
                </span>
              </div>
            ); })}
          </Tabla>
          <div style={{ fontSize: 12.5, color: C.tenue, lineHeight: 1.5 }}>Musashi lleva aquí la cobranza. El CFDI se emite por ahora en tu portal o sistema de facturación; cuando se conecte Facturapi, el timbrado saldrá desde esta pantalla con tus datos fiscales de Configuración.</div>
        </section>
      )}

      {tab === "Mensualidades" && (
        <section style={{ padding: "22px 32px 56px", display: "flex", flexDirection: "column", gap: 16 }}>
          {lista === false ? (
            <Vacio>
              <strong style={{ color: C.papel }}>Falta un paso en Supabase para activar las mensualidades.</strong> Abre el SQL Editor de tu proyecto, pega el contenido de <span style={{ fontFamily: MONO, fontSize: 12, color: C.papel }}>musashi/supabase/migrations/0002_mensualidades.sql</span> y ejecútalo una vez. Crea la tabla de mensualidades y liga cada factura mensual con su mes. Después recarga esta página.
            </Vacio>
          ) : (
            <>
              <Kpis items={[["RECURRENTE AL MES", mxn(recurrente), `${vivas.length} ${vivas.length === 1 ? "mensualidad activa" : "mensualidades activas"} · con IVA`, C.papel], ["PRÓXIMO COBRO", prox ? fechaCorta(prox.f).toUpperCase() : "—", prox ? `${prox.m.cliente?.nombre ?? ""} · ${mxn(Number(prox.m.monto))}` : "sin cobros programados", C.ambar], ["POR COBRAR", mxn(abiertasM.reduce((s, x) => s + Number(x.monto), 0)), `${abiertasM.length} ${abiertasM.length === 1 ? "factura de mensualidad" : "facturas de mensualidad"}`, C.ambar], ["VENCIDO", mxn(abiertasM.filter(vencida).reduce((s, x) => s + Number(x.monto), 0)), `${abiertasM.filter(vencida).length} vencidas`, C.oxido]]} />
              <Tabla cols={WM} heads={["CLIENTE", "CONCEPTO", "MONTO", "DÍA", "PRÓXIMO COBRO", "ESTADO", ""]} titulo="MENSUALIDADES">
                {ms.length === 0 && <Vacio>Todavía no hay mensualidades. Crea una con <strong style={{ color: C.papel }}>Nueva mensualidad</strong>: eliges cliente, monto y día de cobro, y Musashi genera sola la factura de cada mes ese día.</Vacio>}
                {ms.map((m) => { const e = estadoM(m), p = proximoCobro(m, hoy); return (
                  <div key={m.id} style={fila(WM)}>
                    <span>{m.cliente?.nombre ?? "—"}</span>
                    <span style={{ fontSize: 13, color: C.niebla, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.concepto}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12 }}>{mxn(Number(m.monto))}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>DÍA {m.dia_cobro}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{e === "Activa" && p ? fechaCorta(p).toUpperCase() : "—"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, ...mono10, color: C.papel }}><Dot color={e === "Activa" ? C.olivo : e === "Terminada" ? C.acero : C.ambar} />{e.toUpperCase()}</span>
                    <span style={{ display: "flex", gap: 6, justifyContent: "flex-end", minWidth: 170 }}>
                      <button type="button" onClick={() => abrirM(m)} style={btn}>Editar</button>
                      {e !== "Terminada" && <button type="button" onClick={() => void pausar(m)} style={{ ...btn, border: "none", color: C.tenue }}>{m.activa ? "Pausar" : sinFacturas(m) ? "Activar" : "Reanudar"}</button>}
                    </span>
                  </div>
                ); })}
              </Tabla>
              <div style={{ fontSize: 12.5, color: C.tenue, lineHeight: 1.5 }}>La factura de cada mes se genera el día de cobro, al abrir Musashi o cuando corre el agente Cobrador, y aparece en Facturas como cualquier otra. Musashi no cobra a la tarjeta del cliente ni le manda avisos por sí solo: el pago lo registras tú cuando llega.</div>
            </>
          )}
        </section>
      )}

      {nueva && (
        <Modal titulo="NUEVA FACTURA" kicker="FACTURA DIRECTA · SIN PROYECTO" onClose={() => setNueva(false)} ancho={520}>
          <Campo t="Cliente"><select value={f.cliente} onChange={(e) => setF({ ...f, cliente: e.target.value })} style={{ ...inp, appearance: "none" }}><option value="">Elige un cliente</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></Campo>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Campo t="Monto con IVA (MXN)"><input value={f.monto} inputMode="decimal" onChange={(e) => setF({ ...f, monto: e.target.value })} style={{ ...inp, fontFamily: MONO }} /></Campo>
            <Campo t="Vence"><input type="date" value={f.vence} onChange={(e) => setF({ ...f, vence: e.target.value })} style={inp} /></Campo>
          </div>
          <div style={{ fontSize: 12.5, color: C.tenue }}>Para facturar el anticipo o un hito de un proyecto, hazlo desde Proyectos: calcula el monto y liga la factura al hito. Para un cobro que se repite cada mes, crea una mensualidad.</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><SB onClick={() => setNueva(false)}>Cancelar</SB><PB disabled={!f.cliente || !Number(f.monto)} onClick={() => void crear()} style={{ opacity: f.cliente && Number(f.monto) ? 1 : 0.6 }}>Registrar factura</PB></div>
        </Modal>
      )}
      {pago && (
        <Modal titulo="REGISTRAR PAGO" kicker={`${pago.f.folio} · ${(pago.f.cliente?.nombre ?? "").toUpperCase()} · ${mxn(Number(pago.f.monto))}`} onClose={() => setPago(null)} ancho={460}>
          <Campo t="Fecha del pago"><input type="date" value={pago.fecha} onChange={(e) => setPago({ ...pago, fecha: e.target.value })} style={inp} /></Campo>
          <Campo t="Método"><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{METODOS.map((m) => <button key={m} type="button" onClick={() => setPago({ ...pago, metodo: m })} style={chip(pago.metodo === m)}>{m}</button>)}</div></Campo>
          <div style={{ fontSize: 12.5, color: C.tenue }}>Marca la factura como pagada y suma el cobro al mes en Finanzas y al saldo del cliente.</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><SB onClick={() => setPago(null)}>Cancelar</SB><PB onClick={() => void cobrar()}>Registrar pago</PB></div>
        </Modal>
      )}
      {fm && (() => { const p = primer(fm); return (
        <Modal titulo={fm.id ? "EDITAR MENSUALIDAD" : "NUEVA MENSUALIDAD"} kicker="COBRO QUE SE REPITE CADA MES" onClose={() => setFm(null)} ancho={560}>
          <Campo t="Cliente"><select value={fm.cliente} disabled={Boolean(fm.id)} onChange={(e) => setFm({ ...fm, cliente: e.target.value })} style={{ ...inp, appearance: "none", opacity: fm.id ? 0.6 : 1 }}><option value="">Elige un cliente</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></Campo>
          <Campo t="Concepto (aparece en la factura de cada mes)"><input value={fm.concepto} onChange={(e) => setFm({ ...fm, concepto: e.target.value })} style={inp} /></Campo>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 10 }}>
            <Campo t="Monto mensual con IVA (MXN)"><input value={fm.monto} inputMode="decimal" placeholder="2900" onChange={(e) => setFm({ ...fm, monto: e.target.value })} style={{ ...inp, fontFamily: MONO }} /></Campo>
            <Campo t="Día de cobro (1 a 28)"><input value={fm.dia} inputMode="numeric" onChange={(e) => setFm({ ...fm, dia: e.target.value.replace(/\D/g, "").slice(0, 2) })} style={{ ...inp, fontFamily: MONO }} /></Campo>
            <Campo t="Días para pagar"><input value={fm.plazo} inputMode="numeric" onChange={(e) => setFm({ ...fm, plazo: e.target.value.replace(/\D/g, "").slice(0, 2) })} style={{ ...inp, fontFamily: MONO }} /></Campo>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Campo t="Empieza"><input type="date" value={fm.inicio} onChange={(e) => setFm({ ...fm, inicio: e.target.value })} style={inp} /></Campo>
            <Campo t="Termina (opcional)"><input type="date" value={fm.fin} onChange={(e) => setFm({ ...fm, fin: e.target.value })} style={inp} /></Campo>
          </div>
          <Campo t="Notas internas (opcional)"><input value={fm.notas} onChange={(e) => setFm({ ...fm, notas: e.target.value })} placeholder="Qué incluye, horas de cambios, plazo mínimo…" style={inp} /></Campo>
          <div style={{ fontSize: 12.5, color: p.ya ? C.ambar : C.tenue, lineHeight: 1.5 }}>
            {!fm.id && (p.ya ? `Con estas fechas, al guardar se ${p.ya === 1 ? "genera de inmediato la factura" : `generan de inmediato ${p.ya} facturas`} desde el ${fechaCorta(p.fecha)}. Si no quieres cobrar meses pasados, mueve la fecha en que empieza.` : p.fecha ? `Primer cobro: ${fechaCorta(p.fecha)}. Ese día se genera la factura y vence ${Math.round(num(fm.plazo))} días después.` : "Con estas fechas no se genera ningún cobro: revisa cuándo empieza y cuándo termina.")}
            {fm.id && (ms.find((x) => x.id === fm.id && !x.activa && sinFacturas(x)) ? "Está por activar: ajusta aquí el día de cobro y luego usa Activar en la lista. El primer cobro cae en ese día a partir de que la actives." : "Los cambios aplican a las facturas que se generen de aquí en adelante; las ya generadas no se tocan.")}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
            <span>{fm.id && <button type="button" onClick={() => void borrarM()} style={{ ...btn, height: 44, border: "none", color: C.oxido }}>Eliminar</button>}</span>
            <span style={{ display: "flex", gap: 8 }}><SB onClick={() => setFm(null)}>Cancelar</SB><PB disabled={!okM} onClick={() => void guardarM()} style={{ opacity: okM ? 1 : 0.6 }}>{fm.id ? "Guardar cambios" : "Crear mensualidad"}</PB></span>
          </div>
        </Modal>
      ); })()}
    </>
  );
}
