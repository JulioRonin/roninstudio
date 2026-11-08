// Catálogo de los 13 agentes (compartido entre servidor y cliente).
export const AGENTES = [
  { id: "perfilador", nombre: "Perfilador", grupo: "Operación", disparo: "nuevo lead o llamada", cron: "every 2h", modelo: "claude", salida: "PERFIL", aprobacion: true },
  { id: "seguimiento", nombre: "Seguimiento", grupo: "Operación", disparo: "tarea con canal", cron: "weekdays at 8am", modelo: "claude", salida: "MENSAJE", aprobacion: true },
  { id: "mapeador", nombre: "Mapeador", grupo: "Operación", disparo: "visita terminada", cron: "manual", modelo: "claude", salida: "MAPA", aprobacion: true },
  { id: "planeador", nombre: "Planeador", grupo: "Operación", disparo: "cotización aceptada", cron: "manual", modelo: "claude", salida: "ACTA", aprobacion: true },
  { id: "reportero", nombre: "Reportero", grupo: "Operación", disparo: "lunes 9:00", cron: "every monday 9am", modelo: "claude", salida: "REPORTE", aprobacion: true },
  { id: "cobrador", nombre: "Cobrador", grupo: "Operación", disparo: "vencimiento de factura", cron: "daily at 7:30am", modelo: "claude", salida: "MENSAJE", aprobacion: true },
  { id: "analista", nombre: "Analista", grupo: "Operación", disparo: "cierre de semana", cron: "every friday 6pm", modelo: "claude", salida: "ANALISIS", aprobacion: true },
  { id: "investigador", nombre: "Investigador", grupo: "Investigación", disparo: "viernes 7:00", cron: "every friday 7am", modelo: "claude", salida: "INFORME", aprobacion: true },
  { id: "estratega", nombre: "Estratega", grupo: "Marketing", disparo: "viernes 12:00", cron: "every friday 12pm", modelo: "claude", salida: "CALENDARIO", aprobacion: true },
  { id: "guionista", nombre: "Guionista", grupo: "Marketing", disparo: "pieza en guion", cron: "weekdays at 10am", modelo: "claude", salida: "GUION", aprobacion: true },
  { id: "productor", nombre: "Productor", grupo: "Marketing", disparo: "guion aprobado (webhook desde el Estudio)", cron: "webhook", modelo: "higgsfield · elevenlabs", salida: "TOMAS", aprobacion: true },
  { id: "publicador", nombre: "Publicador", grupo: "Marketing", disparo: "pieza programada", cron: "every 30m", modelo: "claude", salida: "PUBLICACION", aprobacion: false },
  { id: "analista-canal", nombre: "Analista de canal", grupo: "Marketing", disparo: "lunes 8:00", cron: "every monday 8am", modelo: "claude", salida: "METRICAS", aprobacion: true },
] as const;
