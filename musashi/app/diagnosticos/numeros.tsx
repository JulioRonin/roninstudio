"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { Glass, Eyebrow, SB } from "@/components/ui";
import { useUI } from "@/components/shell";
import { datos, eq } from "@/lib/datos";
import { useTarifas } from "@/lib/tarifas";
import { nuevoMapa, aFilaMapa, type Proceso } from "@/lib/flujos";
import { MODELOS, modeloDe, calcular, dolencias, fmt, type Datos, type ModeloId, type Rango, type Par } from "@/lib/numeros";
import { Cargando, Vacio, mono10, inp, chip, btn } from "@/components/real";

/* Números del negocio: lo que el cliente cuenta en la primera conversación (rentas, visitas, precios,
   costos) convertido en ingreso, utilidad, rotación y punto de equilibrio. De ahí salen las dolencias,
   y cada una se puede llevar al mapa de flujos como proceso a medir en la visita. */
type Cli = { id: string; nombre: string; sector: string };
type Fila = { cliente_id: string; modelo: ModeloId; datos: Datos; notas: string | null; actualizado_en: string };
type MapaFila = { codigo: string; procesos: Proceso[] };
const parse = (s: string) => { const x = s.replace(/,/g, "").replace(/[^0-9.]/g, ""); return x === "" ? null : Number(x); };
const UNI: Record<string, string> = { mxn: "$", num: "", pct: "%", h: "h" };

function Num({ v, onChange, ph }: { v?: number | null; onChange: (n: number | null) => void; ph: string }) {
  const [t, setT] = useState<string | null>(null);
  return <input value={t ?? (v == null ? "" : v.toLocaleString("en-US"))} placeholder={ph} inputMode="decimal" onChange={(e) => { setT(e.target.value); onChange(parse(e.target.value)); }} onBlur={() => setT(null)}
    style={{ ...inp, height: 36, padding: "0 10px", fontFamily: MONO, fontSize: 12, textAlign: "right" }} />;
}

export function NumerosNegocio() {
  const { flash } = useUI();
  const [tarifas] = useTarifas();
  const [clientes, setClientes] = useState<Cli[] | null>(null);
  const [cid, setCid] = useState("");
  const [fila, setFila] = useState<Fila | null>(null);
  const [falta, setFalta] = useState(false);
  const [estado, setEstado] = useState<"" | "guardando" | "guardado" | "error">("");
  const [mapa, setMapa] = useState<MapaFila | null | undefined>(undefined);
  const tocado = useRef(false);

  useEffect(() => {
    datos.lista<Cli>("clientes", "select=id,nombre,sector&order=nombre").then((r) => {
      setClientes(r.filas);
      const q = new URLSearchParams(window.location.search).get("cliente");
      setCid(r.filas.find((c) => c.id === q || c.nombre === q)?.id ?? r.filas[0]?.id ?? "");
    }).catch(() => setClientes([]));
  }, []);
  const cli = clientes?.find((c) => c.id === cid);
  const cargarMapa = useCallback(() => { if (!cid) return; void datos.lista<MapaFila>("mapas_flujo", `select=codigo,procesos&${eq("cliente_id", cid)}&order=creado_en.desc&limit=1`).then((r) => setMapa(r.filas[0] ?? null)).catch(() => setMapa(null)); }, [cid]);
  useEffect(() => {
    if (!cid || !cli) return; tocado.current = false; setFila(null); setEstado(""); setMapa(undefined);
    datos.lista<Fila>("numeros_negocio", `select=*&${eq("cliente_id", cid)}`)
      .then((r) => setFila(r.filas[0] ?? { cliente_id: cid, modelo: modeloDe(cli.sector), datos: {}, notas: "", actualizado_en: "" }))
      .catch((e) => { if (/numeros_negocio|schema cache|404/i.test((e as Error).message)) setFalta(true); else flash("No se pudieron cargar los números: " + (e as Error).message); });
    cargarMapa();
  }, [cid, cli, flash, cargarMapa]);
  // Se guarda solo, un momento después del último cambio.
  useEffect(() => {
    if (!fila || !tocado.current) return;
    setEstado("guardando");
    const h = setTimeout(() => { datos.crea("numeros_negocio", { cliente_id: fila.cliente_id, modelo: fila.modelo, datos: fila.datos, notas: fila.notas || null, actualizado_en: new Date().toISOString() }, "cliente_id").then(() => setEstado("guardado")).catch((e) => { setEstado("error"); flash("No se guardó: " + (e as Error).message); }); }, 700);
    return () => clearTimeout(h);
  }, [fila, flash]);

  if (!clientes) return <Cargando />;
  if (falta) return <section style={{ padding: "22px 32px 56px" }}><Vacio><strong style={{ color: C.papel }}>Falta un paso en Supabase.</strong> Corre una vez <span style={{ fontFamily: MONO, fontSize: 12, color: C.papel }}>musashi/supabase/migrations/0004_numeros_negocio.sql</span> en el SQL Editor y recarga esta página.</Vacio></section>;
  if (!clientes.length) return <section style={{ padding: "22px 32px 56px" }}><Vacio>Primero da de alta al cliente en <Link href="/clientes" style={{ color: C.papel, textDecoration: "underline" }}>Clientes</Link>.</Vacio></section>;

  const cambia = (p: Partial<Fila>) => { tocado.current = true; setFila((f) => (f ? { ...f, ...p } : f)); };
  const setRango = (k: string, r: Rango) => fila && cambia({ datos: { ...fila.datos, [k]: r } });
  const m = fila?.modelo ?? "venta", M = MODELOS[m];
  const r = fila ? calcular(m, fila.datos) : null, ds = fila ? dolencias(m, fila.datos) : [];
  const R = m === "renta", op = R ? "rentas" : "ventas";
  const grupos = [...new Set(M.campos.map((c) => c.grupo))];

  const alMapa = async (p: Proceso) => {
    if (!cli) return;
    try {
      if (mapa) {
        if (mapa.procesos.some((x) => x.nombre === p.nombre)) { flash("Ese proceso ya está en el mapa"); return; }
        const n = mapa.procesos.reduce((s, x) => Math.max(s, Number(x.id.replace(/\D/g, "")) || 0), 0) + 1;
        const procesos = [...mapa.procesos, { ...p, id: "P" + n, pasos: p.pasos.map((x) => ({ ...x })), hallazgos: [] }];
        await datos.cambia("mapas_flujo", eq("codigo", mapa.codigo), { procesos }); setMapa({ ...mapa, procesos });
        flash(`Agregado al mapa ${mapa.codigo}: ${p.nombre}`);
      } else {
        const hoy = new Date().toISOString().slice(0, 10), ch = fila?.datos.costo_hora;
        const nm = nuevoMapa({ cliente: cli.nombre, sector: cli.sector, sucursales: 1, visita: "", visitaISO: hoy, modo: "Guiado", costoCliente: Number(ch?.min ?? ch?.max ?? tarifas.costoHoraCliente) });
        const procesos = [...nm.procs, { ...p, id: "P" + (nm.procs.length + 1), pasos: p.pasos.map((x) => ({ ...x })), hallazgos: [] }];
        await datos.crea("mapas_flujo", aFilaMapa({ ...nm, procs: procesos }, cli.id), "codigo"); setMapa({ codigo: nm.id, procesos });
        flash(`Se creó el mapa ${nm.id} de ${cli.nombre} con este proceso`);
      }
    } catch (e) { flash("No se guardó en el mapa: " + (e as Error).message); }
  };

  const Card = ({ k, v, d, color }: { k: string; v: string; d: string; color?: string }) => (
    <div style={{ border: `1px solid ${C.borde}`, borderRadius: 18, padding: "12px 14px", background: "rgba(238,235,228,0.03)" }}>
      <div style={{ ...mono10, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: color ?? C.acero }} />{k}</div>
      <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em", marginTop: 6, color: v === "—" ? C.tenue : C.papel }}>{v}</div>
      <div style={{ fontSize: 12, color: C.niebla, marginTop: 3, lineHeight: 1.35 }}>{d}</div>
    </div>
  );
  const signo = (p: Par) => ((p.lo ?? 0) < 0 ? C.oxido : (p.hi ?? p.lo) != null ? C.olivo : C.acero);

  return (
    <section style={{ padding: "22px 32px 56px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <select value={cid} onChange={(e) => setCid(e.target.value)} style={{ ...inp, width: 320, appearance: "none" }}>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre} · {c.sector}</option>)}</select>
        {fila && (Object.keys(MODELOS) as ModeloId[]).map((k) => <button key={k} type="button" onClick={() => cambia({ modelo: k })} style={{ ...chip(m === k), height: 40 }}>{MODELOS[k].nombre}</button>)}
        <span style={{ ...mono10, marginLeft: "auto" }}>{estado === "guardando" ? "GUARDANDO…" : estado === "guardado" ? "GUARDADO" : estado === "error" ? "SIN GUARDAR" : fila?.actualizado_en ? "GUARDADO" : ""}</span>
        {mapa && <Link href="/diagnosticos?tab=flujos" style={{ ...btn, height: 40, display: "flex", alignItems: "center" }}>Mapa {mapa.codigo} · {mapa.procesos.length} procesos ↗</Link>}
      </div>
      {!fila || !r ? <Cargando /> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>
            <Glass pad={20}>
              <Eyebrow>LO QUE DICE {R ? "LA CLIENTA" : "EL CLIENTE"} · {M.nombre.toUpperCase()}</Eyebrow>
              <div style={{ fontSize: 12.5, color: C.niebla, margin: "6px 0 10px", lineHeight: 1.45 }}>Si te da un rango, captura los dos extremos: se calcula un escenario bajo y uno alto. Un solo número va en la primera casilla. Lo que no sepa, déjalo vacío y apúntalo para la visita.</div>
              {grupos.map((g) => (
                <div key={g} style={{ marginTop: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.borde}` }}><span style={{ ...mono10, color: C.papel }}>{g.toUpperCase()}</span><span style={{ ...mono10, textAlign: "right" }}>DE</span><span style={{ ...mono10, textAlign: "right" }}>A</span></div>
                  {M.campos.filter((c) => c.grupo === g).map((c) => { const v = fila.datos[c.k] ?? {}; return (
                    <div key={c.k} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px", gap: 8, padding: "7px 0", alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.05)" }}>
                      <div><div style={{ fontSize: 13 }}>{c.t} <span style={{ ...mono10, fontSize: 9 }}>{UNI[c.u]}</span></div><div style={{ fontSize: 11.5, color: C.tenue, lineHeight: 1.3 }}>{c.ayuda}</div></div>
                      <Num v={v.min} ph={c.k === "dias_semana" ? "6" : "—"} onChange={(n) => setRango(c.k, { ...v, min: n })} />
                      <Num v={v.max} ph="opcional" onChange={(n) => setRango(c.k, { ...v, max: n })} />
                    </div>
                  ); })}
                </div>
              ))}
              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla, marginTop: 14 }}>Notas de la conversación
                <textarea value={fila.notas ?? ""} rows={4} onChange={(e) => cambia({ notas: e.target.value })} placeholder="Lo que dijo con sus palabras, temporadas fuertes, qué le preocupa, qué ya intentó…" style={{ ...inp, height: "auto", padding: "10px 14px", borderRadius: 16, resize: "vertical", fontFamily: "inherit", lineHeight: 1.45 }} />
              </label>
            </Glass>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Eyebrow>LO QUE SALE DE ESOS NÚMEROS · AL MES</Eyebrow>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Card k="INGRESO" v={fmt(r.ingreso, "mxn")} d={R ? `${fmt(r.operaciones)} operaciones al precio promedio` : `${fmt(r.operaciones)} ventas al ticket promedio`} color={C.papel} />
                <Card k="UTILIDAD ANTES DE IMPUESTOS" v={fmt(r.utilidad, "mxn")} d={r.utilidad.lo != null ? `Margen de ${fmt(r.margenPct, "pct")} sobre lo que entra` : "Faltan costos o gastos fijos para calcularla"} color={signo(r.utilidad)} />
                <Card k="PUNTO DE EQUILIBRIO" v={fmt(r.equilibrio)} d={r.equilibrio.lo != null ? `${op} al mes para cubrir gastos fijos; hoy hace ${fmt(r.operaciones)}` : `Faltan gastos fijos y costo por ${R ? "renta" : "venta"}`} color={C.ambar} />
                <Card k="CONVERSIÓN" v={fmt(r.conversion, "pct")} d={r.conversion.lo != null ? `De ${fmt(r.visitasMes)} visitas al mes, cierran ${fmt(r.operaciones)}` : "Faltan visitas al día u operaciones"} color={C.ambar} />
                {R && <Card k="ROTACIÓN DEL INVENTARIO" v={r.rotacion.lo != null ? `${fmt(r.rotacion, "dec")} al mes` : "—"} d={r.mesesEntreSalidas.lo != null ? `Cada vestido sale en promedio cada ${fmt(r.mesesEntreSalidas, "meses")} meses` : "Faltan rentas al mes o inventario"} color={C.oxido} />}
                {R && <Card k="INGRESO POR VESTIDO" v={fmt(r.ingresoPorPieza, "mxn")} d="Al mes, en promedio, por cada vestido del inventario" />}
                {R && <Card k="RECUPERACIÓN DE UN VESTIDO" v={r.operacionesParaPagar.lo != null ? `${fmt(r.operacionesParaPagar, "dec")} rentas` : "—"} d={r.mesesParaPagar.lo != null ? `${fmt(r.mesesParaPagar, "meses")} meses al ritmo actual` : "Falta el costo de compra o por renta"} />}
                <Card k="DINERO EN INVENTARIO" v={fmt(r.capital, "mxn")} d={r.capital.lo != null ? `${fmt({ lo: fila.datos.piezas?.min ?? fila.datos.piezas?.max ?? undefined })} piezas al costo promedio` : "Falta el costo promedio por pieza"} />
                <Card k="COSTO DE ADMINISTRAR" v={fmt(r.costoAdmin, "mxn")} d={r.costoAdmin.lo != null ? "Al mes, en horas de quien administra" : "Faltan horas a la semana y valor de la hora"} />
              </div>
              {(r.supuestos.length > 0 || r.faltan.length > 0) && <div style={{ fontSize: 12.5, color: C.niebla, lineHeight: 1.5, border: `1px solid ${C.borde}`, borderRadius: 16, padding: "10px 14px" }}>
                {r.supuestos.map((x) => <div key={x}><span style={{ ...mono10, color: C.ambar }}>SUPUESTO </span>{x}</div>)}
                {r.faltan.length > 0 && <div><span style={{ ...mono10, color: C.oxido }}>PREGUNTAR </span>{r.faltan.join(" · ")}</div>}
              </div>}
              <div style={{ fontSize: 11.5, color: C.tenue, lineHeight: 1.45 }}>Son cifras dichas por {R ? "la clienta" : "el cliente"}, no medidas. Sirven para orientar la visita y la propuesta; confírmalas con sus registros antes de ponerlas en un reporte.</div>
            </div>
          </div>

          <Glass pad={20}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>LO QUE DICEN LOS NÚMEROS</div>
              <span style={mono10}>{ds.length} {ds.length === 1 ? "DOLENCIA" : "DOLENCIAS"} · CADA UNA SE PUEDE MEDIR EN EL MAPA</span>
            </div>
            {ds.length === 0 && <Vacio>Captura al menos {op} al mes, precios y costos para ver dónde se le va el dinero.</Vacio>}
            {ds.map((x, i) => { const ya = !!x.proceso && !!mapa?.procesos.some((p) => p.nombre === x.proceso!.nombre); return (
              <div key={x.id} style={{ display: "grid", gridTemplateColumns: "28px 1fr 250px", gap: 12, padding: "14px 0", borderTop: i ? `1px solid ${C.borde}` : "none", alignItems: "start", marginTop: i ? 0 : 10 }}>
                <span style={{ display: "flex", gap: 3, paddingTop: 6 }}>{[1, 2, 3].map((n) => <span key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: n <= x.peso ? C.oxido : "#2A2F36" }} />)}</span>
                <div><div style={{ fontSize: 15, fontWeight: 600 }}>{x.titulo}</div><div style={{ fontSize: 13, color: C.niebla, lineHeight: 1.5, marginTop: 4, textWrap: "pretty" }}>{x.porque}</div>
                  {x.proceso && <div style={{ ...mono10, marginTop: 6 }}>PROCESO A MEDIR: {x.proceso.nombre.toUpperCase()}</div>}</div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>{x.proceso ? (ya ? <span style={{ ...mono10, color: C.olivo, paddingTop: 8 }}>YA ESTÁ EN EL MAPA {mapa?.codigo}</span> : <SB small onClick={() => void alMapa(x.proceso!)}>{mapa ? "Agregar al mapa" : "Crear mapa con este proceso"}</SB>) : <span style={{ ...mono10, paddingTop: 8 }}>PARA LA PROPUESTA</span>}</div>
              </div>
            ); })}
          </Glass>
        </>
      )}
    </section>
  );
}
