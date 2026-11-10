"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PaperDoc } from "@/components/paper";
import { RESUMENES, type Resumen } from "@/lib/proyectos";
import { datos, eq, fechaCorta, fechaLarga, hoyISO, sumaDias } from "@/lib/datos";

/* Con Supabase, el reporte se arma con los datos reales del proyecto (hitos, horas, riesgos y facturas). */
type FP = { id: string; codigo: string; nombre: string; objetivo: string | null; etapa: string; inicio: string | null; fin: string | null; avance: number; horas_estimadas: number; cliente?: { nombre: string; sector: string } | null;
  hitos?: { orden: number; nombre: string; fecha: string | null; estado: string; monto: number | null }[]; horas?: { fecha: string; horas: number; que_se_hizo: string | null }[]; riesgos?: { descripcion: string; plan: string | null; abierto: boolean }[] };
const $ = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const PEND = "[Escribe aquí]";
async function cargarReal(codigo: string): Promise<Resumen | null | "sin-db"> {
  const r = await datos.lista<FP>("proyectos", `select=*,cliente:clientes(nombre,sector),hitos(*),horas(*),riesgos(*)&${eq("codigo", codigo)}`);
  if (!r.db) return "sin-db";
  const p = r.filas[0]; if (!p) return null;
  const fac = await datos.lista<{ folio: string; monto: number; estado: string }>("facturas", `select=folio,monto,estado&${eq("proyecto_id", p.id)}`);
  const hoy = hoyISO(), hace7 = sumaDias(hoy, -7);
  const hs = [...(p.hitos ?? [])].sort((a, b) => a.orden - b.orden);
  const prox = hs.find((h) => h.estado !== "Aceptado");
  const vivas = fac.filas.filter((f) => f.estado !== "Cancelada" && f.estado !== "Borrador");
  const facturado = vivas.reduce((s, f) => s + Number(f.monto), 0), pagado = vivas.filter((f) => f.estado === "Pagada").reduce((s, f) => s + Number(f.monto), 0);
  const abiertas = vivas.filter((f) => f.estado !== "Pagada");
  const d = new Date(hoy + "T12:00:00"); const y0 = new Date(Date.UTC(d.getFullYear(), 0, 4)); const semana = String(1 + Math.round(((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - y0.getTime()) / 86400000 - 3 + ((y0.getUTCDay() + 6) % 7)) / 7));
  const hecho = (p.horas ?? []).filter((h) => h.fecha >= hace7 && h.que_se_hizo).sort((a, b) => a.fecha.localeCompare(b.fecha)).map((h) => `${h.que_se_hizo} (${fechaCorta(h.fecha)})`);
  const limpio = (n: string) => n.replace(/^Hito\s+\d+\s*·\s*/i, "");
  return {
    code: p.codigo, cliente: p.cliente?.nombre ?? "—", sector: p.cliente?.sector ?? "", proyecto: p.nombre,
    periodo: `${p.inicio ? fechaLarga(p.inicio) : "por definir"} – ${p.fin ? fechaLarga(p.fin) : "por definir"}`, etapa: p.etapa, etapaN: ["Mapear", "Diseñar", "Construir", "Evolucionar"].indexOf(p.etapa) + 1,
    avance: p.avance, proximo: prox ? `${limpio(prox.nombre)}${prox.fecha ? " · " + fechaLarga(prox.fecha) : ""}` : "Todos los hitos aceptados", fechaReporte: fechaLarga(hoy), semana,
    objetivo: p.objetivo ?? PEND,
    hitos: hs.map((h, i) => ({ n: `H${i + 1}`, t: limpio(h.nombre), fecha: h.fecha ? fechaCorta(h.fecha) : "—", estado: (h.estado !== "Aceptado" && h.fecha && h.fecha < hoy ? "Atrasado" : h.estado) as Resumen["hitos"][number]["estado"], monto: h.monto ? $(Number(h.monto)) : undefined })),
    hecho: hecho.length ? hecho : [PEND], sigue: hs.filter((h) => h.estado !== "Aceptado").slice(0, 3).map((h) => `${limpio(h.nombre)}${h.fecha ? ", para el " + fechaLarga(h.fecha) : ""}.`).concat(hs.every((h) => h.estado === "Aceptado") ? [PEND] : []),
    riesgos: (p.riesgos ?? []).filter((x) => x.abierto).map((x) => ({ r: x.descripcion, plan: x.plan ?? PEND })), decisiones: [PEND],
    horas: { usadas: (p.horas ?? []).reduce((s, h) => s + Number(h.horas), 0), estimadas: Number(p.horas_estimadas) || 1 },
    cobranza: { facturado: `Facturado ${$(facturado)} MXN`, pagado: `Pagado ${$(pagado)} MXN`, porCobrar: abiertas.length ? `${$(facturado - pagado)} MXN (${abiertas.map((f) => f.folio).join(", ")})` : "Nada pendiente" },
  };
}

const COLOR: Record<string, string> = { Aceptado: "#4C8141", "En revisión": "#C98A3C", "En curso": "#0C0F14", Planeado: "#A9A6A0", Atrasado: "#B05139" };

function Reporte() {
  const sp = useSearchParams();
  const code = sp.get("p") ?? "D2";
  const [r, setR] = useState<Resumen | null | "cargando">("cargando");
  useEffect(() => { cargarReal(code).then((x) => setR(x === "sin-db" ? RESUMENES[code] ?? RESUMENES.D2 : x)).catch(() => setR(null)); }, [code]);
  if (r === "cargando") return null;
  if (!r) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EEEBE4", color: "#0C0F14", fontSize: 15, padding: 24 }}>No encontramos el proyecto {code}. Ábrelo desde Proyectos → Reporte para el cliente.</div>;
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
        <tbody>{r.riesgos.map((x) => <tr key={x.r}><td>{x.r}</td><td>{x.plan}</td></tr>)}{r.riesgos.length === 0 && <tr><td colSpan={2}>Sin riesgos abiertos a la fecha.</td></tr>}</tbody>
      </table>

      <h2>Decisiones que necesitamos de ustedes</h2>
      <ol>{r.decisiones.map((s) => <li key={s}>{s}</li>)}</ol>

      <h2>Horas y cobranza</h2>
      <div className="grid">
        <div className="fact"><div className="k">HORAS</div><div className="v">{r.horas.usadas} <span style={{ fontWeight: 300, fontSize: 14 }}>de {r.horas.estimadas}</span></div><div className="bar"><span style={{ width: `${Math.min(100, (r.horas.usadas / r.horas.estimadas) * 100)}%` }} /></div></div>
        <div className="fact"><div className="k">FACTURADO · PAGADO</div><div style={{ marginTop: 6, fontSize: 13 }}>{r.cobranza.facturado}<br />{r.cobranza.pagado}</div></div>
        <div className="fact"><div className="k">POR COBRAR</div><div style={{ marginTop: 6, fontSize: 13 }}>{r.cobranza.porCobrar}</div></div>
      </div>
      <div className="note">Este reporte se arma con los datos del proyecto en Musashi y lo revisa Julio César Ibarra antes de enviarse. Los montos son los acordados en la cotización vigente; cualquier cambio de alcance se documenta por escrito antes de ejecutarse.</div>
      <div className="sign"><div>Julio César Ibarra<br /><span className="mono">FUNDADOR · RONIN STUDIO</span></div><div>Recibido por<br /><span className="mono">{r.cliente.toUpperCase()}</span></div></div>
    </PaperDoc>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Reporte /></Suspense>;
}
