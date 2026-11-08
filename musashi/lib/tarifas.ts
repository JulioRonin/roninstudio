"use client";
import { useEffect, useState } from "react";
import { load, save } from "@/lib/store";

/* Tarifas y costos de Ronin Studio. Se editan en Configuración → Tarifas y costos
   y los leen Flujos de trabajo, Cotizaciones, Proyectos y Finanzas. */
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
  const [ready, setReady] = useState(false);
  useEffect(() => { setT({ ...TARIFAS_BASE, ...load<Partial<Tarifas>>("tarifas", {}) }); setReady(true); }, []);
  useEffect(() => { if (ready) save("tarifas", t); }, [t, ready]);
  return [t, (p) => setT((x) => ({ ...x, ...p })), () => setT(TARIFAS_BASE)];
}
