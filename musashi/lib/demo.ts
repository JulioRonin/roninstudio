// Datos de ejemplo (MODO DEMO). Nada aquí es un cliente real.
export type TrayItem = { id: string; agent: string; model: string; kind: string; title: string; body: string };

export const TRAY: TrayItem[] = [
  { id: "a", agent: "COBRADOR", model: "CLAUDE", kind: "MENSAJE", title: "Recordatorio F-0112 · Negocio demo 2", body: "Primer aviso por WhatsApp. Factura vencida hace 3 días, $25,000.00 MXN." },
  { id: "b", agent: "SEGUIMIENTO", model: "CLAUDE", kind: "MENSAJE", title: "Confirmar visita · Negocio demo 1", body: "Confirmación de visita de diagnóstico para el martes 10 de noviembre, 9:00." },
  { id: "c", agent: "ESTRATEGA", model: "CLAUDE", kind: "CALENDARIO", title: "Calendario de la semana 46", body: "5 piezas: 2 carruseles, 2 videos, 1 post. Tema: cuánto cuesta no ordenar el flujo." },
  { id: "d", agent: "GUIONISTA", model: "CLAUDE", kind: "GUION", title: "Video · El chatbot que nadie usa", body: "Gancho de 3 segundos y guion de 45 segundos para teleprompter, con tiempos." },
  { id: "e", agent: "REPORTERO", model: "CLAUDE", kind: "REPORTE", title: "Reporte semanal · Negocio demo 2", body: "Avance 62 %, hito 3 en curso, sin cambios de alcance." },
];

export type DemoTask = { id: number; client: string; time: string; title: string; origin: string; channel: string; overdue?: boolean; ai?: string };
export const TASKS: DemoTask[] = [
  { id: 1, client: "NEGOCIO DEMO 2 · RESTAURANTE CON SUCURSALES", time: "09:00", title: "Recordatorio de factura F-0112", origin: "Factura", channel: "WHATSAPP", overdue: true, ai: "Hola, te comparto el recordatorio de la factura F-0112 por $25,000.00 MXN, vencida el 2 de noviembre. ¿Te ayudo con el complemento de pago?" },
  { id: 2, client: "NEGOCIO DEMO 4 · CLÍNICA", time: "10:00", title: "Hito 2 atrasado · Mapa de flujo", origin: "Hito", channel: "INTERNO", overdue: true },
  { id: 3, client: "NEGOCIO DEMO 1 · ESCUELA PRIVADA", time: "11:30", title: "Llamada de 15 minutos", origin: "Lead", channel: "LLAMADA" },
  { id: 4, client: "NEGOCIO DEMO 1 · ESCUELA PRIVADA", time: "13:00", title: "Confirmar visita de diagnóstico", origin: "Llamada", channel: "WHATSAPP", ai: "Confirmo la visita del martes 10 a las 9:00. Llevamos la guía de escuelas; calcula una hora y media con dirección y control escolar." },
  { id: 5, client: "NEGOCIO DEMO 5 · GIMNASIO", time: "17:30", title: "Reporte mensual de acompañamiento", origin: "Acompañamiento", channel: "CORREO" },
];

export const STAGES = ["MAPEAR", "DISEÑAR", "CONSTRUIR", "EVOLUCIONAR"] as const;
