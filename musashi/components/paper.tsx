"use client";
import React, { useRef, type ReactNode } from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { RGlyph } from "@/components/ui";

/* Documento en papel: reportes para el cliente, contrato, términos.
   Fondo Papel, tipografía del sistema, listo para imprimir o guardar como PDF. */
export function PaperDoc({ title, kicker, children, file, editable = true, back = "/", publico = false }: { title: string; kicker: string; children: ReactNode; file: string; editable?: boolean; back?: string; publico?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const download = () => {
    const body = ref.current?.innerHTML ?? "";
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title}</title><link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,300..900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"><style>${CSS}</style></head><body><div class="paper">${body}</div></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = file; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div style={{ minHeight: "100vh", background: "#D9D5CD", padding: "32px 16px 64px" }}>
      <style>{CSS}</style>
      <div className="paper-actions" style={{ maxWidth: 816, margin: "0 auto 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        {publico ? <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.acero }}>RONIN STUDIO · DOCUMENTO PRIVADO</span> : <Link href={back} style={{ color: C.tinta, fontSize: 13, textDecoration: "underline", textDecorationColor: C.oxido }}>← Volver a Musashi</Link>}
        <div style={{ display: "flex", gap: 8 }}>
          {editable && <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.acero, alignSelf: "center" }}>HAZ CLIC EN EL TEXTO PARA EDITARLO</span>}
          {!publico && <button type="button" onClick={download} style={{ height: 40, padding: "0 16px", borderRadius: 999, background: "transparent", border: `1px solid ${C.acero}`, color: C.tinta, fontSize: 13, cursor: "pointer" }}>Descargar HTML</button>}
          <button type="button" onClick={() => window.print()} style={{ height: 40, padding: "0 18px", borderRadius: 999, background: C.oxido, border: "none", color: C.papel, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Imprimir · Guardar PDF</button>
        </div>
      </div>
      <div ref={ref} className="paper" contentEditable={editable} suppressContentEditableWarning>
        <header className="paper-head">
          <div className="paper-brand"><RGlyph active={1} size={22} base={C.tinta} /><span>RONIN STUDIO</span></div>
          <div className="paper-kicker">{kicker}</div>
          <h1>{title}</h1>
        </header>
        {children}
        <footer className="paper-foot">Ronin Studio · Ciudad Juárez, Chihuahua · El Paso, Texas · roninstudio.com.mx · project@roninstudio.com.mx</footer>
      </div>
    </div>
  );
}

const CSS = `
.paper{max-width:816px;margin:0 auto;background:#EEEBE4;color:#0C0F14;padding:56px 64px;border-radius:6px;box-shadow:0 20px 60px rgba(0,0,0,.18);font-family:'Archivo',system-ui,sans-serif;font-stretch:112%;font-size:13.5px;line-height:1.55;outline:none}
.paper-head{border-bottom:2px solid #0C0F14;padding-bottom:18px;margin-bottom:22px}
.paper-brand{display:flex;align-items:center;gap:8px;font-weight:900;font-size:13px;letter-spacing:.06em}
.paper-kicker{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;color:#5B6068;margin-top:14px}
.paper h1{font-weight:900;font-size:30px;letter-spacing:-.02em;line-height:1.05;margin:6px 0 0;text-transform:uppercase}
.paper h2{font-weight:900;font-size:15px;letter-spacing:-.01em;text-transform:uppercase;margin:26px 0 8px;display:flex;align-items:center;gap:8px}
.paper h2::before{content:"";width:3px;height:12px;background:#B05139;transform:skewY(-14deg);display:inline-block}
.paper h3{font-weight:600;font-size:13.5px;margin:14px 0 4px}
.paper p{margin:0 0 8px;text-wrap:pretty}
.paper ul,.paper ol{margin:0 0 8px;padding-left:20px}
.paper li{margin-bottom:3px}
.paper table{width:100%;border-collapse:collapse;margin:8px 0 12px;font-size:13px}
.paper th{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;color:#5B6068;text-align:left;padding:6px 8px;border-bottom:1px solid #0C0F14}
.paper td{padding:7px 8px;border-bottom:1px solid #D6D2C9;vertical-align:top}
.paper td.num,.paper th.num{text-align:right;font-family:'JetBrains Mono',monospace}
.paper .mono{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;color:#5B6068}
.paper .field{background:#FBF9F4;border-bottom:1px dashed #B05139;padding:0 4px;color:#B05139;font-weight:600}
.paper .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:10px 0 4px}
.paper .fact{background:#FBF9F4;border:1px solid #D6D2C9;border-radius:10px;padding:10px 12px}
.paper .fact .k{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.12em;color:#5B6068}
.paper .fact .v{font-weight:900;font-size:20px;letter-spacing:-.02em;margin-top:4px}
.paper .bar{height:6px;border-radius:3px;background:#D6D2C9;overflow:hidden;margin:6px 0 2px}
.paper .bar span{display:block;height:100%;background:#0C0F14}
.paper .dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:6px;vertical-align:middle}
.paper .note{background:#FBF9F4;border:1px dashed #A9A6A0;border-radius:10px;padding:10px 12px;font-size:12.5px;color:#3A4048;margin:12px 0}
.paper .sign{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:40px}
.paper .sign div{border-top:1px solid #0C0F14;padding-top:8px;font-size:12px}
.paper-foot{margin-top:36px;border-top:1px solid #0C0F14;padding-top:10px;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;color:#5B6068}
@media print{body{background:#fff!important}.paper-actions{display:none}.paper{box-shadow:none;border-radius:0;max-width:none;padding:0;background:#fff}@page{margin:18mm 16mm}}
`;
