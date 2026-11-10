"use client";
import { useEffect, useRef, useState } from "react";
import { load, save } from "@/lib/store";
import { datos, eq } from "@/lib/datos";

/* Tarifas y costos de Ronin Studio. Se editan en Configuración → Tarifas y costos
   y los leen Flujos de trabajo, Cotizaciones, Proyectos y Finanzas.
   Con Supabase viven en configuracion (clave "tarifas"); sin Supabase, en el navegador. */
import { TARIFAS_BASE, type Tarifas } from "@/lib/tarifas-base";
export { TARIFAS_BASE, margenPct, mxn0, type Tarifas } from "@/lib/tarifas-base";

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
