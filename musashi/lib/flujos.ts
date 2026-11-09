// Flujos de trabajo (etapa 01 · Mapear). Datos demo del Negocio demo 2 · Restaurante con sucursales.
export type Accion = "Mantener" | "Simplificar" | "Automatizar" | "Agente IA" | "Eliminar";
export type Paso = { p: string; quien: string; herr: string; min: number; espera: number; atoro?: boolean; accion: Accion; minNuevo: number };
export type Fase = "Construir ahora" | "Fase 2" | "Quick win" | "No conviene";
export type Proceso = {
  id: string; area: string; nombre: string; dueno: string; personas: number; herramienta: string;
  frecuencia: number; porDia: boolean; dias: number;              // ejecuciones por día (o por semana) y días por semana
  dolor: 1 | 2 | 3; estado: "Sin mapear" | "Mapeado" | "Medido" | "Propuesto";
  pasos: Paso[]; hallazgos: string[]; esfuerzoH: number; fase: Fase; incluir: boolean;
};

const P = (p: string, quien: string, herr: string, min: number, espera: number, accion: Accion, minNuevo: number, atoro = false): Paso => ({ p, quien, herr, min, espera, accion, minNuevo, atoro });

export const CLIENTE_DEMO = { code: "D2", nombre: "Negocio demo 2", sector: "Restaurante con sucursales", sucursales: 2, visita: "22 de octubre de 2026", guia: "Restaurantes v3" };

export const PROCESOS: Proceso[] = [
  { id: "P1", area: "Servicio", nombre: "Toma de orden y comanda a cocina", dueno: "Gerente de piso", personas: 6, herramienta: "Libreta · tablero · POS", frecuencia: 80, porDia: true, dias: 6, dolor: 3, estado: "Propuesto", esfuerzoH: 60, fase: "Construir ahora", incluir: true,
    pasos: [P("Mesero anota la orden en libreta", "Mesero", "Papel", 2, 0, "Automatizar", 1), P("Camina a cocina y entrega", "Mesero", "A pie", 1, 2, "Eliminar", 0), P("Cocina reescribe en el tablero", "Cocina", "Pizarrón", 3, 0, "Eliminar", 0, true), P("Cocina avisa platillos en voz alta", "Cocina", "Voz", 1, 4, "Automatizar", 0), P("Caja captura la cuenta en el POS", "Cajero", "POS", 4, 3, "Automatizar", 1, true)],
    hallazgos: ["La misma orden se escribe tres veces: libreta, tablero y POS.", "Los platillos equivocados nacen al reescribir en el tablero.", "La cuenta se arma al final desde la libreta; cuando no coincide, se discute en la mesa."] },
  { id: "P2", area: "Caja", nombre: "Cierre de caja por turno", dueno: "Encargado de turno", personas: 2, herramienta: "Hoja de cálculo", frecuencia: 2, porDia: true, dias: 7, dolor: 3, estado: "Propuesto", esfuerzoH: 24, fase: "Construir ahora", incluir: true,
    pasos: [P("Imprime tickets del turno", "Cajero", "POS", 5, 0, "Eliminar", 0), P("Captura ventas por forma de pago en la hoja", "Cajero", "Excel", 20, 0, "Automatizar", 2, true), P("Cuenta efectivo y concilia", "Cajero", "Manual", 10, 0, "Simplificar", 3), P("Manda foto del cierre al dueño", "Cajero", "WhatsApp", 5, 30, "Automatizar", 0)],
    hallazgos: ["El cierre toma 40 minutos y se hace dos veces al día por sucursal.", "El dueño recibe una foto; no puede comparar turnos ni sucursales."] },
  { id: "P3", area: "Compras", nombre: "Compras e inventario", dueno: "Dueño", personas: 2, herramienta: "Conteo en papel · WhatsApp", frecuencia: 2, porDia: false, dias: 1, dolor: 2, estado: "Medido", esfuerzoH: 30, fase: "Fase 2", incluir: false,
    pasos: [P("Conteo físico semanal", "Encargado", "Papel", 180, 0, "Simplificar", 60), P("Pasa el conteo a Excel", "Encargado", "Excel", 30, 0, "Automatizar", 0, true), P("Pide a proveedores por WhatsApp", "Dueño", "WhatsApp", 90, 120, "Agente IA", 20)],
    hallazgos: ["No hay mínimos por insumo; se pide por memoria.", "Faltantes de fin de semana en la sucursal 2 en 3 de las últimas 4 semanas."] },
  { id: "P4", area: "Dirección", nombre: "Reporte semanal al dueño", dueno: "Dueño", personas: 1, herramienta: "Excel · WhatsApp", frecuencia: 1, porDia: false, dias: 1, dolor: 2, estado: "Propuesto", esfuerzoH: 16, fase: "Construir ahora", incluir: true,
    pasos: [P("Junta fotos de cierres de la semana", "Dueño", "WhatsApp", 40, 0, "Eliminar", 0), P("Suma ventas por sucursal en Excel", "Dueño", "Excel", 90, 0, "Automatizar", 0, true), P("Revisa y decide", "Dueño", "—", 50, 0, "Mantener", 30)],
    hallazgos: ["Tres horas del dueño cada domingo para saber cuánto se vendió.", "La cifra llega una semana tarde para decidir compras y turnos."] },
  { id: "P5", area: "Servicio", nombre: "Reservas y eventos", dueno: "Gerente de piso", personas: 2, herramienta: "WhatsApp · libreta", frecuencia: 12, porDia: true, dias: 7, dolor: 2, estado: "Mapeado", esfuerzoH: 20, fase: "Fase 2", incluir: false,
    pasos: [P("Lee y contesta mensajes de reservación", "Gerente", "WhatsApp", 3, 25, "Agente IA", 1), P("Anota en la libreta de reservas", "Gerente", "Papel", 1, 0, "Automatizar", 0), P("Confirma un día antes", "Gerente", "WhatsApp", 2, 0, "Agente IA", 0)],
    hallazgos: ["Se contesta con 25 minutos de espera promedio; en hora pico, no se contesta.", "Dos reservaciones empalmadas el último mes."] },
  { id: "P6", area: "Administración", nombre: "Nómina y propinas", dueno: "Dueño", personas: 1, herramienta: "Excel", frecuencia: 1, porDia: false, dias: 1, dolor: 1, estado: "Medido", esfuerzoH: 4, fase: "Quick win", incluir: false,
    pasos: [P("Suma propinas por mesero desde tickets", "Dueño", "Excel", 90, 0, "Simplificar", 40, true), P("Calcula nómina semanal", "Dueño", "Excel", 60, 0, "Simplificar", 40), P("Paga y avisa", "Dueño", "Banco · WhatsApp", 30, 0, "Mantener", 30)],
    hallazgos: ["Las propinas se reparten desde tickets de papel; hay reclamos cada semana.", "Con el POS correcto, el reparte sale solo: no necesita software nuevo."] },
  { id: "P7", area: "Administración", nombre: "Facturación a clientes", dueno: "Cajero", personas: 1, herramienta: "Portal del SAT · correo", frecuencia: 6, porDia: false, dias: 1, dolor: 1, estado: "Mapeado", esfuerzoH: 12, fase: "No conviene", incluir: false,
    pasos: [P("Cliente pide factura por WhatsApp", "Cajero", "WhatsApp", 3, 60, "Automatizar", 0), P("Captura datos fiscales", "Cajero", "Portal", 12, 0, "Automatizar", 2), P("Envía PDF y XML", "Cajero", "Correo", 5, 0, "Automatizar", 0)],
    hallazgos: ["Seis facturas por semana; el volumen no justifica un portal propio hoy.", "Se resuelve con el autofacturador del POS cuando entre el módulo de caja."] },
];

/* ---------- Cálculos ---------- */
/** minutos de trabajo de la gente por ejecución (las esperas se reportan aparte: son tiempo del cliente, no horas del personal) */
export const minTotal = (ps: Paso[]) => ps.reduce((s, p) => s + p.min, 0);
export const esperaTotal = (ps: Paso[]) => ps.reduce((s, p) => s + p.espera, 0);
export const minNuevo = (ps: Paso[]) => ps.reduce((s, p) => s + (p.accion === "Eliminar" ? 0 : p.minNuevo), 0);
/** ejecuciones por semana */
export const ejecSemana = (p: Proceso) => (p.porDia ? p.frecuencia * p.dias : p.frecuencia);
export const horasSemanaActual = (p: Proceso) => (minTotal(p.pasos) * ejecSemana(p)) / 60;
export const horasSemanaNueva = (p: Proceso) => (minNuevo(p.pasos) * ejecSemana(p)) / 60;
export const ahorroHorasSemana = (p: Proceso) => Math.max(0, horasSemanaActual(p) - horasSemanaNueva(p));
export const ahorroMesMXN = (p: Proceso, costoHoraCliente: number) => ahorroHorasSemana(p) * 4.33 * costoHoraCliente;
export const recapturas = (p: Proceso) => p.pasos.filter((x) => x.atoro).length;
export const ACCION_COLOR: Record<Accion, string> = { Mantener: "#A9A6A0", Simplificar: "#C98A3C", Automatizar: "#EEEBE4", "Agente IA": "#B05139", Eliminar: "#5B6068" };
export const FASE_COLOR: Record<Fase, string> = { "Construir ahora": "#B05139", "Fase 2": "#C98A3C", "Quick win": "#4C8141", "No conviene": "#5B6068" };

/* ---------- Mapas por cliente ---------- */
export type Mapa = { id: string; cliente: string; sector: string; sucursales: number; visita: string; visitaISO?: string | null; modo: "Guiado" | "Desde cero"; costoCliente: number; procs: Proceso[]; creado: string };

/* Fila de mapas_flujo en Supabase ⇄ Mapa de la pantalla */
export type FilaMapa = { codigo: string; cliente_id?: string | null; cliente_nombre: string; sector: string; sucursales: number; visita: string | null; modo: string; costo_hora_cliente: number; procesos: Proceso[]; creado_en?: string };
const fmtLarga = (iso?: string | null) => (iso ? new Date(iso.slice(0, 10) + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "sin fecha");
export const deFilaMapa = (f: FilaMapa): Mapa => ({ id: f.codigo, cliente: f.cliente_nombre, sector: f.sector, sucursales: f.sucursales, visita: fmtLarga(f.visita), visitaISO: f.visita, modo: f.modo === "Desde cero" ? "Desde cero" : "Guiado", costoCliente: Number(f.costo_hora_cliente), procs: Array.isArray(f.procesos) ? f.procesos : [], creado: f.creado_en ? new Date(f.creado_en).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : "" });
export const aFilaMapa = (m: Mapa, clienteId?: string | null): FilaMapa => ({ codigo: m.id, ...(clienteId !== undefined ? { cliente_id: clienteId } : {}), cliente_nombre: m.cliente, sector: m.sector, sucursales: m.sucursales, visita: m.visitaISO ?? null, modo: m.modo, costo_hora_cliente: m.costoCliente, procesos: m.procs });

export const SECTORES = ["Restaurante con sucursales", "Clínica", "Escuela privada", "Gimnasio", "Taller", "Notaría", "Manufactura", "Otro"] as const;

/* Plantillas por sector para el arranque guiado: procesos típicos con sus pasos.
   Los minutos van en cero: se miden en la visita. */
const T = (area: string, nombre: string, dueno: string, herramienta: string, frecuencia: number, porDia: boolean, dias: number, pasos: [string, string, string][]): Proceso => ({
  id: "", area, nombre, dueno, personas: 1, herramienta, frecuencia, porDia, dias, dolor: 2, estado: "Sin mapear", esfuerzoH: 16, fase: "Fase 2", incluir: false, hallazgos: [],
  pasos: pasos.map(([p, quien, herr]) => ({ p, quien, herr, min: 0, espera: 0, accion: "Mantener" as Accion, minNuevo: 0 })),
});
export const GUIAS: Record<string, Proceso[]> = {
  "Restaurante con sucursales": [
    T("Servicio", "Toma de orden y comanda a cocina", "Gerente de piso", "Libreta · POS", 80, true, 6, [["Mesero toma la orden", "Mesero", "Papel"], ["Entrega a cocina", "Mesero", "A pie"], ["Cocina prepara y avisa", "Cocina", "Voz"], ["Caja captura la cuenta", "Cajero", "POS"]]),
    T("Caja", "Cierre de caja por turno", "Encargado de turno", "Hoja de cálculo", 2, true, 7, [["Imprime tickets del turno", "Cajero", "POS"], ["Captura ventas por forma de pago", "Cajero", "Excel"], ["Cuenta efectivo y concilia", "Cajero", "Manual"], ["Reporta al dueño", "Cajero", "WhatsApp"]]),
    T("Compras", "Compras e inventario", "Dueño", "Papel · WhatsApp", 2, false, 1, [["Conteo físico", "Encargado", "Papel"], ["Pasa el conteo a Excel", "Encargado", "Excel"], ["Pide a proveedores", "Dueño", "WhatsApp"]]),
    T("Dirección", "Reporte semanal al dueño", "Dueño", "Excel · WhatsApp", 1, false, 1, [["Junta cierres de la semana", "Dueño", "WhatsApp"], ["Suma ventas por sucursal", "Dueño", "Excel"], ["Revisa y decide", "Dueño", "—"]]),
    T("Servicio", "Reservas y eventos", "Gerente de piso", "WhatsApp · libreta", 12, true, 7, [["Contesta mensajes de reservación", "Gerente", "WhatsApp"], ["Anota en la libreta", "Gerente", "Papel"], ["Confirma un día antes", "Gerente", "WhatsApp"]]),
    T("Administración", "Nómina y propinas", "Dueño", "Excel", 1, false, 1, [["Suma propinas por mesero", "Dueño", "Excel"], ["Calcula nómina", "Dueño", "Excel"], ["Paga y avisa", "Dueño", "Banco"]]),
  ],
  "Clínica": [
    T("Recepción", "Agenda de citas", "Recepción", "WhatsApp · libreta", 30, true, 6, [["Paciente pide cita por WhatsApp o llamada", "Recepción", "WhatsApp"], ["Busca espacio en la agenda", "Recepción", "Libreta"], ["Confirma y recuerda", "Recepción", "WhatsApp"], ["Registra llegada", "Recepción", "Papel"]]),
    T("Consulta", "Expediente del paciente", "Médico", "Papel · carpeta", 25, true, 6, [["Busca el expediente físico", "Recepción", "Archivo"], ["Médico anota la consulta", "Médico", "Papel"], ["Receta e indicaciones", "Médico", "Papel"], ["Archiva", "Recepción", "Archivo"]]),
    T("Caja", "Cobro y factura", "Recepción", "Terminal · portal SAT", 25, true, 6, [["Cobra la consulta", "Recepción", "Terminal"], ["Emite factura si la piden", "Recepción", "Portal"], ["Corte del día", "Recepción", "Excel"]]),
    T("Dirección", "Reporte de consultas e ingresos", "Director", "Excel", 1, false, 1, [["Junta cortes y agendas", "Director", "Papel"], ["Captura en Excel", "Director", "Excel"], ["Revisa", "Director", "—"]]),
    T("Seguimiento", "Recordatorios y seguimiento a pacientes", "Recepción", "WhatsApp", 15, true, 6, [["Revisa quién toca seguimiento", "Recepción", "Libreta"], ["Escribe uno por uno", "Recepción", "WhatsApp"]]),
  ],
  "Escuela privada": [
    T("Control escolar", "Inscripción y reinscripción", "Control escolar", "Formatos · Excel", 10, true, 5, [["Padre llena formatos", "Padre", "Papel"], ["Captura en Excel", "Control escolar", "Excel"], ["Arma el expediente", "Control escolar", "Carpeta"], ["Entrega lista a dirección", "Control escolar", "Correo"]]),
    T("Cobranza", "Cobro de colegiaturas", "Administración", "Excel · banco", 1, false, 1, [["Revisa quién debe", "Administración", "Excel"], ["Manda recordatorios", "Administración", "WhatsApp"], ["Concilia pagos del banco", "Administración", "Excel"], ["Emite recibos", "Administración", "Papel"]]),
    T("Académico", "Reportes de calificaciones", "Coordinación", "Excel", 1, false, 1, [["Maestros entregan listas", "Maestros", "Papel"], ["Captura en Excel", "Coordinación", "Excel"], ["Imprime boletas", "Coordinación", "Impresora"]]),
    T("Comunicación", "Avisos a padres", "Dirección", "WhatsApp", 3, true, 5, [["Redacta el aviso", "Dirección", "WhatsApp"], ["Manda por grupos", "Dirección", "WhatsApp"], ["Responde dudas", "Dirección", "WhatsApp"]]),
  ],
  "Gimnasio": [
    T("Recepción", "Alta de socio y cobro de membresía", "Recepción", "Excel · terminal", 5, true, 6, [["Llena formato", "Socio", "Papel"], ["Captura en Excel", "Recepción", "Excel"], ["Cobra", "Recepción", "Terminal"], ["Da acceso", "Recepción", "Manual"]]),
    T("Recepción", "Control de acceso y vigencias", "Recepción", "Lista · memoria", 120, true, 7, [["Socio llega", "Socio", "—"], ["Busca vigencia", "Recepción", "Excel"], ["Deja pasar o cobra", "Recepción", "Terminal"]]),
    T("Cobranza", "Renovaciones y recordatorios", "Dueño", "WhatsApp", 1, false, 1, [["Revisa quién vence", "Dueño", "Excel"], ["Escribe uno por uno", "Dueño", "WhatsApp"]]),
    T("Operación", "Clases y reservas", "Coach", "WhatsApp · pizarrón", 6, true, 6, [["Socio reserva por WhatsApp", "Coach", "WhatsApp"], ["Anota en el pizarrón", "Coach", "Pizarrón"], ["Pasa lista", "Coach", "Papel"]]),
  ],
  "Taller": [
    T("Recepción", "Orden de trabajo", "Encargado", "Papel", 6, true, 6, [["Cliente describe el problema", "Cliente", "—"], ["Llena orden de trabajo", "Encargado", "Papel"], ["Asigna a técnico", "Encargado", "Voz"]]),
    T("Ventas", "Cotización al cliente", "Encargado", "Excel · WhatsApp", 6, true, 6, [["Técnico diagnostica", "Técnico", "—"], ["Encargado cotiza", "Encargado", "Excel"], ["Manda por WhatsApp y espera", "Encargado", "WhatsApp"]]),
    T("Operación", "Control de horas y avance", "Encargado", "Memoria", 6, true, 6, [["Pregunta a cada técnico", "Encargado", "Voz"], ["Anota en la orden", "Encargado", "Papel"]]),
    T("Compras", "Refacciones", "Encargado", "WhatsApp", 4, true, 6, [["Pide al proveedor", "Encargado", "WhatsApp"], ["Recibe y revisa", "Encargado", "Papel"], ["Carga al trabajo", "Encargado", "Papel"]]),
    T("Caja", "Entrega, cobro y factura", "Encargado", "Terminal · portal", 6, true, 6, [["Avisa al cliente", "Encargado", "WhatsApp"], ["Cobra", "Encargado", "Terminal"], ["Factura si la piden", "Encargado", "Portal"]]),
  ],
  "Notaría": [
    T("Recepción", "Alta de trámite y expediente", "Recepción", "Papel · Word", 8, true, 5, [["Cliente trae documentos", "Cliente", "Papel"], ["Revisa requisitos", "Recepción", "Lista"], ["Abre expediente", "Recepción", "Carpeta"], ["Asigna abogado", "Recepción", "Voz"]]),
    T("Operación", "Seguimiento del trámite", "Abogado", "Word · correo", 8, true, 5, [["Redacta el documento", "Abogado", "Word"], ["Pide faltantes al cliente", "Abogado", "WhatsApp"], ["Programa firma", "Recepción", "Agenda"]]),
    T("Agenda", "Citas y firmas", "Recepción", "Agenda de papel", 10, true, 5, [["Cliente pide cita", "Recepción", "Llamada"], ["Busca espacio", "Recepción", "Agenda"], ["Confirma", "Recepción", "WhatsApp"]]),
    T("Caja", "Cobro, honorarios y factura", "Administración", "Excel · portal", 8, true, 5, [["Calcula honorarios y derechos", "Administración", "Excel"], ["Cobra", "Administración", "Terminal"], ["Factura", "Administración", "Portal"]]),
  ],
  "Manufactura": [
    T("Producción", "Programación de la producción", "Supervisor", "Excel · pizarrón", 1, true, 6, [["Recibe pedidos", "Supervisor", "Correo"], ["Arma el programa del día", "Supervisor", "Excel"], ["Asigna estaciones", "Supervisor", "Pizarrón"]]),
    T("Producción", "Registro de producción por estación", "Operadores", "Hoja de papel", 3, true, 6, [["Operador anota piezas por hora", "Operador", "Papel"], ["Supervisor recoge hojas", "Supervisor", "A pie"], ["Captura en Excel", "Supervisor", "Excel"]]),
    T("Calidad", "Registro de rechazos y retrabajos", "Calidad", "Papel", 3, true, 6, [["Inspecciona", "Calidad", "—"], ["Anota rechazos", "Calidad", "Papel"], ["Reporta a fin de turno", "Calidad", "Excel"]]),
    T("Mantenimiento", "Paros y mantenimiento", "Mantenimiento", "WhatsApp · bitácora", 2, true, 6, [["Operador avisa paro", "Operador", "Voz"], ["Mantenimiento atiende", "Mantenimiento", "—"], ["Anota en bitácora", "Mantenimiento", "Papel"]]),
    T("Dirección", "Indicadores del turno", "Gerente", "Excel", 2, true, 6, [["Junta hojas de producción y calidad", "Gerente", "Papel"], ["Captura y calcula", "Gerente", "Excel"], ["Revisa en la junta", "Gerente", "—"]]),
  ],
};

export const MAPA_DEMO: Mapa = { id: "D2", cliente: CLIENTE_DEMO.nombre, sector: CLIENTE_DEMO.sector, sucursales: CLIENTE_DEMO.sucursales, visita: CLIENTE_DEMO.visita, modo: "Guiado", costoCliente: 95, procs: PROCESOS, creado: "22 oct 2026" };

export function nuevoMapa(o: { cliente: string; sector: string; sucursales: number; visita: string; visitaISO?: string | null; modo: "Guiado" | "Desde cero"; costoCliente: number }): Mapa {
  const id = "M" + Date.now().toString(36).toUpperCase().slice(-5);
  const base = o.modo === "Guiado" ? (GUIAS[o.sector] ?? []) : [];
  const procs = base.map((p, i) => ({ ...p, id: "P" + (i + 1), pasos: p.pasos.map((x) => ({ ...x })), hallazgos: [] }));
  return { id, ...o, procs, creado: new Date().toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) };
}

/* Guía de visita: lo que se pregunta y observa en el levantamiento. */
export const GUIA_VISITA: [string, string][] = [
  ["Antes de llegar", "Confirma quién decide y quién ejecuta cada proceso. Pide 90 minutos con el dueño y acceso al piso en hora de operación."],
  ["Recorrido", "Camina el flujo real siguiendo a la persona, no al manual. Anota herramienta, papel y pantalla en cada paso."],
  ["Medición", "Cronometra tres ejecuciones por paso y usa la mediana. Separa trabajo de espera. Pregunta cuántas veces al día pasa."],
  ["Puntos donde se atora", "Marca cada recaptura (mismo dato escrito dos veces) y cada espera mayor a 10 minutos. Pregunta qué pasa cuando sale mal."],
  ["Costo de la hora", "Pregunta sueldos promedio por puesto para fijar el costo hora del personal; si no lo dan, usa el de la casa y dilo en el reporte."],
  ["Cierre de visita", "Lee los hallazgos en voz alta con el dueño antes de irte. Lo que no reconozca como cierto, se quita."],
];
