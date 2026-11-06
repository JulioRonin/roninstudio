"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { C, MONO } from "@/lib/tokens";
import { H, RGlyph, Dot } from "@/components/ui";
import { TRAY, type TrayItem } from "@/lib/demo";

/* ---------- Contexto de UI: toast + bandeja de aprobación ---------- */
type UI = {
  flash: (msg: string) => void;
  tray: TrayItem[];
  trayOpen: boolean;
  toggleTray: () => void;
  approve: (id: string) => void;
  discard: (id: string) => void;
  demo: boolean;
};
const UICtx = createContext<UI | null>(null);
export const useUI = () => {
  const v = useContext(UICtx);
  if (!v) throw new Error("useUI fuera de <Shell>");
  return v;
};

export const NAV: [string, string][] = [
  ["Dashboard", "/"], ["Marketing", "/marketing"], ["Estudio", "/estudio"], ["Clientes", "/clientes"], ["Diagnósticos", "/diagnosticos"],
  ["Proyectos", "/proyectos"], ["Tareas", "/tareas"], ["Finanzas", "/finanzas"], ["Facturación", "/facturacion"], ["Agentes", "/agentes"],
];

export function Shell({ children, demo = true }: { children: ReactNode; demo?: boolean }) {
  const [toast, setToast] = useState<string | null>(null);
  const [trayIds, setTrayIds] = useState<string[]>(() => TRAY.map((t) => t.id));
  const [trayOpen, setTrayOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((m: string) => {
    setToast(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  }, []);
  const tray = useMemo(() => TRAY.filter((t) => trayIds.includes(t.id)), [trayIds]);
  const rm = useCallback((id: string, m: string) => { setTrayIds((s) => s.filter((x) => x !== id)); flash(m); }, [flash]);
  const approve = useCallback((id: string) => { const t = TRAY.find((x) => x.id === id); rm(id, "Aprobado · " + (t?.agent.toLowerCase() ?? "")); }, [rm]);
  const discard = useCallback((id: string) => rm(id, "Propuesta descartada"), [rm]);
  const toggleTray = useCallback(() => setTrayOpen((o) => !o), []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!trayOpen || /INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) return;
      const f = tray[0];
      if (e.key === "Escape") return setTrayOpen(false);
      if (!f) return;
      if (e.key === "a") approve(f.id); else if (e.key === "d") discard(f.id); else if (e.key === "e") flash("Abriendo editor del borrador");
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [trayOpen, tray, approve, discard, flash]);

  const value = useMemo<UI>(() => ({ flash, tray, trayOpen, toggleTray, approve, discard, demo }), [flash, tray, trayOpen, toggleTray, approve, discard, demo]);

  return (
    <UICtx.Provider value={value}>
      <div style={{ maxWidth: 1440, width: "100%", margin: "0 auto", background: C.tinta, minHeight: "100vh", position: "relative", overflow: "hidden", isolation: "isolate" }}>
        <Glows />
        <Header />
        {children}
        {trayOpen && <Tray />}
        {toast && <Toast msg={toast} />}
      </div>
    </UICtx.Provider>
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
function Header() {
  const { demo, tray, toggleTray } = useUI();
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const cfg = path.startsWith("/configuracion");
  return (
    <>
      {demo && (
        <div style={{ height: 26, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, borderBottom: `1px solid ${C.borde}`, fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: C.niebla, background: "rgba(16,19,24,0.8)" }}>
          <Dot color={C.oxido} />MODO DEMO · DATOS DE EJEMPLO
        </div>
      )}
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "22px 32px 0" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 6, flexShrink: 0 }}>
          <RGlyph active={1} size={26} />
          <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-0.02em" }}>MUSASHI</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10, height: 48, width: 180, padding: "0 6px", borderRadius: 999, background: "rgba(22,26,33,0.55)", backdropFilter: "blur(18px)", border: "1px solid rgba(238,235,228,0.09)", flexShrink: 0 }}>
          <span style={{ width: 36, height: 36, borderRadius: "50%", background: C.p3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ width: 11, height: 11, border: `1.5px solid ${C.papel}`, borderRadius: "50%" }} />
          </span>
          <span style={{ fontSize: 13, color: C.tenue, flex: 1 }}>Buscar…</span>
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.1em", color: C.tenue, padding: "4px 7px", border: `1px solid ${C.borde}`, borderRadius: 999 }}>CTRL K</span>
        </div>
        <nav style={{ display: "flex", gap: 4, flex: 1, justifyContent: "center", minWidth: 0 }}>
          {NAV.map(([label, href]) => {
            const a = isActive(href);
            return (
              <H key={href} as={Link as unknown as "a"} {...({ href } as object)}
                style={{ height: 44, padding: "0 12px", borderRadius: 999, border: `1px solid ${a ? C.papel : "rgba(238,235,228,0.09)"}`, background: a ? C.papel : "rgba(22,26,33,0.55)", color: a ? C.tinta : C.papel, fontSize: 12.5, fontWeight: a ? 600 : 400, display: "flex", alignItems: "center", whiteSpace: "nowrap", boxShadow: a ? "0 0 24px rgba(238,235,228,0.25)" : "none", transition: "border-color .2s" }}
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
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.papel, color: C.tinta, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>JC</div>
      </header>
    </>
  );
}

/* ---------- Bandeja de aprobación ---------- */
function Tray() {
  const { tray, toggleTray, approve, discard, flash } = useUI();
  return (
    <>
      <div onClick={toggleTray} style={{ position: "fixed", inset: 0, background: "rgba(7,9,12,0.6)", zIndex: 50 }} />
      <aside style={{ position: "fixed", top: 16, right: 16, bottom: 16, width: 440, background: "rgba(19,23,29,0.78)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(238,235,228,0.1)", borderRadius: 28, padding: 24, display: "flex", flexDirection: "column", gap: 14, overflow: "auto", zIndex: 51, animation: "rise .35s ease both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue }}>A APROBAR · E EDITAR · D DESCARTAR</div>
            <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", marginTop: 6 }}>BANDEJA DE APROBACIÓN</div>
            <div style={{ fontWeight: 300, fontSize: 14, color: C.niebla }}>{tray.length} propuestas de hoy</div>
          </div>
          <button type="button" onClick={toggleTray} style={{ width: 44, height: 44, borderRadius: "50%", background: C.papel, color: C.tinta, border: "none", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>
        {tray.map((p, i) => (
          <div key={p.id} style={{ background: "rgba(12,15,20,0.5)", border: `1px solid ${i === 0 ? C.oxido : "rgba(238,235,228,0.09)"}`, boxShadow: i === 0 ? "0 0 26px rgba(176,81,57,0.3)" : "none", borderRadius: 20, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue }}><span>BORRADOR DE IA · {p.agent} · {p.model}</span><span>{p.kind}</span></div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{p.title}</div>
            <div style={{ fontSize: 13, color: C.niebla, lineHeight: 1.45, textWrap: "pretty" }}>{p.body}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <H as="button" type="button" onClick={() => approve(p.id)} style={{ height: 36, padding: "0 16px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 18px rgba(176,81,57,.45)" }} hover={{ background: C.oxidoHover }}>Aprobar</H>
              <button type="button" onClick={() => flash("Abriendo editor del borrador")} style={{ height: 36, padding: "0 16px", borderRadius: 999, background: "transparent", color: C.papel, border: `1px solid ${C.borde2}`, fontSize: 12, cursor: "pointer" }}>Editar</button>
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
