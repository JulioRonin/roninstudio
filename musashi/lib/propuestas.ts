// Qué pasa al aprobar una propuesta de un agente. Musashi nunca envía nada por su cuenta:
// para mensajes abre WhatsApp con el texto listo y tú das enviar; lo demás se guarda en su módulo.
import { datos, eq } from "@/lib/datos";

export type Propuesta = { id: string; agente: string; tipo: string; titulo: string; cuerpo: string; datos?: Record<string, unknown> | null; referencia?: string | null };
export type Accion = { clave: "whatsapp" | "tarea" | "perfil" | "pieza" | "nada"; etiqueta: string };

const sin = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
export function accionDe(p: Pick<Propuesta, "tipo" | "agente">): Accion {
  const t = sin(p.tipo);
  if (/MENSAJE|RECORDATORIO|WHATSAPP/.test(t)) return { clave: "whatsapp", etiqueta: "Aprobar y abrir WhatsApp" };
  if (/PERFIL/.test(t)) return { clave: "perfil", etiqueta: "Aprobar y guardar perfil" };
  if (/GUION|PIEZA|IDEA|CALENDARIO|CONTENIDO/.test(t)) return { clave: "pieza", etiqueta: "Aprobar y crear pieza" };
  if (/TAREA|RECOMENDACION|INFORME|REPORTE|ACTA|MAPA|ANALISIS/.test(t)) return { clave: "tarea", etiqueta: "Aprobar y crear tarea" };
  return { clave: "nada", etiqueta: "Aprobar" };
}

const str = (x: unknown) => (typeof x === "string" && x.trim() ? x.trim() : null);
const tel = (x: string | null) => { const d = (x ?? "").replace(/\D/g, ""); return d.length === 10 ? "52" + d : d.length >= 11 ? d : null; };

/** Ejecuta la acción de la propuesta con el texto final (puede venir editado) y devuelve el aviso para mostrar.
 *  `ventana` es la pestaña abierta en el clic para WhatsApp (los navegadores bloquean abrirla después). */
export async function ejecutar(p: Propuesta, cuerpo: string, ventana: Window | null): Promise<string> {
  const d = p.datos ?? {}, clienteId = str(d.cliente_id), a = accionDe(p);
  if (a.clave === "whatsapp") {
    let numero = tel(str(d.whatsapp));
    if (!numero && clienteId) { const c = await datos.lista<{ whatsapp: string | null }>("contactos", `select=whatsapp&${eq("cliente_id", clienteId)}&order=decide.desc`).catch(() => ({ filas: [] as { whatsapp: string | null }[] })); numero = tel(c.filas.find((x) => x.whatsapp)?.whatsapp ?? null); }
    const url = `https://wa.me/${numero ?? ""}?text=${encodeURIComponent(cuerpo)}`;
    if (ventana) ventana.location.href = url; else { await navigator.clipboard.writeText(cuerpo).catch(() => {}); }
    const tarea = str(d.tarea_id); if (tarea) await datos.cambia("tareas", eq("id", tarea), { estado: "Hecha" }).catch(() => {});
    return ventana ? (numero ? "WhatsApp abierto con el mensaje · dale enviar" : "WhatsApp abierto · elige el contacto y envía") : "El navegador bloqueó la pestaña: el mensaje quedó copiado, pégalo en WhatsApp";
  }
  if (a.clave === "perfil") {
    if (!clienteId) return "Aprobada · no traía cliente, el perfil no se guardó en ninguna ficha";
    await datos.cambia("clientes", eq("id", clienteId), { perfil_ia: cuerpo });
    return "Perfil guardado en la ficha del cliente";
  }
  if (a.clave === "pieza") {
    await datos.crea("piezas", { titulo: p.titulo, gancho: str(d.gancho), formato: str(d.formato) ?? "Video 9:16", canal: str(d.canal) ?? "IG", estado: "Guion", senal: p.agente, guion: { texto: cuerpo }, publicar_en: str(d.publicar_en) });
    return "Pieza creada en Marketing, en Guion";
  }
  if (a.clave === "tarea") {
    await datos.crea("tareas", { titulo: p.titulo.slice(0, 140), cliente_id: clienteId, proyecto_id: str(d.proyecto_id), origen: sin(p.tipo).includes("REPORTE") ? "Acompañamiento" : "Investigación", canal: str(d.canal) ?? "Interno", borrador_ia: cuerpo, agente: p.agente, ...(str(d.fecha) ? { fecha: str(d.fecha) } : {}) });
    return "Tarea creada con el borrador del agente";
  }
  return "Propuesta aprobada";
}

/** Aprueba (o descarta) y deja registro. Si el texto se editó, queda como "Editada". */
export async function resolver(p: Propuesta, decision: "Aprobada" | "Descartada", cuerpo?: string, ventana: Window | null = null): Promise<string> {
  let aviso = "Propuesta descartada";
  const final = cuerpo?.trim() || p.cuerpo, editada = final !== p.cuerpo;
  if (decision === "Aprobada") aviso = await ejecutar(p, final, ventana);
  await datos.cambia("propuestas_ia", eq("id", p.id), { estado: decision === "Aprobada" && editada ? "Editada" : decision, resuelta_en: new Date().toISOString(), ...(editada ? { cuerpo: final } : {}) });
  return aviso;
}
