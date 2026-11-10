"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { Glass, PB } from "@/components/ui";
import { useUI } from "@/components/shell";
import { datos, eq, fechaCorta, hoyISO } from "@/lib/datos";
import { Vacio, mono10, btn } from "@/components/real";

/* Bandeja exprés: lo que llega del diagnóstico del sitio público. De aquí se da de alta al cliente. */
type Expres = { id: string; cliente_id: string | null; nombre: string; negocio: string; sector: string | null; whatsapp: string | null; correo: string | null; contactado: boolean; creado_en: string;
  respuestas: { sector_clave?: string; lista?: string[] } | null; hallazgos: { lista?: string[]; horas?: string; contexto?: string[] } | null; lectura_interna: { nivel?: string } | null };
const SECTOR: Record<string, string> = { escuelas: "Escuela privada", restaurantes: "Restaurante con sucursales", clinicas: "Clínica", gimnasios: "Gimnasio", notarias: "Notaría", manufactura: "Taller" };
const wa = (n: string) => "https://wa.me/" + n.replace(/\D/g, "").replace(/^(\d{10})$/, "52$1");

export function BandejaExpres({ onCuenta }: { onCuenta?: (total: number, sin: number) => void }) {
  const { flash } = useUI();
  const [xs, setXs] = useState<Expres[] | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);
  const cargar = useCallback(() => datos.lista<Expres>("diagnosticos_expres", "select=*&order=creado_en.desc").then((r) => { setXs(r.filas); onCuenta?.(r.filas.length, r.filas.filter((x) => !x.contactado).length); }).catch((e) => { flash("No se pudo leer la bandeja: " + (e as Error).message); setXs([]); }), [flash, onCuenta]);
  useEffect(() => { void cargar(); }, [cargar]);

  const contactado = async (x: Expres) => { try { await datos.cambia("diagnosticos_expres", eq("id", x.id), { contactado: true }); flash("Marcado como contactado"); await cargar(); } catch (e) { flash("No se guardó: " + (e as Error).message); } };
  const alta = async (x: Expres) => {
    try {
      const sector = SECTOR[x.respuestas?.sector_clave ?? ""] ?? "Otro";
      const c = await datos.crea<{ id: string }>("clientes", { nombre: x.negocio, sector, origen: "Diagnóstico exprés", etapa_embudo: "Lead", siguiente_paso: "Primer contacto", siguiente_fecha: hoyISO() });
      const id = c.filas[0]?.id; if (!id) throw new Error("no se creó el cliente");
      await datos.crea("contactos", { cliente_id: id, nombre: x.nombre, whatsapp: x.whatsapp, correo: x.correo, decide: true });
      await datos.crea("tareas", { titulo: `Primer contacto · ${x.negocio} (diagnóstico exprés)`, cliente_id: id, origen: "Lead", canal: x.whatsapp ? "WhatsApp" : "Correo" });
      await datos.cambia("diagnosticos_expres", eq("id", x.id), { cliente_id: id });
      flash(`${x.negocio} dado de alta como lead · tarea de primer contacto creada`); await cargar();
    } catch (e) { flash("No se pudo dar de alta: " + (e as Error).message); }
  };

  if (!xs) return <div style={{ ...mono10, padding: "20px 0" }}>CARGANDO…</div>;
  if (xs.length === 0) return <Glass><Vacio>Todavía no llega ningún diagnóstico exprés. Cuando alguien lo termine en roninstudio.com.mx/diagnostico, cae aquí con sus hallazgos y lo das de alta como cliente con un clic. Tú sigues recibiendo el correo de siempre.</Vacio></Glass>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16, alignItems: "start" }}>
      {xs.map((x) => { const nuevo = !x.contactado && !x.cliente_id; return (
        <Glass key={x.id} radius={24} pad={22} style={{ display: "flex", flexDirection: "column", gap: 12, borderColor: nuevo ? C.oxido : undefined, boxShadow: nuevo ? "0 0 28px rgba(176,81,57,0.25)" : undefined }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={mono10}>{(x.sector ?? "SIN SECTOR").toUpperCase()} · {fechaCorta(x.creado_en).toUpperCase()}</div>
              <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.01em", marginTop: 4 }}>{x.negocio}</div>
              <div style={{ fontSize: 13, color: C.niebla, marginTop: 2 }}>{x.nombre}{x.correo ? ` · ${x.correo}` : ""}</div>
            </div>
            <span style={{ ...mono10, color: x.cliente_id ? C.olivo : x.contactado ? C.niebla : C.oxido, whiteSpace: "nowrap" }}>{x.cliente_id ? "YA ES CLIENTE EN MUSASHI" : x.contactado ? "CONTACTADO" : "SIN CONTACTAR"}</span>
          </div>
          {(x.hallazgos?.lista ?? []).length > 0 && <div>{x.hallazgos!.lista!.map((h, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "22px 1fr", gap: 6, padding: "6px 0", borderTop: `1px solid ${C.borde}`, fontSize: 13.5 }}><span style={{ fontFamily: MONO, fontSize: 11, color: C.acero }}>{String(i + 1).padStart(2, "0")}</span>{h}</div>)}</div>}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", ...mono10 }}>{x.hallazgos?.horas && <span>TIEMPO ESTIMADO · <span style={{ color: C.papel }}>{x.hallazgos.horas.toUpperCase()}</span></span>}{x.lectura_interna?.nivel && <span>LECTURA INTERNA · <span style={{ color: C.papel }}>{x.lectura_interna.nivel.toUpperCase()}</span></span>}</div>
          {abierto === x.id && <div style={{ background: C.p2, borderRadius: 14, padding: "10px 14px", fontSize: 12.5, color: C.niebla, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{[...(x.respuestas?.lista ?? []), ...((x.hallazgos?.contexto ?? []).length ? ["", "En sus palabras:", ...x.hallazgos!.contexto!] : [])].join("\n") || "Sin respuestas guardadas."}</div>}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {!x.cliente_id ? <PB small onClick={() => void alta(x)}>Dar de alta como cliente</PB> : <Link href="/clientes" style={{ ...btn, height: 36, display: "flex", alignItems: "center" }}>Ver en Clientes ↗</Link>}
            {x.whatsapp && <a href={wa(x.whatsapp)} target="_blank" rel="noreferrer" style={{ height: 36, padding: "0 14px", borderRadius: 999, background: "#25D366", color: C.tinta, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center" }}>WhatsApp</a>}
            {!x.contactado && <button type="button" onClick={() => void contactado(x)} style={{ ...btn, height: 36 }}>Marcar contactado</button>}
            <button type="button" onClick={() => setAbierto(abierto === x.id ? null : x.id)} style={{ ...btn, height: 36, border: "none", color: C.niebla }}>{abierto === x.id ? "Ocultar respuestas" : "Ver respuestas"}</button>
          </div>
        </Glass>
      ); })}
    </div>
  );
}
