"use client";
import { useEffect, useRef, useState } from "react";
import { load, save } from "@/lib/store";
import { datos, eq } from "@/lib/datos";

/* Ajustes de Musashi guardados en la tabla configuracion (clave → valor jsonb).
   Con Supabase se guardan en la base; sin Supabase, en el navegador. */
export function useAjuste<T extends object>(clave: string, base: T): [T, (patch: Partial<T>) => void, boolean] {
  const [v, setV] = useState<T>(base);
  const [listo, setListo] = useState(false);
  const modo = useRef<"cargando" | "db" | "local">("cargando");
  const tocado = useRef(false);
  useEffect(() => {
    let vivo = true;
    const local = () => { modo.current = "local"; setV({ ...base, ...load<Partial<T>>(clave, {}) }); setListo(true); };
    datos.lista<{ valor: Partial<T> }>("configuracion", `select=valor&${eq("clave", clave)}`)
      .then((r) => { if (!vivo) return; if (!r.db) return local(); modo.current = "db"; if (r.filas[0]) setV({ ...base, ...r.filas[0].valor }); setListo(true); })
      .catch(() => { if (vivo) local(); });
    return () => { vivo = false; };
  }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!tocado.current || modo.current === "cargando") return;
    if (modo.current === "local") { save(clave, v); return; }
    const h = setTimeout(() => { void datos.crea("configuracion", { clave, valor: v }, "clave").catch(() => {}); }, 700);
    return () => clearTimeout(h);
  }, [v, clave]);
  return [v, (p) => { tocado.current = true; setV((x) => ({ ...x, ...p })); }, listo];
}

/* Datos del emisor: salen en la cotización formal y, más adelante, en el CFDI. */
export type Fiscales = { nombreComercial: string; razonSocial: string; rfc: string; regimen: string; cp: string; domicilio: string; serie: string; monedas: string; correo: string; telefono: string; banco: string; titular: string; clabe: string };
export const FISCALES_BASE: Fiscales = { nombreComercial: "Ronin Studio", razonSocial: "", rfc: "", regimen: "", cp: "", domicilio: "", serie: "F", monedas: "MXN", correo: "project@roninstudio.com.mx", telefono: "", banco: "", titular: "", clabe: "" };

/* Tope mensual de gasto en tokens de IA (MXN). */
export type Tope = { total: number };
export const TOPE_BASE: Tope = { total: 3000 };
