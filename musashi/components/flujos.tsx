"use client";
import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { Glass, Eyebrow, H, Dot, PB, SB } from "@/components/ui";
import { useUI } from "@/components/shell";
import { load, save } from "@/lib/store";
import { datos, eq, hoyISO, fechaLarga } from "@/lib/datos";
import { useTarifas, mxn0 } from "@/lib/tarifas";
import { MAPA_DEMO, SECTORES, GUIAS, GUIA_VISITA, nuevoMapa, deFilaMapa, aFilaMapa, minTotal, esperaTotal, minNuevo, ejecSemana, horasSemanaActual, horasSemanaNueva, ahorroHorasSemana, ahorroMesMXN, recapturas, ACCION_COLOR, FASE_COLOR, type Proceso, type Accion, type Fase, type Mapa, type FilaMapa } from "@/lib/flujos";

/* =====================================================================
   FLUJOS DE TRABAJO · el bloque central de 01 · Mapear
   Inventario → Flujo (actual y propuesto) → Impacto → Decisión y propuesta → Reporte
   De aquí salen: el reporte al cliente, el filtro de quién sigue y la cotización.
   ===================================================================== */

const PASOS_MOD = ["Inventario", "Flujo", "Impacto", "Decisión y propuesta"] as const;
const ACCIONES: Accion[] = ["Mantener", "Simplificar", "Automatizar", "Agente IA", "Eliminar"];
const FASES: Fase[] = ["Construir ahora", "Fase 2", "Quick win", "No conviene"];
const mono10: CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue };
const chip = (a: boolean, color = C.papel): CSSProperties => ({ height: 34, padding: "0 12px", borderRadius: 999, border: `1px solid ${a ? color : "rgba(238,235,228,0.12)"}`, background: a ? color : "rgba(22,26,33,0.55)", color: a ? C.tinta : C.papel, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontWeight: a ? 600 : 400 });
const h1 = (n: number) => (Math.round(n * 10) / 10).toLocaleString("en-US");

/* ---------- Lista de mapas + nuevo mapa ---------- */
export function Flujos() {
  const { flash } = useUI();
  const [tarifas] = useTarifas();
  const [mapas, setMapas] = useState<Mapa[]>([]);
  const [cur, setCur] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [form, setForm] = useState({ cliente: "", sector: "Restaurante con sucursales", sucursales: 1, visita: hoyISO(), modo: "Guiado" as "Guiado" | "Desde cero", costoCliente: tarifas.costoHoraCliente });
  const [modo, setModo] = useState<"cargando" | "db" | "local">("cargando");
  const [clientes, setClientes] = useState<{ id: string; nombre: string; sector: string }[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  useEffect(() => {
    datos.lista<FilaMapa>("mapas_flujo", "select=*&order=creado_en.desc").then((r) => {
      if (r.db) { setMapas(r.filas.map(deFilaMapa)); setModo("db"); void datos.lista<{ id: string; nombre: string; sector: string }>("clientes", "select=id,nombre,sector&order=nombre").then((c) => setClientes(c.filas)).catch(() => {}); return; }
      throw new Error("local");
    }).catch(() => {
      const d = load<{ mapas?: Mapa[] }>("flujos-mapas", {});
      if (d.mapas?.length) setMapas(d.mapas);
      else { const old = load<{ procs?: Proceso[]; costoCliente?: number }>("flujos-D2", {}); setMapas([old.procs ? { ...MAPA_DEMO, procs: old.procs, costoCliente: old.costoCliente ?? 95 } : MAPA_DEMO]); }
      setModo("local");
    });
  }, []);
  useEffect(() => { if (modo === "local") save("flujos-mapas", { mapas }); }, [mapas, modo]);
  useEffect(() => { setForm((f) => ({ ...f, costoCliente: tarifas.costoHoraCliente })); }, [tarifas.costoHoraCliente]);
  // En Supabase cada mapa se guarda solo, un momento después del último cambio.
  const guardar = (m: Mapa, inmediato = false) => {
    if (modo !== "db") return;
    clearTimeout(timers.current[m.id]);
    const ir = () => { const cli = clientes.find((c) => c.nombre.toLowerCase() === m.cliente.toLowerCase()); void datos.crea("mapas_flujo", aFilaMapa(m, cli?.id ?? null), "codigo").catch((e) => flash("No se guardó el mapa: " + (e as Error).message)); };
    if (inmediato) ir(); else timers.current[m.id] = setTimeout(ir, 900);
  };
  const mapa = mapas.find((m) => m.id === cur);
  const crear = () => {
    if (!form.cliente.trim()) { flash("Ponle nombre al cliente"); return; }
    const m = nuevoMapa({ ...form, cliente: form.cliente.trim(), visita: form.visita ? fechaLarga(form.visita) : fechaLarga(hoyISO()), visitaISO: form.visita || hoyISO() });
    setMapas((ms) => [m, ...ms]); setCur(m.id); setNuevo(false); guardar(m, true);
    flash(form.modo === "Guiado" ? `Mapa guiado: ${m.procs.length} procesos típicos de ${form.sector} listos para medir` : "Mapa en blanco listo: agrega el primer proceso");
  };
  if (modo === "cargando") return <section style={{ padding: "40px 32px", color: C.tenue, fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em" }}>CARGANDO MAPAS…</section>;
  if (mapa) return <MapaView mapa={mapa} onChange={(m) => { setMapas((ms) => ms.map((x) => (x.id === m.id ? m : x))); guardar(m); }} onBack={() => setCur(null)} />;
  return (
    <section style={{ padding: "22px 32px 48px", display: "grid", gridTemplateColumns: nuevo ? "1fr 460px" : "1fr", gap: 16 }}>
      <Glass pad="4px 22px 10px" radius={24}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 6px", gap: 12 }}>
          <div><div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>MAPAS DE FLUJOS POR CLIENTE</div><div style={{ fontSize: 13, color: C.niebla, marginTop: 2 }}>Un mapa por levantamiento. Ábrelo en la visita y mide ahí mismo; el reporte y la cotización salen de él.</div></div>
          <PB onClick={() => setNuevo(true)}>Nuevo mapa</PB>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 110px 110px 110px 120px", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>{["CLIENTE", "SECTOR · VISITA", "PROCESOS", "MEDIDOS", "AHORRO H/SEM", "ESTADO"].map((h) => <div key={h} style={mono10}>{h}</div>)}</div>
        {mapas.map((m) => {
          const med = m.procs.filter((p) => p.estado === "Medido" || p.estado === "Propuesto").length, inc = m.procs.filter((p) => p.incluir).length;
          const est = m.procs.length === 0 ? ["EN BLANCO", C.acero] : med === 0 ? ["POR MEDIR", C.niebla] : inc > 0 ? ["CON PROPUESTA", C.olivo] : ["EN MEDICIÓN", C.ambar];
          return (
            <H key={m.id} onClick={() => setCur(m.id)} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 110px 110px 110px 120px", gap: 12, padding: "13px 0", alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.06)", cursor: "pointer" }} hover={{ background: "rgba(238,235,228,0.035)" }}>
              <div><div style={{ fontSize: 14, fontWeight: 600 }}>{m.cliente}</div><div style={{ ...mono10, fontSize: 9.5, marginTop: 2 }}>{m.id} · {m.modo.toUpperCase()} · {m.sucursales} SUCURSAL{m.sucursales === 1 ? "" : "ES"}</div></div>
              <div><div style={{ fontSize: 13, color: C.niebla }}>{m.sector}</div><div style={{ ...mono10, fontSize: 9.5, marginTop: 2 }}>VISITA {m.visita.toUpperCase()}</div></div>
              <div style={{ fontFamily: MONO, fontSize: 12 }}>{m.procs.length}</div>
              <div style={{ fontFamily: MONO, fontSize: 12 }}>{med} / {m.procs.length}</div>
              <div style={{ fontFamily: MONO, fontSize: 12 }}>{h1(m.procs.reduce((s2, p) => s2 + ahorroHorasSemana(p), 0))}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, ...mono10, color: C.papel }}><Dot color={est[1]} />{est[0]}</div>
            </H>
          );
        })}
        {mapas.length === 0 && <div style={{ padding: "26px 0", fontSize: 13.5, color: C.niebla }}>Todavía no hay mapas. Crea el primero con <strong style={{ color: C.papel }}>Nuevo mapa</strong>: guiado con los procesos típicos del sector o desde cero.</div>}
        <div style={{ display: "flex", gap: 18, padding: "14px 0 6px", flexWrap: "wrap" }}>
          {GUIA_VISITA.slice(0, 3).map(([t, d]) => <div key={t} style={{ flex: 1, minWidth: 220 }}><div style={{ ...mono10, color: C.papel }}>{t.toUpperCase()}</div><div style={{ fontSize: 12.5, color: C.niebla, lineHeight: 1.4, marginTop: 3, textWrap: "pretty" }}>{d}</div></div>)}
        </div>
      </Glass>
      {nuevo && (
        <Glass style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: "start" }}>
          <Eyebrow>NUEVO MAPA · LEVANTAMIENTO</Eyebrow>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Cliente<input list="clientes-musashi" value={form.cliente} onChange={(e) => { const v = e.target.value; const c = clientes.find((x) => x.nombre === v); setForm((f) => ({ ...f, cliente: v, ...(c && (SECTORES as readonly string[]).includes(c.sector) ? { sector: c.sector } : {}) })); }} placeholder="Nombre del negocio" style={{ height: 44, padding: "0 16px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 13, outline: "none" }} /><datalist id="clientes-musashi">{clientes.map((c) => <option key={c.id} value={c.nombre}>{c.sector}</option>)}</datalist></label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Sector<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{SECTORES.map((o) => <button key={o} type="button" onClick={() => setForm((f) => ({ ...f, sector: o }))} style={{ ...chip(form.sector === o), height: 32, padding: "0 11px", fontSize: 11.5 }}>{o}</button>)}</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Sucursales<input value={form.sucursales} inputMode="numeric" onChange={(e) => setForm((f) => ({ ...f, sucursales: Number(e.target.value.replace(/[^0-9]/g, "")) || 1 }))} style={{ height: 44, padding: "0 14px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontFamily: MONO, fontSize: 13, outline: "none" }} /></label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Fecha de visita<input type="date" value={form.visita} onChange={(e) => setForm((f) => ({ ...f, visita: e.target.value }))} style={{ colorScheme: "dark",  height: 44, padding: "0 14px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 13, outline: "none" }} /></label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Costo hora personal<input value={form.costoCliente} inputMode="numeric" onChange={(e) => setForm((f) => ({ ...f, costoCliente: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 }))} style={{ height: 44, padding: "0 14px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontFamily: MONO, fontSize: 13, outline: "none" }} /></label>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>Cómo empezar
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(["Guiado", "Desde cero"] as const).map((m) => <button key={m} type="button" onClick={() => setForm((f) => ({ ...f, modo: m }))} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 16, border: `1px solid ${form.modo === m ? C.papel : C.borde}`, background: form.modo === m ? "rgba(238,235,228,0.08)" : "transparent", color: C.papel, cursor: "pointer" }}><div style={{ fontSize: 14, fontWeight: 600 }}>{m}</div><div style={{ fontSize: 12, color: C.niebla, marginTop: 3, lineHeight: 1.35 }}>{m === "Guiado" ? `Carga los ${(GUIAS[form.sector] ?? []).length || "—"} procesos típicos de ${form.sector.toLowerCase()} con sus pasos; tú mides y ajustas en la visita.` : "Inventario vacío: agregas cada proceso y paso como lo veas en el piso."}</div></button>)}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}><SB onClick={() => setNuevo(false)}>Cancelar</SB><PB onClick={crear}>Crear mapa</PB></div>
        </Glass>
      )}
    </section>
  );
}

/* ---------- Un mapa: inventario → flujo → impacto → decisión ---------- */
function MapaView({ mapa, onChange, onBack }: { mapa: Mapa; onChange: (m: Mapa) => void; onBack: () => void }) {
  const { flash } = useUI();
  const [tarifas] = useTarifas();
  const [paso, setPaso] = useState<(typeof PASOS_MOD)[number]>("Inventario");
  const [sel, setSel] = useState(mapa.procs[0]?.id ?? "P1");
  const [guia, setGuia] = useState(mapa.modo === "Guiado" && mapa.procs.every((p) => p.estado === "Sin mapear"));
  const procs = mapa.procs;
  const setProcs = (f: Proceso[] | ((ps: Proceso[]) => Proceso[])) => onChange({ ...mapa, procs: typeof f === "function" ? f(mapa.procs) : f });
  const costoCliente = mapa.costoCliente;
  const setCostoCliente = (n: number) => onChange({ ...mapa, costoCliente: n });

  const cur = procs.find((p) => p.id === sel) ?? procs[0] ?? ({ id: "—", area: "", nombre: "Sin procesos", dueno: "", personas: 0, herramienta: "", frecuencia: 0, porDia: true, dias: 0, dolor: 1, estado: "Sin mapear", pasos: [], hallazgos: [], esfuerzoH: 0, fase: "Fase 2", incluir: false } as Proceso);
  const upd = (id: string, patch: Partial<Proceso>) => setProcs((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const updPaso = (id: string, i: number, patch: Partial<Proceso["pasos"][number]>) => setProcs((ps) => ps.map((p) => (p.id === id ? { ...p, pasos: p.pasos.map((x, k) => (k === i ? { ...x, ...patch } : x)) } : p)));

  const tot = useMemo(() => {
    const act = procs.reduce((s, p) => s + horasSemanaActual(p), 0);
    const ahorro = procs.reduce((s, p) => s + ahorroHorasSemana(p), 0);
    const mxn = procs.reduce((s, p) => s + ahorroMesMXN(p, costoCliente), 0);
    const inc = procs.filter((p) => p.incluir);
    const horasRonin = inc.reduce((s, p) => s + p.esfuerzoH, 0);
    const inversion = horasRonin * tarifas.precioHora;
    const ahorroInc = inc.reduce((s, p) => s + ahorroMesMXN(p, costoCliente), 0);
    const payback = ahorroInc > 0 ? inversion / ahorroInc : Infinity;
    return { act, ahorro, mxn, inc, horasRonin, inversion, ahorroInc, payback, recap: procs.reduce((s, p) => s + recapturas(p), 0) };
  }, [procs, costoCliente, tarifas.precioHora]);

  const veredicto = tot.inc.length === 0 ? { t: "SIN PROPUESTA", c: C.acero, d: "Marca qué procesos entran para ver la inversión y el retorno." }
    : tot.payback <= tarifas.paybackMaxMeses ? { t: "CONVIENE · PASA A 02 DISEÑAR", c: C.olivo, d: `La inversión se recupera en ${h1(tot.payback)} meses con el ahorro medido; el tope de la casa es ${tarifas.paybackMaxMeses}.` }
    : tot.payback <= tarifas.paybackMaxMeses * 2 ? { t: "CONVIENE CON AJUSTES", c: C.ambar, d: `Retorno en ${h1(tot.payback)} meses. Sugerencia: dejar fuera los procesos de menor ahorro o partir en fases.` }
    : { t: "NO CONVIENE POR AHORA", c: C.oxido, d: `Retorno en ${h1(tot.payback)} meses. Se entregan los quick wins y se cierra con el reporte; el cliente queda en Evolucionar sin proyecto.` };

  const crearCotizacion = () => {
    const lineas = tot.inc.map((p, i) => ({ c: `Hito ${i + 1} · ${p.nombre}`, etapa: (i === 0 ? "Diseñar" : "Construir") as "Diseñar" | "Construir", horas: p.esfuerzoH, monto: p.esfuerzoH * tarifas.precioHora }));
    save("cotizacion-borrador", { cliente: `${mapa.cliente} · ${mapa.sector}`, proyecto: `Plataforma de operación · ${mapa.cliente}`, lineas, credito: 0, notas: `Alcance definido en el reporte de flujos del ${mapa.visita}. Ahorro medido: ${h1(tot.inc.reduce((s, p) => s + ahorroHorasSemana(p), 0))} h/semana (${mxn0(tot.ahorroInc)} al mes). Quick wins entregados sin costo en el diagnóstico.` });
    flash("Borrador de cotización armado con los hitos del mapa");
    window.location.href = "/cotizaciones?tab=nueva";
  };

  return (
    <section style={{ padding: "22px 32px 48px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Cabecera del bloque */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {PASOS_MOD.map((p, i) => <H key={p} as="button" type="button" onClick={() => setPaso(p)} style={{ ...chip(paso === p), height: 40, padding: "0 16px", fontSize: 13 }} hover={paso === p ? {} : { borderColor: C.acero }}><span style={{ ...mono10, color: paso === p ? C.tinta : C.tenue, marginRight: 8 }}>0{i + 1}</span>{p}</H>)}
          <Link href={`/flujos/reporte?c=${mapa.id}`} target="_blank" style={{ ...chip(false, C.papel), height: 40, padding: "0 16px", fontSize: 13, display: "flex", alignItems: "center", borderColor: C.oxido }}><span style={{ ...mono10, marginRight: 8 }}>05</span>Reporte al cliente ↗</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, ...mono10 }}>
          <button type="button" onClick={onBack} style={{ ...chip(false), height: 30, padding: "0 10px", fontSize: 11 }}>← Mapas</button>
          {mapa.cliente.toUpperCase()} · {mapa.sector.toUpperCase()} · VISITA {mapa.visita.toUpperCase().replace(" DE 2026", "")}
          <label style={{ display: "flex", alignItems: "center", gap: 6, color: C.niebla }}>COSTO HORA DEL PERSONAL<input value={costoCliente} inputMode="numeric" onChange={(e) => setCostoCliente(Number(e.target.value.replace(/[^0-9]/g, "")) || 0)} style={{ width: 64, height: 30, borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontFamily: MONO, fontSize: 11, textAlign: "center", outline: "none" }} />MXN</label>
        </div>
      </div>

      {/* KPIs del mapa */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 12 }}>
        {[["PROCESOS MAPEADOS", `${procs.filter((p) => p.estado !== "Sin mapear").length} / ${procs.length}`, `${procs.filter((p) => p.estado === "Propuesto").length} con propuesta`], ["HORAS/SEMANA HOY", h1(tot.act), "en los procesos medidos"], ["AHORRO POSIBLE", `${h1(tot.ahorro)} h/sem`, `${mxn0(tot.mxn)} al mes a ${costoCliente} MXN/h`], ["PUNTOS DONDE SE ATORA", String(tot.recap), "recapturas y esperas largas"], ["ENTRAN EN PROPUESTA", `${tot.inc.length}`, `${tot.horasRonin} h nuestras · ${mxn0(tot.inversion)}`]].map(([k, v, s], i) => (
          <Glass key={k} pad={18} radius={22} delay={`${i * 0.05}s`}><div style={mono10}>{k}</div><div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", marginTop: 8 }}>{v}</div><div style={{ fontSize: 12, color: C.niebla, marginTop: 4 }}>{s}</div></Glass>
        ))}
      </div>

      {/* Guía de visita (modo guiado) */}
      {guia && (
        <div style={{ background: "rgba(238,235,228,0.94)", color: C.tinta, borderRadius: 24, padding: "18px 22px", display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
          <div>
            <div style={{ ...mono10, color: C.acero }}>LEVANTAMIENTO GUIADO · {mapa.sector.toUpperCase()} · {procs.filter((p) => p.estado !== "Sin mapear").length} DE {procs.length} PROCESOS MEDIDOS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "10px 18px", marginTop: 10 }}>
              {GUIA_VISITA.map(([t, d], i) => <div key={t} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 8 }}><span style={{ fontFamily: MONO, fontSize: 11, color: C.acero }}>0{i + 1}</span><div><div style={{ fontSize: 13, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 12, color: C.acero, lineHeight: 1.4, textWrap: "pretty" }}>{d}</div></div></div>)}
            </div>
            <div style={{ fontSize: 12.5, color: C.acero, marginTop: 10 }}>Los procesos cargados son los típicos del sector: quita los que no existan en este negocio, agrega los que falten y mide cada paso en el piso. Al terminar un proceso, márcalo como Medido.</div>
          </div>
          <button type="button" onClick={() => setGuia(false)} style={{ height: 34, padding: "0 14px", borderRadius: 999, border: `1px solid ${C.tinta}`, background: "transparent", color: C.tinta, fontSize: 12, cursor: "pointer" }}>Ocultar guía</button>
        </div>
      )}

      {/* 01 Inventario */}
      {paso === "Inventario" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          <Glass pad="4px 22px 10px" radius={24}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 0 4px" }}><div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>INVENTARIO DE PROCESOS</div><SB small onClick={() => { const id = "P" + (Math.max(0, ...procs.map((x) => Number(x.id.replace(/\D/g, "")) || 0)) + 1); setProcs((ps) => [...ps, { id, area: "Por definir", nombre: "Nuevo proceso", dueno: "—", personas: 1, herramienta: "—", frecuencia: 1, porDia: true, dias: 6, dolor: 1, estado: "Sin mapear", pasos: [], hallazgos: [], esfuerzoH: 8, fase: "Fase 2", incluir: false }]); setSel(id); setPaso("Flujo"); }}>+ Proceso</SB></div>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1.6fr 1fr 1fr 90px 110px 110px", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>{["ÁREA", "PROCESO", "DUEÑO · PERSONAS", "HERRAMIENTA HOY", "DOLOR", "H/SEMANA", "ESTADO"].map((h) => <div key={h} style={mono10}>{h}</div>)}</div>
            {procs.length === 0 && <div style={{ padding: "22px 0", fontSize: 13.5, color: C.niebla }}>Mapa en blanco. Agrega el primer proceso con "+ Proceso": el que más duela primero.</div>}
            {procs.map((p) => (
              <H key={p.id} onClick={() => { setSel(p.id); setPaso("Flujo"); }} style={{ display: "grid", gridTemplateColumns: "110px 1.6fr 1fr 1fr 90px 110px 110px", gap: 12, padding: "12px 0", alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.06)", cursor: "pointer", background: sel === p.id ? "rgba(238,235,228,0.05)" : "transparent" }} hover={{ background: "rgba(238,235,228,0.035)" }}>
                <div style={{ ...mono10, color: C.niebla }}>{p.area.toUpperCase()}</div>
                <div><div style={{ fontSize: 13.5 }}>{p.nombre}</div><div style={{ ...mono10, fontSize: 9.5, marginTop: 2 }}>{p.id} · {ejecSemana(p)} VECES/SEMANA</div></div>
                <div style={{ fontSize: 12.5, color: C.niebla }}>{p.dueno} · {p.personas}</div>
                <div style={{ fontSize: 12.5, color: C.niebla }}>{p.herramienta}</div>
                <div style={{ display: "flex", gap: 3 }}>{[1, 2, 3].map((n) => <span key={n} style={{ width: 8, height: 8, borderRadius: "50%", background: n <= p.dolor ? C.oxido : "#2A2F36" }} />)}</div>
                <div style={{ fontFamily: MONO, fontSize: 12 }}>{h1(horasSemanaActual(p))}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, ...mono10, color: C.papel }}><Dot color={p.estado === "Propuesto" ? C.olivo : p.estado === "Medido" ? C.ambar : p.estado === "Mapeado" ? C.niebla : C.acero} />{p.estado.toUpperCase()}</div>
              </H>
            ))}
          </Glass>
          <Glass style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Eyebrow>CÓMO SE MAPEA UN NEGOCIO</Eyebrow>
            {[["Inventario", "En la visita se listan todos los procesos por área, quién los hace, con qué herramienta y cuántas veces al día. Nada se mejora todavía."], ["Flujo actual", "Cada proceso se dibuja paso a paso con minutos de trabajo y de espera. Sólo el trabajo cuenta como horas del personal; la espera es tiempo del cliente. Se marcan las recapturas: donde el mismo dato se escribe dos veces."], ["Flujo propuesto", "Por paso se decide: mantener, simplificar, automatizar, agente de IA o eliminar. El tiempo nuevo sale de ahí, no de una promesa."], ["Impacto", "Horas por semana que se liberan por el costo de esa hora en el negocio: eso vale el cambio en pesos al mes."], ["Decisión", "Entra lo que se paga solo en el plazo de la casa. Lo demás es quick win, fase 2 o no conviene. Así se filtra al cliente y se arma la cotización."]].map(([t, d], i) => (
              <div key={t} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 10, borderTop: i ? `1px solid ${C.borde}` : "none", paddingTop: i ? 10 : 0 }}><span style={{ fontFamily: MONO, fontSize: 11, color: C.acero }}>0{i + 1}</span><div><div style={{ fontSize: 14, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 12.5, color: C.niebla, lineHeight: 1.4, textWrap: "pretty" }}>{d}</div></div></div>
            ))}
          </Glass>
        </div>
      )}

      {/* 02 Flujo */}
      {paso === "Flujo" && (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
          <Glass pad={14} style={{ display: "flex", flexDirection: "column", gap: 4, alignSelf: "start" }}>
            <div style={{ ...mono10, padding: "6px 8px" }}>PROCESOS</div>
            {procs.map((p) => <button key={p.id} type="button" onClick={() => setSel(p.id)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 14, background: sel === p.id ? C.papel : "transparent", color: sel === p.id ? C.tinta : C.papel, border: "none", cursor: "pointer", fontSize: 13 }}><div style={{ fontWeight: sel === p.id ? 600 : 400 }}>{p.nombre}</div><div style={{ ...mono10, color: sel === p.id ? C.acero : C.tenue, marginTop: 2 }}>{p.id} · {h1(horasSemanaActual(p))} H/SEM</div></button>)}
          </Glass>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Glass>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
                <div>
                  <Eyebrow>{cur.id} · {cur.area.toUpperCase()} · {cur.estado.toUpperCase()}</Eyebrow>
                  <input value={cur.nombre} onChange={(e) => upd(cur.id, { nombre: e.target.value })} style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", marginTop: 6, background: "transparent", border: "none", color: C.papel, outline: "none", width: "100%", textTransform: "uppercase" }} />
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: C.niebla, marginTop: 4 }}>
                    <label>Dueño <input value={cur.dueno} onChange={(e) => upd(cur.id, { dueno: e.target.value })} style={{ width: 130, height: 28, borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 12, padding: "0 10px", outline: "none" }} /></label>
                    <label>Veces <input value={cur.frecuencia} inputMode="numeric" onChange={(e) => upd(cur.id, { frecuencia: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })} style={{ width: 56, height: 28, borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontFamily: MONO, fontSize: 11, textAlign: "center", outline: "none" }} /> <button type="button" onClick={() => upd(cur.id, { porDia: !cur.porDia })} style={{ ...chip(false), height: 28, padding: "0 10px", fontSize: 11 }}>{cur.porDia ? "por día" : "por semana"}</button></label>
                    {cur.porDia && <label>Días/sem <input value={cur.dias} inputMode="numeric" onChange={(e) => upd(cur.id, { dias: Math.min(7, Number(e.target.value.replace(/[^0-9]/g, "")) || 0) })} style={{ width: 44, height: 28, borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontFamily: MONO, fontSize: 11, textAlign: "center", outline: "none" }} /></label>}
                    <label>Dolor <span style={{ display: "inline-flex", gap: 4, verticalAlign: "middle" }}>{[1, 2, 3].map((n) => <button key={n} type="button" onClick={() => upd(cur.id, { dolor: n as 1 | 2 | 3 })} style={{ width: 14, height: 14, borderRadius: "50%", border: "none", background: n <= cur.dolor ? C.oxido : "#2A2F36", cursor: "pointer" }} />)}</span></label>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: 10, textAlign: "right" }}>
                  <div><div style={mono10}>TRABAJO HOY</div><div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>{minTotal(cur.pasos)} <span style={{ fontWeight: 300, fontSize: 12 }}>min</span></div><div style={{ ...mono10, fontSize: 9 }}>+ {esperaTotal(cur.pasos)} MIN DE ESPERA</div></div>
                  <div><div style={mono10}>PROPUESTO</div><div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em", color: C.olivo }}>{minNuevo(cur.pasos)} <span style={{ fontWeight: 300, fontSize: 12 }}>min</span></div></div>
                  <div><div style={mono10}>AHORRO</div><div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>{h1(ahorroHorasSemana(cur))} <span style={{ fontWeight: 300, fontSize: 12 }}>h/sem</span></div></div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "28px 1.6fr 110px 120px 70px 70px 1fr 70px", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>{["#", "PASO · FLUJO ACTUAL", "QUIÉN", "HERRAMIENTA", "MIN", "ESPERA", "FLUJO PROPUESTO", "MIN"].map((h) => <div key={h} style={mono10}>{h}</div>)}</div>
              {cur.pasos.map((s, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1.6fr 110px 120px 70px 70px 1fr 70px", gap: 10, padding: "9px 0", alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.06)", background: s.atoro ? "rgba(176,81,57,0.07)" : "transparent" }}>
                  <button type="button" title="Marcar punto donde se atora" onClick={() => updPaso(cur.id, i, { atoro: !s.atoro })} style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${s.atoro ? C.oxido : C.borde2}`, background: s.atoro ? C.oxido : "transparent", color: C.papel, fontFamily: MONO, fontSize: 9, cursor: "pointer" }}>{i + 1}</button>
                  <input value={s.p} onChange={(e) => updPaso(cur.id, i, { p: e.target.value })} style={{ background: "transparent", border: "none", color: C.papel, fontSize: 13, outline: "none" }} />
                  <input value={s.quien} onChange={(e) => updPaso(cur.id, i, { quien: e.target.value })} style={{ background: "transparent", border: "none", color: C.niebla, fontSize: 12.5, outline: "none" }} />
                  <input value={s.herr} onChange={(e) => updPaso(cur.id, i, { herr: e.target.value })} style={{ background: "transparent", border: "none", color: C.niebla, fontSize: 12.5, outline: "none" }} />
                  <input value={s.min} inputMode="numeric" onChange={(e) => updPaso(cur.id, i, { min: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })} style={{ background: C.p2, border: `1px solid ${C.borde}`, borderRadius: 999, height: 30, color: C.papel, fontFamily: MONO, fontSize: 11, textAlign: "center", outline: "none" }} />
                  <input value={s.espera} inputMode="numeric" onChange={(e) => updPaso(cur.id, i, { espera: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })} style={{ background: C.p2, border: `1px solid ${C.borde}`, borderRadius: 999, height: 30, color: s.espera > 10 ? C.ambar : C.papel, fontFamily: MONO, fontSize: 11, textAlign: "center", outline: "none" }} />
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{ACCIONES.map((a) => <button key={a} type="button" onClick={() => updPaso(cur.id, i, { accion: a, minNuevo: a === "Eliminar" ? 0 : s.minNuevo })} style={{ height: 24, padding: "0 8px", borderRadius: 999, border: `1px solid ${s.accion === a ? ACCION_COLOR[a] : "rgba(238,235,228,0.1)"}`, background: s.accion === a ? ACCION_COLOR[a] : "transparent", color: s.accion === a ? (a === "Automatizar" || a === "Mantener" ? C.tinta : C.papel) : C.niebla, fontSize: 10.5, cursor: "pointer" }}>{a}</button>)}</div>
                  <input value={s.accion === "Eliminar" ? 0 : s.minNuevo} disabled={s.accion === "Eliminar"} inputMode="numeric" onChange={(e) => updPaso(cur.id, i, { minNuevo: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })} style={{ background: C.p2, border: `1px solid ${C.borde}`, borderRadius: 999, height: 30, color: C.olivo, fontFamily: MONO, fontSize: 11, textAlign: "center", outline: "none", opacity: s.accion === "Eliminar" ? 0.4 : 1 }} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, gap: 10 }}>
                <SB small onClick={() => setProcs((ps) => ps.map((p) => (p.id === cur.id ? { ...p, pasos: [...p.pasos, { p: "Nuevo paso", quien: "—", herr: "—", min: 5, espera: 0, accion: "Mantener", minNuevo: 5 }] } : p)))}>+ Paso</SB>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button type="button" onClick={() => { if (procs.length <= 1) return; const rest = procs.filter((p) => p.id !== cur.id); setProcs(rest); setSel(rest[0].id); flash("Proceso quitado del mapa"); }} style={{ ...chip(false), height: 30, padding: "0 10px", fontSize: 11, color: C.niebla, marginRight: 8 }}>Quitar proceso</button>
                  <span style={mono10}>ESTADO</span>
                  {(["Sin mapear", "Mapeado", "Medido", "Propuesto"] as const).map((e) => <button key={e} type="button" onClick={() => upd(cur.id, { estado: e })} style={{ ...chip(cur.estado === e), height: 30, padding: "0 10px", fontSize: 11 }}>{e}</button>)}
                </div>
              </div>
            </Glass>
            <Glass>
              <Eyebrow>HALLAZGOS · LO QUE SE LE DICE AL CLIENTE DE ESTE PROCESO</Eyebrow>
              {cur.hallazgos.map((h, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr 30px", gap: 10, alignItems: "center", borderTop: `1px solid ${C.borde}`, padding: "10px 0" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: C.acero }}>0{i + 1}</span>
                  <input value={h} onChange={(e) => upd(cur.id, { hallazgos: cur.hallazgos.map((x, k) => (k === i ? e.target.value : x)) })} style={{ background: "transparent", border: "none", color: C.papel, fontSize: 13.5, outline: "none" }} />
                  <button type="button" onClick={() => upd(cur.id, { hallazgos: cur.hallazgos.filter((_, k) => k !== i) })} style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${C.borde}`, background: "transparent", color: C.niebla, cursor: "pointer", fontSize: 11 }}>✕</button>
                </div>
              ))}
              <div style={{ paddingTop: 10 }}><SB small onClick={() => upd(cur.id, { hallazgos: [...cur.hallazgos, "Nuevo hallazgo"] })}>+ Hallazgo</SB></div>
            </Glass>
          </div>
        </div>
      )}

      {/* 03 Impacto */}
      {paso === "Impacto" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
          <Glass pad="4px 22px 10px" radius={24}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 0 4px" }}><div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>IMPACTO POR PROCESO</div><span style={mono10}>AHORRO = (MIN DE TRABAJO HOY − PROPUESTO) × VECES/SEMANA · VALOR A {costoCliente} MXN/H</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 90px 90px 100px 110px 90px 1fr", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>{["PROCESO", "H/SEM HOY", "PROPUESTO", "AHORRO H/SEM", "MXN / MES", "ESFUERZO H", "PRIORIDAD"].map((h) => <div key={h} style={mono10}>{h}</div>)}</div>
            {[...procs].sort((a, b) => ahorroMesMXN(b, costoCliente) / Math.max(1, b.esfuerzoH) - ahorroMesMXN(a, costoCliente) / Math.max(1, a.esfuerzoH)).map((p) => {
              const ratio = ahorroMesMXN(p, costoCliente) / Math.max(1, p.esfuerzoH * tarifas.precioHora);
              const prio = ratio >= 0.15 ? ["ALTA", C.olivo] : ratio >= 0.07 ? ["MEDIA", C.ambar] : ["BAJA", C.acero];
              return (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 90px 90px 100px 110px 90px 1fr", gap: 12, padding: "11px 0", alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.06)" }}>
                  <div><div style={{ fontSize: 13.5 }}>{p.nombre}</div><div style={{ ...mono10, fontSize: 9.5, marginTop: 2 }}>{p.id} · {recapturas(p)} RECAPTURAS</div></div>
                  <div style={{ fontFamily: MONO, fontSize: 12 }}>{h1(horasSemanaActual(p))}</div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: C.olivo }}>{h1(horasSemanaNueva(p))}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(238,235,228,0.08)", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${Math.min(100, (ahorroHorasSemana(p) / Math.max(1, tot.ahorro)) * 100 * 2)}%`, background: C.papel }} /></span><span style={{ fontFamily: MONO, fontSize: 12 }}>{h1(ahorroHorasSemana(p))}</span></div>
                  <div style={{ fontFamily: MONO, fontSize: 12 }}>{mxn0(ahorroMesMXN(p, costoCliente))}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><input value={p.esfuerzoH} inputMode="numeric" onChange={(e) => upd(p.id, { esfuerzoH: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })} style={{ width: 56, height: 28, borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontFamily: MONO, fontSize: 11, textAlign: "center", outline: "none" }} /></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, ...mono10, color: C.papel }}><Dot color={prio[1]} />{prio[0]} · RETORNO {Math.round(ratio * 100)} % / MES</div>
                </div>
              );
            })}
          </Glass>
          <Glass style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Eyebrow>MATRIZ · IMPACTO VS ESFUERZO</Eyebrow>
            <div style={{ position: "relative", height: 300, border: `1px solid ${C.borde}`, borderRadius: 16, background: "radial-gradient(circle at 70% 30%, rgba(76,129,65,0.12), transparent 60%)" }}>
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: C.borde }} /><div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: C.borde }} />
              <span style={{ position: "absolute", top: 8, right: 10, ...mono10, color: C.olivo }}>HACER PRIMERO</span><span style={{ position: "absolute", top: 8, left: 10, ...mono10 }}>PROYECTO GRANDE</span><span style={{ position: "absolute", bottom: 8, right: 10, ...mono10 }}>QUICK WIN</span><span style={{ position: "absolute", bottom: 8, left: 10, ...mono10, color: C.acero }}>DEJAR</span>
              {procs.map((p) => { const maxM = Math.max(...procs.map((x) => ahorroMesMXN(x, costoCliente)), 1), maxE = Math.max(...procs.map((x) => x.esfuerzoH), 1); const x = 100 - (p.esfuerzoH / maxE) * 100, y = 100 - (ahorroMesMXN(p, costoCliente) / maxM) * 100; return <span key={p.id} title={`${p.nombre} · ${mxn0(ahorroMesMXN(p, costoCliente))}/mes · ${p.esfuerzoH} h`} style={{ position: "absolute", left: `calc(${Math.max(6, Math.min(94, x))}% - 16px)`, top: `calc(${Math.max(8, Math.min(92, y))}% - 16px)`, width: 32, height: 32, borderRadius: "50%", background: p.incluir ? C.oxido : C.p3, border: `1px solid ${p.incluir ? C.oxido : C.borde2}`, color: C.papel, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 10, boxShadow: p.incluir ? "0 0 16px rgba(176,81,57,.5)" : "none" }}>{p.id}</span>; })}
            </div>
            <div style={{ fontSize: 12.5, color: C.niebla, lineHeight: 1.45, textWrap: "pretty" }}>Arriba a la derecha: mucho ahorro con pocas horas nuestras. Eso entra primero. Abajo a la derecha son quick wins: se entregan en el diagnóstico sin cobrar y generan confianza. Abajo a la izquierda no conviene hoy.</div>
          </Glass>
        </div>
      )}

      {/* 04 Decisión y propuesta */}
      {paso === "Decisión y propuesta" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 16 }}>
          <Glass pad="4px 22px 10px" radius={24}>
            <div style={{ padding: "16px 0 4px" }}><div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>QUÉ ENTRA Y EN QUÉ FASE</div><div style={{ fontSize: 13, color: C.niebla, marginTop: 2 }}>Lo que se marca como "Construir ahora" se vuelve un hito de la cotización. Quick wins se entregan en el diagnóstico.</div></div>
            <div style={{ display: "grid", gridTemplateColumns: "28px 1.6fr 110px 110px 1fr", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>{["", "PROCESO", "MXN / MES", "HORAS · PRECIO", "FASE"].map((h) => <div key={h} style={mono10}>{h}</div>)}</div>
            {procs.map((p) => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "28px 1.6fr 110px 110px 1fr", gap: 12, padding: "11px 0", alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.06)", opacity: p.fase === "No conviene" ? 0.6 : 1 }}>
                <button type="button" onClick={() => upd(p.id, { incluir: !p.incluir, fase: !p.incluir ? "Construir ahora" : p.fase === "Construir ahora" ? "Fase 2" : p.fase })} style={{ width: 22, height: 22, borderRadius: 7, border: `1px solid ${p.incluir ? C.oxido : C.borde2}`, background: p.incluir ? C.oxido : "transparent", color: C.papel, cursor: "pointer", fontSize: 12 }}>{p.incluir ? "✓" : ""}</button>
                <div><div style={{ fontSize: 13.5 }}>{p.nombre}</div><div style={{ ...mono10, fontSize: 9.5, marginTop: 2 }}>AHORRO {h1(ahorroHorasSemana(p))} H/SEM</div></div>
                <div style={{ fontFamily: MONO, fontSize: 12 }}>{mxn0(ahorroMesMXN(p, costoCliente))}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{p.esfuerzoH} h · {mxn0(p.esfuerzoH * tarifas.precioHora)}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{FASES.map((f) => <button key={f} type="button" onClick={() => upd(p.id, { fase: f, incluir: f === "Construir ahora" })} style={{ height: 26, padding: "0 10px", borderRadius: 999, border: `1px solid ${p.fase === f ? FASE_COLOR[f] : "rgba(238,235,228,0.1)"}`, background: p.fase === f ? FASE_COLOR[f] : "transparent", color: p.fase === f ? C.papel : C.niebla, fontSize: 11, cursor: "pointer" }}>{f}</button>)}</div>
              </div>
            ))}
          </Glass>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "rgba(238,235,228,0.94)", color: C.tinta, borderRadius: 28, padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ ...mono10, color: C.acero }}>VEREDICTO DEL MAPA · {mapa.cliente.toUpperCase()}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em", lineHeight: 1.1 }}><Dot color={veredicto.c} size={9} />{veredicto.t}</div>
              <div style={{ fontSize: 13, color: C.acero, lineHeight: 1.45, textWrap: "pretty" }}>{veredicto.d}</div>
              <div style={{ borderTop: `1px solid ${C.tinta}`, marginTop: 4 }}>
                {[["Procesos que entran", `${tot.inc.length}`], ["Ahorro medido", `${h1(tot.inc.reduce((s, p) => s + ahorroHorasSemana(p), 0))} h/sem · ${mxn0(tot.ahorroInc)}/mes`], ["Horas nuestras", `${tot.horasRonin} h`], ["Inversión (sin IVA)", mxn0(tot.inversion)], ["Costo nuestro", `${mxn0(tot.horasRonin * tarifas.costoHora)} · margen ${tot.inversion ? Math.round((1 - (tot.horasRonin * tarifas.costoHora) / tot.inversion) * 100) : 0} %`], ["Retorno para el cliente", tot.ahorroInc ? `${h1(tot.payback)} meses` : "—"]].map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderBottom: "1px solid #D6D2C9", fontSize: 13 }}><span style={{ color: C.acero }}>{k}</span><span style={{ fontFamily: MONO, fontSize: 12 }}>{v}</span></div>)}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                <PB small onClick={crearCotizacion} disabled={tot.inc.length === 0} style={{ background: C.tinta, boxShadow: "none", opacity: tot.inc.length ? 1 : 0.5 }}>Crear cotización con estos hitos</PB>
                <Link href={`/flujos/reporte?c=${mapa.id}`} target="_blank" style={{ height: 36, padding: "0 14px", borderRadius: 999, border: `1px solid ${C.tinta}`, color: C.tinta, fontSize: 12, display: "flex", alignItems: "center" }}>Reporte al cliente</Link>
              </div>
            </div>
            <Glass style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Eyebrow>REGLAS DE LA CASA · EDITABLES EN CONFIGURACIÓN</Eyebrow>
              {[["Precio por hora", mxn0(tarifas.precioHora)], ["Costo por hora", mxn0(tarifas.costoHora)], ["Retorno máximo para proponer", `${tarifas.paybackMaxMeses} meses`], ["Costo hora del personal (este cliente)", `${costoCliente} MXN`]].map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${C.borde}`, padding: "8px 0", fontSize: 13 }}><span style={{ color: C.niebla }}>{k}</span><span style={{ fontFamily: MONO, fontSize: 12 }}>{v}</span></div>)}
              <Link href="/configuracion?sec=tarifas" style={{ ...mono10, color: C.papel }}>CAMBIAR TARIFAS ↗</Link>
            </Glass>
          </div>
        </div>
      )}
    </section>
  );
}
