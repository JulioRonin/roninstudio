"use client";
import React, { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { Glass, Eyebrow, H, Dot, PB, SB } from "@/components/ui";
import { useUI, PageHead } from "@/components/shell";
import { COTS, PAGOS, FACTURAS, CLIENTES, mxn, total, PESO, type Cot, type Pago, type Linea, type Estado } from "@/lib/cotizaciones";
import { load, save } from "@/lib/store";

/* =====================================================================
   COTIZACIONES · la entrada del dinero
   Cotizar → seguimiento (Tareas) → aceptar (Proyectos + Facturación) → cobrar → balance (Finanzas)
   ===================================================================== */

const TABS = ["Cotizaciones", "Nueva cotización", "Cobros y gastos", "Balance"];
const COLOR: Record<Estado, string> = { Borrador: C.acero, Enviada: C.niebla, Abierta: C.ambar, Aceptada: C.olivo, Vencida: C.oxido, Perdida: C.tenue };
const mono10: CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue };
const input: CSSProperties = { height: 44, padding: "0 16px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 13, outline: "none", width: "100%" };
const KEY = "cotizaciones";

function chip(a: boolean): CSSProperties {
  return { height: 36, padding: "0 14px", borderRadius: 999, border: `1px solid ${a ? C.papel : "rgba(238,235,228,0.12)"}`, background: a ? C.papel : "rgba(22,26,33,0.55)", color: a ? C.tinta : C.papel, fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap", fontWeight: a ? 600 : 400 };
}

export default function Cotizaciones() {
  const { flash } = useUI();
  const [tab, setTab] = useState(0);
  const [cots, setCots] = useState<Cot[]>(COTS);
  const [pagos, setPagos] = useState<Pago[]>(PAGOS);
  const [sel, setSel] = useState<string>("C-0034");
  const [filtro, setFiltro] = useState<"Todas" | Estado>("Todas");
  const [tareas, setTareas] = useState<string[]>(["Seguimiento C-0033 · llamar a Negocio demo 1 · 7 nov", "Seguimiento C-0032 · confirmar recepción · 6 nov"]);
  const [loaded, setLoaded] = useState(false);

  // Persistencia local (demo): lo que capturas sobrevive a recargar la página.
  useEffect(() => { const d = load<{ cots?: Cot[]; pagos?: Pago[]; tareas?: string[] }>(KEY, {}); if (d.cots) setCots(d.cots); if (d.pagos) setPagos(d.pagos); if (d.tareas) setTareas(d.tareas); setLoaded(true); }, []);
  useEffect(() => { if (loaded) save(KEY, { cots, pagos, tareas }); }, [cots, pagos, tareas, loaded]);
  useEffect(() => { try { const t = new URLSearchParams(window.location.search).get("tab"); if (t) setTab(Math.max(0, TABS.findIndex((x) => x.toLowerCase().startsWith(t.toLowerCase())))); } catch {} }, []);

  const cur = cots.find((c) => c.folio === sel) ?? cots[0];
  const lista = cots.filter((c) => filtro === "Todas" || c.estado === filtro);
  const enJuego = cots.filter((c) => ["Borrador", "Enviada", "Abierta"].includes(c.estado));
  const pipeline = enJuego.reduce((s, c) => s + total(c), 0);
  const ponderado = enJuego.reduce((s, c) => s + total(c) * PESO[c.estado], 0);
  const aceptadas = cots.filter((c) => c.estado === "Aceptada");
  const cerradas = cots.filter((c) => ["Aceptada", "Perdida", "Vencida"].includes(c.estado));
  const tasa = cerradas.length ? Math.round((aceptadas.length / cerradas.length) * 100) : 0;
  const porCobrar = FACTURAS.filter((f) => f.estado === "Vencida" || f.estado === "Vigente").reduce((s, f) => s + f.monto, 0);
  const cobradoMes = pagos.filter((p) => p.tipo === "Cobro" && p.mes === "NOV").reduce((s, p) => s + p.monto, 0);
  const gastoMes = pagos.filter((p) => p.tipo === "Gasto" && p.mes === "NOV").reduce((s, p) => s + p.monto, 0);

  const setEstado = (folio: string, estado: Estado, extra: Partial<Cot> = {}) => setCots((cs) => cs.map((c) => (c.folio === folio ? { ...c, estado, ...extra } : c)));
  const enviar = (c: Cot) => { setEstado(c.folio, "Enviada"); setTareas((t) => [`Seguimiento ${c.folio} · ${c.cliente} · en 3 días`, ...t]); flash(`${c.folio} enviada · tarea de seguimiento creada`); };
  const aceptar = (c: Cot) => { setEstado(c.folio, "Aceptada", { proyectoCode: "D" + (14 + cots.filter((x) => x.estado === "Aceptada").length) }); setTareas((t) => [`Crear proyecto y facturar anticipo · ${c.folio} · ${c.cliente}`, ...t]); flash(`${c.folio} aceptada · proyecto en Mapear y anticipo por facturar`); };
  const perder = (c: Cot) => { setEstado(c.folio, "Perdida", { razon: "Precio" }); flash(`${c.folio} marcada como perdida`); };

  return (
    <>
      <PageHead
        stage={0}
        eyebrow="05 · COTIZACIONES · ENTRADA DEL DINERO"
        title="COTIZACIONES"
        sub={`${enJuego.length} en juego por ${mxn(pipeline)} · ${aceptadas.length} aceptadas · ${mxn(porCobrar)} por cobrar`}
        style={{ paddingTop: 34, gap: 24, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}
        right={
          <H as="button" type="button" onClick={() => setTab(1)} style={{ height: 48, padding: "0 22px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 28px rgba(176,81,57,.45)" }} hover={{ background: C.oxidoHover }}>Nueva cotización</H>
        }
      />
      <nav style={{ display: "flex", gap: 6, padding: "22px 32px 0" }}>
        {TABS.map((l, i) => { const a = i === tab; return <H key={l} as="button" type="button" onClick={() => setTab(i)} style={{ ...chip(a), height: 44, padding: "0 18px", fontSize: 13 }} hover={a ? {} : { borderColor: C.acero }}>{l}</H>; })}
      </nav>

      {/* ---------- Lista + detalle ---------- */}
      {tab === 0 && (
        <section style={{ padding: "22px 32px 48px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}>
            {[["EN JUEGO", mxn(pipeline), `${enJuego.length} cotizaciones · ponderado ${mxn(ponderado)}`], ["ACEPTADAS · 90 DÍAS", mxn(aceptadas.reduce((s, c) => s + total(c), 0)), `${aceptadas.length} proyectos`], ["TASA DE ACEPTACIÓN", `${tasa} %`, `${aceptadas.length} de ${cerradas.length} cerradas · objeción: precio`], ["POR COBRAR", mxn(porCobrar), "3 facturas · 1 vencida"]].map(([k, v, s], i) => (
              <Glass key={k} pad={18} radius={22} delay={`${i * 0.05}s`}><div style={mono10}>{k}</div><div style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em", marginTop: 8 }}>{v}</div><div style={{ fontSize: 12, color: C.niebla, marginTop: 4 }}>{s}</div></Glass>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 16 }}>
            <Glass pad="4px 22px 10px" radius={24}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 6px", gap: 10 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["Todas", "Borrador", "Enviada", "Abierta", "Aceptada", "Vencida", "Perdida"] as const).map((f) => <button key={f} type="button" onClick={() => setFiltro(f)} style={{ ...chip(filtro === f), height: 32, padding: "0 12px", fontSize: 12 }}>{f}</button>)}
                </div>
                <span style={mono10}>{lista.length} DE {cots.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "70px 1.4fr 1.2fr 110px 110px 90px", gap: 14, padding: "10px 0", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>
                {["FOLIO", "CLIENTE · PROYECTO", "ESTADO", "VIGENCIA", "TOTAL", "ABIERTA"].map((h) => <div key={h} style={mono10}>{h}</div>)}
              </div>
              {lista.map((c) => (
                <H key={c.folio} onClick={() => setSel(c.folio)} style={{ display: "grid", gridTemplateColumns: "70px 1.4fr 1.2fr 110px 110px 90px", gap: 14, padding: "12px 0", alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.06)", cursor: "pointer", background: sel === c.folio ? "rgba(238,235,228,0.05)" : "transparent" }} hover={{ background: "rgba(238,235,228,0.035)" }}>
                  <div style={{ fontFamily: MONO, fontSize: 11 }}>{c.folio}</div>
                  <div style={{ minWidth: 0 }}><div style={{ fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.cliente}</div><div style={{ ...mono10, fontSize: 9.5, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.proyecto.toUpperCase()}</div></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, ...mono10, color: C.papel }}><Dot color={COLOR[c.estado]} anim={c.estado === "Vencida" ? "pulseOx 2s infinite" : undefined} />{c.estado.toUpperCase()}{c.razon ? ` · ${c.razon.toUpperCase()}` : ""}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{c.vigencia.toUpperCase()}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12 }}>{mxn(total(c))}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: C.tenue }}>{c.abierta ?? (c.estado === "Enviada" ? "SIN ABRIR" : "—")}</div>
                </H>
              ))}
            </Glass>
            {/* Detalle en papel */}
            <div style={{ background: "rgba(238,235,228,0.94)", color: C.tinta, borderRadius: 28, padding: 24, display: "flex", flexDirection: "column", gap: 10, animation: "rise .5s both" }}>
              <div style={{ ...mono10, color: C.acero }}>RONIN STUDIO · COTIZACIÓN {cur.folio} · {cur.estado.toUpperCase()}{cur.vigencia !== "—" ? ` · VIGENTE AL ${cur.vigencia.toUpperCase()}` : ""}</div>
              <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", lineHeight: 1 }}>{cur.cliente.toUpperCase()}</div>
              <div style={{ fontSize: 13.5, color: C.acero }}>{cur.proyecto} · {cur.sector}</div>
              <div style={{ borderTop: `1px solid ${C.tinta}`, marginTop: 4 }}>
                {cur.lineas.map((l, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 0", borderBottom: "1px solid #D6D2C9", fontSize: 13 }}><span>{l.c}<span style={{ ...mono10, color: C.acero, marginLeft: 8 }}>{l.etapa.toUpperCase()}</span></span><span style={{ fontFamily: MONO, fontSize: 12 }}>{mxn(l.monto)}</span></div>
                ))}
                {cur.credito > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #D6D2C9", fontSize: 13, color: C.acero }}><span>Crédito del diagnóstico exprés</span><span style={{ fontFamily: MONO, fontSize: 12 }}>-{mxn(cur.credito)}</span></div>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ ...mono10, color: C.acero }}>TOTAL MXN · ANTICIPO {cur.anticipo} %</span><span style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em" }}>{mxn(total(cur))}</span></div>
              <div style={{ fontSize: 12, color: C.acero }}>Anticipo de {mxn(Math.round(total(cur) * cur.anticipo / 100))} al aceptar; el resto contra aceptación de cada hito. CFDI por cada pago.</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                {cur.estado === "Borrador" && <PB small onClick={() => enviar(cur)} style={{ background: C.tinta, boxShadow: "none" }}>Enviar al cliente</PB>}
                {(cur.estado === "Enviada" || cur.estado === "Abierta") && <><PB small onClick={() => aceptar(cur)} style={{ background: C.tinta, boxShadow: "none" }}>Marcar aceptada</PB><button type="button" onClick={() => { setTareas((t) => [`Seguimiento ${cur.folio} · ${cur.cliente} · mañana`, ...t]); flash("Tarea de seguimiento creada"); }} style={{ height: 36, padding: "0 14px", borderRadius: 999, background: "transparent", border: `1px solid ${C.tinta}`, color: C.tinta, fontSize: 12, cursor: "pointer" }}>Dar seguimiento</button><button type="button" onClick={() => perder(cur)} style={{ height: 36, padding: "0 14px", borderRadius: 999, background: "transparent", border: "none", color: C.acero, fontSize: 12, cursor: "pointer" }}>Perdida</button></>}
                {cur.estado === "Aceptada" && <><Link href="/proyectos" style={{ height: 36, padding: "0 14px", borderRadius: 999, background: C.tinta, color: C.papel, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center" }}>Ver proyecto {cur.proyectoCode ?? ""}</Link><Link href="/facturacion" style={{ height: 36, padding: "0 14px", borderRadius: 999, border: `1px solid ${C.tinta}`, color: C.tinta, fontSize: 12, display: "flex", alignItems: "center" }}>Facturas</Link></>}
                {(cur.estado === "Perdida" || cur.estado === "Vencida") && <PB small onClick={() => { setEstado(cur.folio, "Borrador", { razon: undefined, vigencia: "30 nov" }); flash("Cotización reabierta como borrador"); }} style={{ background: C.tinta, boxShadow: "none" }}>Reabrir</PB>}
                <button type="button" onClick={() => flash("PDF de la cotización descargado")} style={{ height: 36, padding: "0 14px", borderRadius: 999, background: "transparent", border: `1px solid ${C.acero}`, color: C.tinta, fontSize: 12, cursor: "pointer" }}>PDF</button>
              </div>
              <div style={{ borderTop: "1px solid #D6D2C9", paddingTop: 10, marginTop: 4 }}>
                <div style={{ ...mono10, color: C.acero, marginBottom: 6 }}>LIGADO A</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[["Cliente", "/clientes"], ["Tareas", "/tareas"], cur.estado === "Aceptada" ? ["Proyecto", "/proyectos"] : null, cur.estado === "Aceptada" ? ["Facturación", "/facturacion"] : null, ["Finanzas", "/finanzas"]].filter(Boolean).map((x) => { const [l, h] = x as [string, string]; return <Link key={l} href={h} style={{ ...mono10, color: C.tinta, padding: "5px 10px", border: "1px solid #D6D2C9", borderRadius: 999 }}>{l.toUpperCase()} ↗</Link>; })}
                </div>
              </div>
            </div>
          </div>
          <Glass>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div><Eyebrow>TAREAS GENERADAS POR COTIZACIONES</Eyebrow><div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em", marginTop: 6 }}>SEGUIMIENTO</div></div>
              <Link href="/tareas" style={{ ...mono10, color: C.papel }}>VER EN TAREAS ↗</Link>
            </div>
            {tareas.map((t, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, borderTop: `1px solid ${C.borde}`, padding: "10px 0", fontSize: 13.5 }}><Dot color={i === 0 ? C.oxido : C.acero} />{t}</div>)}
          </Glass>
        </section>
      )}

      {tab === 1 && <Nueva onSave={(c, enviar) => { setCots((cs) => [c, ...cs]); setSel(c.folio); if (enviar) setTareas((t) => [`Seguimiento ${c.folio} · ${c.cliente} · en 3 días`, ...t]); setTab(0); flash(enviar ? `${c.folio} enviada · tarea de seguimiento creada` : `${c.folio} guardada como borrador`); }} next={`C-00${35 + (cots.length - COTS.length)}`} />}

      {tab === 2 && <CobrosGastos pagos={pagos} onAdd={(p) => { setPagos((ps) => [p, ...ps]); flash(p.tipo === "Cobro" ? `Cobro de ${mxn(p.monto)} registrado · ${p.ref}` : `Gasto de ${mxn(p.monto)} registrado`); }} />}

      {tab === 3 && <Balance pagos={pagos} cobradoMes={cobradoMes} gastoMes={gastoMes} porCobrar={porCobrar} pipeline={pipeline} ponderado={ponderado} />}
    </>
  );
}

/* ---------- Nueva cotización ---------- */
function Nueva({ onSave, next }: { onSave: (c: Cot, enviar: boolean) => void; next: string }) {
  const { flash } = useUI();
  const [cliente, setCliente] = useState(CLIENTES[6]);
  const [proyecto, setProyecto] = useState("");
  const [vigencia, setVigencia] = useState("20 nov");
  const [anticipo, setAnticipo] = useState(30);
  const [credito, setCredito] = useState(0);
  const [notas, setNotas] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([{ c: "Hito 1 · Visita, mapa de flujo y propuesta", etapa: "Mapear", monto: 20000 }, { c: "Hito 2 · Plan y prototipo", etapa: "Diseñar", monto: 30000 }, { c: "Hito 3 · Construcción y arranque", etapa: "Construir", monto: 40000 }]);
  const tot = lineas.reduce((s, l) => s + (Number(l.monto) || 0), 0) - (Number(credito) || 0);
  const build = (): Cot | null => {
    if (!proyecto.trim()) { flash("Ponle nombre al proyecto"); return null; }
    const [cli, sec] = cliente.split(" · ");
    return { folio: next, cliente: cli, sector: sec ?? "", proyecto: proyecto.trim(), estado: "Borrador", fecha: "6 nov", vigencia, lineas: lineas.map((l) => ({ ...l, monto: Number(l.monto) || 0 })), credito: Number(credito) || 0, anticipo, notas };
  };
  return (
    <section style={{ padding: "22px 32px 48px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
      <Glass style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Eyebrow>NUEVA COTIZACIÓN · {next}</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Cliente
            <select value={cliente} onChange={(e) => setCliente(e.target.value)} style={{ ...input, appearance: "none" }}>{CLIENTES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Proyecto
            <input value={proyecto} onChange={(e) => setProyecto(e.target.value)} placeholder="Plataforma de expedientes y citas" style={input} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Vigencia
            <input value={vigencia} onChange={(e) => setVigencia(e.target.value)} style={input} />
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Anticipo
            <div style={{ display: "flex", gap: 6 }}>{[20, 30, 50, 100].map((n) => <button key={n} type="button" onClick={() => setAnticipo(n)} style={{ ...chip(anticipo === n), flex: 1, height: 44 }}>{n} %</button>)}</div>
          </div>
        </div>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 140px 36px", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>{["CONCEPTO · HITO", "ETAPA", "MONTO MXN", ""].map((h) => <div key={h} style={mono10}>{h}</div>)}</div>
          {lineas.map((l, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 150px 140px 36px", gap: 10, padding: "8px 0", alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.06)" }}>
              <input value={l.c} onChange={(e) => setLineas((ls) => ls.map((x, k) => (k === i ? { ...x, c: e.target.value } : x)))} style={{ ...input, height: 40 }} />
              <select value={l.etapa} onChange={(e) => setLineas((ls) => ls.map((x, k) => (k === i ? { ...x, etapa: e.target.value as Linea["etapa"] } : x)))} style={{ ...input, height: 40, appearance: "none" }}>{["Mapear", "Diseñar", "Construir", "Evolucionar"].map((o) => <option key={o}>{o}</option>)}</select>
              <input value={l.monto} inputMode="numeric" onChange={(e) => setLineas((ls) => ls.map((x, k) => (k === i ? { ...x, monto: Number(e.target.value.replace(/[^0-9]/g, "")) } : x)))} style={{ ...input, height: 40, fontFamily: MONO, textAlign: "right" }} />
              <button type="button" onClick={() => setLineas((ls) => ls.filter((_, k) => k !== i))} title="Quitar" style={{ width: 36, height: 36, borderRadius: "50%", background: "transparent", border: `1px solid ${C.borde}`, color: C.niebla, cursor: "pointer" }}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10 }}>
            <SB small onClick={() => setLineas((ls) => [...ls, { c: `Hito ${ls.length + 1} · `, etapa: "Evolucionar", monto: 0 }])}>+ Agregar hito</SB>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: C.niebla }}>Crédito del diagnóstico exprés<input value={credito} inputMode="numeric" onChange={(e) => setCredito(Number(e.target.value.replace(/[^0-9]/g, "")))} style={{ ...input, width: 140, height: 40, fontFamily: MONO, textAlign: "right" }} /></label>
          </div>
        </div>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Notas y condiciones
          <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} placeholder="Incluye capacitación de 40 minutos y 30 días de garantía. No incluye hardware." style={{ ...input, height: "auto", padding: "12px 16px", borderRadius: 16, resize: "vertical", fontFamily: "inherit" }} />
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <SB onClick={() => { const c = build(); if (c) onSave(c, false); }}>Guardar borrador</SB>
          <PB onClick={() => { const c = build(); if (c) onSave({ ...c, estado: "Enviada" }, true); }}>Enviar al cliente</PB>
        </div>
      </Glass>
      <div style={{ background: "rgba(238,235,228,0.94)", color: C.tinta, borderRadius: 28, padding: 24, display: "flex", flexDirection: "column", gap: 10, alignSelf: "start" }}>
        <div style={{ ...mono10, color: C.acero }}>VISTA PREVIA · {next}</div>
        <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em", lineHeight: 1 }}>{cliente.split(" · ")[0].toUpperCase()}</div>
        <div style={{ fontSize: 13, color: C.acero }}>{proyecto || "Nombre del proyecto"} · {cliente.split(" · ")[1]}</div>
        <div style={{ borderTop: `1px solid ${C.tinta}` }}>
          {lineas.map((l, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderBottom: "1px solid #D6D2C9", fontSize: 13 }}><span>{l.c || "—"}</span><span style={{ fontFamily: MONO, fontSize: 12 }}>{mxn(Number(l.monto) || 0)}</span></div>)}
          {Number(credito) > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #D6D2C9", fontSize: 13, color: C.acero }}><span>Crédito del diagnóstico</span><span style={{ fontFamily: MONO, fontSize: 12 }}>-{mxn(Number(credito))}</span></div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ ...mono10, color: C.acero }}>TOTAL MXN</span><span style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em" }}>{mxn(tot)}</span></div>
        <div style={{ fontSize: 12, color: C.acero }}>Anticipo {anticipo} % · {mxn(Math.round(tot * anticipo / 100))} al aceptar. Vigente al {vigencia}.</div>
        <div style={{ ...mono10, color: C.acero, borderTop: "1px solid #D6D2C9", paddingTop: 10 }}>AL ENVIAR: TAREA DE SEGUIMIENTO EN 3 DÍAS · AL ACEPTAR: PROYECTO EN MAPEAR + CFDI DEL ANTICIPO</div>
      </div>
    </section>
  );
}

/* ---------- Cobros y gastos ---------- */
function CobrosGastos({ pagos, onAdd }: { pagos: Pago[]; onAdd: (p: Pago) => void }) {
  const [tipo, setTipo] = useState<"Cobro" | "Gasto">("Cobro");
  const [ref, setRef] = useState("F-0112");
  const [monto, setMonto] = useState("25000");
  const [fecha, setFecha] = useState("6 nov");
  const [metodo, setMetodo] = useState("Transferencia");
  const [concepto, setConcepto] = useState("");
  const [cliente, setCliente] = useState("Negocio demo 2");
  const [verTipo, setVerTipo] = useState<"Todo" | "Cobro" | "Gasto">("Todo");
  const fac = FACTURAS.find((f) => f.folio === ref);
  const lista = pagos.filter((p) => verTipo === "Todo" || p.tipo === verTipo);
  const n = pagos.length;
  const save = () => {
    const m = Number(monto.replace(/[^0-9.]/g, ""));
    if (!m) return;
    onAdd({ id: (tipo === "Cobro" ? "P-" : "G-") + String(45 + n).padStart(4, "0"), tipo, fecha, mes: "NOV", cliente: tipo === "Cobro" ? cliente : "Ronin Studio", concepto: concepto || (tipo === "Cobro" ? (fac ? `Pago de ${fac.folio}` : "Pago") : "Gasto"), ref: tipo === "Cobro" ? ref : metodo, metodo, monto: m });
    setConcepto("");
  };
  // saldos por cliente (facturado − pagado)
  const saldos = CLIENTES.map((c) => c.split(" · ")[0]).map((cl) => {
    const fact = FACTURAS.filter((f) => f.cliente === cl && f.estado !== "Borrador").reduce((s, f) => s + f.monto, 0);
    const pag = pagos.filter((p) => p.tipo === "Cobro" && p.cliente === cl).reduce((s, p) => s + p.monto, 0);
    return { cl, fact, pag, saldo: fact - pag };
  }).filter((x) => x.fact > 0 || x.pag > 0);
  return (
    <section style={{ padding: "22px 32px 48px", display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Glass style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Eyebrow>REGISTRAR</Eyebrow>
          <div style={{ display: "flex", gap: 6 }}>{(["Cobro", "Gasto"] as const).map((t) => <button key={t} type="button" onClick={() => { setTipo(t); setMetodo(t === "Gasto" ? "Tarjeta" : "Transferencia"); }} style={{ ...chip(tipo === t), flex: 1, height: 44 }}>{t}</button>)}</div>
          {tipo === "Cobro" ? (
            <>
              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Factura o cotización
                <select value={ref} onChange={(e) => { setRef(e.target.value); const f = FACTURAS.find((x) => x.folio === e.target.value); if (f) { setMonto(String(f.monto)); setCliente(f.cliente); } }} style={{ ...input, appearance: "none" }}>{FACTURAS.filter((f) => f.estado !== "Pagada").map((f) => <option key={f.folio} value={f.folio}>{f.folio} · {f.cliente} · {mxn(f.monto)} · {f.estado}</option>)}</select>
              </label>
              {fac && <div style={{ fontSize: 12.5, color: C.niebla }}>{fac.cliente} · {fac.estado.toLowerCase()} · vence {fac.vence}</div>}
            </>
          ) : (
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Concepto
              <input value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Tokens de IA · noviembre" style={input} />
            </label>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Monto MXN<input value={monto} inputMode="decimal" onChange={(e) => setMonto(e.target.value)} style={{ ...input, fontFamily: MONO }} /></label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Fecha<input value={fecha} onChange={(e) => setFecha(e.target.value)} style={input} /></label>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Método
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["Transferencia", "Efectivo", "Tarjeta", "Stripe"].map((m) => <button key={m} type="button" onClick={() => setMetodo(m)} style={{ ...chip(metodo === m), height: 36 }}>{m}</button>)}</div>
          </div>
          {tipo === "Cobro" && <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Concepto (opcional)<input value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Hito 3 · comanda digital" style={input} /></label>}
          <PB onClick={save}>{tipo === "Cobro" ? "Registrar cobro" : "Registrar gasto"}</PB>
          <div style={{ fontSize: 12, color: C.tenue, lineHeight: 1.4 }}>Un cobro marca la factura como pagada, actualiza el saldo del cliente y el cobrado del mes en Finanzas. Un gasto baja la utilidad del mes.</div>
        </Glass>
        <Glass style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Eyebrow>SALDOS POR CLIENTE</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "10px 0 6px", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>{["CLIENTE", "PAGADO", "SALDO"].map((h) => <div key={h} style={{ ...mono10, textAlign: h === "CLIENTE" ? "left" : "right" }}>{h}</div>)}</div>
          {saldos.map((s) => <div key={s.cl} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "9px 0", borderBottom: "1px solid rgba(238,235,228,0.06)", fontSize: 13 }}><span>{s.cl}</span><span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{mxn(s.pag)}</span><span style={{ fontFamily: MONO, fontSize: 11, color: s.saldo > 0 ? C.ambar : C.olivo }}>{mxn(Math.max(0, s.saldo))}</span></div>)}
        </Glass>
      </div>
      <Glass pad="4px 22px 10px" radius={24}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 6px" }}>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>MOVIMIENTOS</div>
          <div style={{ display: "flex", gap: 6 }}>{(["Todo", "Cobro", "Gasto"] as const).map((t) => <button key={t} type="button" onClick={() => setVerTipo(t)} style={{ ...chip(verTipo === t), height: 32, padding: "0 12px", fontSize: 12 }}>{t === "Todo" ? "Todo" : t + "s"}</button>)}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "70px 70px 1.3fr 1.4fr 90px 110px 120px", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>{["ID", "FECHA", "QUIÉN", "CONCEPTO", "REF.", "MÉTODO", "MONTO"].map((h) => <div key={h} style={{ ...mono10, textAlign: h === "MONTO" ? "right" : "left" }}>{h}</div>)}</div>
        {lista.map((p) => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "70px 70px 1.3fr 1.4fr 90px 110px 120px", gap: 12, padding: "11px 0", alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.06)" }}>
            <div style={{ fontFamily: MONO, fontSize: 11 }}>{p.id}</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{p.fecha.toUpperCase()}</div>
            <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}><Dot color={p.tipo === "Cobro" ? C.olivo : C.oxido} />{p.cliente}</div>
            <div style={{ fontSize: 13, color: "#D9D5CD", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.concepto}</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{p.ref}</div>
            <div style={{ fontSize: 12.5, color: C.niebla }}>{p.metodo}</div>
            <div style={{ fontFamily: MONO, fontSize: 12, textAlign: "right", color: p.tipo === "Cobro" ? C.papel : C.oxido }}>{p.tipo === "Cobro" ? "+" : "−"}{mxn(p.monto)}</div>
          </div>
        ))}
      </Glass>
    </section>
  );
}

/* ---------- Balance (nuestro) ---------- */
function Balance({ pagos, cobradoMes, gastoMes, porCobrar, pipeline, ponderado }: { pagos: Pago[]; cobradoMes: number; gastoMes: number; porCobrar: number; pipeline: number; ponderado: number }) {
  const meses = ["SEP", "OCT", "NOV"];
  const serie = meses.map((m) => ({ m, cobro: pagos.filter((p) => p.tipo === "Cobro" && p.mes === m).reduce((s, p) => s + p.monto, 0) + (m === "SEP" ? 45000 : 0), gasto: pagos.filter((p) => p.tipo === "Gasto" && p.mes === m).reduce((s, p) => s + p.monto, 0) + (m === "SEP" ? 7500 : 0) }));
  const max = Math.max(...serie.map((s) => s.cobro));
  const util = cobradoMes - gastoMes;
  return (
    <section style={{ padding: "22px 32px 48px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 12 }}>
        {[["COBRADO · NOVIEMBRE", mxn(cobradoMes), "pagos registrados", C.olivo], ["GASTOS · NOVIEMBRE", mxn(gastoMes), "herramientas, IA, oficina", C.oxido], ["UTILIDAD DEL MES", mxn(util), `${cobradoMes ? Math.round((util / cobradoMes) * 100) : 0} % de margen`, C.papel], ["POR COBRAR", mxn(porCobrar), "facturas vigentes y vencidas", C.ambar], ["PIPELINE PONDERADO", mxn(ponderado), `de ${mxn(pipeline)} en juego`, C.niebla]].map(([k, v, s, c], i) => (
          <Glass key={k} pad={18} radius={22} delay={`${i * 0.05}s`}><div style={{ display: "flex", alignItems: "center", gap: 7, ...mono10 }}><Dot color={c} />{k}</div><div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", marginTop: 8 }}>{v}</div><div style={{ fontSize: 12, color: C.niebla, marginTop: 4 }}>{s}</div></Glass>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Glass>
          <Eyebrow>COBROS VS GASTOS · 3 MESES</Eyebrow>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, height: 220, marginTop: 18, padding: "0 10px" }}>
            {serie.map((s) => (
              <div key={s.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: "100%", width: "100%", justifyContent: "center" }}>
                  <div title={`Cobrado ${mxn(s.cobro)}`} style={{ width: 38, height: `${(s.cobro / max) * 100}%`, background: C.olivo, borderRadius: 6, boxShadow: "0 0 14px rgba(76,129,65,.4)", animation: "grow .7s ease both", transformOrigin: "bottom" }} />
                  <div title={`Gastos ${mxn(s.gasto)}`} style={{ width: 38, height: `${(s.gasto / max) * 100}%`, background: C.oxido, borderRadius: 6, animation: "grow .7s ease both", transformOrigin: "bottom" }} />
                </div>
                <div style={{ ...mono10, color: C.papel }}>{s.m}</div>
                <div style={{ ...mono10, fontSize: 9 }}>{mxn(s.cobro - s.gasto)}</div>
              </div>
            ))}
          </div>
        </Glass>
        <Glass style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Eyebrow>CÓMO SE LIGA EL DINERO</Eyebrow>
          {[["Cotización", "Se cotiza por hitos, con etapa del método y anticipo.", "/cotizaciones"], ["Tareas", "Al enviar, nace una tarea de seguimiento; al aceptar, la de crear proyecto y facturar.", "/tareas"], ["Proyectos", "La aceptada entra en 01 · Mapear con sus hitos como entregables.", "/proyectos"], ["Facturación", "Cada hito aceptado genera su CFDI; el anticipo al aceptar.", "/facturacion"], ["Cobros y gastos", "Cada pago registrado cierra una factura y mueve el saldo del cliente.", "/cotizaciones?tab=cobros"], ["Finanzas", "Cobrado, gastos y utilidad del mes salen de estos registros; el margen por proyecto, de horas y cobros.", "/finanzas"]].map(([t, d, h]) => (
            <Link key={t} href={h} style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 12, alignItems: "center", borderTop: `1px solid ${C.borde}`, padding: "10px 0", color: C.papel }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{t}</span><span style={{ fontSize: 12.5, color: C.niebla, lineHeight: 1.4 }}>{d}</span><span style={{ ...mono10 }}>↗</span>
            </Link>
          ))}
        </Glass>
      </div>
    </section>
  );
}
