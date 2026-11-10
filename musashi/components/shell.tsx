"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { C, MONO } from "@/lib/tokens";
import { H, RGlyph, Dot } from "@/components/ui";
import { TRAY, type TrayItem } from "@/lib/demo";
import { datos, eq } from "@/lib/datos";
import { accionDe, resolver } from "@/lib/propuestas";

/* ---------- Contexto de UI: toast + bandeja de aprobación ---------- */
type UI = {
  flash: (msg: string) => void;
  tray: TrayItem[];
  trayOpen: boolean;
  toggleTray: () => void;
  approve: (id: string, cuerpo?: string) => void;
  discard: (id: string) => void;
  demo: boolean;
  db: boolean;
};
const UICtx = createContext<UI | null>(null);
export const useUI = () => {
  const v = useContext(UICtx);
  if (!v) throw new Error("useUI fuera de <Shell>");
  return v;
};

export const NAV: [string, string][] = [
  ["Dashboard", "/"], ["Marketing", "/marketing"], ["Estudio", "/estudio"], ["Clientes", "/clientes"], ["Diagnósticos", "/diagnosticos"],
  ["Cotizaciones", "/cotizaciones"], ["Proyectos", "/proyectos"], ["Tareas", "/tareas"], ["Finanzas", "/finanzas"], ["Facturación", "/facturacion"], ["Agentes", "/agentes"],
];

const BARE = ["/login", "/c/", "/documentos", "/proyectos/reporte", "/flujos/reporte"];

export function Shell({ children, demo = true }: { children: ReactNode; demo?: boolean }) {
  const path = usePathname();
  const [toast, setToast] = useState<string | null>(null);
  const [palette, setPalette] = useState(false);
  const [items, setItems] = useState<TrayItem[]>([]);
  const [db, setDb] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((m: string) => {
    setToast(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  }, []);
  const tray = items;
  // Bandeja: con Supabase, las propuestas pendientes que dejaron los agentes en propuestas_ia.
  const enLogin = path.startsWith("/login") || path.startsWith("/c/");
  const cargarBandeja = useCallback(() => {
    if (enLogin) return;
    datos.lista<{ id: string; agente: string; modelo: string | null; tipo: string; titulo: string; cuerpo: string; datos: Record<string, unknown> | null; referencia: string | null }>("propuestas_ia", `select=id,agente,modelo,tipo,titulo,cuerpo,datos,referencia&${eq("estado", "Pendiente")}&order=creado_en.desc&limit=30`)
      .then((r) => { if (!r.db) { setItems(TRAY); return; } setDb(true); setItems(r.filas.map((f) => ({ id: f.id, agent: f.agente.toUpperCase(), model: (f.modelo ?? "IA").toUpperCase(), kind: f.tipo.toUpperCase(), title: f.titulo, body: f.cuerpo, agente: f.agente, datos: f.datos, referencia: f.referencia }))); })
      .catch(() => {});
  }, [enLogin]);
  useEffect(() => { cargarBandeja(); }, [cargarBandeja]);
  // Aprobar ejecuta la acción de la propuesta (abrir WhatsApp, crear tarea, guardar perfil, crear pieza) y deja registro.
  const decidir = useCallback((id: string, decision: "Aprobada" | "Descartada", cuerpo?: string) => {
    const t = items.find((x) => x.id === id); if (!t) return;
    setItems((s) => s.filter((x) => x.id !== id));
    if (!db) { flash(decision === "Aprobada" ? "Aprobado · " + t.agent.toLowerCase() : "Propuesta descartada"); return; }
    const p = { id, agente: t.agente ?? t.agent.toLowerCase(), tipo: t.kind, titulo: t.title, cuerpo: t.body, datos: t.datos, referencia: t.referencia };
    // La pestaña de WhatsApp se abre en el mismo clic; si se abre después, el navegador la bloquea.
    const ventana = decision === "Aprobada" && accionDe(p).clave === "whatsapp" ? window.open("", "_blank") : null;
    resolver(p, decision, cuerpo, ventana).then(flash).catch((e) => { ventana?.close(); setItems((s) => [t, ...s]); flash("No se pudo completar: " + (e as Error).message); });
  }, [flash, db, items]);
  const approve = useCallback((id: string, cuerpo?: string) => decidir(id, "Aprobada", cuerpo), [decidir]);
  const discard = useCallback((id: string) => decidir(id, "Descartada"), [decidir]);
  const toggleTray = useCallback(() => { if (!trayOpen) cargarBandeja(); setTrayOpen((o) => !o); }, [trayOpen, cargarBandeja]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((o) => !o); return; }
      if (palette) { if (e.key === "Escape") setPalette(false); return; }
      if (!trayOpen || /INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) return;
      const f = tray[0];
      if (e.key === "Escape") return setTrayOpen(false);
      if (!f) return;
      if (e.key === "a") approve(f.id); else if (e.key === "d") discard(f.id);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [trayOpen, tray, approve, discard, flash, palette]);

  const value = useMemo<UI>(() => ({ flash, tray, trayOpen, toggleTray, approve, discard, demo: demo && !db, db }), [flash, tray, trayOpen, toggleTray, approve, discard, demo, db]);

  if (BARE.some((b) => path.startsWith(b))) return <UICtx.Provider value={value}>{children}</UICtx.Provider>;

  return (
    <UICtx.Provider value={value}>
      <div style={{ maxWidth: 1440, width: "100%", margin: "0 auto", background: C.tinta, minHeight: "100vh", position: "relative", overflow: "hidden", isolation: "isolate" }}>
        <Glows />
        <Header onSearch={() => setPalette(true)} />
        {children}
        {trayOpen && <Tray />}
        {palette && <Palette close={() => setPalette(false)} />}
        {toast && <Toast msg={toast} />}
      </div>
    </UICtx.Provider>
  );
}

/* ---------- Paleta de búsqueda (Ctrl K) ---------- */
const PALETTE: { t: string; s: string; href: string; demo?: boolean }[] = [
  ...NAV.map(([t, href]) => ({ t, s: "Pantalla", href })),
  { t: "Configuración", s: "Pantalla", href: "/configuracion" },
  { t: "Nueva pieza de contenido", s: "Estudio", href: "/estudio" },
  { t: "Flujos de trabajo · mapa del cliente", s: "Diagnósticos", href: "/diagnosticos?tab=flujos" },
  { t: "Reporte de flujos al cliente", s: "Documento", href: "/flujos/reporte?c=D2", demo: true },
  { t: "Tarifas y costos", s: "Configuración", href: "/configuracion?sec=tarifas" },
  { t: "Nuevo proyecto", s: "Proyectos", href: "/proyectos?nuevo=1" },
  { t: "Nueva cotización", s: "Cotizaciones", href: "/cotizaciones?tab=nueva" },
  { t: "Registrar cobro o gasto", s: "Cotizaciones", href: "/cotizaciones?tab=cobros" },
  { t: "Balance del mes", s: "Cotizaciones", href: "/cotizaciones?tab=balance" },
  { t: "Reporte para el cliente · Negocio demo 2", s: "Documento", href: "/proyectos/reporte?p=D2", demo: true },
  { t: "Contrato de servicios", s: "Plantilla", href: "/documentos/contrato" },
  { t: "Términos y condiciones", s: "Plantilla", href: "/documentos/terminos" },
  { t: "Negocio demo 2 · Restaurante con sucursales", s: "Cliente", href: "/clientes", demo: true },
  { t: "Negocio demo 4 · Clínica", s: "Cliente", href: "/clientes", demo: true },
  { t: "Factura F-0112 · vencida", s: "Facturación", href: "/facturacion", demo: true },
  { t: "Informe del Investigador · semana 45", s: "Agentes", href: "/agentes", demo: true },
  { t: "Cerrar sesión", s: "Cuenta", href: "/api/logout" },
];
function Palette({ close }: { close: () => void }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const { db } = useUI();
  const [extra, setExtra] = useState<{ t: string; s: string; href: string }[]>([]);
  useEffect(() => {
    if (!db) return;
    Promise.all([datos.lista<{ nombre: string; sector: string }>("clientes", "select=nombre,sector&order=nombre"), datos.lista<{ folio: string; proyecto_nombre: string }>("cotizaciones", "select=folio,proyecto_nombre&order=creado_en.desc&limit=30"), datos.lista<{ codigo: string; nombre: string }>("proyectos", "select=codigo,nombre&order=creado_en.desc&limit=30")])
      .then(([c, q2, p]) => setExtra([...c.filas.map((x) => ({ t: `${x.nombre} · ${x.sector}`, s: "Cliente", href: "/clientes" })), ...q2.filas.map((x) => ({ t: `${x.folio} · ${x.proyecto_nombre}`, s: "Cotización", href: `/documentos/cotizacion?f=${encodeURIComponent(x.folio)}` })), ...p.filas.map((x) => ({ t: `${x.codigo} · ${x.nombre}`, s: "Proyecto", href: "/proyectos" }))])).catch(() => {});
  }, [db]);
  const items = [...PALETTE.filter((i) => !db || !i.demo), ...extra].filter((i) => norm(i.t + " " + i.s).includes(norm(q))).slice(0, 8);
  const go = (href: string) => { close(); if (href.startsWith("/api/")) window.location.href = href; else router.push(href); };
  return (
    <>
      <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(7,9,12,0.6)", zIndex: 70 }} />
      <div style={{ position: "fixed", top: 120, left: "50%", transform: "translateX(-50%)", width: 560, background: "rgba(19,23,29,0.9)", backdropFilter: "blur(28px)", border: "1px solid rgba(238,235,228,0.12)", borderRadius: 24, padding: 10, zIndex: 71, animation: "rise .25s ease both" }}>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && items[0]) go(items[0].href); }} placeholder="Buscar pantalla, cliente, factura, documento…" style={{ width: "100%", height: 48, padding: "0 18px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 14, outline: "none" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8 }}>
          {items.map((i, k) => (
            <H key={i.href + i.t} as="button" type="button" onClick={() => go(i.href)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, height: 42, padding: "0 14px", borderRadius: 14, background: k === 0 ? "rgba(238,235,228,0.06)" : "transparent", border: "none", color: C.papel, fontSize: 13.5, cursor: "pointer", textAlign: "left" }} hover={{ background: "rgba(238,235,228,0.08)" }}>
              <span>{i.t}</span><span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue }}>{i.s.toUpperCase()}</span>
            </H>
          ))}
          {items.length === 0 && <div style={{ padding: "12px 14px", fontSize: 13, color: C.tenue }}>Nada con ese nombre. Prueba con una pantalla, un cliente o una factura.</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px 4px", fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", color: C.tenue }}><span>ENTER ABRE EL PRIMERO</span><span>ESC CIERRA</span></div>
      </div>
    </>
  );
}

function Glows() {
  const g = (s: React.CSSProperties) => <div style={{ position: "absolute", zIndex: -1, borderRadius: "50%", pointerEvents: "none", ...s }} />;
  return (
    <>
      {g({ left: 260, top: 40, width: 620, height: 420, background: "radial-gradient(closest-side,rgba(176,81,57,.42),rgba(176,81,57,0))", filter: "blur(30px)", animation: "drift 14s ease-in-out infinite" })}
      {g({ right: 80, top: 120, width: 520, height: 360, background: "radial-gradient(closest-side,rgba(238,235,228,.10),rgba(238,235,228,0))", filter: "blur(30px)", animation: "drift 18s ease-in-out infinite reverse" })}
      {g({ left: -120, top: 980, width: 700, height: 480, background: "radial-gradient(closest-side,rgba(176,81,57,.22),rgba(176,81,57,0))", filter: "blur(40px)", animation: "drift 20s ease-in-out infinite" })}
      {g({ right: -100, top: 1100, width: 620, height: 420, background: "radial-gradient(closest-side,rgba(76,129,65,.18),rgba(76,129,65,0))", filter: "blur(40px)", animation: "drift 16s ease-in-out infinite reverse" })}
    </>
  );
}

/* ---------- Encabezado ---------- */
function Header({ onSearch }: { onSearch: () => void }) {
  const { demo, db, tray, toggleTray } = useUI();
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const cfg = path.startsWith("/configuracion");
  return (
    <>
      {(demo || db) && (
        <div style={{ height: 26, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, borderBottom: `1px solid ${C.borde}`, fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: C.niebla, background: "rgba(16,19,24,0.8)" }}>
          {db ? <><Dot color={C.olivo} />DATOS REALES · GUARDADOS EN TU BASE</> : <><Dot color={C.oxido} />MODO DEMO · DATOS DE EJEMPLO</>}
        </div>
      )}
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "22px 32px 0" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 6, flexShrink: 0 }}>
          <RGlyph active={1} size={26} />
          <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-0.02em" }}>MUSASHI</span>
          </span>
        </Link>
        <H as="button" type="button" onClick={onSearch} title="Buscar · Ctrl K" style={{ display: "flex", alignItems: "center", gap: 8, height: 48, padding: "0 10px 0 6px", borderRadius: 999, background: "rgba(22,26,33,0.55)", backdropFilter: "blur(18px)", border: "1px solid rgba(238,235,228,0.09)", flexShrink: 0, cursor: "pointer", color: C.papel, textAlign: "left" }} hover={{ borderColor: C.acero }}>
          <span style={{ width: 36, height: 36, borderRadius: "50%", background: C.p3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ width: 11, height: 11, border: `1.5px solid ${C.papel}`, borderRadius: "50%" }} />
          </span>
          
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: C.tenue, padding: "4px 7px", border: `1px solid ${C.borde}`, borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>CTRL K</span>
        </H>
        <nav style={{ display: "flex", gap: 3, flex: 1, justifyContent: "center", minWidth: 0 }}>
          {NAV.map(([label, href]) => {
            const a = isActive(href);
            return (
              <H key={href} as={Link as unknown as "a"} {...({ href } as object)}
                style={{ height: 44, padding: "0 9px", borderRadius: 999, border: `1px solid ${a ? C.papel : "rgba(238,235,228,0.09)"}`, background: a ? C.papel : "rgba(22,26,33,0.55)", color: a ? C.tinta : C.papel, fontSize: 12, fontWeight: a ? 600 : 400, display: "flex", alignItems: "center", whiteSpace: "nowrap", boxShadow: a ? "0 0 24px rgba(238,235,228,0.25)" : "none", transition: "border-color .2s" }}
                hover={a ? {} : { borderColor: C.acero }}>
                {label}
              </H>
            );
          })}
        </nav>
        <Link href="/configuracion" title="Configuración" style={{ width: 44, height: 44, borderRadius: "50%", background: cfg ? C.papel : "rgba(22,26,33,0.55)", color: cfg ? C.tinta : C.papel, border: "1px solid rgba(238,235,228,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em", flexShrink: 0 }}>CFG</Link>
        <H as="button" type="button" onClick={toggleTray} title="Bandeja de aprobación"
          style={{ position: "relative", width: 48, height: 48, borderRadius: "50%", background: "rgba(22,26,33,0.55)", border: "1px solid rgba(238,235,228,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          hover={{ borderColor: C.acero }}>
          <span style={{ width: 14, height: 15, border: `1.5px solid ${C.papel}`, borderRadius: "7px 7px 2px 2px" }} />
          <span style={{ position: "absolute", top: -3, right: -3, minWidth: 20, height: 20, padding: "0 5px", borderRadius: 999, background: C.oxido, color: C.papel, fontFamily: MONO, fontSize: 10, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C.tinta}`, animation: tray.length ? "pulseOx 2.2s infinite" : "none" }}>{tray.length}</span>
        </H>
        <Link href="/configuracion" title="Julio César Ibarra · cuenta" style={{ width: 48, height: 48, borderRadius: "50%", background: C.papel, color: C.tinta, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>JC</Link>
      </header>
    </>
  );
}

/* ---------- Bandeja de aprobación ---------- */
function Tray() {
  const { tray, toggleTray, approve, discard, db } = useUI();
  const [edit, setEdit] = useState<{ id: string; texto: string } | null>(null);
  return (
    <>
      <div onClick={toggleTray} style={{ position: "fixed", inset: 0, background: "rgba(7,9,12,0.6)", zIndex: 50 }} />
      <aside style={{ position: "fixed", top: 16, right: 16, bottom: 16, width: 440, background: "rgba(19,23,29,0.78)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(238,235,228,0.1)", borderRadius: 28, padding: 24, display: "flex", flexDirection: "column", gap: 14, overflow: "auto", zIndex: 51, animation: "rise .35s ease both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>A APROBAR · D DESCARTAR</div>
            <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", marginTop: 6 }}>BANDEJA DE APROBACIÓN</div>
            <div style={{ fontWeight: 300, fontSize: 14, color: C.niebla }}>{tray.length} {tray.length === 1 ? "propuesta pendiente" : "propuestas pendientes"}</div>
          </div>
          <button type="button" onClick={toggleTray} style={{ width: 44, height: 44, borderRadius: "50%", background: C.papel, color: C.tinta, border: "none", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>
        {tray.map((p, i) => (
          <div key={p.id} style={{ background: "rgba(12,15,20,0.5)", border: `1px solid ${i === 0 ? C.oxido : "rgba(238,235,228,0.09)"}`, boxShadow: i === 0 ? "0 0 26px rgba(176,81,57,0.3)" : "none", borderRadius: 20, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue }}><span>BORRADOR DE IA · {p.agent} · {p.model}</span><span>{p.kind}</span></div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{p.title}</div>
            {edit?.id === p.id
              ? <textarea autoFocus value={edit.texto} onChange={(e) => setEdit({ id: p.id, texto: e.target.value })} rows={6} style={{ borderRadius: 14, background: C.p2, border: `1px solid ${C.oxido}`, color: C.papel, padding: 12, fontSize: 13, lineHeight: 1.45, resize: "vertical", outline: "none", fontFamily: "inherit" }} />
              : <div style={{ fontSize: 13, color: C.niebla, lineHeight: 1.45, textWrap: "pretty", whiteSpace: "pre-wrap" }}>{p.body}</div>}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <H as="button" type="button" onClick={() => { approve(p.id, edit?.id === p.id ? edit.texto : undefined); setEdit(null); }} style={{ height: 36, padding: "0 16px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 18px rgba(176,81,57,.45)" }} hover={{ background: C.oxidoHover }}>{db ? accionDe({ tipo: p.kind, agente: p.agent }).etiqueta : "Aprobar"}</H>
              <button type="button" onClick={() => setEdit(edit?.id === p.id ? null : { id: p.id, texto: p.body })} style={{ height: 36, padding: "0 16px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.borde2}`, fontSize: 12, cursor: "pointer" }}>{edit?.id === p.id ? "Cancelar edición" : "Editar"}</button>
              <H as="button" type="button" onClick={() => discard(p.id)} style={{ height: 36, padding: "0 16px", borderRadius: 999, background: "transparent", color: C.niebla, border: "none", fontSize: 12, cursor: "pointer" }} hover={{ color: C.papel }}>Descartar</H>
            </div>
          </div>
        ))}
        {tray.length === 0 && <div style={{ fontSize: 14, color: C.tenue, padding: "20px 0" }}>Nada por aprobar. Los agentes proponen aquí lo de hoy.</div>}
      </aside>
    </>
  );
}

function Toast({ msg }: { msg: string }) {
  return (
    <div style={{ position: "fixed", left: 24, bottom: 24, zIndex: 60, background: C.papel, color: C.tinta, borderRadius: 999, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, animation: "rise .3s ease both" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.olivo }} />{msg}
    </div>
  );
}

/* ---------- Encabezado de pantalla (glifo + eyebrow + título) ---------- */
export function PageHead({ stage = 1, eyebrow, title, sub, right, style }: { stage?: number; eyebrow: ReactNode; title: ReactNode; sub?: ReactNode; right?: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, padding: "28px 32px 0", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <span style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(22,26,33,0.8)", border: `1px solid ${C.borde}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><RGlyph active={stage} size={30} /></span>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>
            <span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)", boxShadow: `0 0 8px ${C.oxido}` }} />{eyebrow}
          </div>
          <div style={{ fontWeight: 900, fontSize: 44, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 8 }}>{title}</div>
          {sub && <div style={{ fontWeight: 300, fontSize: 15, color: C.niebla, marginTop: 8 }}>{sub}</div>}
        </div>
      </div>
      {right && <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>{right}</div>}
    </div>
  );
}
