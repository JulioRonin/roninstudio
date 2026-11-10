"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { PB, SB, Dot } from "@/components/ui";
import { useUI, PageHead } from "@/components/shell";
import { datos, eq, fechaCorta, hoyISO, sumaDias, siguienteFolio } from "@/lib/datos";
import { Cargando, Vacio, Campo, Modal, Tabla, Kpis, fila, mono10, inp, chip, btn, mxn } from "@/components/real";

/* Facturación con datos reales: lleva la cobranza (qué se facturó, qué vence, qué se pagó).
   El CFDI todavía se emite fuera de Musashi; se conecta con Facturapi. */
type Factura = { id: string; folio: string; cliente_id: string; proyecto_id: string | null; hito_id: string | null; monto: number; estado: "Borrador" | "Vigente" | "Vencida" | "Pagada" | "Cancelada"; emitida: string | null; vence: string | null; uuid_sat: string | null; cliente?: { nombre: string } | null; proyecto?: { codigo: string } | null; hito?: { nombre: string } | null };
const METODOS = ["Transferencia", "Efectivo", "Tarjeta", "Stripe"];

export default function FacturacionReal() {
  const { flash } = useUI();
  const [fs, setFs] = useState<Factura[] | null>(null);
  const [clientes, setClientes] = useState<{ id: string; nombre: string }[]>([]);
  const [filtro, setFiltro] = useState("Por cobrar");
  const [nueva, setNueva] = useState(false);
  const [f, setF] = useState({ cliente: "", monto: "", vence: sumaDias(hoyISO(), 5) });
  const [pago, setPago] = useState<{ f: Factura; fecha: string; metodo: string } | null>(null);
  const hoy = hoyISO();

  const cargar = useCallback(() => datos.lista<Factura>("facturas", "select=*,cliente:clientes(nombre),proyecto:proyectos(codigo),hito:hitos(nombre)&order=creado_en.desc").then((r) => setFs(r.filas)).catch((e) => { flash("No se pudieron cargar las facturas: " + (e as Error).message); setFs([]); }), [flash]);
  useEffect(() => { void cargar(); void datos.lista<{ id: string; nombre: string }>("clientes", "select=id,nombre&order=nombre").then((r) => setClientes(r.filas)).catch(() => {}); }, [cargar]);

  if (!fs) return <Cargando />;
  const vencida = (x: Factura) => x.estado === "Vencida" || (x.estado === "Vigente" && !!x.vence && x.vence < hoy);
  const abiertas = fs.filter((x) => x.estado === "Vigente" || x.estado === "Vencida");
  const porCobrar = abiertas.reduce((s, x) => s + Number(x.monto), 0), vencido = abiertas.filter(vencida).reduce((s, x) => s + Number(x.monto), 0);
  const mes = hoy.slice(0, 7);
  const facturadoMes = fs.filter((x) => x.estado !== "Cancelada" && x.estado !== "Borrador" && (x.emitida ?? "").slice(0, 7) === mes).reduce((s, x) => s + Number(x.monto), 0);
  const lista = fs.filter((x) => filtro === "Todas" || (filtro === "Por cobrar" ? x.estado === "Vigente" || x.estado === "Vencida" : filtro === "Vencidas" ? vencida(x) : x.estado === filtro.replace(/s$/, "")));

  const crear = async () => {
    const m = Number(f.monto.replace(/[^0-9.]/g, "")); if (!f.cliente || !m) return;
    try { const folio = siguienteFolio("F-", fs.map((x) => x.folio)); await datos.crea("facturas", { folio, cliente_id: f.cliente, monto: m, estado: "Vigente", emitida: hoy, vence: f.vence || null }); setNueva(false); setF({ ...f, monto: "" }); flash(`Factura ${folio} registrada`); await cargar(); } catch (e) { flash("No se guardó: " + (e as Error).message); }
  };
  const cobrar = async () => {
    if (!pago) return; const x = pago.f;
    try {
      await datos.crea("movimientos", { tipo: "Cobro", fecha: pago.fecha, cliente_id: x.cliente_id, factura_id: x.id, concepto: `Pago de ${x.folio}${x.hito ? " · " + x.hito.nombre : ""}`, metodo: pago.metodo, referencia: x.folio, monto: Number(x.monto) });
      await datos.cambia("facturas", eq("id", x.id), { estado: "Pagada" });
      setPago(null); flash(`Cobro de ${mxn(Number(x.monto))} registrado · ${x.folio} pagada`); await cargar();
    } catch (e) { flash("No se guardó: " + (e as Error).message); }
  };
  const cancelar = async (x: Factura) => { if (!window.confirm(`¿Cancelar la factura ${x.folio}?`)) return; try { await datos.cambia("facturas", eq("id", x.id), { estado: "Cancelada" }); flash(`${x.folio} cancelada`); await cargar(); } catch (e) { flash("No se guardó: " + (e as Error).message); } };
  const W = "80px 1.4fr 1.3fr 110px 130px 130px auto";

  return (
    <>
      <PageHead stage={3} eyebrow="09 · FACTURACIÓN Y COBRANZA" title="FACTURACIÓN" sub={`${abiertas.length} por cobrar · ${abiertas.filter(vencida).length} vencidas`} style={{ paddingTop: 34 }}
        right={<PB style={{ height: 48, padding: "0 22px", fontSize: 14 }} onClick={() => setNueva(true)}>Nueva factura</PB>} />
      <section style={{ padding: "22px 32px 56px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Kpis items={[["POR COBRAR", mxn(porCobrar), `${abiertas.length} ${abiertas.length === 1 ? "factura" : "facturas"}`, C.ambar], ["VENCIDO", mxn(vencido), `${abiertas.filter(vencida).length} vencidas`, C.oxido], ["FACTURADO ESTE MES", mxn(facturadoMes), "montos con IVA", C.papel], ["PAGADAS", String(fs.filter((x) => x.estado === "Pagada").length), "en total", C.olivo]]} />
        <Tabla cols={W} heads={["FOLIO", "CLIENTE", "CONCEPTO", "EMITIDA", "VENCE", "MONTO", ""]} titulo="FACTURAS"
          extra={<div style={{ display: "flex", gap: 6 }}>{["Por cobrar", "Vencidas", "Pagadas", "Canceladas", "Todas"].map((x) => <button key={x} type="button" onClick={() => setFiltro(x)} style={{ ...chip(filtro === x), height: 32, padding: "0 12px", fontSize: 12 }}>{x}</button>)}</div>}>
          {lista.length === 0 && <Vacio>{fs.length === 0 ? <>Todavía no hay facturas. Se crean desde <Link href="/proyectos" style={{ color: C.papel, textDecoration: "underline" }}>Proyectos</Link> al facturar el anticipo o un hito aceptado, o aquí con <strong style={{ color: C.papel }}>Nueva factura</strong>.</> : "Ninguna en este filtro."}</Vacio>}
          {lista.map((x) => { const v = vencida(x); return (
            <div key={x.id} style={fila(W)}>
              <span style={{ fontFamily: MONO, fontSize: 11 }}>{x.folio}</span>
              <span>{x.cliente?.nombre ?? "—"}</span>
              <span style={{ fontSize: 13, color: C.niebla, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.hito?.nombre ?? (x.proyecto ? `Anticipo · ${x.proyecto.codigo}` : "Factura directa")}</span>
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

      {nueva && (
        <Modal titulo="NUEVA FACTURA" kicker="FACTURA DIRECTA · SIN PROYECTO" onClose={() => setNueva(false)} ancho={520}>
          <Campo t="Cliente"><select value={f.cliente} onChange={(e) => setF({ ...f, cliente: e.target.value })} style={{ ...inp, appearance: "none" }}><option value="">Elige un cliente</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></Campo>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Campo t="Monto con IVA (MXN)"><input value={f.monto} inputMode="decimal" onChange={(e) => setF({ ...f, monto: e.target.value })} style={{ ...inp, fontFamily: MONO }} /></Campo>
            <Campo t="Vence"><input type="date" value={f.vence} onChange={(e) => setF({ ...f, vence: e.target.value })} style={inp} /></Campo>
          </div>
          <div style={{ fontSize: 12.5, color: C.tenue }}>Para facturar el anticipo o un hito de un proyecto, hazlo desde Proyectos: calcula el monto y liga la factura al hito.</div>
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
    </>
  );
}
