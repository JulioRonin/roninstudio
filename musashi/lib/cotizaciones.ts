// Cotizaciones, facturas, cobros y gastos (demo). Es la entrada del dinero de Musashi.
export type Estado = "Borrador" | "Enviada" | "Abierta" | "Aceptada" | "Vencida" | "Perdida";
export type Linea = { c: string; etapa: "Mapear" | "Diseñar" | "Construir" | "Evolucionar"; monto: number; horas?: number };
export type Cot = {
  folio: string; cliente: string; sector: string; proyecto: string; estado: Estado; fecha: string; vigencia: string;
  lineas: Linea[]; credito: number; anticipo: number; notas?: string; abierta?: string; razon?: string; proyectoCode?: string;
};
export type Pago = { id: string; tipo: "Cobro" | "Gasto"; fecha: string; mes: string; cliente: string; concepto: string; ref: string; metodo: string; monto: number };
export type Factura = { folio: string; cliente: string; cot: string; monto: number; estado: "Pagada" | "Vencida" | "Vigente" | "Borrador"; vence: string };

export const CLIENTES = ["Negocio demo 1 · Escuela privada", "Negocio demo 2 · Restaurante con sucursales", "Negocio demo 3 · Clínica", "Negocio demo 4 · Clínica", "Negocio demo 5 · Gimnasio", "Negocio demo 6 · Taller", "Negocio demo 7 · Notaría", "Negocio demo 8 · Taller", "Negocio demo 13 · Clínica"];

export const COTS: Cot[] = [
  { folio: "C-0034", cliente: "Negocio demo 7", sector: "Notaría", proyecto: "Plataforma de expedientes y citas", estado: "Borrador", fecha: "5 nov", vigencia: "20 nov", credito: 10000, anticipo: 30,
    lineas: [{ c: "Hito 1 · Flujo y roles", etapa: "Mapear", monto: 30000 }, { c: "Hito 2 · Expediente digital", etapa: "Diseñar", monto: 35000 }, { c: "Hito 3 · Agenda y citas", etapa: "Construir", monto: 30000 }, { c: "Hito 4 · Tablero y ajustes", etapa: "Evolucionar", monto: 15000 }] },
  { folio: "C-0033", cliente: "Negocio demo 1", sector: "Escuela privada", proyecto: "Control escolar y cobranza", estado: "Abierta", fecha: "28 oct", vigencia: "18 nov", credito: 0, anticipo: 30, abierta: "HOY 08:12 · 3 VECES",
    lineas: [{ c: "Hito 1 · Visita y diagnóstico", etapa: "Mapear", monto: 20000 }, { c: "Hito 2 · Plan y prototipo", etapa: "Diseñar", monto: 25000 }, { c: "Hito 3 · Construcción y arranque", etapa: "Construir", monto: 35000 }] },
  { folio: "C-0032", cliente: "Negocio demo 8", sector: "Taller", proyecto: "Diagnóstico completo", estado: "Enviada", fecha: "3 nov", vigencia: "15 nov", credito: 0, anticipo: 100,
    lineas: [{ c: "Diagnóstico completo · visita y mapa de flujo", etapa: "Mapear", monto: 10000 }] },
  { folio: "C-0031", cliente: "Negocio demo 2", sector: "Restaurante con sucursales", proyecto: "Plataforma de operación", estado: "Aceptada", fecha: "1 oct", vigencia: "—", credito: 0, anticipo: 20, proyectoCode: "D2",
    lineas: [{ c: "Hito 1 · Mapa de flujo y propuesta", etapa: "Mapear", monto: 30000 }, { c: "Hito 2 · Comanda y roles", etapa: "Diseñar", monto: 35000 }, { c: "Hito 3 · Comanda digital y cocina", etapa: "Construir", monto: 40000 }, { c: "Hito 4 · POS y caja", etapa: "Construir", monto: 35000 }] },
  { folio: "C-0030", cliente: "Negocio demo 5", sector: "Gimnasio", proyecto: "Membresías y accesos", estado: "Aceptada", fecha: "10 sep", vigencia: "—", credito: 5000, anticipo: 30, proyectoCode: "D5",
    lineas: [{ c: "Hito 1 · Flujo de alta y acceso", etapa: "Mapear", monto: 25000 }, { c: "Hito 2 · Prototipo", etapa: "Diseñar", monto: 25000 }, { c: "Hito 3 · Construcción", etapa: "Construir", monto: 45000 }] },
  { folio: "C-0029", cliente: "Negocio demo 13", sector: "Clínica", proyecto: "Agenda y expediente", estado: "Perdida", fecha: "10 oct", vigencia: "30 oct", credito: 0, anticipo: 30, razon: "Precio",
    lineas: [{ c: "Hito 1 · Diagnóstico", etapa: "Mapear", monto: 20000 }, { c: "Hito 2 · Prototipo", etapa: "Diseñar", monto: 40000 }] },
];

export const FACTURAS: Factura[] = [
  { folio: "F-0107", cliente: "Negocio demo 2", cot: "C-0031", monto: 30000, estado: "Pagada", vence: "16 oct" },
  { folio: "F-0109", cliente: "Negocio demo 3", cot: "—", monto: 20000, estado: "Pagada", vence: "2 nov" },
  { folio: "F-0110", cliente: "Negocio demo 2", cot: "C-0031", monto: 35000, estado: "Pagada", vence: "30 oct" },
  { folio: "F-0112", cliente: "Negocio demo 2", cot: "C-0031", monto: 25000, estado: "Vencida", vence: "2 nov" },
  { folio: "F-0115", cliente: "Negocio demo 5", cot: "C-0030", monto: 20000, estado: "Pagada", vence: "4 nov" },
  { folio: "F-0118", cliente: "Negocio demo 6", cot: "—", monto: 18000, estado: "Vigente", vence: "10 nov" },
  { folio: "F-0120", cliente: "Negocio demo 4", cot: "—", monto: 12500, estado: "Vigente", vence: "14 nov" },
  { folio: "F-0121", cliente: "Negocio demo 2", cot: "C-0031", monto: 40000, estado: "Borrador", vence: "—" },
];

export const PAGOS: Pago[] = [
  { id: "P-0044", tipo: "Cobro", fecha: "4 nov", mes: "NOV", cliente: "Negocio demo 5", concepto: "Hito 2 · Prototipo", ref: "F-0115", metodo: "Transferencia", monto: 20000 },
  { id: "P-0043", tipo: "Cobro", fecha: "2 nov", mes: "NOV", cliente: "Negocio demo 3", concepto: "Acompañamiento mensual", ref: "F-0109", metodo: "Transferencia", monto: 20000 },
  { id: "G-0031", tipo: "Gasto", fecha: "3 nov", mes: "NOV", cliente: "Ronin Studio", concepto: "Tokens de IA · agentes (Anthropic)", ref: "Tarjeta", metodo: "Tarjeta", monto: 1200 },
  { id: "G-0030", tipo: "Gasto", fecha: "1 nov", mes: "NOV", cliente: "Ronin Studio", concepto: "Vercel, Supabase, Higgsfield, ElevenLabs", ref: "Tarjeta", metodo: "Tarjeta", monto: 2400 },
  { id: "G-0029", tipo: "Gasto", fecha: "1 nov", mes: "NOV", cliente: "Ronin Studio", concepto: "Contador y oficina", ref: "Transferencia", metodo: "Transferencia", monto: 4400 },
  { id: "P-0042", tipo: "Cobro", fecha: "30 oct", mes: "OCT", cliente: "Negocio demo 2", concepto: "Hito 2 · Comanda y roles", ref: "F-0110", metodo: "Transferencia", monto: 35000 },
  { id: "P-0041", tipo: "Cobro", fecha: "16 oct", mes: "OCT", cliente: "Negocio demo 2", concepto: "Hito 1 · Mapa de flujo", ref: "F-0107", metodo: "Transferencia", monto: 30000 },
  { id: "G-0028", tipo: "Gasto", fecha: "1 oct", mes: "OCT", cliente: "Ronin Studio", concepto: "Herramientas y oficina", ref: "Tarjeta", metodo: "Tarjeta", monto: 8000 },
];

export const mxn = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const total = (c: Cot) => c.lineas.reduce((s, l) => s + l.monto, 0) - c.credito;
export const PESO: Record<Estado, number> = { Borrador: 0.1, Enviada: 0.3, Abierta: 0.5, Aceptada: 1, Vencida: 0, Perdida: 0 };
