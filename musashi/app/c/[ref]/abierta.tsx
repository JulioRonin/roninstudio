"use client";
import { useEffect } from "react";

/* Avisa a Musashi que el cliente abrió la cotización (una vez por visita del navegador).
   Se hace desde el navegador para no contar las vistas previas de WhatsApp o de buscadores. */
export function Abierta({ refCot }: { refCot: string }) {
  useEffect(() => {
    const k = "cot-abierta:" + refCot;
    try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, "1"); } catch {}
    void fetch("/api/publico/cotizacion-abierta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref: refCot }), keepalive: true }).catch(() => {});
  }, [refCot]);
  return null;
}
