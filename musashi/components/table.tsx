"use client";
import React, { type ReactNode } from "react";
import { C, MONO, SANS, col, S } from "@/lib/tokens";
import { H, Dot } from "@/components/ui";

/* Tabla genérica · equivale al componente "Ronin Table" del diseño. */
export type Col = string | { l: string; a?: "l" | "r" };
export type Cell =
  | string | number | null | undefined
  | {
      t?: ReactNode; s?: ReactNode; dot?: string; mono?: boolean; big?: boolean; b?: boolean; c?: string;
      bar?: number; bc?: string; btn?: string; primary?: boolean; onClick?: () => void;
    };
export type Row = { group: string; dot?: string } | { cells: Cell[]; late?: boolean; sel?: boolean; onClick?: () => void };

export function Table({ title, sub, grid, cols, rows, style }: { title?: ReactNode; sub?: ReactNode; grid?: string; cols: Col[]; rows: Row[]; style?: React.CSSProperties }) {
  const cs = cols.map((c) => (typeof c === "string" ? { l: c } : c));
  const g = grid || cs.map(() => "minmax(0,1fr)").join(" ");
  return (
    <div style={{ ...S.glass, borderRadius: 24, padding: "4px 22px 10px", ...style }}>
      {title && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "18px 0 4px" }}>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em", textTransform: "uppercase" }}>{title}</div>
          <div style={S.label}>{sub}</div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: g, gap: 16, padding: "14px 0 10px", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>
        {cs.map((h, i) => <div key={i} style={{ ...S.label, textAlign: h.a === "r" ? "right" : "left", whiteSpace: "nowrap" }}>{h.l}</div>)}
      </div>
      {rows.map((r, ri) => {
        if ("group" in r) {
          const d = col(r.dot) || C.acero;
          return (
            <div key={ri} style={{ display: "flex", alignItems: "center", gap: 8, padding: "18px 0 6px", fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.niebla }}>
              <Dot color={d} />{r.group}
            </div>
          );
        }
        return (
          <H key={ri} onClick={r.onClick}
            style={{ display: "grid", gridTemplateColumns: g, gap: 16, padding: "12px 0", alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.06)", background: r.late ? "rgba(176,81,57,0.07)" : r.sel ? "rgba(238,235,228,0.05)" : "transparent", cursor: r.onClick ? "pointer" : "default", transition: "background .2s" }}
            hover={{ background: "rgba(238,235,228,0.035)" }}>
            {r.cells.map((raw, i) => {
              const c = raw == null ? {} : typeof raw !== "object" ? { t: String(raw) } : raw;
              const right = cs[i]?.a === "r";
              const base: React.CSSProperties = { minWidth: 0, textAlign: right ? "right" : "left" };
              if (c.btn) {
                return (
                  <div key={i} style={base}>
                    <button type="button" onClick={c.onClick} style={{ height: 32, padding: "0 14px", borderRadius: 999, background: c.primary ? C.oxido : "transparent", border: `1px solid ${c.primary ? C.oxido : C.borde2}`, boxShadow: c.primary ? "0 0 16px rgba(176,81,57,.4)" : "none", color: C.papel, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{c.btn}</button>
                  </div>
                );
              }
              if (c.bar != null) {
                const bc = col(c.bc) || C.oxido;
                return (
                  <div key={i} style={base}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(238,235,228,0.08)", overflow: "hidden", display: "block" }}>
                        <span style={{ display: "block", height: "100%", width: `${c.bar}%`, background: bc, boxShadow: `0 0 10px ${bc}` }} />
                      </span>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.papel, minWidth: 40, textAlign: "right" }}>{c.t}</span>
                    </div>
                  </div>
                );
              }
              const d = col(c.dot);
              return (
                <div key={i} style={base}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: right ? "flex-end" : "flex-start", minWidth: 0 }}>
                    {d && <Dot color={d} />}
                    <span style={{ fontFamily: c.mono ? MONO : SANS, fontSize: c.mono ? (c.big ? 13 : 10.5) : c.b ? 14 : 13.5, letterSpacing: c.mono && !c.big ? "0.12em" : 0, color: col(c.c) || (i === 0 ? C.papel : "#D9D5CD"), fontWeight: c.b ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.t ?? ""}</span>
                  </div>
                  {c.s && <div style={{ ...S.label, fontSize: 9.5, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.s}</div>}
                </div>
              );
            })}
          </H>
        );
      })}
    </div>
  );
}
