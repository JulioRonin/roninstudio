// Ajustes guardados en configuracion: tipos y valores base, sin código de navegador.
/* Datos del emisor: salen en la cotización formal y, más adelante, en el CFDI. */
export type Fiscales = { nombreComercial: string; razonSocial: string; rfc: string; regimen: string; cp: string; domicilio: string; serie: string; monedas: string; correo: string; telefono: string; banco: string; titular: string; clabe: string };
export const FISCALES_BASE: Fiscales = { nombreComercial: "Ronin Studio", razonSocial: "", rfc: "", regimen: "", cp: "", domicilio: "", serie: "F", monedas: "MXN", correo: "project@roninstudio.com.mx", telefono: "", banco: "", titular: "", clabe: "" };

/* Tope mensual de gasto en tokens de IA (MXN). */
export type Tope = { total: number };
export const TOPE_BASE: Tope = { total: 3000 };
