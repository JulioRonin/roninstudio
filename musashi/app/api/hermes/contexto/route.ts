import { NextResponse } from "next/server";
import { autorizado, DEMO } from "@/lib/hermes";
import { hayDB, sb } from "@/lib/db";
import { TASKS, TRAY } from "@/lib/demo";
import { COTS, FACTURAS, PAGOS, total } from "@/lib/cotizaciones";
import { RESUMENES } from "@/lib/proyectos";

export const dynamic = "force-dynamic";

/** Lo que un agente necesita leer antes de proponer.
 *  GET /api/hermes/contexto?para=cobrador|seguimiento|perfilador|reportero|analista|estratega|guionista|… (Bearer MUSASHI_API_KEY)
 *  Con Supabase responde con los datos reales de la operación; sin base, con los de ejemplo. */

const REGLAS = [
  "Ninguna acción hacia terceros sin aprobación humana: tú propones, Julio aprueba en la bandeja.",
  "Cifras sólo si están en estos datos. Si falta un dato, dilo; no lo inventes.",
  "Nombra a los clientes sólo como vienen aquí y sólo en propuestas internas o mensajes para ese mismo cliente.",
  "Al proponer un MENSAJE incluye en `datos` el cliente_id y el whatsapp del contacto (y tarea_id o factura_id si aplica): al aprobar, Musashi abre WhatsApp con tu texto.",
  "Al proponer un PERFIL incluye en `datos` el cliente_id: al aprobar se guarda en la ficha del cliente.",
];
const DIA = 86400000;
const hoyISO = () => new Date(Date.now() - 7 * 3600000).toISOString().slice(0, 10); // fecha de Ciudad Juárez (UTC−7)
const mas = (iso: string, n: number) => new Date(Date.parse(iso + "T12:00:00Z") + n * DIA).toISOString().slice(0, 10);
const dias = (a: string, b: string) => Math.round((Date.parse(a + "T12:00:00Z") - Date.parse(b + "T12:00:00Z")) / DIA);

type Contacto = { nombre: string; puesto: string | null; whatsapp: string | null; correo: string | null; decide: boolean };
type Cliente = { id: string; nombre: string; sector: string; ciudad: string | null; etapa_embudo: string; origen: string | null; siguiente_paso: string | null; siguiente_fecha: string | null; perfil_ia: string | null; razon_perdida: string | null; contactos?: Contacto[] };
const principal = (c?: Cliente) => { const x = [...(c?.contactos ?? [])].sort((a, b) => Number(b.decide) - Number(a.decide))[0]; return x ? { nombre: x.nombre, puesto: x.puesto, whatsapp: x.whatsapp } : null; };

async function real(para: string) {
  const hoy = hoyISO();
  // Lo que este agente ya dejó sin resolver, para que no proponga lo mismo dos veces.
  const pendientes = await sb<{ tipo: string; titulo: string; referencia: string | null; creado_en: string }[]>(`propuestas_ia?select=tipo,titulo,referencia,creado_en&agente=eq.${encodeURIComponent(para)}&estado=eq.Pendiente&order=creado_en.desc&limit=40`);
  const base = { demo: false, hoy, agente: para, reglas: REGLAS, tus_propuestas_pendientes: pendientes };
  const clientes = await sb<Cliente[]>("clientes?select=id,nombre,sector,ciudad,etapa_embudo,origen,siguiente_paso,siguiente_fecha,perfil_ia,razon_perdida,contactos(nombre,puesto,whatsapp,correo,decide)&order=actualizado_en.desc");
  const cli = new Map(clientes.map((c) => [c.id, c]));
  const ref = (id: string | null) => { const c = id ? cli.get(id) : undefined; return c ? { cliente_id: c.id, cliente: c.nombre, sector: c.sector, contacto: principal(c) } : { cliente_id: null, cliente: null, sector: null, contacto: null }; };

  const facturasAbiertas = async () => (await sb<{ id: string; folio: string; monto: number; estado: string; emitida: string | null; vence: string | null; cliente_id: string; proyecto: { codigo: string; nombre: string } | null; hito: { nombre: string } | null }[]>(
    "facturas?select=id,folio,monto,estado,emitida,vence,cliente_id,proyecto:proyectos(codigo,nombre),hito:hitos(nombre)&estado=in.(Vigente,Vencida)&order=vence.asc"))
    .map((f) => ({ factura_id: f.id, folio: f.folio, monto: Number(f.monto), emitida: f.emitida, vence: f.vence, dias_vencida: f.vence && f.vence < hoy ? dias(hoy, f.vence) : 0, concepto: f.hito?.nombre ?? (f.proyecto ? `Anticipo · ${f.proyecto.nombre}` : "Factura directa"), proyecto: f.proyecto?.codigo ?? null, ...ref(f.cliente_id) }));
  const cotizacionesVivas = async () => (await sb<{ id: string; folio: string; proyecto_nombre: string; estado: string; vigencia: string | null; abierta_veces: number; abierta_ultima: string | null; credito: number; cliente_id: string; creado_en: string; cotizacion_lineas: { monto: number }[] }[]>(
    "cotizaciones?select=id,folio,proyecto_nombre,estado,vigencia,abierta_veces,abierta_ultima,credito,cliente_id,creado_en,cotizacion_lineas(monto)&estado=in.(Enviada,Abierta)&order=creado_en.desc"))
    .map((c) => ({ cotizacion_id: c.id, folio: c.folio, proyecto: c.proyecto_nombre, estado: c.estado, total_sin_iva: c.cotizacion_lineas.reduce((s, l) => s + Number(l.monto), 0) - Number(c.credito), vigencia: c.vigencia, dias_para_vencer: c.vigencia ? dias(c.vigencia, hoy) : null, veces_abierta: c.abierta_veces, ultima_apertura: c.abierta_ultima, enviada: c.creado_en.slice(0, 10), ...ref(c.cliente_id) }));
  const proyectos = async () => (await sb<{ id: string; codigo: string; nombre: string; objetivo: string | null; etapa: string; avance: number; inicio: string | null; fin: string | null; horas_estimadas: number; presupuesto: number; cliente_id: string; hitos: { orden: number; nombre: string; fecha: string | null; estado: string; monto: number | null }[]; horas: { fecha: string; horas: number; que_se_hizo: string | null }[]; riesgos: { descripcion: string; plan: string | null; abierto: boolean }[] }[]>(
    "proyectos?select=id,codigo,nombre,objetivo,etapa,avance,inicio,fin,horas_estimadas,presupuesto,cliente_id,hitos(orden,nombre,fecha,estado,monto),horas(fecha,horas,que_se_hizo),riesgos(descripcion,plan,abierto)&order=creado_en.desc"))
    .map((p) => ({ proyecto_id: p.id, codigo: p.codigo, nombre: p.nombre, objetivo: p.objetivo, etapa: p.etapa, avance_pct: p.avance, inicio: p.inicio, fin: p.fin, presupuesto_sin_iva: Number(p.presupuesto), horas_estimadas: Number(p.horas_estimadas), horas_usadas: p.horas.reduce((s, h) => s + Number(h.horas), 0),
      hitos: [...p.hitos].sort((a, b) => a.orden - b.orden).map((h) => ({ nombre: h.nombre, fecha: h.fecha, estado: h.estado !== "Aceptado" && h.fecha && h.fecha < hoy ? "Atrasado" : h.estado, monto: h.monto })),
      trabajo_ultimos_7_dias: p.horas.filter((h) => h.fecha >= mas(hoy, -7)).map((h) => ({ fecha: h.fecha, horas: Number(h.horas), que_se_hizo: h.que_se_hizo })), riesgos_abiertos: p.riesgos.filter((r) => r.abierto).map((r) => ({ riesgo: r.descripcion, plan: r.plan })), ...ref(p.cliente_id) }));

  switch (para) {
    case "cobrador":
      return { ...base, facturas_por_cobrar: await facturasAbiertas(), pagos_recientes: await sb("movimientos?select=fecha,concepto,monto,metodo,cliente:clientes(nombre)&tipo=eq.Cobro&order=fecha.desc&limit=8"),
        instrucciones: "Propón un MENSAJE por factura vencida o por vencer en 3 días, dirigido al contacto. Primer aviso amable; si dias_vencida > 7, firme. No repitas si ya hay una propuesta pendiente para ese folio (usa referencia = folio)." };
    case "seguimiento": {
      const tareas = (await sb<{ id: string; titulo: string; fecha: string; hora: string | null; origen: string | null; canal: string | null; cliente_id: string | null }[]>(`tareas?select=id,titulo,fecha,hora,origen,canal,cliente_id&estado=eq.Pendiente&fecha=lte.${mas(hoy, 2)}&order=fecha.asc`))
        .filter((t) => t.canal && t.canal !== "Interno").map((t) => ({ tarea_id: t.id, titulo: t.titulo, fecha: t.fecha, hora: t.hora, vencida: t.fecha < hoy, origen: t.origen, canal: t.canal, ...ref(t.cliente_id) }));
      const pasos = clientes.filter((c) => c.etapa_embudo !== "Perdido" && c.etapa_embudo !== "Cliente" && c.siguiente_fecha && c.siguiente_fecha <= mas(hoy, 1)).map((c) => ({ ...ref(c.id), etapa: c.etapa_embudo, siguiente_paso: c.siguiente_paso, fecha: c.siguiente_fecha, vencido: c.siguiente_fecha! < hoy }));
      return { ...base, tareas_con_cliente: tareas, siguientes_pasos_del_embudo: pasos, cotizaciones_sin_respuesta: await cotizacionesVivas(),
        instrucciones: "Propón un MENSAJE por tarea o cotización que lo amerite, listo para WhatsApp, en el tono de Julio. Si la cotización ya fue abierta (veces_abierta > 0) menciónalo con tacto. Incluye tarea_id en datos cuando el mensaje resuelva una tarea." };
    }
    case "perfilador": {
      const dx = await sb<{ cliente_id: string | null; negocio: string; sector: string | null; hallazgos: unknown; respuestas: unknown; creado_en: string }[]>("diagnosticos_expres?select=cliente_id,negocio,sector,hallazgos,respuestas,creado_en&order=creado_en.desc&limit=30");
      const mapas = await sb<{ cliente_id: string | null; cliente_nombre: string; procesos: { nombre: string; hallazgos?: string[]; estado?: string }[] }[]>("mapas_flujo?select=cliente_id,cliente_nombre,procesos");
      return { ...base, clientes_sin_perfil: clientes.filter((c) => !c.perfil_ia && c.etapa_embudo !== "Perdido").map((c) => ({ cliente_id: c.id, nombre: c.nombre, sector: c.sector, ciudad: c.ciudad, etapa: c.etapa_embudo, origen: c.origen, siguiente_paso: c.siguiente_paso, contactos: (c.contactos ?? []).map((x) => ({ nombre: x.nombre, puesto: x.puesto, decide: x.decide })),
        diagnostico_expres: dx.find((d) => d.cliente_id === c.id) ?? null, mapa_de_flujos: (mapas.find((m) => m.cliente_id === c.id)?.procesos ?? []).map((p) => ({ proceso: p.nombre, estado: p.estado, hallazgos: p.hallazgos ?? [] })) })),
        instrucciones: "Por cada cliente sin perfil propón un PERFIL de cinco líneas: quién es, su dolor principal, qué ha intentado, quién decide y el siguiente paso sugerido. Sólo con lo que hay aquí." };
    }
    case "reportero":
    case "planeador":
    case "mapeador":
      return { ...base, proyectos: await proyectos(), mapas_de_flujos: para === "reportero" ? undefined : await sb("mapas_flujo?select=codigo,cliente_nombre,sector,visita,procesos&order=creado_en.desc&limit=10"),
        instrucciones: para === "reportero" ? "Propón un REPORTE semanal por proyecto activo: avance, lo hecho (trabajo_ultimos_7_dias), lo que sigue, riesgos y decisiones que se necesitan del cliente. Incluye proyecto_id y cliente_id en datos." : "Usa los proyectos y mapas para proponer el plan o el mapa que te pidan. Incluye proyecto_id en datos." };
    case "analista": {
      const mov = await sb<{ tipo: string; fecha: string; concepto: string; monto: number }[]>(`movimientos?select=tipo,fecha,concepto,monto&fecha=gte.${mas(hoy, -120)}&order=fecha.desc`);
      const cfg = (await sb<{ valor: Record<string, number> }[]>("configuracion?select=valor&clave=eq.tarifas"))[0]?.valor ?? {};
      const pr = await proyectos();
      return { ...base, tarifas: cfg, movimientos_120_dias: mov, facturas_por_cobrar: await facturasAbiertas(),
        proyectos: pr.map((p) => ({ codigo: p.codigo, cliente: p.cliente, etapa: p.etapa, presupuesto_sin_iva: p.presupuesto_sin_iva, horas_usadas: p.horas_usadas, horas_estimadas: p.horas_estimadas, costo_de_horas: p.horas_usadas * Number(cfg.costoHora ?? 540), avance_pct: p.avance_pct })),
        instrucciones: "Propón un ANÁLISIS breve: caja del mes, margen por proyecto y la alerta más importante. Sólo con estas cifras." };
    }
    case "estratega":
    case "guionista":
    case "analista-canal":
    case "investigador":
    case "productor":
    case "publicador": {
      // Para contenido no se mandan nombres de clientes: sólo sectores, objeciones y hallazgos.
      const cuenta = (xs: (string | null)[]) => Object.entries(xs.filter(Boolean).reduce<Record<string, number>>((m, x) => { m[x!] = (m[x!] ?? 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ k, n }));
      const mapas = await sb<{ sector: string; procesos: { nombre: string; hallazgos?: string[] }[] }[]>("mapas_flujo?select=sector,procesos");
      return { ...base, tema_de_marca: "Primero el flujo. Después la IA.", lineas_rojas: ["No prometer porcentajes ni plazos", "No nombrar clientes ni dar datos que permitan identificarlos", "No usar 'revoluciona', 'potencia', 'impulsa'"],
        piezas: await sb("piezas?select=id,titulo,gancho,formato,canal,estado,senal,publicar_en,metricas&order=creado_en.desc&limit=40"),
        sectores_en_el_embudo: cuenta(clientes.filter((c) => c.etapa_embudo !== "Perdido").map((c) => c.sector)), origen_de_los_leads: cuenta(clientes.map((c) => c.origen)), objeciones_registradas: cuenta(clientes.map((c) => (c.razon_perdida ?? "").split(" · ")[0] || null)),
        hallazgos_por_sector: mapas.map((m) => ({ sector: m.sector, hallazgos: m.procesos.flatMap((p) => p.hallazgos ?? []).slice(0, 12) })).filter((m) => m.hallazgos.length),
        instrucciones: "Propón contenido desde lo que de verdad pasa en la operación: un hallazgo, una objeción o un sector con leads. Para una pieza usa tipo GUION o IDEA e incluye en datos formato, canal y gancho." };
    }
    default: {
      const [fac, cot, pr, tareas] = await Promise.all([facturasAbiertas(), cotizacionesVivas(), proyectos(), sb<{ id: string }[]>(`tareas?select=id&estado=eq.Pendiente&fecha=lte.${hoy}`)]);
      return { ...base, resumen: { clientes: clientes.length, en_embudo: clientes.filter((c) => !["Cliente", "Perdido"].includes(c.etapa_embudo)).length, proyectos_activos: pr.length, cotizaciones_sin_respuesta: cot.length, facturas_por_cobrar: fac.length, por_cobrar: fac.reduce((s, f) => s + f.monto, 0), tareas_para_hoy_o_vencidas: tareas.length },
        proyectos: pr.map((p) => ({ codigo: p.codigo, cliente: p.cliente, etapa: p.etapa, avance_pct: p.avance_pct })), cotizaciones_sin_respuesta: cot, facturas_por_cobrar: fac };
    }
  }
}

function demo(para: string) {
  const base = { demo: DEMO, hoy: "2026-11-06", agente: para, reglas: REGLAS };
  switch (para) {
    case "cobrador": return { ...base, facturas: FACTURAS.filter((f) => f.estado === "Vencida" || f.estado === "Vigente"), pagos_recientes: PAGOS.filter((p) => p.tipo === "Cobro").slice(0, 5) };
    case "seguimiento": return { ...base, tareas: TASKS.filter((t) => t.channel !== "INTERNO"), cotizaciones_abiertas: COTS.filter((c) => ["Enviada", "Abierta"].includes(c.estado)).map((c) => ({ folio: c.folio, cliente: c.cliente, proyecto: c.proyecto, total: total(c), vigencia: c.vigencia, abierta: c.abierta ?? null })) };
    case "reportero": return { ...base, proyectos: Object.values(RESUMENES) };
    case "analista": return { ...base, pagos: PAGOS, facturas: FACTURAS, proyectos: Object.values(RESUMENES).map((r) => ({ code: r.code, cliente: r.cliente, horas: r.horas, cobranza: r.cobranza, avance: r.avance })) };
    case "estratega": case "guionista": case "analista-canal":
      return { ...base, propuestas_pendientes: TRAY.filter((t) => ["ESTRATEGA", "GUIONISTA"].includes(t.agent)), tema_de_marca: "Primero el flujo. Después la IA.", lineas_rojas: ["No prometer porcentajes ni plazos", "No nombrar clientes sin permiso", "No usar 'revoluciona', 'potencia', 'impulsa'"] };
    default: return { ...base, tareas: TASKS, bandeja: TRAY, cotizaciones: COTS.map((c) => ({ folio: c.folio, cliente: c.cliente, estado: c.estado, total: total(c) })), facturas: FACTURAS };
  }
}

export async function GET(req: Request) {
  if (!autorizado(req)) return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  const para = (new URL(req.url).searchParams.get("para") ?? "general").toLowerCase();
  if (!hayDB()) return NextResponse.json(demo(para));
  try { return NextResponse.json(await real(para)); }
  catch (e) { return NextResponse.json({ error: "no se pudo leer la base: " + (e as Error).message }, { status: 502 }); }
}
