"use client";
import React, { useEffect, useMemo, useState } from "react";
import { C, MONO, SANS } from "@/lib/tokens";
import { H, PB } from "@/components/ui";
import { useUI, PageHead } from "@/components/shell";
import { datos, eq, fechaCorta, hoyISO } from "@/lib/datos";
import { SECTORES } from "@/lib/flujos";

/* ---------- Datos demo (idénticos al prototipo) ---------- */
type Stage = "LEAD" | "CONTACTADO" | "LLAMADA" | "DIAGNÓSTICO" | "PROPUESTA" | "CLIENTE" | "PERDIDO";
type Client = { id: string; name: string; sector: string; city: string; stage: Stage; origin: string; last: string; next: string; late: boolean; owner: string; nextStep?: string; nextDate?: string | null; perfil?: string | null; razon?: string | null; creado?: string };
type FilaCliente = { id: string; nombre: string; sector: string; ciudad: string | null; etapa_embudo: string; origen: string | null; siguiente_paso: string | null; siguiente_fecha: string | null; perfil_ia: string | null; razon_perdida: string | null; creado_en: string; actualizado_en: string };
type Contacto = { id: string; cliente_id: string; nombre: string; puesto: string | null; whatsapp: string | null; correo: string | null; decide: boolean };
const ETAPA_DB: Record<Stage, string> = { LEAD: "Lead", CONTACTADO: "Contactado", LLAMADA: "Llamada", "DIAGNÓSTICO": "Diagnóstico", PROPUESTA: "Propuesta", CLIENTE: "Cliente", PERDIDO: "Perdido" };
const deFila = (f: FilaCliente): Client => {
  const stage = ((Object.keys(ETAPA_DB) as Stage[]).find((k) => ETAPA_DB[k] === f.etapa_embudo) ?? "LEAD") as Stage;
  const next = stage === "PERDIDO" ? (f.razon_perdida ?? "Sin razón") : [f.siguiente_paso, f.siguiente_fecha ? fechaCorta(f.siguiente_fecha).toUpperCase() : ""].filter(Boolean).join(" · ") || "Definir siguiente paso";
  return { id: f.id, name: f.nombre, sector: f.sector, city: f.ciudad ?? "—", stage, origin: f.origen ?? "—", last: fechaCorta(f.actualizado_en).toUpperCase(), next, late: stage !== "PERDIDO" && !!f.siguiente_fecha && f.siguiente_fecha < hoyISO(), owner: "JC", nextStep: f.siguiente_paso ?? "", nextDate: f.siguiente_fecha, perfil: f.perfil_ia, razon: f.razon_perdida, creado: f.creado_en };
};
const ORIGENES = ["Instagram", "LinkedIn", "TikTok", "YouTube", "Referido", "Diagnóstico exprés", "Sitio web", "Otro"];

const STAGES: Stage[] = ["LEAD", "CONTACTADO", "LLAMADA", "DIAGNÓSTICO", "PROPUESTA", "CLIENTE", "PERDIDO"];
const STC: Record<Stage, string> = { LEAD: C.tenue, CONTACTADO: C.niebla, LLAMADA: C.ambar, "DIAGNÓSTICO": C.oxido, PROPUESTA: C.oxido, CLIENTE: C.olivo, PERDIDO: C.acero };
const INIT: Client[] = [
  { id: "1", name: "Negocio demo 1", sector: "Escuela privada", city: "Juárez", stage: "DIAGNÓSTICO", origin: "Instagram", last: "04 NOV", next: "Visita · 10 NOV", late: false, owner: "JC" },
  { id: "2", name: "Negocio demo 2", sector: "Restaurante con sucursales", city: "Juárez", stage: "CLIENTE", origin: "Referido", last: "05 NOV", next: "Cobrar F-0112 · 02 NOV", late: true, owner: "JC" },
  { id: "3", name: "Negocio demo 3", sector: "Clínica", city: "El Paso", stage: "CLIENTE", origin: "LinkedIn", last: "30 OCT", next: "Reporte · 30 NOV", late: false, owner: "JC" },
  { id: "4", name: "Negocio demo 4", sector: "Clínica", city: "Chihuahua", stage: "CLIENTE", origin: "TikTok", last: "03 NOV", next: "Hito 2 · 03 NOV", late: true, owner: "JC" },
  { id: "7", name: "Negocio demo 7", sector: "Notaría", city: "Juárez", stage: "PROPUESTA", origin: "Diagnóstico exprés", last: "02 NOV", next: "Seguimiento · 06 NOV", late: false, owner: "JC" },
  { id: "9", name: "Negocio demo 9", sector: "Gimnasio", city: "Juárez", stage: "LLAMADA", origin: "Instagram", last: "01 NOV", next: "Llamada · 05 NOV", late: false, owner: "JC" },
  { id: "10", name: "Negocio demo 10", sector: "Taller", city: "Juárez", stage: "CONTACTADO", origin: "Diagnóstico exprés", last: "29 OCT", next: "Agendar llamada · 03 NOV", late: true, owner: "JC" },
  { id: "11", name: "Negocio demo 11", sector: "Restaurante con sucursales", city: "El Paso", stage: "LEAD", origin: "Instagram", last: "—", next: "Primer contacto · 06 NOV", late: false, owner: "JC" },
  { id: "12", name: "Negocio demo 12", sector: "Escuela privada", city: "Chihuahua", stage: "LEAD", origin: "YouTube", last: "—", next: "Primer contacto · 06 NOV", late: false, owner: "JC" },
  { id: "13", name: "Negocio demo 13", sector: "Clínica", city: "Juárez", stage: "PERDIDO", origin: "TikTok", last: "20 OCT", next: "Precio", late: false, owner: "JC" },
];

const TABS = ["Lista", "Tablero de embudo", "Ficha del cliente"] as const;
type Tab = (typeof TABS)[number];
const SECTORS = ["Todos", ...SECTORES];
const REASONS = ["Precio", "Tiempo del equipo", "Ya tienen un sistema", "No es prioridad", "Cortina de humo"];
const W = "1.4fr 1.5fr 0.9fr 1.1fr 1.1fr 0.8fr 1.6fr 60px";
const HEAD = ["NEGOCIO", "SECTOR", "CIUDAD", "ETAPA", "ORIGEN", "ÚLTIMO", "SIGUIENTE PASO", "RESP."];

/* ---------- Celdas (tx / mo del prototipo) ---------- */
type CellV = { t: string; color: string; font: string; size: string; ls: string; w: number; dot: string | null };
const tx = (t: string, o: { c?: string; w?: number; dot?: string } = {}): CellV => ({ t, color: o.c || C.papel, font: SANS, size: "14px", ls: "0", w: o.w || 400, dot: o.dot || null });
const mo = (t: string, o: { c?: string; dot?: string } = {}): CellV => ({ t, color: o.c || C.niebla, font: MONO, size: "11px", ls: "0.08em", w: 400, dot: o.dot || null });

/* ---------- Píldora local (44px pestañas / 36px filtros, como el prototipo) ---------- */
function Pill({ label, active, onClick, h = 44, px = 18, fs = 13, hover = true }: { label: string; active: boolean; onClick: () => void; h?: number; px?: number; fs?: number; hover?: boolean }) {
  return (
    <H as="button" type="button" onClick={onClick}
      style={{ height: h, padding: `0 ${px}px`, borderRadius: 999, border: `1px solid ${active ? C.papel : "rgba(238,235,228,0.09)"}`, background: active ? C.papel : "rgba(22,26,33,0.55)", color: active ? C.tinta : C.papel, fontSize: fs, cursor: "pointer", whiteSpace: "nowrap" }}
      hover={hover ? { borderColor: C.acero } : undefined}>
      {label}
    </H>
  );
}

const MONO10: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue };
const GLASS: React.CSSProperties = { background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: "1px solid rgba(238,235,228,0.09)", boxShadow: "inset 0 1px 0 rgba(238,235,228,0.08)" };

/* ---------- Contenido estático de la ficha ---------- */
const CONTACTS = [["DR", "Directora general", "DIRECCIÓN", true], ["CE", "Control escolar", "COORDINACIÓN", false], ["AD", "Administración", "FINANZAS", false]] as const;
const TIMELINE: { date: string; kind: string; title: string; note: string; dot: string; glow: string; call: { k: string; v: string }[] | null }[] = [
  { date: "04 NOV", kind: "LLAMADA · 15 MIN", title: "Llamada con dirección", note: "Agendamos visita de diagnóstico completo para el martes 10.", dot: C.oxido, glow: "0 0 14px rgba(176,81,57,.7)", call: [["PUNTO A", "Inscripciones y pagos en hojas de cálculo separadas"], ["PUNTO B", "Un solo registro por alumno, de inscripción a cobro"], ["INTENTOS PREVIOS", "Sistema escolar genérico, abandonado en 2025"], ["COSTO DE NO ACTUAR", "Unas 20 horas al mes de captura doble"]].map(([k, v]) => ({ k, v })) },
  { date: "30 OCT", kind: "MENSAJE · WHATSAPP", title: "Seguimiento del diagnóstico exprés", note: "Respondió el mismo día; pidió llamada la semana siguiente.", dot: C.papel, glow: "none", call: null },
  { date: "28 OCT", kind: "DIAGNÓSTICO EXPRÉS", title: "Llenó el diagnóstico en el sitio", note: "Tres hallazgos: captura doble, cobranza manual, reportes tardíos.", dot: C.papel, glow: "none", call: null },
  { date: "27 OCT", kind: "CONTENIDO", title: "Guardó el carrusel “El chatbot que nadie usa”", note: "Primera interacción registrada desde Instagram.", dot: C.acero, glow: "none", call: null },
];
const PROFILE = ["Escuela privada de 60 personas con dos planteles en Juárez.", "El dolor principal es la captura doble entre inscripción y cobranza.", "Ya probó un sistema genérico y el equipo lo abandonó.", "Decide la directora; control escolar será quien más lo use.", "Siguiente paso sugerido: visita con guía de escuelas."];
const EXPRESS = [["Personas", "60"], ["Hallazgo 1", "Captura doble"], ["Horas estimadas al mes", "20"]];

export default function Clientes() {
  const { flash } = useUI();
  const [tab, setTab] = useState<Tab>("Lista");
  const [sector, setSector] = useState("Todos");
  const [clients, setClients] = useState<Client[]>([]);
  const [db, setDb] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [sel, setSel] = useState<string | null>(null);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [over, setOver] = useState<Stage | null>(null);
  const [loss, setLoss] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [nota, setNota] = useState("");
  const [noteFocus, setNoteFocus] = useState(false);
  const [nuevo, setNuevo] = useState(false);

  // Con Supabase: clientes reales (vacío al inicio). Sin Supabase: los demo del prototipo.
  useEffect(() => {
    datos.lista<FilaCliente>("clientes", "select=*&order=actualizado_en.desc")
      .then((r) => { if (r.db) { setDb(true); setClients(r.filas.map(deFila)); } else setClients(INIT); })
      .catch((e) => flash("No se pudieron cargar los clientes: " + (e as Error).message))
      .finally(() => setCargando(false));
  }, [flash]);
  useEffect(() => {
    if (!db || !sel) { setContactos([]); return; }
    datos.lista<Contacto>("contactos", `select=*&${eq("cliente_id", sel)}&order=decide.desc`).then((r) => setContactos(r.filas)).catch(() => setContactos([]));
  }, [db, sel]);

  const subtitle = cargando ? "Cargando…" : `${clients.length} negocios · ${clients.filter((c) => c.late).length} con siguiente paso vencido`;
  const openFicha = (id?: string) => { if (id) setSel(id); setTab("Ficha del cliente"); };
  const ficha = clients.find((c) => c.id === sel) ?? (db ? clients[0] : undefined);

  const patch = async (id: string, cambios: Partial<FilaCliente>) => {
    if (!db) return true;
    try { const r = await datos.cambia<FilaCliente>("clientes", eq("id", id), cambios); if (r.filas[0]) setClients((x) => x.map((c) => (c.id === id ? deFila(r.filas[0]) : c))); return true; }
    catch (e) { flash("No se guardó: " + (e as Error).message); return false; }
  };
  const move = (id: string, stage: Stage) => {
    if (stage === "PERDIDO") { setLoss(id); setReason(null); setNota(""); setOver(null); return; }
    setClients((s) => s.map((c) => (c.id === id ? { ...c, stage } : c)));
    setOver(null);
    void patch(id, { etapa_embudo: ETAPA_DB[stage] });
    flash("Movido a " + stage.toLowerCase());
  };
  const openLoss = () => { setLoss(ficha?.id ?? "1"); setReason(null); setNota(""); };
  const closeLoss = () => setLoss(null);
  const confirmLoss = async () => {
    const id = loss; if (!id) return;
    const r = [reason, nota.trim()].filter(Boolean).join(" · ") || "Sin razón";
    setClients((x) => x.map((c) => (c.id === id ? { ...c, stage: "PERDIDO", next: reason || "Sin razón", late: false } : c)));
    setLoss(null);
    await patch(id, { etapa_embudo: "Perdido", razon_perdida: r });
    flash("Pérdida registrada");
  };
  const crear = async (f: NuevoCliente) => {
    if (!db) { const c: Client = { id: String(Date.now()), name: f.nombre, sector: f.sector, city: f.ciudad || "—", stage: "LEAD", origin: f.origen, last: "—", next: f.paso || "Primer contacto", late: false, owner: "JC" }; setClients((x) => [c, ...x]); setNuevo(false); flash("Cliente agregado (modo demo, no se guarda)"); return; }
    try {
      const r = await datos.crea<FilaCliente>("clientes", { nombre: f.nombre, sector: f.sector, ciudad: f.ciudad || null, origen: f.origen, etapa_embudo: "Lead", siguiente_paso: f.paso || "Primer contacto", siguiente_fecha: f.fecha || null });
      const c = r.filas[0];
      if (c && f.contacto.trim()) await datos.crea("contactos", { cliente_id: c.id, nombre: f.contacto.trim(), puesto: f.puesto || null, whatsapp: f.whatsapp || null, correo: f.correo || null, decide: true });
      if (c) setClients((x) => [deFila(c), ...x]);
      setNuevo(false); flash(`${f.nombre} dado de alta como lead`);
    } catch (e) { flash("No se guardó: " + (e as Error).message); }
  };

  const rows = useMemo(() => clients.filter((c) => sector === "Todos" || c.sector === sector).map((c) => ({
    id: c.id,
    cells: [
      tx(c.name, { w: 600 }), tx(c.sector, { c: C.niebla }), mo(c.city.toUpperCase()),
      { ...mo(c.stage, { c: C.papel }), dot: STC[c.stage], size: "10px", ls: "0.12em" },
      mo(c.origin.toUpperCase()), mo(c.last), mo(c.next.toUpperCase(), { c: c.late ? C.oxido : C.papel }), mo(c.owner, { c: C.papel }),
    ] as CellV[],
  })), [clients, sector]);

  const lossC = clients.find((c) => c.id === loss);
  const lossName = (lossC?.name ?? "NEGOCIO DEMO 1").toUpperCase();

  return (
    <>
      <PageHead stage={0} eyebrow="03 · CLIENTES Y PERFIL" title="CLIENTES" sub={subtitle} style={{ padding: "34px 32px 0", animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}
        right={<PB style={{ height: 48, padding: "0 22px", fontSize: 14, boxShadow: "0 0 28px rgba(176,81,57,.45)" }} onClick={() => setNuevo(true)}>Nuevo cliente</PB>} />

      <nav style={{ display: "flex", gap: 6, padding: "22px 32px 0" }}>
        {TABS.map((t) => <Pill key={t} label={t} active={tab === t} onClick={() => setTab(t)} />)}
      </nav>

      <section style={{ padding: "22px 32px 56px" }}>
        {/* ---------- LISTA ---------- */}
        {tab === "Lista" && (
          <>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 14 }}>
              <span style={{ ...MONO10, marginRight: 6 }}>SECTOR</span>
              {SECTORS.map((l) => <Pill key={l} label={l} active={sector === l} onClick={() => setSector(l)} h={36} px={14} fs={12} hover={false} />)}
            </div>
            <div style={{ ...GLASS, borderRadius: 24, overflow: "hidden", animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}>
              <div style={{ display: "grid", gridTemplateColumns: W, gap: 16, padding: "14px 22px", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>
                {HEAD.map((h) => <span key={h} style={MONO10}>{h}</span>)}
              </div>
              {!cargando && rows.length === 0 && <div style={{ padding: "26px 22px", fontSize: 13.5, color: C.niebla }}>{clients.length === 0 ? <>Todavía no hay clientes. Da de alta el primero con <strong style={{ color: C.papel }}>Nuevo cliente</strong>; los leads del diagnóstico exprés también caerán aquí.</> : "Ningún cliente en ese sector."}</div>}
              {rows.map((r) => (
                <H key={r.id} onClick={() => openFicha(r.id)}
                  style={{ display: "grid", gridTemplateColumns: W, gap: 16, padding: "14px 22px", borderBottom: "1px solid rgba(238,235,228,0.06)", alignItems: "center", cursor: "pointer", transition: "background .2s" }}
                  hover={{ background: "rgba(238,235,228,0.04)" }}>
                  {r.cells.map((c, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "flex-start", fontFamily: c.font, fontSize: c.size, letterSpacing: c.ls, fontWeight: c.w, color: c.color, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: c.dot, boxShadow: `0 0 8px ${c.dot}` }} />}
                      {c.t}
                    </span>
                  ))}
                </H>
              ))}
            </div>
          </>
        )}

        {/* ---------- TABLERO DE EMBUDO ---------- */}
        {tab === "Tablero de embudo" && (
          <>
            <div style={{ ...MONO10, marginBottom: 12 }}>ARRASTRA UNA TARJETA PARA CAMBIAR DE ETAPA</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 10, alignItems: "start" }}>
              {STAGES.map((st) => {
                const cards = clients.filter((c) => c.stage === st);
                const ov = over === st;
                return (
                  <div key={st}
                    onDragOver={(e) => { e.preventDefault(); if (over !== st) setOver(st); }}
                    onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) move(id, st); }}
                    style={{ minHeight: 520, borderRadius: 22, background: ov ? "rgba(176,81,57,0.12)" : "rgba(22,26,33,0.35)", border: `1px solid ${ov ? C.oxido : "rgba(238,235,228,0.07)"}`, padding: 10, display: "flex", flexDirection: "column", gap: 8, transition: "background .2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 6px 8px" }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: st === "PERDIDO" ? C.tenue : C.niebla }}>{st}</span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{cards.length}</span>
                    </div>
                    {cards.map((c) => {
                      const dot = c.late ? C.oxido : STC[c.stage];
                      return (
                        <H key={c.id} draggable onClick={() => openFicha(c.id)}
                          onDragStart={(e: React.DragEvent) => { e.dataTransfer.setData("text/plain", String(c.id)); }}
                          style={{ background: "rgba(22,26,33,0.7)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${c.late ? C.oxido : "rgba(238,235,228,0.09)"}`, boxShadow: c.late ? "0 0 22px rgba(176,81,57,0.3)" : "none", borderRadius: 16, padding: 12, cursor: "grab", display: "flex", flexDirection: "column", gap: 6, animation: "rise .45s cubic-bezier(.2,.7,.2,1) both", transition: "transform .2s" }}
                          hover={{ transform: "translateY(-2px)" }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.tenue }}>{c.sector.toUpperCase()}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: c.late ? C.papel : C.tenue }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />{c.next.toUpperCase()}
                          </span>
                        </H>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ---------- FICHA DEL CLIENTE ---------- */}
        {tab === "Ficha del cliente" && db && (
          <FichaReal cliente={ficha} clientes={clients} contactos={contactos} onSelect={setSel} onLoss={openLoss}
            onPaso={async (paso, fecha) => { if (ficha && await patch(ficha.id, { siguiente_paso: paso, siguiente_fecha: fecha || null })) flash("Siguiente paso guardado"); }}
            onContacto={async (c) => { if (!ficha) return; try { const r = await datos.crea<Contacto>("contactos", { ...c, cliente_id: ficha.id }); setContactos((x) => [...x, ...r.filas]); flash("Contacto agregado"); } catch (e) { flash("No se guardó: " + (e as Error).message); } }} />
        )}
        {tab === "Ficha del cliente" && !db && (
          <>
            <div style={{ ...GLASS, borderRadius: 28, padding: 26, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
                <div>
                  <div style={MONO10}>ESCUELA PRIVADA · 60 PERSONAS · 2 SUCURSALES · CIUDAD JUÁREZ</div>
                  <div style={{ fontWeight: 900, fontSize: 34, letterSpacing: "-0.02em", marginTop: 6 }}>NEGOCIO DEMO 1</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", padding: "10px 14px", borderRadius: 999, border: `1px solid ${C.oxido}`, boxShadow: "0 0 20px rgba(176,81,57,.3)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.oxido, animation: "blink 1.6s infinite" }} />DIAGNÓSTICO
                  </span>
                  <button type="button" onClick={openLoss} style={{ height: 40, padding: "0 16px", borderRadius: 999, background: "transparent", color: C.niebla, border: `1px solid ${C.borde2}`, fontSize: 13, cursor: "pointer" }}>Marcar como perdido</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 20 }}>
                {CONTACTS.map(([ini, name, role, decide]) => (
                  <div key={ini} style={{ background: "rgba(12,15,20,0.45)", border: "1px solid rgba(238,235,228,0.08)", borderRadius: 18, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 42, height: 42, borderRadius: "50%", background: C.p3, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{ini}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14 }}>{name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.tenue, marginTop: 3 }}>{role}</div>
                    </div>
                    {decide && <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", padding: "4px 8px", borderRadius: 999, background: C.papel, color: C.tinta }}>DECIDE</span>}
                    <span style={{ height: 32, padding: "0 12px", borderRadius: 999, background: "#25D366", color: C.tinta, display: "flex", alignItems: "center", fontSize: 11, fontWeight: 600 }}>WhatsApp</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 400px", gap: 16, marginTop: 16 }}>
              <div style={{ background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: "1px solid rgba(238,235,228,0.09)", borderRadius: 28, padding: 26, animation: "rise .7s cubic-bezier(.2,.7,.2,1) both", animationDelay: ".1s" }}>
                <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em", marginBottom: 10 }}>LÍNEA DE TIEMPO</div>
                {TIMELINE.map((e) => (
                  <div key={e.date} style={{ display: "grid", gridTemplateColumns: "90px 22px 1fr", gap: 14 }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue, paddingTop: 16 }}>{e.date}</span>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ width: 1, height: 16, background: C.borde2 }} />
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: e.dot, boxShadow: e.glow, flexShrink: 0 }} />
                      <span style={{ width: 1, flex: 1, background: C.borde2 }} />
                    </div>
                    <div style={{ padding: "12px 0 18px" }}>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.niebla }}>{e.kind}</div>
                      <div style={{ fontSize: 15, marginTop: 4 }}>{e.title}</div>
                      <div style={{ fontSize: 13, color: C.niebla, marginTop: 4, lineHeight: 1.5, textWrap: "pretty" }}>{e.note}</div>
                      {e.call && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8, marginTop: 10 }}>
                          {e.call.map((q) => (
                            <div key={q.k} style={{ background: "rgba(12,15,20,0.45)", border: "1px solid rgba(238,235,228,0.07)", borderRadius: 14, padding: "10px 12px" }}>
                              <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", color: C.tenue }}>{q.k}</div>
                              <div style={{ fontSize: 13, marginTop: 4 }}>{q.v}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "rgba(238,235,228,0.92)", color: C.tinta, borderRadius: 28, padding: 22, animation: "rise .7s cubic-bezier(.2,.7,.2,1) both", animationDelay: ".2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.acero }}>
                      <span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)" }} />BORRADOR DE IA · PERFILADOR
                    </span>
                    <button type="button" onClick={() => flash("El Perfilador está regenerando el resumen")} style={{ height: 30, padding: "0 12px", borderRadius: 999, background: C.tinta, color: C.papel, border: "none", fontSize: 11, cursor: "pointer" }}>Regenerar</button>
                  </div>
                  {PROFILE.map((p) => <div key={p} style={{ fontSize: 13, lineHeight: 1.45, padding: "9px 0", borderBottom: "1px solid #D6D2C9", textWrap: "pretty" }}>{p}</div>)}
                </div>
                <div style={{ background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)", border: "1px solid rgba(238,235,228,0.09)", borderRadius: 28, padding: 22 }}>
                  <div style={{ ...MONO10, marginBottom: 8 }}>DIAGNÓSTICO EXPRÉS · 28 OCT</div>
                  {EXPRESS.map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(238,235,228,0.06)", fontSize: 13 }}>
                      <span style={{ color: C.niebla }}>{k}</span><span style={{ textAlign: "right" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: 13 }}><span style={{ color: C.niebla }}>Objeción principal</span><span>Tiempo del equipo</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0", fontSize: 13 }}><span style={{ color: C.niebla }}>Llegó por</span><span>Carrusel · El chatbot que nadie usa</span></div>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {nuevo && <NuevoClienteModal onClose={() => setNuevo(false)} onSave={(f) => void crear(f)} />}

      {/* ---------- Registro de pérdida ---------- */}
      {loss !== null && (
        <>
          <div onClick={closeLoss} style={{ position: "fixed", inset: 0, background: "rgba(7,9,12,0.65)", zIndex: 40 }} />
          <div style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 520, zIndex: 41, background: "rgba(19,23,29,0.85)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(238,235,228,0.1)", borderRadius: 28, padding: 26, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={MONO10}>REGISTRO DE PÉRDIDA · {lossName}</div>
            <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em" }}>¿POR QUÉ SE PERDIÓ?</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {REASONS.map((l) => (
                <button key={l} type="button" onClick={() => setReason(l)} style={{ height: 44, borderRadius: 14, border: `1px solid ${reason === l ? C.oxido : C.borde}`, background: reason === l ? "rgba(176,81,57,0.2)" : C.p2, color: C.papel, fontSize: 13, cursor: "pointer", textAlign: "left", padding: "0 14px" }}>{l}</button>
              ))}
            </div>
            <div style={MONO10}>NOTA</div>
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Qué dijo y qué haríamos distinto" onFocus={() => setNoteFocus(true)} onBlur={() => setNoteFocus(false)}
              style={{ height: 90, borderRadius: 14, background: C.p2, border: `1px solid ${noteFocus ? C.oxido : C.borde}`, color: C.papel, padding: 12, fontSize: 13, resize: "none", outline: "none" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" onClick={closeLoss} style={{ height: 42, padding: "0 18px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.borde2}`, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button type="button" onClick={() => void confirmLoss()} style={{ height: 42, padding: "0 18px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Registrar pérdida</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ---------- Ficha con datos reales ---------- */
const INP: React.CSSProperties = { height: 42, padding: "0 14px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 13, outline: "none", width: "100%", colorScheme: "dark" };
const WA = (n: string) => "https://wa.me/" + n.replace(/\D/g, "").replace(/^(\d{10})$/, "52$1");

function FichaReal({ cliente, clientes, contactos, onSelect, onLoss, onPaso, onContacto }: { cliente?: Client; clientes: Client[]; contactos: Contacto[]; onSelect: (id: string) => void; onLoss: () => void; onPaso: (paso: string, fecha: string) => void; onContacto: (c: Omit<Contacto, "id" | "cliente_id">) => void }) {
  const [paso, setPaso] = useState(""); const [fecha, setFecha] = useState("");
  const [nc, setNc] = useState({ nombre: "", puesto: "", whatsapp: "", correo: "", decide: false }); const [abrir, setAbrir] = useState(false);
  useEffect(() => { setPaso(cliente?.nextStep ?? ""); setFecha(cliente?.nextDate ?? ""); }, [cliente?.id, cliente?.nextStep, cliente?.nextDate]);
  if (!cliente) return <div style={{ ...GLASS, borderRadius: 28, padding: 26, fontSize: 13.5, color: C.niebla }}>Todavía no hay clientes. Da de alta el primero con <strong style={{ color: C.papel }}>Nuevo cliente</strong>.</div>;
  const perfil = (cliente.perfil ?? "").split(/\n+/).map((x) => x.trim()).filter(Boolean);
  return (
    <>
      <div style={{ ...GLASS, borderRadius: 28, padding: 26, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20 }}>
          <div style={{ minWidth: 0 }}>
            <div style={MONO10}>{[cliente.sector, cliente.city !== "—" ? cliente.city : "", cliente.origin !== "—" ? "LLEGÓ POR " + cliente.origin : ""].filter(Boolean).join(" · ").toUpperCase()}</div>
            <div style={{ fontWeight: 900, fontSize: 34, letterSpacing: "-0.02em", marginTop: 6 }}>{cliente.name.toUpperCase()}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <select value={cliente.id} onChange={(e) => onSelect(e.target.value)} title="Cambiar de cliente" style={{ ...INP, width: 220, appearance: "none" }}>{clientes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", padding: "10px 14px", borderRadius: 999, border: `1px solid ${STC[cliente.stage]}` }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: STC[cliente.stage] }} />{cliente.stage}
            </span>
            {cliente.stage !== "PERDIDO" && <button type="button" onClick={onLoss} style={{ height: 40, padding: "0 16px", borderRadius: 999, background: "transparent", color: C.niebla, border: `1px solid ${C.borde2}`, fontSize: 13, cursor: "pointer" }}>Marcar como perdido</button>}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 20 }}>
          {contactos.map((c) => (
            <div key={c.id} style={{ background: "rgba(12,15,20,0.45)", border: "1px solid rgba(238,235,228,0.08)", borderRadius: 18, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 42, height: 42, borderRadius: "50%", background: C.p3, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{c.nombre.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase()}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nombre}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: C.tenue, marginTop: 3 }}>{(c.puesto ?? c.correo ?? "").toUpperCase()}</div>
              </div>
              {c.decide && <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", padding: "4px 8px", borderRadius: 999, background: C.papel, color: C.tinta }}>DECIDE</span>}
              {c.whatsapp && <a href={WA(c.whatsapp)} target="_blank" rel="noreferrer" style={{ height: 32, padding: "0 12px", borderRadius: 999, background: "#25D366", color: C.tinta, display: "flex", alignItems: "center", fontSize: 11, fontWeight: 600 }}>WhatsApp</a>}
            </div>
          ))}
          {!abrir ? (
            <button type="button" onClick={() => setAbrir(true)} style={{ minHeight: 70, borderRadius: 18, border: `1px dashed ${C.borde2}`, background: "transparent", color: C.niebla, fontSize: 13, cursor: "pointer" }}>+ Agregar contacto</button>
          ) : (
            <div style={{ background: "rgba(12,15,20,0.45)", border: "1px solid rgba(238,235,228,0.08)", borderRadius: 18, padding: 12, display: "flex", flexDirection: "column", gap: 8, gridColumn: "span 2" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input placeholder="Nombre" value={nc.nombre} onChange={(e) => setNc({ ...nc, nombre: e.target.value })} style={INP} />
                <input placeholder="Puesto" value={nc.puesto} onChange={(e) => setNc({ ...nc, puesto: e.target.value })} style={INP} />
                <input placeholder="WhatsApp (10 dígitos)" inputMode="tel" value={nc.whatsapp} onChange={(e) => setNc({ ...nc, whatsapp: e.target.value })} style={INP} />
                <input placeholder="Correo" type="email" value={nc.correo} onChange={(e) => setNc({ ...nc, correo: e.target.value })} style={INP} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.niebla }}><input type="checkbox" checked={nc.decide} onChange={(e) => setNc({ ...nc, decide: e.target.checked })} />Es quien decide</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="button" onClick={() => setAbrir(false)} style={{ height: 36, padding: "0 14px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.borde2}`, fontSize: 12, cursor: "pointer" }}>Cancelar</button>
                  <PB small disabled={!nc.nombre.trim()} onClick={() => { onContacto({ nombre: nc.nombre.trim(), puesto: nc.puesto || null, whatsapp: nc.whatsapp || null, correo: nc.correo || null, decide: nc.decide }); setNc({ nombre: "", puesto: "", whatsapp: "", correo: "", decide: false }); setAbrir(false); }}>Guardar</PB>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 400px", gap: 16, marginTop: 16 }}>
        <div style={{ ...GLASS, borderRadius: 28, padding: 26, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em" }}>SIGUIENTE PASO</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 170px auto", gap: 8 }}>
            <input value={paso} onChange={(e) => setPaso(e.target.value)} placeholder="Llamada de 15 minutos, visita, enviar cotización…" style={INP} />
            <input type="date" value={fecha ?? ""} onChange={(e) => setFecha(e.target.value)} style={INP} />
            <PB small onClick={() => onPaso(paso.trim(), fecha ?? "")} style={{ height: 42 }}>Guardar</PB>
          </div>
          <div style={{ ...MONO10, marginTop: 8 }}>REGISTRO</div>
          <div style={{ fontSize: 13, color: C.niebla, lineHeight: 1.6 }}>
            Alta: {cliente.creado ? fechaCorta(cliente.creado) : "—"} · Último movimiento: {cliente.last.toLowerCase()}{cliente.razon ? ` · Razón de pérdida: ${cliente.razon}` : ""}
          </div>
          <div style={{ fontSize: 12.5, color: C.tenue }}>Las llamadas, mensajes y diagnósticos de este cliente aparecerán aquí conforme se conecten Tareas y el diagnóstico exprés.</div>
        </div>
        <div style={{ background: "rgba(238,235,228,0.92)", color: C.tinta, borderRadius: 28, padding: 22 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.acero }}>
            <span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)" }} />PERFIL · PERFILADOR
          </span>
          {perfil.length ? perfil.map((p) => <div key={p} style={{ fontSize: 13, lineHeight: 1.45, padding: "9px 0", borderBottom: "1px solid #D6D2C9" }}>{p}</div>)
            : <div style={{ fontSize: 13, lineHeight: 1.5, paddingTop: 10, color: C.acero }}>El Perfilador todavía no genera el perfil de este cliente. Cuando corra, dejará aquí cinco líneas: quién es, su dolor, intentos previos, quién decide y el siguiente paso sugerido.</div>}
        </div>
      </div>
    </>
  );
}

/* ---------- Alta de cliente ---------- */
type NuevoCliente = { nombre: string; sector: string; ciudad: string; origen: string; paso: string; fecha: string; contacto: string; puesto: string; whatsapp: string; correo: string };
function NuevoClienteModal({ onClose, onSave }: { onClose: () => void; onSave: (f: NuevoCliente) => void }) {
  const [f, setF] = useState<NuevoCliente>({ nombre: "", sector: SECTORES[0], ciudad: "Juárez", origen: "Instagram", paso: "Primer contacto", fecha: hoyISO(), contacto: "", puesto: "", whatsapp: "", correo: "" });
  const set = (k: keyof NuevoCliente) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: C.niebla }}>{t}{children}</label>;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(7,9,12,0.65)", zIndex: 40 }} />
      <div role="dialog" aria-label="Nuevo cliente" style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 600, maxWidth: "calc(100vw - 32px)", zIndex: 41, background: "rgba(19,23,29,0.92)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(238,235,228,0.1)", borderRadius: 28, padding: 26, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={MONO10}>ALTA DE CLIENTE · ENTRA COMO LEAD</div>
        <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em" }}>NUEVO CLIENTE</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {L({ t: "Negocio", children: <input autoFocus value={f.nombre} onChange={set("nombre")} placeholder="Nombre del negocio" style={INP} /> })}
          {L({ t: "Sector", children: <select value={f.sector} onChange={set("sector")} style={{ ...INP, appearance: "none" }}>{SECTORES.map((x) => <option key={x}>{x}</option>)}</select> })}
          {L({ t: "Ciudad", children: <input value={f.ciudad} onChange={set("ciudad")} style={INP} /> })}
          {L({ t: "Llegó por", children: <select value={f.origen} onChange={set("origen")} style={{ ...INP, appearance: "none" }}>{ORIGENES.map((x) => <option key={x}>{x}</option>)}</select> })}
          {L({ t: "Siguiente paso", children: <input value={f.paso} onChange={set("paso")} style={INP} /> })}
          {L({ t: "Fecha", children: <input type="date" value={f.fecha} onChange={set("fecha")} style={INP} /> })}
        </div>
        <div style={{ ...MONO10, marginTop: 4 }}>CONTACTO PRINCIPAL (OPCIONAL)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input value={f.contacto} onChange={set("contacto")} placeholder="Nombre" style={INP} />
          <input value={f.puesto} onChange={set("puesto")} placeholder="Puesto" style={INP} />
          <input value={f.whatsapp} onChange={set("whatsapp")} placeholder="WhatsApp (10 dígitos)" inputMode="tel" style={INP} />
          <input value={f.correo} onChange={set("correo")} placeholder="Correo" type="email" style={INP} />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
          <button type="button" onClick={onClose} style={{ height: 42, padding: "0 18px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.borde2}`, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
          <PB disabled={!f.nombre.trim()} onClick={() => onSave({ ...f, nombre: f.nombre.trim() })} style={{ opacity: f.nombre.trim() ? 1 : 0.6 }}>Dar de alta</PB>
        </div>
      </div>
    </>
  );
}
