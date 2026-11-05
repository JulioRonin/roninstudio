"use client";
import React, { useRef, useState } from "react";
import { C, MONO, col, S } from "@/lib/tokens";
import { H, Dot } from "@/components/ui";

/* Tablero kanban con arrastrar y soltar · equivale a "Ronin Board". */
export type Card = { t: string; s?: string; tag?: string; m?: string; late?: boolean; dot?: string; chip?: string };
export type Column = { t: string; dot?: string; cards: Card[] };

export function Board({ columns, minCol = 170, minH = 300, onMove }: { columns: Column[]; minCol?: number; minH?: number; onMove?: (card: Card, to: string) => void }) {
  const [cols, setCols] = useState<Column[] | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const src = useRef<[number, number] | null>(null);
  const cur = cols ?? columns;

  const move = (ci: number) => {
    const s = src.current; src.current = null; setOver(null);
    if (!s || s[0] === ci) return;
    const next: Column[] = JSON.parse(JSON.stringify(cur));
    const [card] = next[s[0]].cards.splice(s[1], 1);
    next[ci].cards.unshift(card);
    setCols(next);
    onMove?.(card, next[ci].t);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cur.length},minmax(${minCol}px,1fr))`, gap: 12, overflowX: "auto", paddingBottom: 6 }}>
      {cur.map((c, ci) => {
        const d = col(c.dot) || C.acero;
        return (
          <div key={c.t}
            onDragOver={(e) => { e.preventDefault(); if (over !== ci) setOver(ci); }}
            onDrop={(e) => { e.preventDefault(); move(ci); }}
            style={{ ...S.glass, borderRadius: 22, padding: 14, display: "flex", flexDirection: "column", gap: 10, minHeight: minH, borderColor: over === ci ? "rgba(238,235,228,0.4)" : "rgba(238,235,228,0.09)", transition: "border-color .2s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 4px 4px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.papel }}><Dot color={d} />{c.t}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: C.tenue }}>{c.cards.length}</span>
            </div>
            {c.cards.map((k, ki) => (
              <H key={ki} draggable onDragStart={(e: React.DragEvent) => { e.dataTransfer.setData("text/plain", "card"); src.current = [ci, ki]; }}
                style={{ background: "rgba(12,15,20,0.55)", border: `1px solid ${k.late ? C.oxido : "rgba(238,235,228,0.08)"}`, boxShadow: k.late ? "0 0 22px rgba(176,81,57,0.3)" : "none", borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", gap: 6, cursor: "grab", transition: "transform .2s,border-color .2s" }}
                hover={{ transform: "translateY(-2px)", borderColor: C.acero }}>
                {k.tag && <div style={{ ...S.label, fontSize: 9.5 }}>{k.tag}</div>}
                <div style={{ fontSize: 13.5, lineHeight: 1.3, textWrap: "pretty" }}>{k.t}</div>
                {k.s && <div style={{ fontSize: 12, color: C.niebla, lineHeight: 1.35, textWrap: "pretty" }}>{k.s}</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.12em", color: C.papel }}><Dot color={col(k.dot) || C.tenue} />{k.chip ?? ""}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: k.late ? C.papel : C.tenue, whiteSpace: "nowrap" }}>{k.m ?? ""}</span>
                </div>
              </H>
            ))}
          </div>
        );
      })}
    </div>
  );
}
