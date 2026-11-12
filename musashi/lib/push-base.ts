// Tipos y preferencias de avisos push (sin dependencias de servidor: lo usa también Configuración).
export type TipoAviso = "propuestas" | "aperturas" | "diagnosticos" | "resumen";
export type Avisos = Record<TipoAviso, boolean>;
export const AVISOS_BASE: Avisos = { propuestas: true, aperturas: true, diagnosticos: true, resumen: true };
export const AVISOS_TEXTO: [TipoAviso, string, string][] = [
  ["propuestas", "Propuestas de los agentes", "Cuando un agente de Hermes deja algo en la bandeja de aprobación."],
  ["aperturas", "Cotización abierta", "Cuando un cliente abre la liga de su cotización."],
  ["diagnosticos", "Diagnóstico exprés nuevo", "Cuando alguien llena el diagnóstico en roninstudio.com.mx."],
  ["resumen", "Resumen de la mañana", "Tareas del día, propuestas por aprobar y facturas vencidas, a las 7 de la mañana."],
];
