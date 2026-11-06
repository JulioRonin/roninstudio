"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PaperDoc } from "@/components/paper";
import { RESUMENES } from "@/lib/proyectos";

const COLOR: Record<string, string> = { Aceptado: "#4C8141", "En revisión": "#C98A3C", "En curso": "#0C0F14", Planeado: "#A9A6A0", Atrasado: "#B05139" };

function Reporte() {
  const sp = useSearchParams();
  const r = RESUMENES[sp.get("p") ?? "D2"] ?? RESUMENES.D2;
  return (
    <PaperDoc title={`${r.proyecto} · reporte de avance`} kicker={`REPORTE PARA EL CLIENTE · ${r.cliente.toUpperCase()} · SEMANA ${r.semana} · ${r.fechaReporte.toUpperCase()}`} file={`reporte-${r.code}-semana-${r.semana}.html`} back="/proyectos">
      <p><strong>{r.cliente}</strong> · {r.sector}<br />Periodo del proyecto: {r.periodo}</p>

      <h2>Estado general</h2>
      <div className="grid">
        <div className="fact"><div className="k">AVANCE</div><div className="v">{r.avance} %</div><div className="bar"><span style={{ width: `${r.avance}%` }} /></div></div>
        <div className="fact"><div className="k">ETAPA</div><div className="v">0{r.etapaN} · {r.etapa}</div><div className="mono">DE 4 ETAPAS DEL MÉTODO</div></div>
        <div className="fact"><div className="k">PRÓXIMO HITO</div><div style={{ fontWeight: 600, marginTop: 6, fontSize: 13 }}>{r.proximo}</div></div>
      </div>
      <p style={{ marginTop: 10 }}><strong>Objetivo del proyecto.</strong> {r.objetivo}</p>

      <h2>Hitos y entregables</h2>
      <table>
        <thead><tr><th>#</th><th>Hito</th><th>Fecha</th><th>Estado</th><th className="num">Monto</th></tr></thead>
        <tbody>
          {r.hitos.map((h) => (
            <tr key={h.n}><td className="mono">{h.n}</td><td>{h.t}</td><td className="mono">{h.fecha.toUpperCase()}</td><td><span className="dot" style={{ background: COLOR[h.estado] }} />{h.estado}</td><td className="num">{h.monto ?? "—"}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>Lo que se hizo esta semana</h2>
      <ul>{r.hecho.map((s) => <li key={s}>{s}</li>)}</ul>

      <h2>Lo que sigue</h2>
      <ul>{r.sigue.map((s) => <li key={s}>{s}</li>)}</ul>

      <h2>Riesgos y cómo los atendemos</h2>
      <table>
        <thead><tr><th>Riesgo</th><th>Plan</th></tr></thead>
        <tbody>{r.riesgos.map((x) => <tr key={x.r}><td>{x.r}</td><td>{x.plan}</td></tr>)}</tbody>
      </table>

      <h2>Decisiones que necesitamos de ustedes</h2>
      <ol>{r.decisiones.map((s) => <li key={s}>{s}</li>)}</ol>

      <h2>Horas y cobranza</h2>
      <div className="grid">
        <div className="fact"><div className="k">HORAS</div><div className="v">{r.horas.usadas} <span style={{ fontWeight: 300, fontSize: 14 }}>de {r.horas.estimadas}</span></div><div className="bar"><span style={{ width: `${Math.min(100, (r.horas.usadas / r.horas.estimadas) * 100)}%` }} /></div></div>
        <div className="fact"><div className="k">FACTURADO · PAGADO</div><div style={{ marginTop: 6, fontSize: 13 }}>{r.cobranza.facturado}<br />{r.cobranza.pagado}</div></div>
        <div className="fact"><div className="k">POR COBRAR</div><div style={{ marginTop: 6, fontSize: 13 }}>{r.cobranza.porCobrar}</div></div>
      </div>
      <div className="note">Este reporte lo prepara el agente Reportero de Musashi con los datos del proyecto y lo revisa Julio César Ibarra antes de enviarse. Los montos son los acordados en la cotización vigente; cualquier cambio de alcance se documenta por escrito antes de ejecutarse.</div>
      <div className="sign"><div>Julio César Ibarra<br /><span className="mono">FUNDADOR · RONIN STUDIO</span></div><div>Recibido por<br /><span className="mono">{r.cliente.toUpperCase()}</span></div></div>
    </PaperDoc>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Reporte /></Suspense>;
}
