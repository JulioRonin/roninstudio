"use client";
import { useCallback, useEffect, useState } from "react";
import { C } from "@/lib/tokens";
import { datos, fechaCorta, hoyISO, mesCorto } from "@/lib/datos";
import { SELECT_COT, deFilaCot, total, type FilaCot } from "@/lib/cotizaciones";

/* Datos reales del Dashboard. Con Supabase todo sale de la base (vacío al inicio);
   sin Supabase el Dashboard usa sus datos de ejemplo. */
export type P = { code: string; name: string; meta: string; late?: boolean; ok?: boolean; badge?: number; from: number; to: number; next: number };
export type TareaHoy = { id: string | number; client: string; time: string; title: string; origin: string; channel: string; overdue?: boolean; ai?: string };
export type Kpi = { name: string; value: number; texto?: string; unit?: string; delta: string; serie?: number[] | null; dinero?: boolean };
export type Tablero = {
  hoy: number; base: number; fecha: string; saludo: string; siguiente: string; agentes: string;
  kpis: Kpi[];
  stageDefs: [string, string, P[]][]; inv: number[];
  tasks: TareaHoy[]; filters: string[];
  invoices: { client: string; amount: string; status: string; dot: string; id: string; reminder?: boolean }[]; porCobrar: number; barra: [number, number, number];
  fd: [string, number][]; perdidos: number; objecion: string;
  content: { day: string; channel: string; hook: string; type: string; status: string; dot: string; metrics?: string }[]; contentSub: string;
  rs: { n: string; text: string; src: string }[]; rsEyebrow: string;
};

const DAY = 86400000;
const utc = (iso: string) => { const [y, m, d] = iso.slice(0, 10).split("-").map(Number); return Date.UTC(y, m - 1, d); };
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const $ = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const $2 = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ETAPAS: [string, string][] = [["01", "Mapear"], ["02", "Diseñar"], ["03", "Construir"], ["04", "Evolucionar"]];
const EMBUDO = ["Lead", "Contactado", "Llamada", "Diagnóstico", "Propuesta", "Cliente"];
const DOT_PIEZA: Record<string, string> = { Publicada: C.olivo, Programada: C.olivo, "Aprobación": C.oxido, "Producción": C.ambar, Guion: C.niebla, Idea: C.acero };

type FProyecto = { id: string; codigo: string; nombre: string; etapa: string; inicio: string | null; fin: string | null; creado_en: string; cliente?: { nombre: string; sector: string } | null; hitos?: { nombre: string; fecha: string | null; estado: string; orden: number }[] };
type FTarea = { id: string; titulo: string; fecha: string; hora: string | null; origen: string | null; canal: string | null; borrador_ia: string | null; proyecto_id: string | null; cliente?: { nombre: string; sector: string } | null };
type FFactura = { id: string; folio: string; monto: number; estado: string; vence: string | null; cliente?: { nombre: string } | null };
type FCliente = { etapa_embudo: string; origen: string | null; razon_perdida: string | null; creado_en: string };
type FPieza = { titulo: string; gancho: string | null; formato: string; canal: string; estado: string; publicar_en: string | null };

async function cargar(): Promise<Tablero | null> {
  const pr = await datos.lista<FProyecto>("proyectos", "select=*,cliente:clientes(nombre,sector),hitos(*)&order=creado_en.asc");
  if (!pr.db) return null;
  const [ta, mo, fa, cl, co, pi, inv] = await Promise.all([
    datos.lista<FTarea>("tareas", "select=*,cliente:clientes(nombre,sector)&estado=eq.Pendiente&order=fecha.asc"),
    datos.lista<{ tipo: string; fecha: string; monto: number }>("movimientos", "select=tipo,fecha,monto"),
    datos.lista<FFactura>("facturas", "select=id,folio,monto,estado,vence,cliente:clientes(nombre)&order=vence.asc"),
    datos.lista<FCliente>("clientes", "select=etapa_embudo,origen,razon_perdida,creado_en"),
    datos.lista<FilaCot>("cotizaciones", SELECT_COT),
    datos.lista<FPieza>("piezas", "select=titulo,gancho,formato,canal,estado,publicar_en&order=publicar_en.asc"),
    datos.lista<{ titulo: string; cuerpo: string; creado_en: string }>("propuestas_ia", "select=titulo,cuerpo,creado_en&agente=eq.investigador&order=creado_en.desc&limit=3"),
  ]);
  const hoyI = hoyISO(), hoy = utc(hoyI), ahora = new Date();
  const lunes = hoy - ((new Date(hoy).getUTCDay() + 6) % 7) * DAY;
  const base = lunes - 9 * 7 * DAY;
  const mes = hoyI.slice(0, 7), mesAnt = iso(Date.UTC(+hoyI.slice(0, 4), +hoyI.slice(5, 7) - 2, 15)).slice(0, 7);
  const suma = (tipo: string, m: string) => mo.filas.filter((x) => x.tipo === tipo && x.fecha.slice(0, 7) === m).reduce((s, x) => s + Number(x.monto), 0);
  const cobrado = suma("Cobro", mes), gastos = suma("Gasto", mes), cobradoAnt = suma("Cobro", mesAnt);

  // Tareas
  const vencidas = ta.filas.filter((t) => t.fecha < hoyI), deHoy = ta.filas.filter((t) => t.fecha === hoyI);
  const tasks: TareaHoy[] = [...vencidas, ...deHoy].map((t) => ({ id: t.id, client: (t.cliente ? `${t.cliente.nombre} · ${t.cliente.sector}` : "Ronin Studio").toUpperCase(), time: t.fecha < hoyI ? fechaCorta(t.fecha).toUpperCase() : (t.hora ?? "").slice(0, 5) || "HOY", title: t.titulo, origin: t.origen ?? "Tarea", channel: (t.canal ?? "Interno").toUpperCase(), overdue: t.fecha < hoyI, ai: t.borrador_ia ?? undefined }));
  const prox = ta.filas.find((t) => t.fecha >= hoyI);

  // Proyectos por etapa
  const badge: Record<string, number> = {}; ta.filas.forEach((t) => { if (t.proyecto_id) badge[t.proyecto_id] = (badge[t.proyecto_id] ?? 0) + 1; });
  const stageDefs = ETAPAS.map(([num, et]) => [num, et.toUpperCase(), pr.filas.filter((p) => p.etapa === et).map((p): P => {
    const from = utc(p.inicio ?? p.creado_en);
    const hs = [...(p.hitos ?? [])].sort((a, b) => a.orden - b.orden);
    const pend = hs.find((h) => h.estado !== "Aceptado");
    const fechas = hs.map((h) => h.fecha).filter(Boolean) as string[];
    const to = p.fin ? utc(p.fin) : fechas.length ? Math.max(...fechas.map(utc), from + 30 * DAY) : from + 120 * DAY;
    const late = !!pend?.fecha && pend.fecha < hoyI;
    return { code: p.codigo, name: `${p.cliente?.nombre ?? p.nombre}${p.cliente?.sector ? " · " + p.cliente.sector.split(" ")[0] : ""}`, meta: pend ? `${pend.nombre.replace(/^Hito\s+\d+\s*·\s*/i, "")}${pend.fecha ? " · " + fechaCorta(pend.fecha) : " · sin fecha"}`.toUpperCase() : hs.length ? "HITOS ACEPTADOS" : "SIN HITOS", late, ok: et === "Evolucionar" && !late, badge: badge[p.id], from, to, next: pend?.fecha ? utc(pend.fecha) : from };
  })] as [string, string, P[]]);

  // Cobranza
  const abiertas = fa.filas.filter((f) => f.estado === "Vigente" || f.estado === "Vencida");
  const esVencida = (f: FFactura) => f.estado === "Vencida" || (!!f.vence && f.vence < hoyI);
  const porCobrar = abiertas.reduce((s, f) => s + Number(f.monto), 0);
  const vencido = abiertas.filter(esVencida).reduce((s, f) => s + Number(f.monto), 0);
  const invoices = [...abiertas, ...fa.filas.filter((f) => f.estado === "Pagada").slice(-2)].slice(0, 5).map((f) => {
    const v = f.estado !== "Pagada" && esVencida(f), dias = f.vence ? Math.round((hoy - utc(f.vence)) / DAY) : 0;
    return { client: f.cliente?.nombre ?? "—", amount: $2(Number(f.monto)), id: f.folio, status: f.estado === "Pagada" ? "PAGADA" : v ? `VENCIDA · ${dias} ${dias === 1 ? "DÍA" : "DÍAS"}` : f.vence ? `VENCE ${fechaCorta(f.vence).toUpperCase()}` : "VIGENTE", dot: f.estado === "Pagada" ? C.olivo : v ? C.oxido : C.ambar };
  });

  // Embudo
  const activos = cl.filas.filter((c) => c.etapa_embudo !== "Perdido");
  const fd = EMBUDO.map((e) => [e.toUpperCase(), activos.filter((c) => c.etapa_embudo === e).length] as [string, number]);
  const perdidos = cl.filas.filter((c) => c.etapa_embudo === "Perdido");
  const rz: Record<string, number> = {}; perdidos.forEach((c) => { const r = (c.razon_perdida ?? "").split(" · ")[0]; if (r) rz[r] = (rz[r] ?? 0) + 1; });
  const hace7 = iso(hoy - 7 * DAY);
  const nuevos = cl.filas.filter((c) => c.creado_en.slice(0, 10) >= hace7);
  const og: Record<string, number> = {}; nuevos.forEach((c) => { const o = c.origen ?? "Otro"; og[o] = (og[o] ?? 0) + 1; });

  // Cotizaciones en juego
  const cots = co.filas.map(deFilaCot).filter((c) => ["Borrador", "Enviada", "Abierta"].includes(c.estado));
  const enJuego = cots.reduce((s, c) => s + total(c), 0);

  // Contenido de la semana
  const finSem = iso(lunes + 6 * DAY), iniSem = iso(lunes);
  const sem = pi.filas.filter((p) => p.publicar_en && p.publicar_en.slice(0, 10) >= iniSem && p.publicar_en.slice(0, 10) <= finSem);
  const content = sem.slice(0, 5).map((p) => ({ day: new Date(p.publicar_en!.slice(0, 10) + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric" }).replace(".", "").toUpperCase(), channel: p.canal, hook: p.gancho || p.titulo, type: p.formato.toUpperCase(), status: p.estado.toUpperCase(), dot: DOT_PIEZA[p.estado] ?? C.niebla }));

  // Serie semanal de cobros (7 semanas) para la chispa
  const sems = Array.from({ length: 7 }, (_, i) => { const s = iso(lunes - (6 - i) * 7 * DAY), e = iso(lunes - (6 - i) * 7 * DAY + 6 * DAY); return mo.filas.filter((x) => x.tipo === "Cobro" && x.fecha >= s && x.fecha <= e).reduce((a, x) => a + Number(x.monto), 0); });
  const mx = Math.max(...sems);
  const dif = cobrado - cobradoAnt;
  const h = ahora.getHours();

  return {
    hoy, base,
    fecha: ahora.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short", year: "numeric" }).replace(/[.,]/g, "").toUpperCase(),
    saludo: h < 12 ? "Buenos días," : h < 19 ? "Buenas tardes," : "Buenas noches,",
    siguiente: prox ? `${prox.titulo.length > 26 ? prox.titulo.slice(0, 25) + "…" : prox.titulo} · ${prox.fecha === hoyI ? "hoy" : fechaCorta(prox.fecha)}` : "Sin pendientes",
    agentes: "13 AGENTES CONFIGURADOS",
    kpis: [
      { name: "TAREAS VENCIDAS", value: vencidas.length, delta: `${deHoy.length} PARA HOY` },
      { name: `COBRADO · ${ahora.toLocaleDateString("es-MX", { month: "long" }).toUpperCase()}`, value: cobrado, dinero: true, unit: "MXN", delta: cobradoAnt || cobrado ? `${dif >= 0 ? "+" : "−"}${$(Math.abs(dif))} VS ${mesCorto(mesAnt + "-15")}` : "SIN COBROS REGISTRADOS", serie: mx > 0 ? sems.map((v) => 2 + Math.round((v / mx) * 16)) : null },
      { name: "MARGEN DEL MES", value: cobrado ? Math.round(((cobrado - gastos) / cobrado) * 100) : 0, unit: "%", delta: `GASTOS ${$(gastos)}` },
      { name: "LEADS · 7 DÍAS", value: nuevos.length, delta: Object.entries(og).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([o, n]) => `${n} ${o.toUpperCase()}`).join(" · ") || "SIN LEADS NUEVOS" },
      { name: "EN JUEGO", value: cots.length, delta: `${$(enJuego)} EN COTIZACIONES` },
      { name: "POR COBRAR", value: abiertas.length, delta: `${$(porCobrar)} EN FACTURAS` },
    ],
    stageDefs, inv: abiertas.filter((f) => f.vence).map((f) => utc(f.vence!)),
    tasks, filters: ["Todo", ...new Set(tasks.map((t) => t.origin))],
    invoices, porCobrar, barra: [vencido, porCobrar - vencido, cobrado],
    fd, perdidos: perdidos.length, objecion: Object.entries(rz).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "",
    content, contentSub: `${fechaCorta(iniSem)} al ${fechaCorta(finSem)} · ${sem.length} ${sem.length === 1 ? "pieza planeada" : "piezas planeadas"}`,
    rs: inv.filas.map((r, i) => ({ n: String(i + 1).padStart(2, "0"), text: r.cuerpo.length > 220 ? r.cuerpo.slice(0, 219) + "…" : r.cuerpo, src: `${r.titulo.toUpperCase()} · ${fechaCorta(r.creado_en).toUpperCase()}` })),
    rsEyebrow: "BORRADOR DE IA · INVESTIGADOR",
  };
}

export function useTablero() {
  const [modo, setModo] = useState<"cargando" | "db" | "demo" | "error">("cargando");
  const [t, setT] = useState<Tablero | null>(null);
  const refrescar = useCallback(() => { cargar().then((x) => { if (x) { setT(x); setModo("db"); } else setModo("demo"); }).catch(() => setModo((m) => (m === "cargando" ? "error" : m))); }, []);
  useEffect(() => {
    refrescar();
    // Facturas de mensualidad cuyo día de cobro ya llegó: se generan al abrir y, si hubo alguna, se recarga.
    fetch("/api/mensualidades/generar", { method: "POST" }).then((r) => (r.ok ? r.json() : null)).then((d) => { if (d?.generadas?.length) refrescar(); }).catch(() => {});
  }, [refrescar]);
  return { modo, t, refrescar };
}
