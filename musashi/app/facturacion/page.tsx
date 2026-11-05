"use client";
import React, { useState } from "react";
import { C, MONO, SANS } from "@/lib/tokens";
import { H } from "@/components/ui";
import { useUI } from "@/components/shell";

/* ---------- Helpers locales (equivalen al script del prototipo) ---------- */
type Cell = { t: string; color: string; font: string; size: number; ls: string; w: number; dot: string | null; align: "flex-start" | "flex-end" };
const tx = (t: string, o: { c?: string; w?: number; a?: Cell["align"] } = {}): Cell => ({ t, color: o.c || C.papel, font: SANS, size: 14, ls: "0", w: o.w || 400, dot: null, align: o.a || "flex-start" });
const mo = (t: string, o: { c?: string; a?: Cell["align"] } = {}): Cell => ({ t, color: o.c || C.niebla, font: MONO, size: 11, ls: "0.08em", w: 400, dot: null, align: o.a || "flex-start" });
const ch = (t: string, dot: string): Cell => ({ t, color: C.papel, font: MONO, size: 10, ls: "0.12em", w: 500, dot, align: "flex-start" });
const SC: Record<string, string> = { BORRADOR: C.tenue, ENVIADA: C.niebla, ABIERTA: C.ambar, ACEPTADA: C.olivo, VENCIDA: C.oxido, EMITIDA: C.papel, PAGADA: C.olivo, CANCELADA: C.acero };
const GLASS: React.CSSProperties = { background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" };
const LBL: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue };

const TABS = ["Cotizaciones", "Facturas", "Cobranza", "Conciliación"];

const W1 = "0.7fr 1.3fr 1.1fr 0.8fr 1fr 1fr";
const QUOTES: string[][] = [
  ["C-0034", "Negocio demo 7", "$100,000.00", "20 NOV", "BORRADOR", "—"],
  ["C-0033", "Negocio demo 1", "$80,000.00", "18 NOV", "ABIERTA", "HOY 08:12 · 3 VECES"],
  ["C-0032", "Negocio demo 8", "$10,000.00", "15 NOV", "ENVIADA", "SIN ABRIR"],
  ["C-0031", "Negocio demo 2", "$140,000.00", "—", "ACEPTADA", "05 OCT"],
  ["C-0029", "Negocio demo 13", "$60,000.00", "30 OCT", "VENCIDA", "22 OCT"],
];
const W2 = "0.7fr 1.1fr 1.4fr 1fr 0.6fr 1fr 0.8fr";
const INVOICES: string[][] = [
  ["F-0121", "Negocio demo 2", "Hito 3 · POS y caja", "$40,000.00", "MXN", "BORRADOR", "—"],
  ["F-0120", "Negocio demo 4", "Hito 1 · Diseño", "$12,500.00", "MXN", "EMITIDA", "VENCE 14 NOV"],
  ["F-0119", "Negocio demo 16", "Diagnóstico completo", "$500.00", "USD", "EMITIDA", "STRIPE"],
  ["F-0118", "Negocio demo 6", "Hito 3 · Entrega", "$18,000.00", "MXN", "EMITIDA", "VENCE 10 NOV"],
  ["F-0112", "Negocio demo 2", "Hito 2 · Comanda digital", "$25,000.00", "MXN", "VENCIDA", "02 NOV"],
  ["F-0109", "Negocio demo 3", "Acompañamiento octubre", "$20,000.00", "MXN", "PAGADA", "02 NOV"],
  ["F-0104", "Negocio demo 13", "Anticipo", "$5,000.00", "MXN", "CANCELADA", "—"],
];
const CONCEPTS: [string, string][] = [["Hito 1 · Flujo y roles", "$30,000.00"], ["Hito 2 · Expediente digital", "$35,000.00"], ["Hito 3 · Agenda y citas", "$30,000.00"], ["Hito 4 · Tablero y ajustes", "$15,000.00"]];

const D: [string, string, string, string, string, string, string, string][] = [
  ["d1", "Negocio demo 2", "F-0112", "$25,000.00", "VENCIDA · 3 DÍAS", C.oxido, "PRIMER AVISO", "Hola, te comparto el recordatorio de la factura F-0112 por $25,000.00 MXN, vencida el 2 de noviembre. ¿Te ayudo con el complemento de pago?"],
  ["d2", "Negocio demo 6", "F-0118", "$18,000.00", "VENCE 10 NOV", C.ambar, "AVISO PREVIO", "Te recuerdo que la factura F-0118 por $18,000.00 MXN vence el martes 10 de noviembre. Quedo atento."],
  ["d3", "Negocio demo 4", "F-0120", "$12,500.00", "VENCE 14 NOV", C.niebla, "AVISO PREVIO", "La factura F-0120 por $12,500.00 MXN vence el sábado 14 de noviembre. Te comparto los datos de pago."],
];
const HISTORY: [string, string][] = [["05 NOV", "F-0109 · pago recibido de Negocio demo 3"], ["03 NOV", "F-0112 · factura vencida, Cobrador preparó aviso"], ["31 OCT", "F-0112 · aviso previo enviado por WhatsApp"], ["28 OCT", "F-0109 · aviso previo enviado por correo"]];
const P: [string, string, string, string, string, string, string, boolean][] = [
  ["p1", "04 NOV", "TRANSFERENCIA SPEI", "REF 88213", "Negocio demo 3", "$20,000.00 MXN", "F-0109 · Acompañamiento octubre", true],
  ["p2", "05 NOV", "TRANSFERENCIA SPEI", "REF 90114", "Negocio demo 2", "$25,000.00 MXN", "F-0112 · Hito 2", false],
  ["p3", "05 NOV", "STRIPE", "PI_3Q8", "Negocio demo 16", "$500.00 USD", "F-0119 · Diagnóstico completo", false],
  ["p4", "03 NOV", "DEPÓSITO", "REF 77102", "Sin identificar", "$4,000.00 MXN", "Sin coincidencia", false],
];
const CFDI: [string, string][] = [["CLIENTE", "Negocio demo 2"], ["RFC", "XAXX010101000"], ["RÉGIMEN FISCAL", "601 · General de Ley Personas Morales"], ["USO DE CFDI", "G03 · Gastos en general"], ["FORMA DE PAGO", "03 · Transferencia electrónica"], ["MÉTODO DE PAGO", "PPD · Pago en parcialidades o diferido"], ["CONCEPTO", "Hito 3 · Módulo POS y caja · $40,000.00 + IVA"]];

export default function Facturacion() {
  const { flash } = useUI();
  const [tab, setTab] = useState(TABS[0]);
  const [cfdi, setCfdi] = useState(false);
  const [sent, setSent] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);

  const tCot = tab === "Cotizaciones";
  const showTable = tCot || tab === "Facturas";
  const table = tCot
    ? { cols: W1, head: ["FOLIO", "CLIENTE", "MONTO", "VIGENCIA", "ESTADO", "ABIERTA"], rows: QUOTES.map((r, i) => ({ key: r[0], bg: i === 0 ? "rgba(238,235,228,0.05)" : "transparent", onClick: undefined as (() => void) | undefined, cells: [mo(r[0], { c: C.papel }), tx(r[1]), mo(r[2], { c: C.papel }), mo(r[3]), ch(r[4], SC[r[4]]), mo(r[5], { c: r[4] === "ABIERTA" ? C.papel : C.niebla })] })) }
    : { cols: W2, head: ["FOLIO", "CLIENTE", "CONCEPTO", "MONTO", "MONEDA", "ESTADO", "PAGO"], rows: INVOICES.map((r) => ({ key: r[0], bg: "transparent", onClick: r[5] === "BORRADOR" ? () => setCfdi(true) : undefined, cells: [mo(r[0], { c: C.papel }), tx(r[1]), tx(r[2], { c: C.niebla }), mo(r[3], { c: C.papel }), mo(r[4]), ch(r[5], SC[r[5]]), mo(r[6], { c: r[5] === "VENCIDA" ? C.oxido : C.niebla })] })) };

  return (
    <div style={{ paddingBottom: 56 }}>
      {/* El prototipo usa una animación "slide" que no existe en globals.css */}
      <style>{`@keyframes factSlide{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}`}</style>

      {/* Encabezado de pantalla */}
      <section style={{ padding: "34px 32px 0", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, ...LBL }}><span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)" }} />08 · FACTURACIÓN · CFDI CON FACTURAPI</div>
          <h1 style={{ margin: "8px 0 0", fontWeight: 900, fontSize: 44, letterSpacing: "-0.02em", lineHeight: 1 }}>FACTURACIÓN</h1>
          <div style={{ fontWeight: 300, fontSize: 16, color: C.niebla, marginTop: 6 }}>$55,500.00 MXN por cobrar · 1 factura vencida</div>
        </div>
        <H as="button" type="button" onClick={() => setCfdi(true)} style={{ height: 48, padding: "0 22px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 28px rgba(176,81,57,.45)" }} hover={{ background: C.oxidoHover }}>Emitir CFDI</H>
      </section>

      {/* Pestañas */}
      <nav style={{ display: "flex", gap: 6, padding: "22px 32px 0" }}>
        {TABS.map((l) => {
          const a = l === tab;
          return (
            <H key={l} as="button" type="button" onClick={() => setTab(l)}
              style={{ height: 44, padding: "0 18px", borderRadius: 999, border: `1px solid ${a ? C.papel : "rgba(238,235,228,0.09)"}`, background: a ? C.papel : "rgba(22,26,33,0.55)", color: a ? C.tinta : C.papel, fontSize: 13, cursor: "pointer" }}
              hover={{ borderColor: C.acero }}>
              {l}
            </H>
          );
        })}
      </nav>

      <section style={{ padding: "22px 32px 0" }}>
        {/* Cotizaciones / Facturas */}
        {showTable && (
          <div style={{ display: "grid", gridTemplateColumns: tCot ? "minmax(0,1fr) 400px" : "minmax(0,1fr)", gap: 16, alignItems: "start" }}>
            <div style={{ ...GLASS, border: "1px solid rgba(238,235,228,0.09)", boxShadow: "inset 0 1px 0 rgba(238,235,228,0.08)", borderRadius: 24, overflow: "hidden", animation: "rise .6s ease both" }}>
              <div style={{ display: "grid", gridTemplateColumns: table.cols, gap: 16, padding: "14px 22px", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>
                {table.head.map((h) => <span key={h} style={LBL}>{h}</span>)}
              </div>
              {table.rows.map((r) => (
                <H key={r.key} onClick={r.onClick}
                  style={{ display: "grid", gridTemplateColumns: table.cols, gap: 16, padding: "14px 22px", borderBottom: "1px solid rgba(238,235,228,0.06)", alignItems: "center", cursor: "pointer", background: r.bg, transition: "background .2s" }}
                  hover={{ background: "rgba(238,235,228,0.04)" }}>
                  {r.cells.map((c, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: c.align, fontFamily: c.font, fontSize: c.size, letterSpacing: c.ls, fontWeight: c.w, color: c.color, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: c.dot, boxShadow: `0 0 8px ${c.dot}` }} />}
                      {c.t}
                    </span>
                  ))}
                </H>
              ))}
            </div>
            {tCot && (
              <div style={{ background: C.papel, color: C.tinta, borderRadius: 8, padding: 30, boxShadow: "0 30px 60px rgba(0,0,0,0.45)", animation: "factSlide .5s ease both", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", color: C.acero }}>RONIN STUDIO · COTIZACIÓN C-0034</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.16em", color: C.acero }}>VIGENTE AL 20 NOV</span>
                </div>
                <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1 }}>NEGOCIO DEMO 7</div>
                <div style={{ fontWeight: 300, fontSize: 13, color: C.acero }}>Plataforma de expedientes y citas · Notaría</div>
                <div style={{ borderTop: `1px solid ${C.tinta}`, marginTop: 6 }} />
                {CONCEPTS.map(([t, v]) => (
                  <div key={t} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #D6D2C9" }}><span>{t}</span><span style={{ fontFamily: MONO }}>{v}</span></div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.acero }}><span>Crédito del diagnóstico</span><span style={{ fontFamily: MONO }}>−$10,000.00</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}><span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em" }}>TOTAL MXN</span><span style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em" }}>$100,000.00</span></div>
                <button type="button" onClick={() => flash("Cotización C-0034 enviada a Negocio demo 7")} style={{ height: 42, borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 6 }}>Aprobar y enviar</button>
              </div>
            )}
          </div>
        )}

        {/* Cobranza */}
        {tab === "Cobranza" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {D.map(([id, client, fid, amount, st, dot, level, msg], i) => {
                const isSent = sent.includes(id);
                const hot = dot === C.oxido && !isSent;
                return (
                  <div key={id} style={{ ...GLASS, border: `1px solid ${hot ? C.oxido : "rgba(238,235,228,0.09)"}`, boxShadow: hot ? "0 0 28px rgba(176,81,57,0.3)" : "none", borderRadius: 24, padding: 20, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, animation: "rise .5s ease both", animationDelay: 0.06 * i + "s" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-0.01em" }}>{client}</span><span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue }}>{fid}</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", marginTop: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, animation: dot === C.oxido ? "pulseOx 2.2s infinite" : "none" }} />{st}</div>
                      <div style={{ marginTop: 12, background: "rgba(12,15,20,0.5)", border: `1px dashed ${C.borde2}`, borderRadius: 14, padding: "10px 12px" }}>
                        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", color: C.tenue, marginBottom: 4 }}>BORRADOR DE IA · COBRADOR · {level}</div>
                        <div style={{ fontSize: 13, color: C.niebla, lineHeight: 1.5 }}>{msg}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontWeight: 300, fontSize: 26, letterSpacing: "-0.02em" }}>{amount} MXN</span>
                      {!isSent && <button type="button" onClick={() => { setSent((x) => [...x, id]); flash("Recordatorio enviado por WhatsApp"); }} style={{ height: 38, padding: "0 16px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Aprobar y enviar</button>}
                      {isSent && <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.olivo }}>ENVIADO · WHATSAPP</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ ...GLASS, border: "1px solid rgba(238,235,228,0.09)", borderRadius: 24, padding: 22, alignSelf: "start" }}>
              <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em" }}>HISTORIAL DE AVISOS</div>
              {HISTORY.map(([d, t]) => (
                <div key={d + t} style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 10, padding: "11px 0", borderBottom: "1px solid rgba(238,235,228,0.06)" }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue }}>{d}</span>
                  <span style={{ fontSize: 13 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conciliación */}
        {tab === "Conciliación" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16 }}>
            {P.map(([id, date, via, ref, who, amount, match, pre]) => {
              const ok = pre || matched.includes(id);
              const none = match === "Sin coincidencia";
              return (
                <div key={id} style={{ ...GLASS, border: `1px solid ${ok ? "rgba(76,129,65,0.6)" : "rgba(238,235,228,0.09)"}`, boxShadow: ok ? "0 0 24px rgba(76,129,65,0.2)" : "none", borderRadius: 24, padding: 20, display: "flex", flexDirection: "column", gap: 10, transition: "border-color .3s,box-shadow .3s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue }}><span>{date} · {via}</span><span>{ref}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontSize: 15 }}>{who}</span><span style={{ fontWeight: 300, fontSize: 24, letterSpacing: "-0.02em" }}>{amount}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: C.niebla }}>Sugerencia: {match}</span>
                    <button type="button" onClick={() => { if (ok || none) return; setMatched((x) => [...x, id]); flash("Pago conciliado · complemento de pago listo"); }}
                      style={{ height: 36, padding: "0 16px", borderRadius: 999, background: ok ? "transparent" : none ? "transparent" : C.oxido, color: ok ? C.olivo : C.papel, border: `1px solid ${ok ? C.olivo : none ? C.borde2 : C.oxido}`, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {ok ? "Conciliado" : none ? "Asignar" : "Marcar como pagado"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Cajón de emisión de CFDI */}
      {cfdi && (
        <>
          <div onClick={() => setCfdi(false)} style={{ position: "fixed", inset: 0, background: "rgba(7,9,12,0.6)", zIndex: 40 }} />
          <aside style={{ position: "fixed", top: 16, right: 16, bottom: 16, width: 460, zIndex: 41, background: "rgba(19,23,29,0.85)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(238,235,228,0.1)", borderRadius: 28, padding: 26, display: "flex", flexDirection: "column", gap: 14, overflow: "auto", animation: "factSlide .35s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={LBL}>EMISIÓN · FACTURAPI · CFDI 4.0</div>
                <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", marginTop: 6 }}>F-0121 · HITO 3</div>
              </div>
              <button type="button" onClick={() => setCfdi(false)} style={{ width: 40, height: 40, borderRadius: "50%", background: C.papel, color: C.tinta, border: "none", cursor: "pointer" }}>✕</button>
            </div>
            {CFDI.map(([k, v]) => (
              <label key={k} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={LBL}>{k}</span>
                <span style={{ height: 44, borderRadius: 12, background: C.p2, border: `1px solid ${C.borde}`, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 14 }}>{v}</span>
              </label>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `1px solid ${C.borde}`, paddingTop: 14 }}>
              <span style={LBL}>TOTAL CON IVA</span>
              <span style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em" }}>$46,400.00 MXN</span>
            </div>
            <button type="button" onClick={() => { setCfdi(false); flash("CFDI timbrado · F-0121 emitida"); }} style={{ height: 48, borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 24px rgba(176,81,57,.45)" }}>Aprobar y timbrar</button>
          </aside>
        </>
      )}
    </div>
  );
}
