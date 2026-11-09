"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PaperDoc } from "@/components/paper";
import { abordajeDe } from "@/lib/abordaje";
import { GUIAS } from "@/lib/flujos";

/* Guía de primer acercamiento por sector: para llevar impresa o en el teléfono a la primera plática. */
function Guia() {
  const sp = useSearchParams();
  const sector = sp.get("s") ?? "Otro";
  const cliente = sp.get("c") ?? "";
  const a = abordajeDe(sector);
  const procesos = GUIAS[sector] ?? [];
  const slug = sector.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
  return (
    <PaperDoc title="Guía de primer acercamiento" kicker={`USO INTERNO · ${sector.toUpperCase()}${cliente ? ` · ${cliente.toUpperCase()}` : ""}`} file={`guia-primer-acercamiento-${slug}.html`} back="/clientes">
      <p>{a.perfil}</p>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="fact"><div className="k">LO QUE PIDE</div><p style={{ margin: "6px 0 0" }}>{a.pide}</p></div>
        <div className="fact"><div className="k">LO QUE HAY QUE ENTENDER ANTES</div><p style={{ margin: "6px 0 0" }}>{a.entender}</p></div>
      </div>

      <h2>Preguntas del primer acercamiento</h2>
      <p className="mono">QUINCE A VEINTE MINUTOS. ANOTA LA RESPUESTA TEXTUAL, NO TU INTERPRETACIÓN.</p>
      <table>
        <thead><tr><th>#</th><th>Pregunta</th><th style={{ width: "42%" }}>Respuesta</th></tr></thead>
        <tbody>{a.preguntas.map((q, i) => <tr key={q}><td className="mono">{String(i + 1).padStart(2, "0")}</td><td>{q}</td><td>&nbsp;</td></tr>)}</tbody>
      </table>

      <h2>Qué observar en la visita</h2>
      <ul>{a.observar.map((x) => <li key={x}>{x}</li>)}</ul>

      <h2>Qué pedirle</h2>
      <ul>{a.pedir.map((x) => <li key={x}>{x}</li>)}</ul>

      {a.opciones && (
        <>
          <h2>Escalera de solución</h2>
          <p>Se sube un escalón a la vez. El mapa de flujos dice en cuál está hoy el negocio; la propuesta nunca salta dos.</p>
          <table>
            <thead><tr><th>Escalón</th><th>Conviene cuando</th><th>Implica</th></tr></thead>
            <tbody>{a.opciones.map((o, i) => <tr key={o.nombre}><td><strong>{i + 1} · {o.nombre}</strong></td><td>{o.cuando}</td><td>{o.implica}</td></tr>)}</tbody>
          </table>
        </>
      )}

      {procesos.length > 0 && (
        <>
          <h2>Procesos que se mapean en la visita</h2>
          <table>
            <thead><tr><th>Área</th><th>Proceso</th><th>Quién</th><th>Hoy se hace con</th></tr></thead>
            <tbody>{procesos.map((p) => <tr key={p.nombre}><td className="mono">{p.area.toUpperCase()}</td><td>{p.nombre}</td><td>{p.dueno}</td><td>{p.herramienta}</td></tr>)}</tbody>
          </table>
          <p className="mono">SON LOS TÍPICOS DEL SECTOR. EN EL MAPA GUIADO SE QUITAN LOS QUE NO EXISTAN Y SE AGREGAN LOS QUE FALTEN.</p>
        </>
      )}

      <h2>Quick wins que se pueden dejar sin software nuevo</h2>
      <ul>{a.quick.map((x) => <li key={x}>{x}</li>)}</ul>

      <h2>Señales de alerta</h2>
      <ul>{a.alertas.map((x) => <li key={x}>{x}</li>)}</ul>

      <div className="note"><strong>Cómo cerrar:</strong> {a.cierre}</div>
    </PaperDoc>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Guia /></Suspense>;
}
