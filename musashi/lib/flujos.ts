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
