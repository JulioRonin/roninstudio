// Números del negocio del cliente: con lo que cuenta en la primera conversación se calcula
// qué tan redituable es, dónde se le va el dinero y qué procesos conviene mapear.
// Sin dependencias del navegador: lo usan la pantalla de Diagnósticos y el contexto de los agentes.
// Todo son datos dichos por el cliente; se muestran como rango (escenario bajo y alto), no como medición.
import type { Proceso } from "@/lib/flujos";

export type Rango = { min?: number | null; max?: number | null };
export type Datos = Record<string, Rango>;
export type ModeloId = "renta" | "venta";
type Unidad = "mxn" | "num" | "pct" | "h";
/** sentido: 1 = más es mejor (demanda, precio), -1 = más es peor (costos), 0 = neutro */
export type Campo = { k: string; t: string; ayuda: string; u: Unidad; sentido: 1 | -1 | 0; grupo: string };

const DEMANDA = "Demanda", INV = "Inventario y precios", COSTOS = "Costos y tiempo";
export const MODELOS: Record<ModeloId, { nombre: string; pieza: string; campos: Campo[] }> = {
  renta: {
    nombre: "Renta por pieza", pieza: "vestido",
    campos: [
      { k: "visitas_dia", t: "Clientas que llegan al día", ayuda: "En tienda o por mensaje, las que preguntan en serio.", u: "num", sentido: 1, grupo: DEMANDA },
      { k: "dias_semana", t: "Días que abre a la semana", ayuda: "Para pasar las visitas del día al mes.", u: "num", sentido: 0, grupo: DEMANDA },
      { k: "rentas_mes", t: "Rentas al mes", ayuda: "Si da un rango (50 a 80), captura los dos.", u: "num", sentido: 1, grupo: DEMANDA },
      { k: "ventas_mes", t: "Vestidos vendidos al mes", ayuda: "Sólo ventas; déjalo vacío si todavía no vende.", u: "num", sentido: 1, grupo: DEMANDA },
      { k: "piezas", t: "Vestidos en inventario", ayuda: "Todos los que puede rentar hoy.", u: "num", sentido: 0, grupo: INV },
      { k: "precio_rango", t: "Rango de precios de renta", ayuda: "Del más barato al más caro.", u: "mxn", sentido: 0, grupo: INV },
      { k: "precio_prom", t: "Precio de renta que más se cobra", ayuda: "Pregúntale cuál sale más. Si no lo sabe, se usa el punto medio del rango.", u: "mxn", sentido: 1, grupo: INV },
      { k: "precio_venta", t: "Precio promedio de venta", ayuda: "De los vestidos que vende.", u: "mxn", sentido: 1, grupo: INV },
      { k: "costo_pieza", t: "Costo de compra promedio por vestido", ayuda: "Lo que le cuesta comprar o mandar hacer uno.", u: "mxn", sentido: -1, grupo: INV },
      { k: "costo_operacion", t: "Costo por renta", ayuda: "Tintorería, arreglos y entrega de una renta.", u: "mxn", sentido: -1, grupo: COSTOS },
      { k: "fijos", t: "Gastos fijos al mes", ayuda: "Local, sueldos, servicios, publicidad. Sin la compra de vestidos.", u: "mxn", sentido: -1, grupo: COSTOS },
      { k: "horas_admin", t: "Horas a la semana en administración", ayuda: "Excel, calendario, contestar disponibilidad, cuadrar el mes.", u: "h", sentido: -1, grupo: COSTOS },
      { k: "costo_hora", t: "Valor de una hora de quien administra", ayuda: "Su sueldo por hora, o lo que valdría pagarle a alguien.", u: "mxn", sentido: 0, grupo: COSTOS },
    ],
  },
  venta: {
    nombre: "Venta de productos o servicios", pieza: "pieza",
    campos: [
      { k: "visitas_dia", t: "Clientes que llegan o escriben al día", ayuda: "Los que preguntan en serio.", u: "num", sentido: 1, grupo: DEMANDA },
      { k: "dias_semana", t: "Días que abre a la semana", ayuda: "Para pasar las visitas del día al mes.", u: "num", sentido: 0, grupo: DEMANDA },
      { k: "ventas_mes", t: "Ventas al mes", ayuda: "Tickets, no piezas. Si da un rango, captura los dos.", u: "num", sentido: 1, grupo: DEMANDA },
      { k: "ticket", t: "Ticket promedio", ayuda: "Lo que deja en promedio cada venta.", u: "mxn", sentido: 1, grupo: INV },
      { k: "costo_pct", t: "Costo de lo vendido", ayuda: "Qué parte del precio es costo de mercancía o insumo.", u: "pct", sentido: -1, grupo: INV },
      { k: "piezas", t: "Piezas en inventario", ayuda: "Déjalo vacío si vende servicios.", u: "num", sentido: 0, grupo: INV },
      { k: "costo_pieza", t: "Costo promedio por pieza", ayuda: "Para saber cuánto dinero tiene parado en inventario.", u: "mxn", sentido: -1, grupo: INV },
      { k: "fijos", t: "Gastos fijos al mes", ayuda: "Local, sueldos, servicios, publicidad.", u: "mxn", sentido: -1, grupo: COSTOS },
      { k: "horas_admin", t: "Horas a la semana en administración", ayuda: "Captura, inventario, cuadrar caja, contestar mensajes.", u: "h", sentido: -1, grupo: COSTOS },
      { k: "costo_hora", t: "Valor de una hora de quien administra", ayuda: "Su sueldo por hora, o lo que valdría pagarle a alguien.", u: "mxn", sentido: 0, grupo: COSTOS },
    ],
  },
};
export const modeloDe = (sector?: string | null): ModeloId => (/renta/i.test(sector ?? "") ? "renta" : "venta");

/* ---------- Escenarios ---------- */
type Esc = Record<string, number | undefined>;
const val = (r: Rango | undefined, cual: "min" | "max" | "mid") => {
  const a = r?.min ?? r?.max ?? undefined, b = r?.max ?? r?.min ?? undefined;
  if (a == null || b == null) return undefined;
  const lo = Math.min(a, b), hi = Math.max(a, b);
  return cual === "min" ? lo : cual === "max" ? hi : (lo + hi) / 2;
};
/** bajo: demanda en lo mínimo y costos en lo máximo; alto: al revés. Los neutros van al punto medio. */
function escenario(m: ModeloId, d: Datos, alto: boolean): Esc {
  const e: Esc = {};
  for (const c of MODELOS[m].campos) e[c.k] = val(d[c.k], c.sentido === 0 ? "mid" : (c.sentido === 1) === alto ? "max" : "min");
  if (m === "renta" && e.precio_prom == null) e.precio_prom = val(d.precio_rango, "mid");
  if (e.dias_semana == null) e.dias_semana = 6;
  return e;
}

export type Par = { lo?: number; hi?: number };
export type Resultado = {
  ingreso: Par; costoVariable: Par; margen: Par; utilidad: Par; margenPct: Par; equilibrio: Par; visitasMes: Par; operaciones: Par; conversion: Par;
  rotacion: Par; mesesEntreSalidas: Par; capital: Par; operacionesParaPagar: Par; mesesParaPagar: Par; costoAdmin: Par; ingresoPorPieza: Par;
  supuestos: string[]; faltan: string[];
};
const P = (f: (e: Esc) => number | undefined, bajo: Esc, alto: Esc): Par => { const a = f(bajo), b = f(alto); const ok = (x?: number) => (x != null && Number.isFinite(x) ? x : undefined); return { lo: ok(a), hi: ok(b) }; };
const s = (...xs: (number | undefined)[]) => (xs.some((x) => x == null) ? undefined : (xs as number[]).reduce((a, b) => a + b, 0));
const SEM = 4.33;

export function calcular(m: ModeloId, d: Datos): Resultado {
  const b = escenario(m, d, false), a = escenario(m, d, true);
  const tiene = (k: string) => val(d[k], "mid") != null;
  const supuestos: string[] = [], faltan: string[] = [];
  if (!tiene("dias_semana")) supuestos.push("Abre 6 días a la semana (no se capturó).");
  const R = m === "renta";
  if (R && !tiene("precio_prom") && tiene("precio_rango")) supuestos.push("Precio de renta promedio = punto medio del rango. Pregunta cuál se renta más: cambia mucho el resultado.");
  const nombre = (k: string) => MODELOS[m].campos.find((c) => c.k === k)?.t ?? k;
  for (const k of R ? ["rentas_mes", "precio_prom", "piezas", "costo_pieza", "costo_operacion", "fijos"] : ["ventas_mes", "ticket", "costo_pct", "fijos"]) if (!tiene(k) && !(k === "precio_prom" && tiene("precio_rango"))) faltan.push(nombre(k));

  const ops = (e: Esc) => (R ? s(e.rentas_mes, e.ventas_mes ?? 0) : e.ventas_mes);
  const ingreso = (e: Esc) => (R ? s(e.rentas_mes != null && e.precio_prom != null ? e.rentas_mes * e.precio_prom : undefined, (e.ventas_mes ?? 0) * (e.precio_venta ?? 0)) : e.ventas_mes != null && e.ticket != null ? e.ventas_mes * e.ticket : undefined);
  const variable = (e: Esc) => (R ? (e.rentas_mes != null && e.costo_operacion != null ? e.rentas_mes * e.costo_operacion + (e.ventas_mes ? (e.costo_pieza != null ? e.ventas_mes * e.costo_pieza : NaN) : 0) : undefined) : (ingreso(e) != null && e.costo_pct != null ? (ingreso(e)! * e.costo_pct) / 100 : undefined));
  const margen = (e: Esc) => { const i = ingreso(e), v = variable(e); return i != null && v != null && !Number.isNaN(v) ? i - v : undefined; };
  const porOp = (e: Esc) => (R ? (e.precio_prom != null && e.costo_operacion != null ? e.precio_prom - e.costo_operacion : undefined) : e.ticket != null && e.costo_pct != null ? e.ticket * (1 - e.costo_pct / 100) : undefined);
  const rot = (e: Esc) => (R && e.rentas_mes != null && e.piezas ? e.rentas_mes / e.piezas : undefined);
  const visitas = (e: Esc) => (e.visitas_dia != null ? e.visitas_dia * (e.dias_semana ?? 6) * SEM : undefined);
  return {
    ingreso: P(ingreso, b, a), costoVariable: P(variable, b, a), margen: P(margen, b, a),
    utilidad: P((e) => { const mg = margen(e); return mg != null && e.fijos != null ? mg - e.fijos : undefined; }, b, a),
    margenPct: P((e) => { const mg = margen(e), i = ingreso(e); return mg != null && e.fijos != null && i ? ((mg - e.fijos) / i) * 100 : undefined; }, b, a),
    equilibrio: P((e) => { const u = porOp(e); return e.fijos != null && u && u > 0 ? e.fijos / u : undefined; }, b, a),
    visitasMes: P(visitas, b, a), operaciones: P(ops, b, a),
    conversion: P((e) => { const v = visitas(e), o = ops(e); return v && o != null ? (o / v) * 100 : undefined; }, b, a),
    rotacion: P(rot, b, a), mesesEntreSalidas: P((e) => { const r = rot(e); return r ? 1 / r : undefined; }, b, a),
    capital: P((e) => (e.piezas != null && e.costo_pieza != null ? e.piezas * e.costo_pieza : undefined), b, a),
    operacionesParaPagar: P((e) => { const u = porOp(e); return R && e.costo_pieza != null && u && u > 0 ? e.costo_pieza / u : undefined; }, b, a),
    mesesParaPagar: P((e) => { const u = porOp(e), r = rot(e); return R && e.costo_pieza != null && u && u > 0 && r ? e.costo_pieza / u / r : undefined; }, b, a),
    costoAdmin: P((e) => (e.horas_admin != null && e.costo_hora != null ? e.horas_admin * SEM * e.costo_hora : undefined), b, a),
    ingresoPorPieza: P((e) => { const i = ingreso(e); return R && i != null && e.piezas ? (e.rentas_mes! * e.precio_prom!) / e.piezas : undefined; }, b, a),
    supuestos, faltan,
  };
}

/* ---------- Formato ---------- */
const n0 = (x: number) => Math.round(x).toLocaleString("en-US");
const n1 = (x: number) => (Math.round(x * 10) / 10).toLocaleString("en-US");
export const fmt = (p: Par, tipo: "mxn" | "num" | "pct" | "dec" | "meses" = "num") => {
  if (p.lo == null && p.hi == null) return "—";
  const f = (x: number) => (tipo === "mxn" ? (x < 0 ? "-$" : "$") + n0(Math.abs(x)) : tipo === "pct" ? n0(x) + " %" : tipo === "dec" ? n1(x) : tipo === "meses" ? n1(x) : n0(x));
  const lo = p.lo ?? p.hi!, hi = p.hi ?? p.lo!;
  const [x, y] = lo <= hi ? [lo, hi] : [hi, lo];
  return Math.abs(x - y) < (tipo === "dec" || tipo === "meses" ? 0.05 : 0.5) ? f(x) : `${f(x)} a ${f(y)}`;
};

/* ---------- Lo que dicen los números: dolencias y el proceso que conviene mapear ---------- */
export type Dolencia = { id: string; titulo: string; porque: string; peso: 1 | 2 | 3; proceso?: Proceso };
const proc = (area: string, nombre: string, dueno: string, herramienta: string, frecuencia: number, porDia: boolean, dias: number, pasos: [string, string, string][], dolor: 1 | 2 | 3): Proceso => ({
  id: "", area, nombre, dueno, personas: 1, herramienta, frecuencia, porDia, dias, dolor, estado: "Sin mapear", esfuerzoH: 16, fase: "Fase 2", incluir: false, hallazgos: [],
  pasos: pasos.map(([p, quien, herr]) => ({ p, quien, herr, min: 0, espera: 0, accion: "Mantener" as const, minNuevo: 0 })),
});
/** extremos numéricos del par (el escenario bajo puede dar el número mayor, p. ej. en meses para recuperar) */
const hi = (p: Par) => (p.lo == null ? p.hi : p.hi == null ? p.lo : Math.max(p.lo, p.hi)), lo = (p: Par) => (p.lo == null ? p.hi : p.hi == null ? p.lo : Math.min(p.lo, p.hi));

export function dolencias(m: ModeloId, d: Datos): Dolencia[] {
  const r = calcular(m, d), out: Dolencia[] = [], R = m === "renta", pz = MODELOS[m].pieza;
  const rm = d[R ? "rentas_mes" : "ventas_mes"];
  if (r.faltan.length) out.push({ id: "margen", peso: 3, titulo: "No se conoce el margen del negocio", porque: `Faltan: ${r.faltan.join(", ").toLowerCase()}. Sin eso no se sabe cuánto deja cada ${R ? "renta" : "venta"} ni cuánto necesita vender para cubrir sus gastos.`,
    proceso: proc("Administración", R ? "Registro de costos por vestido y por renta" : "Registro de costos y margen por producto", "Dueña", "Notas · Excel", 1, false, 1, R ? [["Guarda la nota de compra de cada vestido", "Dueña", "Papel"], ["Anota tintorería y arreglos de cada renta", "Dueña", "Notas"], ["Junta gastos fijos del mes", "Dueña", "Excel"], ["Calcula lo que dejó cada vestido", "Dueña", "Excel"]] : [["Anota costo de cada producto", "Dueña", "Excel"], ["Junta gastos fijos del mes", "Dueña", "Excel"], ["Calcula margen por producto", "Dueña", "Excel"]], 3) });
  if (rm && rm.min != null && rm.max != null && rm.max / Math.max(1, rm.min) >= 1.3) out.push({ id: "registro", peso: 2, titulo: `No se sabe con precisión cuántas ${R ? "rentas" : "ventas"} hace`, porque: `Dice entre ${n0(Math.min(rm.min, rm.max))} y ${n0(Math.max(rm.min, rm.max))} al mes${r.ingreso.lo != null && r.ingreso.hi != null ? `; entre un extremo y otro hay unos ${fmt({ lo: Math.abs(r.ingreso.hi - r.ingreso.lo) }, "mxn")} de ingreso al mes` : ""}. Puede ser temporada o puede ser que no se registra; para saberlo y planear compras hay que registrar cada ${R ? "renta" : "venta"} en un solo lugar.`,
    proceso: proc(R ? "Renta" : "Venta", R ? "Registro de cada renta y su cobro" : "Registro de cada venta y su cobro", "Dueña", "Calendario · Excel", Math.max(1, Math.round((lo(r.operaciones) ?? 30) / 26)), true, 6, R ? [["Anota la renta en el calendario", "Dueña", "Calendario"], ["La vuelve a capturar en Excel", "Dueña", "Excel"], ["Registra anticipo y saldo", "Dueña", "Excel"], ["Cuadra al cierre del mes", "Dueña", "Excel"]] : [["Anota la venta", "Vendedora", "Libreta"], ["La captura en Excel", "Dueña", "Excel"], ["Cuadra al cierre", "Dueña", "Excel"]], 2) });
  if (R && hi(r.rotacion) != null && hi(r.rotacion)! < 0.5) out.push({ id: "rotacion", peso: 3, titulo: "Buena parte del inventario se renta poco", porque: `Con ${fmt({ lo: val(d.piezas, "mid") })} vestidos y ${fmt(r.operaciones)} rentas al mes, cada vestido sale en promedio cada ${fmt(r.mesesEntreSalidas, "meses")} meses. Casi siempre unos pocos vestidos hacen la mayoría de las rentas: hay que saber cuáles para comprar mejor y vender o dar de baja los que no salen.${r.capital.lo != null ? ` Hay ${fmt(r.capital, "mxn")} invertidos en inventario.` : ""}`,
    proceso: proc("Inventario", "Rentabilidad por vestido: qué rotar, vender o dar de baja", "Dueña", "Excel · memoria", 1, false, 1, [["Revisa cuántas veces salió cada vestido", "Dueña", "Calendario"], ["Compara contra lo que costó", "Dueña", "Excel"], ["Decide cuáles vender o dar de baja", "Dueña", "—"], ["Decide qué tallas y estilos comprar", "Dueña", "—"]], 2) });
  if (R && (hi(r.operaciones) ?? 0) >= 30) out.push({ id: "empalme", peso: 3, titulo: "Riesgo de rentar el mismo vestido dos veces", porque: `Con ${fmt(r.operaciones)} rentas al mes llevadas en calendario y hojas de cálculo, cada renta ocupa días de entrega, devolución y tintorería. Un solo empalme en temporada alta es una clienta sin vestido el día de su evento.`,
    proceso: proc("Renta", "Disponibilidad por fecha con días de preparación", "Dueña", "Calendario · memoria", Math.max(1, Math.round((hi(r.operaciones) ?? 30) / 26)), true, 6, [["Clienta pide un vestido para una fecha", "Clienta", "WhatsApp"], ["Busca el vestido en el calendario", "Dueña", "Calendario"], ["Calcula si regresa y se limpia a tiempo", "Dueña", "Memoria"], ["Aparta la fecha", "Dueña", "Calendario"]], 3) });
  if (hi(r.conversion) != null && hi(r.conversion)! < 60) out.push({ id: "conversion", peso: 2, titulo: `Visitas que no terminan en ${R ? "renta" : "venta"}`, porque: `Llegan ${fmt(r.visitasMes)} ${R ? "clientas" : "clientes"} al mes y se cierran ${fmt(r.operaciones)}: entre ${fmt({ lo: lo(r.conversion) }, "pct")} y ${fmt({ lo: hi(r.conversion) }, "pct")}. ${lo(r.equilibrio) != null ? "" : ""}Recuperar a quien se probó y no decidió suele ser la venta más barata.`,
    proceso: proc("Atención", R ? "Seguimiento a clientas que se probaron y no rentaron" : "Seguimiento a clientes que preguntaron y no compraron", "Dueña", "WhatsApp", Math.max(1, Math.round(((lo(r.visitasMes) ?? 0) - (lo(r.operaciones) ?? 0)) / 26)), true, 6, [["Anota quién vino, qué buscaba y para qué fecha", "Dueña", "Memoria"], ["Le escribe días después", "Dueña", "WhatsApp"], ["Le manda opciones disponibles", "Dueña", "WhatsApp"]], 2) });
  if (R && hi(r.mesesParaPagar) != null && hi(r.mesesParaPagar)! > 12) out.push({ id: "recuperacion", peso: 2, titulo: `En un mes flojo, un ${pz} tarda más de un año en pagarse`, porque: `Un ${pz} se paga con ${fmt(r.operacionesParaPagar, "dec")} rentas y, al ritmo actual, eso tarda ${fmt(r.mesesParaPagar, "meses")} meses. Comprar más vestidos sin saber cuáles rotan alarga ese plazo.` });
  if (lo(r.utilidad) != null && lo(r.utilidad)! < 0) out.push({ id: "perdida", peso: 3, titulo: "En un mes flojo, el negocio pierde", porque: `En el escenario bajo la utilidad es de ${fmt({ lo: lo(r.utilidad) }, "mxn")}. Necesita ${fmt(r.equilibrio)} ${R ? "rentas" : "ventas"} al mes sólo para cubrir sus gastos fijos.` });
  const ha = val(d.horas_admin, "max");
  if (ha != null && ha >= 6) out.push({ id: "admin", peso: 2, titulo: "La administración se come la semana", porque: `${n0(ha)} horas a la semana en hojas de cálculo, calendario y mensajes${r.costoAdmin.hi != null ? `: ${fmt(r.costoAdmin, "mxn")} al mes del tiempo de quien administra` : ""}. Es tiempo que no está vendiendo.`,
    proceso: proc("Administración", "Corte del mes: ingresos, gastos y utilidad", "Dueña", "Excel", 1, false, 1, [["Junta rentas, ventas y anticipos", "Dueña", "Excel"], ["Junta gastos y notas", "Dueña", "Notas"], ["Separa depósitos que no son ingreso", "Dueña", "Excel"], ["Calcula lo que ganó", "Dueña", "Excel"]], 2) });
  return out.sort((x, y) => y.peso - x.peso);
}

/** Resumen corto para los agentes (perfilador): sólo lo calculable, con rangos. */
export function resumenNumeros(m: ModeloId, d: Datos) {
  const r = calcular(m, d);
  return { modelo: MODELOS[m].nombre, ingreso_mensual: fmt(r.ingreso, "mxn"), utilidad_mensual: fmt(r.utilidad, "mxn"), operaciones_mes: fmt(r.operaciones), conversion: fmt(r.conversion, "pct"),
    rotacion_por_pieza_al_mes: fmt(r.rotacion, "dec"), punto_de_equilibrio: fmt(r.equilibrio), faltan_datos: r.faltan, supuestos: r.supuestos, dolencias: dolencias(m, d).map((x) => x.titulo) };
}
