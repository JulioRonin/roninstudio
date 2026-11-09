"use client";
import { useEffect, useRef, useState } from "react";
import { load, save } from "@/lib/store";
import { datos, eq } from "@/lib/datos";

/* Tarifas y costos de Ronin Studio. Se editan en Configuración → Tarifas y costos
   y los leen Flujos de trabajo, Cotizaciones, Proyectos y Finanzas.
   Con Supabase viven en configuracion (clave "tarifas"); sin Supabase, en el navegador. */
export type Tarifas = {
  costoHora: number;            // lo que nos cuesta una hora (MXN)
  precioHora: number;           // lo que cobramos por hora (MXN)
  ivaPct: number;
  anticipoPct: number;
  diagnosticoHoras: number;     // horas del diagnóstico completo
  acompanamientoHoras: number;  // horas al mes del acompañamiento
  costoHoraCliente: number;     // costo promedio de una hora del personal del cliente (para valuar ahorros)
  paybackMaxMeses: number;      // filtro: si la inversión no se recupera en este plazo, no se propone
};
export const TARIFAS_BASE: Tarifas = { costoHora: 540, precioHora: 1000, ivaPct: 16, anticipoPct: 30, diagnosticoHoras: 20, acompanamientoHoras: 8, costoHoraCliente: 95, paybackMaxMeses: 12 };

export const margenPct = (t: Tarifas) => Math.round((1 - t.costoHora / t.precioHora) * 100);
export const mxn0 = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export function useTarifas(): [Tarifas, (patch: Partial<Tarifas>) => void, () => void] {
  const [t, setT] = useState<Tarifas>(TARIFAS_BASE);
  const modo = useRef<"cargando" | "db" | "local">("cargando");
  const tocado = useRef(false);
  useEffect(() => {
    let vivo = true;
    datos.lista<{ valor: Partial<Tarifas> }>("configuracion", `select=valor&${eq("clave", "tarifas")}`)
      .then((r) => { if (!vivo) return; if (r.db) { modo.current = "db"; if (r.filas[0]) setT({ ...TARIFAS_BASE, ...r.filas[0].valor }); } else { modo.current = "local"; setT({ ...TARIFAS_BASE, ...load<Partial<Tarifas>>("tarifas", {}) }); } })
      .catch(() => { modo.current = "local"; setT({ ...TARIFAS_BASE, ...load<Partial<Tarifas>>("tarifas", {}) }); });
    return () => { vivo = false; };
  }, []);
  // Guarda sólo cuando el usuario cambia algo (no al cargar), con una pausa para no escribir en cada tecla.
  useEffect(() => {
    if (!tocado.current || modo.current === "cargando") return;
    if (modo.current === "local") { save("tarifas", t); return; }
    const h = setTimeout(() => { void datos.crea("configuracion", { clave: "tarifas", valor: t }, "clave").catch(() => {}); }, 700);
    return () => clearTimeout(h);
  }, [t]);
  return [t, (p) => { tocado.current = true; setT((x) => ({ ...x, ...p })); }, () => { tocado.current = true; setT(TARIFAS_BASE); }];
}
