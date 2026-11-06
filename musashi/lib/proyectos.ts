// Resúmenes de proyecto (demo) para el reporte que se comparte con el cliente.
export type Hito = { n: string; t: string; fecha: string; estado: "Aceptado" | "En revisión" | "En curso" | "Planeado" | "Atrasado"; monto?: string };
export type Resumen = {
  code: string; cliente: string; sector: string; proyecto: string; periodo: string; etapa: string; etapaN: number;
  avance: number; proximo: string; fechaReporte: string; semana: string;
  objetivo: string; hitos: Hito[]; hecho: string[]; sigue: string[]; riesgos: { r: string; plan: string }[];
  decisiones: string[]; horas: { usadas: number; estimadas: number }; cobranza: { facturado: string; pagado: string; porCobrar: string };
};

export const RESUMENES: Record<string, Resumen> = {
  D2: {
    code: "D2", cliente: "Negocio demo 2", sector: "Restaurante con sucursales", proyecto: "Plataforma de operación", periodo: "5 de octubre – 27 de diciembre de 2026", etapa: "Construir", etapaN: 3,
    avance: 62, proximo: "Módulo POS y caja · 18 de noviembre", fechaReporte: "6 de noviembre de 2026", semana: "45",
    objetivo: "Que la orden entre una sola vez: de la mesa a cocina y a caja sin recapturas, con cierre de caja automático y un tablero por sucursal.",
    hitos: [
      { n: "H1", t: "Mapa de flujo actual y propuesta", fecha: "16 oct", estado: "Aceptado", monto: "$30,000.00" },
      { n: "H2", t: "Flujo de comanda y roles · prototipo", fecha: "30 oct", estado: "Aceptado", monto: "$35,000.00" },
      { n: "H3", t: "Comanda digital y cocina", fecha: "13 nov", estado: "En revisión", monto: "$40,000.00" },
      { n: "H4", t: "Módulo POS y caja", fecha: "18 nov", estado: "En curso", monto: "$35,000.00" },
      { n: "H5", t: "Cierre automático y pruebas con casos reales", fecha: "11 dic", estado: "Planeado" },
      { n: "H6", t: "Inventario, tablero y acompañamiento", fecha: "27 dic", estado: "Planeado" },
    ],
    hecho: ["Comanda digital operando en la sucursal piloto desde el 2 de noviembre; cocina la recibe en pantalla.", "Roles de mesero, cocina y caja cargados; 14 usuarios con acceso.", "Pruebas de la comanda en turno de comida durante tres días: sin órdenes duplicadas registradas."],
    sigue: ["Módulo POS y caja: captura única desde la comanda, corte por turno.", "Pruebas en la segunda sucursal la semana del 23 de noviembre.", "Capacitación de 40 minutos para cajeros, con guía impresa."],
    riesgos: [{ r: "Impresora de cocina de la sucursal 2 no es compatible con la comanda digital.", plan: "Cotizar impresora térmica de red; decisión del cliente antes del 13 de noviembre." }, { r: "Rotación de meseros en temporada decembrina.", plan: "Guía de un minuto en pantalla y acceso por PIN para altas rápidas." }],
    decisiones: ["Confirmar modelo de impresora para la sucursal 2 (antes del 13 de noviembre).", "Definir si el inventario arranca con las 30 referencias de mayor rotación o con el catálogo completo."],
    horas: { usadas: 148, estimadas: 240 },
    cobranza: { facturado: "$105,000.00 MXN", pagado: "$65,000.00 MXN", porCobrar: "$40,000.00 MXN (F-0121 en revisión)" },
  },
  D4: {
    code: "D4", cliente: "Negocio demo 4", sector: "Clínica", proyecto: "Expedientes y agenda", periodo: "5 de octubre – 18 de diciembre de 2026", etapa: "Diseñar", etapaN: 2,
    avance: 38, proximo: "Hito 2 · Mapa de flujo y propuesta (atrasado desde el 3 de noviembre)", fechaReporte: "6 de noviembre de 2026", semana: "45",
    objetivo: "Expediente único por paciente, agenda con confirmación automática y menos tiempo de recepción en el teléfono.",
    hitos: [
      { n: "H1", t: "Visita y diagnóstico", fecha: "16 oct", estado: "Aceptado", monto: "$25,000.00" },
      { n: "H2", t: "Mapa de flujo y propuesta", fecha: "3 nov", estado: "Atrasado", monto: "$30,000.00" },
      { n: "H3", t: "Prototipo de expediente y agenda", fecha: "27 nov", estado: "Planeado" },
      { n: "H4", t: "Construcción y pruebas", fecha: "18 dic", estado: "Planeado" },
    ],
    hecho: ["Visita de diagnóstico completada con dirección, recepción y dos médicos.", "Levantamiento del flujo actual de citas y expedientes en papel."],
    sigue: ["Entrega del mapa de flujo y la propuesta: nueva fecha, 10 de noviembre.", "Sesión de revisión con dirección, 45 minutos."],
    riesgos: [{ r: "El hito 2 lleva tres días de retraso por falta de acceso al sistema de agenda actual.", plan: "Acceso de lectura solicitado el 4 de noviembre; si no llega el 7, se documenta desde capturas." }],
    decisiones: ["Autorizar acceso de lectura al sistema de agenda actual."],
    horas: { usadas: 42, estimadas: 160 },
    cobranza: { facturado: "$25,000.00 MXN", pagado: "$25,000.00 MXN", porCobrar: "$0.00 MXN" },
  },
  D1: {
    code: "D1", cliente: "Negocio demo 1", sector: "Escuela privada", proyecto: "Control escolar y cobranza", periodo: "26 de octubre – 11 de diciembre de 2026", etapa: "Diseñar", etapaN: 2,
    avance: 20, proximo: "Plan de trabajo y entregables · 13 de noviembre", fechaReporte: "6 de noviembre de 2026", semana: "45",
    objetivo: "Cobranza de colegiaturas sin perseguir a nadie: recordatorios automáticos, estado de cuenta por familia y conciliación en un solo lugar.",
    hitos: [
      { n: "H1", t: "Visita y diagnóstico", fecha: "6 nov", estado: "En revisión", monto: "$20,000.00" },
      { n: "H2", t: "Plan de trabajo y entregables", fecha: "13 nov", estado: "En curso" },
      { n: "H3", t: "Prototipo de estado de cuenta", fecha: "27 nov", estado: "Planeado" },
      { n: "H4", t: "Construcción y arranque", fecha: "11 dic", estado: "Planeado" },
    ],
    hecho: ["Visita de diagnóstico con dirección y control escolar.", "Mapa del flujo de cobranza actual: 4 pasos manuales, 2 hojas de cálculo."],
    sigue: ["Plan de trabajo con hitos y fechas para aprobación.", "Definir canal de recordatorios (WhatsApp o correo)."],
    riesgos: [{ r: "Datos de familias en tres archivos distintos.", plan: "Limpieza y unificación como parte del hito 3." }],
    decisiones: ["Elegir canal de recordatorios."],
    horas: { usadas: 18, estimadas: 140 },
    cobranza: { facturado: "$0.00 MXN", pagado: "$0.00 MXN", porCobrar: "$20,000.00 MXN al aceptar H1" },
  },
};
