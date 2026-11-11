"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PaperDoc } from "@/components/paper";
import { load } from "@/lib/store";
import { datos, eq } from "@/lib/datos";
import { TARIFAS_BASE, mxn0, type Tarifas } from "@/lib/tarifas";
import { MAPA_DEMO, deFilaMapa, type FilaMapa, minTotal, esperaTotal, minNuevo, minPropuesto, fmtMin, ejecSemana, horasSemanaActual, ahorroHorasSemana, ahorroMesMXN, recapturas, type Mapa } from "@/lib/flujos";

const h1 = (n: number) => (Math.round(n * 10) / 10).toLocaleString("en-US");

function ReporteFlujos() {
  const sp = useSearchParams();
  const [mapa, setMapa] = useState<Mapa>(MAPA_DEMO);
  const [t, setT] = useState<Tarifas>(TARIFAS_BASE);
  const [falta, setFalta] = useState(false);
  useEffect(() => {
    const id = sp.get("c") ?? "D2";
    const local = () => { const d = load<{ mapas?: Mapa[] }>("flujos-mapas", {}); const m = d.mapas?.find((x) => x.id === id); if (m) setMapa(m); setT({ ...TARIFAS_BASE, ...load<Partial<Tarifas>>("tarifas", {}) }); };
    Promise.all([datos.lista<FilaMapa>("mapas_flujo", `select=*&${eq("codigo", id)}`), datos.lista<{ valor: Partial<Tarifas> }>("configuracion", `select=valor&${eq("clave", "tarifas")}`)])
      .then(([m, t]) => { if (!m.db) return local(); if (m.filas[0]) setMapa(deFilaMapa(m.filas[0])); else setFalta(true); if (t.filas[0]) setT({ ...TARIFAS_BASE, ...t.filas[0].valor }); })
      .catch(local);
  }, [sp]);
  const procs = mapa.procs, costo = mapa.costoCliente;
  const CLIENTE_DEMO = { nombre: mapa.cliente, sector: mapa.sector, sucursales: mapa.sucursales, visita: mapa.visita, code: mapa.id };
  const inc = procs.filter((p) => p.incluir);
  const quick = procs.filter((p) => p.fase === "Quick win");
  const fase2 = procs.filter((p) => p.fase === "Fase 2");
  const act = procs.reduce((s, p) => s + horasSemanaActual(p), 0);
  const ahorro = procs.reduce((s, p) => s + ahorroHorasSemana(p), 0);
  const ahorroInc = inc.reduce((s, p) => s + ahorroMesMXN(p, costo), 0);
  const horas = inc.reduce((s, p) => s + p.esfuerzoH, 0);
  const inversion = horas * t.precioHora;
  const payback = ahorroInc ? inversion / ahorroInc : 0;
  const top = [...procs].flatMap((p) => p.hallazgos.map((h) => ({ h, p: p.nombre, d: p.dolor }))).sort((a, b) => b.d - a.d).slice(0, 6);
  if (falta) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EEEBE4", color: "#0C0F14", fontSize: 15 }}>No encontramos ese mapa. Vuelve a Diagnósticos → Flujos de trabajo y ábrelo desde ahí.</div>;
  return (
    <PaperDoc title="Mapa de flujos y propuesta" kicker={`DIAGNÓSTICO COMPLETO · ${CLIENTE_DEMO.nombre.toUpperCase()} · ${CLIENTE_DEMO.sector.toUpperCase()} · VISITA ${CLIENTE_DEMO.visita.toUpperCase()}`} file={`mapa-de-flujos-${CLIENTE_DEMO.code}.html`} back="/diagnosticos">
      <h2>En una página</h2>
      <p>Visitamos las {CLIENTE_DEMO.sucursales} sucursales, mapeamos {procs.length} procesos y medimos cuánto tiempo toma cada uno hoy. Encontramos <strong>{procs.reduce((s, p) => s + recapturas(p), 0)} puntos donde la misma información se captura dos veces o se espera demasiado</strong>. Ordenando esos flujos, el negocio libera cerca de <strong>{h1(ahorro)} horas por semana</strong> de su gente, que a {costo} pesos la hora valen alrededor de <strong>{mxn0(procs.reduce((s, p) => s + ahorroMesMXN(p, costo), 0))} al mes</strong>. No todo conviene hacerlo con software: abajo decimos qué sí, qué después y qué no.</p>
      <div className="grid">
        <div className="fact"><div className="k">HORAS POR SEMANA HOY</div><div className="v">{h1(act)}</div></div>
        <div className="fact"><div className="k">HORAS QUE SE LIBERAN</div><div className="v">{h1(ahorro)}</div></div>
        <div className="fact"><div className="k">VALOR AL MES</div><div className="v">{mxn0(procs.reduce((s, p) => s + ahorroMesMXN(p, costo), 0))}</div></div>
      </div>

      <h2>Lo que encontramos</h2>
      <ol>{top.map((x, i) => <li key={i}>{x.h} <span className="mono">· {x.p.toUpperCase()}</span></li>)}</ol>

      <h2>Inventario de procesos</h2>
      <table>
        <thead><tr><th>Área</th><th>Proceso</th><th>Quién</th><th>Hoy</th><th className="num">Veces/sem</th><th className="num">Min trabajo</th><th className="num">Min espera</th><th className="num">Min propuesto</th><th className="num">H/sem liberadas</th></tr></thead>
        <tbody>{procs.map((p) => <tr key={p.id}><td className="mono">{p.area.toUpperCase()}</td><td>{p.nombre}</td><td>{p.dueno}</td><td>{p.herramienta}</td><td className="num">{ejecSemana(p)}</td><td className="num">{fmtMin(minTotal(p.pasos))}</td><td className="num">{fmtMin(esperaTotal(p.pasos))}</td><td className="num">{minNuevo(p.pasos)}</td><td className="num">{h1(ahorroHorasSemana(p))}</td></tr>)}</tbody>
      </table>

      <h2>Cómo queda cada flujo</h2>
      {procs.filter((p) => p.pasos.length).map((p) => (
        <div key={p.id} style={{ marginBottom: 14 }}>
          <h3>{p.id} · {p.nombre} <span className="mono">· {fmtMin(minTotal(p.pasos))} → {fmtMin(minNuevo(p.pasos))} MIN POR VEZ</span></h3>
          <table>
            <thead><tr><th>#</th><th>Paso hoy</th><th>Quién · herramienta</th><th className="num">Trabajo</th><th className="num">Espera</th><th>Qué cambia</th><th className="num">Min</th></tr></thead>
            <tbody>{p.pasos.map((s, i) => <tr key={i}><td className="mono">{i + 1}{s.atoro ? " ●" : ""}</td><td>{s.p}</td><td>{s.quien} · {s.herr}</td><td className="num">{fmtMin(s.min)}</td><td className="num">{s.espera ? fmtMin(s.espera) : "—"}</td><td>{s.accion === "Eliminar" ? "Se elimina" : s.accion === "Mantener" ? "Se mantiene" : s.accion === "Agente IA" ? "Lo atiende un agente de IA con aprobación" : s.accion === "Automatizar" ? "Se automatiza en la plataforma" : "Se simplifica"}</td><td className="num">{fmtMin(minPropuesto(s))}</td></tr>)}</tbody>
          </table>
          {p.hallazgos.length > 0 && <p style={{ fontSize: 12.5, color: "#3A4048" }}>{p.hallazgos.join(" ")}</p>}
        </div>
      ))}
      <p className="mono">● = punto donde hoy se atora: recaptura o espera larga. Las horas liberadas se calculan sólo con minutos de trabajo del personal; las esperas se reportan aparte porque son tiempo del cliente.</p>

      <h2>Qué proponemos</h2>
      <h3>Construir ahora</h3>
      <table>
        <thead><tr><th>Hito</th><th>Proceso</th><th className="num">Ahorro / mes</th><th className="num">Horas Ronin</th><th className="num">Inversión</th></tr></thead>
        <tbody>{inc.map((p, i) => <tr key={p.id}><td className="mono">H{i + 1}</td><td>{p.nombre}</td><td className="num">{mxn0(ahorroMesMXN(p, costo))}</td><td className="num">{p.esfuerzoH}</td><td className="num">{mxn0(p.esfuerzoH * t.precioHora)}</td></tr>)}
          <tr><td /><td><strong>Total</strong></td><td className="num"><strong>{mxn0(ahorroInc)}</strong></td><td className="num"><strong>{horas}</strong></td><td className="num"><strong>{mxn0(inversion)}</strong></td></tr></tbody>
      </table>
      <p><strong>Retorno:</strong> con el ahorro medido, la inversión se recupera en <strong>{h1(payback)} meses</strong>. Los montos son sin IVA; se paga por hito aceptado con {t.anticipoPct} % de anticipo.</p>
      {quick.length > 0 && <><h3>Quick wins · sin costo, parte de este diagnóstico</h3><ul>{quick.map((p) => <li key={p.id}>{p.nombre}: {p.hallazgos[p.hallazgos.length - 1]}</li>)}</ul></>}
      {fase2.length > 0 && <><h3>Fase 2 · cuando lo anterior esté operando</h3><ul>{fase2.map((p) => <li key={p.id}>{p.nombre} · libera {h1(ahorroHorasSemana(p))} h/sem</li>)}</ul></>}
      {procs.filter((p) => p.fase === "No conviene").length > 0 && <><h3>No conviene hoy</h3><ul>{procs.filter((p) => p.fase === "No conviene").map((p) => <li key={p.id}>{p.nombre}: {p.hallazgos[0]}</li>)}</ul></>}

      <h2>Siguientes pasos</h2>
      <ol><li>Revisión de este reporte con dirección (45 minutos).</li><li>Si se acepta, cotización formal con los hitos de arriba y acta de constitución del proyecto.</li><li>Arranque de 02 · Diseñar: flujo propuesto a detalle y prototipo de pantallas.</li></ol>
      <div className="note">Los tiempos se midieron en la visita y con el personal que ejecuta cada proceso; los ahorros son estimaciones a partir de esos tiempos y del costo por hora que nos indicó el negocio ({costo} MXN). No prometemos porcentajes: medimos antes y después.</div>
      <div className="sign"><div>Julio César Ibarra<br /><span className="mono">FUNDADOR · RONIN STUDIO</span></div><div>Recibido por<br /><span className="mono">{CLIENTE_DEMO.nombre.toUpperCase()}</span></div></div>
    </PaperDoc>
  );
}

export default function Page() {
  return <Suspense fallback={null}><ReporteFlujos /></Suspense>;
}
