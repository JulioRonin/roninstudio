import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { folioDe } from "@/lib/liga";
import { hayDB, sb } from "@/lib/db";
import { SELECT_COT, deFilaCot, type FilaCot } from "@/lib/cotizaciones";
import { TARIFAS_BASE } from "@/lib/tarifas-base";
import { FISCALES_BASE, type Fiscales } from "@/lib/ajustes-base";
import { CotizacionDoc, type ContactoDoc } from "@/components/cotizacion-doc";
import { Abierta } from "./abierta";

// Liga privada para el cliente: sólo abre con la firma correcta, no pide contraseña y no se indexa.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cotización · Ronin Studio", robots: { index: false, follow: false } };
const WHATSAPP_RONIN = "5216565736505"; // el mismo número público del sitio

export default async function Page({ params }: { params: Promise<{ ref: string }> }) {
  const ref = decodeURIComponent((await params).ref);
  const folio = folioDe(ref);
  if (!folio || !hayDB()) notFound();
  const filas = await sb<FilaCot[]>(`cotizaciones?${SELECT_COT}&folio=eq.${encodeURIComponent(folio)}`);
  const f = filas[0];
  if (!f || f.estado === "Borrador") notFound(); // un borrador no se comparte
  const [cfg, cli, con] = await Promise.all([
    sb<{ clave: string; valor: Record<string, unknown> }[]>("configuracion?select=clave,valor&clave=in.(tarifas,fiscales)"),
    sb<{ ciudad: string | null }[]>(`clientes?select=ciudad&id=eq.${f.cliente_id}`),
    sb<ContactoDoc[]>(`contactos?select=nombre,puesto,correo,whatsapp&cliente_id=eq.${f.cliente_id}&order=decide.desc&limit=1`),
  ]);
  const t = { ...TARIFAS_BASE, ...(cfg.find((x) => x.clave === "tarifas")?.valor ?? {}) };
  const fx = { ...FISCALES_BASE, ...((cfg.find((x) => x.clave === "fiscales")?.valor ?? {}) as Partial<Fiscales>) };
  const tel = (fx.telefono || "").replace(/\D/g, "").replace(/^(\d{10})$/, "52$1") || WHATSAPP_RONIN;
  const aceptar = `https://wa.me/${tel}?text=${encodeURIComponent(`Hola Julio, acepto la cotización ${f.folio} (${f.proyecto_nombre}). ¿Cuál es el siguiente paso?`)}`;
  return (
    <>
      <CotizacionDoc cot={deFilaCot(f)} emitida={f.creado_en.slice(0, 10)} ciudad={cli[0]?.ciudad ?? ""} contacto={con[0] ? { ...con[0], correo: null, whatsapp: null } : null} t={t} fx={{ ...fx, banco: "", clabe: "", titular: "" }} publico aceptar={aceptar} />
      <Abierta refCot={ref} />
    </>
  );
}
