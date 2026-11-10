"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CotizacionDoc, type ContactoDoc } from "@/components/cotizacion-doc";
import { load } from "@/lib/store";
import { datos, eq, hoyISO } from "@/lib/datos";
import { COTS, SELECT_COT, deFilaCot, type Cot, type FilaCot } from "@/lib/cotizaciones";
import { TARIFAS_BASE, type Tarifas } from "@/lib/tarifas";
import { FISCALES_BASE, type Fiscales } from "@/lib/ajustes";

/* Cotización formal para el cliente. Sale de la cotización guardada (?f=C-0001),
   se puede ajustar el texto en pantalla y se imprime o guarda como PDF. */
type Contacto = ContactoDoc;

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

  return <CotizacionDoc cot={cot} emitida={emitida} ciudad={ciudad} contacto={contacto} t={t} fx={fx} />;
}

export default function Page() {
  return <Suspense fallback={null}><Documento /></Suspense>;
}
