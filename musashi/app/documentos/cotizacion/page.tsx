"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PaperDoc } from "@/components/paper";
import { load } from "@/lib/store";
import { datos, eq, fechaLarga, hoyISO } from "@/lib/datos";
import { COTS, SELECT_COT, deFilaCot, mxn, type Cot, type FilaCot, type Linea } from "@/lib/cotizaciones";
import { TARIFAS_BASE, type Tarifas } from "@/lib/tarifas";
import { FISCALES_BASE, type Fiscales } from "@/lib/ajustes";

/* Cotización formal para el cliente. Sale de la cotización guardada (?f=C-0001),
   se puede ajustar el texto en pantalla y se imprime o guarda como PDF. */
const F = ({ children }: { children: string }) => <span className="field">{children}</span>;
const ENTREGA: Record<Linea["etapa"], string> = {
  Mapear: "Visita, mapa del flujo real, hallazgos y propuesta por escrito.",
  "Diseñar": "Plan de trabajo, flujo propuesto y prototipo navegable.",
  Construir: "Sistema en operación, probado con casos reales, y capacitación.",
  Evolucionar: "Acompañamiento, reporte de resultados y ajustes.",
};
type Contacto = { nombre: string; puesto: string | null; correo: string | null; whatsapp: string | null };

function Documento() {
  const sp = useSearchParams();
  const folio = sp.get("f") ?? "";
  const [cot, setCot] = useState<Cot | null>(null);
  const [emitida, setEmitida] = useState<string>(hoyISO());
  const [ciudad, setCiudad] = useState<string>("");
  const [contacto, setContacto] = useState<Contacto | null>(null);
  const [t, setT] = useState<Tarifas>(TARIFAS_BASE);
  const [fx, setFx] = useState<Fiscales>(FISCALES_BASE);
  const [estado, setEstado] = useState<"cargando" | "ok" | "falta">("cargando");

  useEffect(() => {
    const local = () => { const d = load<{ cots?: Cot[] }>("cotizaciones", {}); const c = (d.cots ?? COTS).find((x) => x.folio === folio); if (c) { setCot(c); setEstado("ok"); } else setEstado("falta"); setT({ ...TARIFAS_BASE, ...load<Partial<Tarifas>>("tarifas", {}) }); setFx({ ...FISCALES_BASE, ...load<Partial<Fiscales>>("fiscales", {}) }); };
    (async () => {
      try {
        const r = await datos.lista<FilaCot>("cotizaciones", `${SELECT_COT}&${eq("folio", folio)}`);
        if (!r.db) return local();
        const f = r.filas[0]; if (!f) { setEstado("falta"); return; }
        setCot(deFilaCot(f)); setEmitida(f.creado_en.slice(0, 10));
        const [cf, cl, co] = await Promise.all([
          datos.lista<{ clave: string; valor: object }>("configuracion", "select=clave,valor&clave=in.(tarifas,fiscales)"),
          datos.lista<{ ciudad: string | null }>("clientes", `select=ciudad&${eq("id", f.cliente_id)}`),
          datos.lista<Contacto>("contactos", `select=nombre,puesto,correo,whatsapp&${eq("cliente_id", f.cliente_id)}&order=decide.desc&limit=1`),
        ]);
        cf.filas.forEach((x) => { if (x.clave === "tarifas") setT({ ...TARIFAS_BASE, ...(x.valor as Partial<Tarifas>) }); if (x.clave === "fiscales") setFx({ ...FISCALES_BASE, ...(x.valor as Partial<Fiscales>) }); });
        setCiudad(cl.filas[0]?.ciudad ?? ""); setContacto(co.filas[0] ?? null); setEstado("ok");
      } catch { local(); }
    })();
  }, [folio]);

  if (estado === "cargando") return null;
  if (estado === "falta" || !cot) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EEEBE4", color: "#0C0F14", fontSize: 15, padding: 24, textAlign: "center" }}>No encontramos la cotización {folio}. Ábrela desde Cotizaciones → Cotización formal.</div>;

  const subtotal = cot.lineas.reduce((s, l) => s + l.monto, 0);
  const neto = subtotal - cot.credito;
  const iva = Math.round(neto * t.ivaPct) / 100;
  const total = neto + iva;
  const anticipo = Math.round(total * cot.anticipo) / 100;
  const emisor = fx.razonSocial || fx.nombreComercial || "Ronin Studio";

  return (
    <PaperDoc title={cot.proyecto} kicker={`COTIZACIÓN ${cot.folio} · ${fechaLarga(emitida).toUpperCase()}${cot.vigenciaISO ? ` · VIGENTE AL ${fechaLarga(cot.vigenciaISO).toUpperCase()}` : ""}`} file={`cotizacion-${cot.folio}.html`} back="/cotizaciones">
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="fact">
          <div className="k">PARA</div>
          <p style={{ margin: "6px 0 0" }}><strong>{cot.cliente}</strong><br />{contacto ? <>{contacto.nombre}{contacto.puesto ? ` · ${contacto.puesto}` : ""}<br /></> : <><F>[Nombre de quien decide]</F><br /></>}{[cot.sector, ciudad].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="fact">
          <div className="k">DE</div>
          <p style={{ margin: "6px 0 0" }}><strong>Julio César Ibarra</strong> · Fundador de Ronin Studio<br />{emisor}{fx.rfc ? ` · RFC ${fx.rfc}` : ""}<br />{[fx.correo, fx.telefono].filter(Boolean).join(" · ")}</p>
        </div>
      </div>

      <h2>Qué vamos a resolver</h2>
      {cot.notas ? <p>{cot.notas}</p> : <p><F>[Describe en dos o tres líneas el problema del negocio con sus palabras, lo que cambia al terminar y cómo se va a medir.]</F></p>}

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
        <li>Soporte posterior a la garantía; se contrata como acompañamiento mensual.</li>
      </ul>

      <h2>Condiciones</h2>
      <ul>
        <li>Precios en pesos mexicanos. Esta cotización vence el {cot.vigenciaISO ? fechaLarga(cot.vigenciaISO) : <F>[fecha]</F>}.</li>
        <li>Lo desarrollado específicamente para tu negocio es tuyo al cubrir el total. Las herramientas y componentes propios de Ronin Studio se licencian para su uso dentro de la solución.</li>
        <li>La información que nos compartas es confidencial. Las acciones de agentes de IA hacia terceros pasan por aprobación humana.</li>
        <li>Al aceptarse, esta cotización forma parte del contrato de prestación de servicios como Anexo A.</li>
      </ul>

      <div className="sign">
        <div>Julio César Ibarra<br /><span className="mono">FUNDADOR · RONIN STUDIO</span></div>
        <div>Acepto la cotización {cot.folio}<br /><span className="mono">{(contacto?.nombre ?? cot.cliente).toUpperCase()} · {cot.cliente.toUpperCase()} · FECHA</span></div>
      </div>
    </PaperDoc>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Documento /></Suspense>;
}
