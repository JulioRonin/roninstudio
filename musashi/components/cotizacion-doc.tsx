"use client";
import React from "react";
import { PaperDoc } from "@/components/paper";
import { fechaLarga } from "@/lib/datos";
import { mxn, renglones, type Cot, type Linea } from "@/lib/cotizaciones";
import type { Tarifas } from "@/lib/tarifas";
import type { Fiscales } from "@/lib/ajustes";

/* Cotización formal. La usan la vista interna (editable, /documentos/cotizacion)
   y la liga privada del cliente (sólo lectura, /c/<folio>.<firma>). */
const F = ({ children }: { children: string }) => <span className="field">{children}</span>;
const ENTREGA: Record<Linea["etapa"], string> = {
  Mapear: "Visita, mapa del flujo real, hallazgos y propuesta por escrito.",
  "Diseñar": "Plan de trabajo, flujo propuesto y prototipo navegable.",
  Construir: "Sistema en operación, probado con casos reales, y capacitación.",
  Evolucionar: "Acompañamiento, reporte de resultados y ajustes.",
};
export type ContactoDoc = { nombre: string; puesto: string | null; correo: string | null; whatsapp: string | null };

export function CotizacionDoc({ cot, emitida, ciudad, contacto, t, fx, publico = false, aceptar }: { cot: Cot; emitida: string; ciudad: string; contacto: ContactoDoc | null; t: Pick<Tarifas, "ivaPct">; fx: Fiscales; publico?: boolean; aceptar?: string }) {
  const subtotal = cot.lineas.reduce((s, l) => s + l.monto, 0);
  const neto = subtotal - cot.credito;
  const iva = Math.round(neto * t.ivaPct) / 100;
  const total = neto + iva;
  const anticipo = Math.round(total * cot.anticipo) / 100;
  const emisor = fx.razonSocial || fx.nombreComercial || "Ronin Studio";
  const m = cot.mensual && cot.mensual.monto > 0 ? cot.mensual : null;
  const mIva = m ? Math.round(m.monto * t.ivaPct) / 100 : 0, mTotal = m ? m.monto + mIva : 0;

  return (
    <PaperDoc title={cot.proyecto} kicker={`COTIZACIÓN ${cot.folio} · ${fechaLarga(emitida).toUpperCase()}${cot.vigenciaISO ? ` · VIGENTE AL ${fechaLarga(cot.vigenciaISO).toUpperCase()}` : ""}`} file={`cotizacion-${cot.folio}.html`} back="/cotizaciones" publico={publico} editable={!publico}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="fact">
          <div className="k">PARA</div>
          <p style={{ margin: "6px 0 0" }}><strong>{cot.cliente}</strong><br />{contacto ? <>{contacto.nombre}{contacto.puesto ? ` · ${contacto.puesto}` : ""}<br /></> : publico ? null : <><F>[Nombre de quien decide]</F><br /></>}{[cot.sector, ciudad].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="fact">
          <div className="k">DE</div>
          <p style={{ margin: "6px 0 0" }}><strong>Julio César Ibarra</strong> · Fundador de Ronin Studio<br />{(fx.razonSocial || fx.rfc) && <>{[fx.razonSocial, fx.rfc ? `RFC ${fx.rfc}` : ""].filter(Boolean).join(" · ")}<br /></>}{[fx.correo, fx.telefono].filter(Boolean).join(" · ")}</p>
        </div>
      </div>

      <h2>Qué vamos a resolver</h2>
      {cot.notas ? <p>{cot.notas}</p> : publico ? <p>Ordenar el flujo de trabajo de {cot.cliente} y construir la solución descrita en los hitos de esta cotización.</p> : <p><F>[Describe en dos o tres líneas el problema del negocio con sus palabras, lo que cambia al terminar y cómo se va a medir. Se guarda en las notas de la cotización.]</F></p>}

      <h2>Alcance por hitos</h2>
      <table>
        <thead><tr><th>#</th><th>Hito</th><th>Etapa</th><th>Qué se entrega</th><th className="num">Monto (MXN)</th></tr></thead>
        <tbody>
          {cot.lineas.map((l, i) => <tr key={i}><td className="mono">H{i + 1}</td><td>{l.c.replace(/^Hito\s+\d+\s*·\s*/i, "")}</td><td className="mono">{l.etapa.toUpperCase()}</td><td>{ENTREGA[l.etapa]}</td><td className="num">{mxn(l.monto)}</td></tr>)}
          <tr><td /><td colSpan={3}>Subtotal</td><td className="num">{mxn(subtotal)}</td></tr>
          {cot.credito > 0 && <tr><td /><td colSpan={3}>Crédito del diagnóstico ya pagado</td><td className="num">-{mxn(cot.credito)}</td></tr>}
          <tr><td /><td colSpan={3}>IVA {t.ivaPct} %</td><td className="num">{mxn(iva)}</td></tr>
          <tr><td /><td colSpan={3}><strong>Total</strong></td><td className="num"><strong>{mxn(total)}</strong></td></tr>
        </tbody>
      </table>

      <h2>Forma de pago</h2>
      <div className="grid">
        <div className="fact"><div className="k">ANTICIPO AL ACEPTAR · {cot.anticipo} %</div><div className="v">{mxn(anticipo)}</div></div>
        <div className="fact"><div className="k">RESTO · CONTRA CADA HITO ACEPTADO</div><div className="v">{mxn(total - anticipo)}</div></div>
        <div className="fact"><div className="k">TOTAL CON IVA</div><div className="v">{mxn(total)}</div></div>
      </div>
      <p>El anticipo se cubre al aceptar esta cotización y aparta la fecha de arranque. El resto se paga conforme se acepta cada hito, en proporción a su monto. Se emite factura (CFDI) por cada pago; los pagos se hacen por transferencia dentro de los cinco días naturales siguientes a la factura.</p>
      {(fx.banco || fx.clabe) && <p className="mono">TRANSFERENCIA · {[fx.banco, fx.titular || emisor, fx.clabe ? `CLABE ${fx.clabe}` : ""].filter(Boolean).join(" · ").toUpperCase()}</p>}

      {m && <>
        <h2>Costo mensual después de la entrega</h2>
        <p>{m.arranque.replace(/\.$/, "")}, la plataforma queda en línea con una mensualidad que cubre lo que necesita para seguir funcionando. Se factura cada mes y se paga dentro de los cinco días naturales siguientes.</p>
        <table>
          <thead><tr><th>Concepto</th><th>Empieza</th><th className="num">Al mes (MXN)</th></tr></thead>
          <tbody>
            <tr><td>{m.concepto}</td><td>{m.arranque}</td><td className="num">{mxn(m.monto)}</td></tr>
            <tr><td colSpan={2}>IVA {t.ivaPct} %</td><td className="num">{mxn(mIva)}</td></tr>
            <tr><td colSpan={2}><strong>Mensualidad con IVA</strong></td><td className="num"><strong>{mxn(mTotal)}</strong></td></tr>
          </tbody>
        </table>
        {renglones(m.incluye).length > 0 && <><h3>La mensualidad incluye</h3><ul>{renglones(m.incluye).map((x, i) => <li key={i}>{x}</li>)}</ul></>}
        {renglones(m.terceros).length > 0 && <><h3>Costos de terceros que paga {cot.cliente} directamente</h3><ul>{renglones(m.terceros).map((x, i) => <li key={i}>{x}</li>)}</ul><p>Se pagan al proveedor de cada servicio; no pasan por Ronin Studio y dependen del uso.</p></>}
        <h3>Panorama del primer año</h3>
        <div className="grid">
          <div className="fact"><div className="k">DESARROLLO · CON IVA</div><div className="v">{mxn(total)}</div></div>
          <div className="fact"><div className="k">12 MENSUALIDADES · CON IVA</div><div className="v">{mxn(mTotal * 12)}</div></div>
          <div className="fact"><div className="k">PRIMER AÑO EN OPERACIÓN</div><div className="v">{mxn(total + mTotal * 12)}</div></div>
        </div>
        <p>Sin contar los costos de terceros. Los ajustes que excedan lo incluido en la mensualidad se cotizan aparte. La mensualidad puede cancelarse con treinta días de aviso.</p>
      </>}

      <h2>Cómo trabajamos</h2>
      <ol>
        <li><strong>Mapear.</strong> Visitamos el negocio, seguimos el flujo real y medimos dónde se va el tiempo.</li>
        <li><strong>Diseñar.</strong> Acordamos el flujo propuesto y lo ves en un prototipo antes de construir.</li>
        <li><strong>Construir.</strong> Desarrollamos, probamos con casos reales y arrancamos con tu equipo.</li>
        <li><strong>Evolucionar.</strong> Acompañamos la operación, medimos el resultado y ajustamos.</li>
      </ol>
      <p>Cada hito cierra con tu aceptación por escrito (correo o WhatsApp). Si en cinco días hábiles no hay observaciones, se considera aceptado.</p>

      <h2>Incluye</h2>
      <ul>
        <li>Los entregables de cada hito y una ronda de ajustes por hito.</li>
        <li>Capacitación al equipo que usará la solución.</li>
        <li>Treinta días de garantía por defectos, a partir de la aceptación de cada hito.</li>
      </ul>
      <h2>No incluye</h2>
      <ul>
        <li>Equipo, licencias de terceros, dominios, pasarelas de pago ni costos de envío de mensajes.</li>
        <li>Trabajo fuera del alcance descrito; se cotiza aparte como solicitud de cambio, con su efecto en tiempo y costo.</li>
        <li>{m ? "Soporte y cambios fuera de lo que incluye la mensualidad; se cotizan aparte." : "Soporte posterior a la garantía; se contrata como acompañamiento mensual."}</li>
      </ul>

      <h2>Condiciones</h2>
      <ul>
        <li>Precios en pesos mexicanos. Esta cotización vence el {cot.vigenciaISO ? fechaLarga(cot.vigenciaISO) : <F>[fecha]</F>}.</li>
        <li>Lo desarrollado específicamente para tu negocio es tuyo al cubrir el total. Las herramientas y componentes propios de Ronin Studio se licencian para su uso dentro de la solución.</li>
        <li>La información que nos compartas es confidencial. Las acciones de agentes de IA hacia terceros pasan por aprobación humana.</li>
        <li>Al aceptarse, esta cotización forma parte del contrato de prestación de servicios como Anexo A.</li>
      </ul>

      {publico && aceptar && <p className="paper-actions" style={{ marginTop: 22 }}><a href={aceptar} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "#B05139", color: "#EEEBE4", fontWeight: 600, padding: "12px 20px", borderRadius: 999, textDecoration: "none" }}>Aceptar esta cotización por WhatsApp</a> <span className="mono" style={{ marginLeft: 10 }}>O RESPONDE AL MENSAJE DONDE LA RECIBISTE</span></p>}
      <div className="sign">
        <div>Julio César Ibarra<br /><span className="mono">FUNDADOR · RONIN STUDIO</span></div>
        <div>Acepto la cotización {cot.folio}<br /><span className="mono">{(contacto?.nombre ?? cot.cliente).toUpperCase()} · {cot.cliente.toUpperCase()} · FECHA</span></div>
      </div>
    </PaperDoc>
  );
}
