"use client";
import React, { useId, useState, type CSSProperties, type ReactNode } from "react";
import { C, MONO, R_PATH, S } from "@/lib/tokens";

type Sty = CSSProperties;

/* ---------- Hover: equivalente a style-hover del prototipo ---------- */
type HProps<T extends keyof React.JSX.IntrinsicElements> = {
  as?: T;
  hover?: Sty;
  style?: Sty;
  children?: ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "style" | "children">;

export function H<T extends keyof React.JSX.IntrinsicElements = "div">({ as, hover, style, children, ...rest }: HProps<T>) {
  const [on, setOn] = useState(false);
  const Tag = (as ?? "div") as React.ElementType;
  const r = rest as Record<string, unknown>;
  return (
    <Tag
      {...r}
      style={on && hover ? { ...style, ...hover } : style}
      onMouseEnter={(e: React.MouseEvent) => { setOn(true); (r.onMouseEnter as ((e: React.MouseEvent) => void) | undefined)?.(e); }}
      onMouseLeave={(e: React.MouseEvent) => { setOn(false); (r.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(e); }}
    >
      {children}
    </Tag>
  );
}

/* ---------- Glifo R Pipeline (4 bandas, la activa en Óxido) ---------- */
export function RGlyph({ active = 1, size = 26, base = C.papel, style }: { active?: number; size?: number; base?: string; style?: Sty }) {
  const id = useId().replace(/:/g, "");
  const offs = [-12, -4, 4, 12];
  return (
    <svg width={size} height={(size * 220) / 228} viewBox="-14 0 228 220" style={{ flexShrink: 0, ...style }} aria-hidden>
      {offs.map((o, i) => {
        const y0 = i * 55, y1 = y0 + 55, cid = `${id}${i}`;
        return (
          <g key={i} transform={`translate(${o} 0)`}>
            <clipPath id={cid}><polygon points={`-40,${y0 + 12} 240,${y0 - 12} 240,${y1 - 12} -40,${y1 + 12}`} /></clipPath>
            <path d={R_PATH} fill={i === active ? C.oxido : base} fillRule="evenodd" clipPath={`url(#${cid})`} />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Panel de vidrio ---------- */
export function Glass({ style, children, radius = 28, pad = 24, delay, ...rest }: { style?: Sty; children?: ReactNode; radius?: number; pad?: number | string; delay?: string } & Omit<React.HTMLAttributes<HTMLDivElement>, "style">) {
  return (
    <div
      {...rest}
      style={{ ...S.glass, borderRadius: radius, padding: pad, animation: "rise .8s cubic-bezier(.2,.7,.2,1) both", animationDelay: delay, ...style }}
    >
      {children}
    </div>
  );
}

/* ---------- Etiquetas ---------- */
export function Eyebrow({ children, color, style }: { children: ReactNode; color?: string; style?: Sty }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, ...S.eyebrow, color: color ?? C.tenue, ...style }}>
      <span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)", boxShadow: `0 0 8px ${C.oxido}`, flexShrink: 0 }} />
      {children}
    </div>
  );
}
export function Label({ children, style, color }: { children: ReactNode; style?: Sty; color?: string }) {
  return <div style={{ ...S.label, color: color ?? C.tenue, ...style }}>{children}</div>;
}
export function H2({ children, style, size = 24 }: { children: ReactNode; style?: Sty; size?: number }) {
  return <div style={{ fontWeight: 900, fontSize: size, letterSpacing: "-0.02em", textTransform: "uppercase", ...style }}>{children}</div>;
}
export function Dot({ color, size = 6, glow = true, anim, style }: { color: string; size?: number; glow?: boolean; anim?: string; style?: Sty }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: color, boxShadow: glow ? `0 0 ${size + 2}px ${color}` : undefined, flexShrink: 0, display: "inline-block", animation: anim, ...style }} />;
}

/* ---------- Botones ---------- */
export function PB({ children, style, small, ...rest }: { children: ReactNode; style?: Sty; small?: boolean } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style">) {
  return (
    <H as="button" {...rest} style={{ ...S.pb, ...(small ? { height: 36, padding: "0 16px", fontSize: 12, boxShadow: "0 0 18px rgba(176,81,57,.45)" } : {}), ...style }} hover={{ background: C.oxidoHover }}>
      {children}
    </H>
  );
}
export function SB({ children, style, small, ...rest }: { children: ReactNode; style?: Sty; small?: boolean } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style">) {
  return (
    <H as="button" {...rest} style={{ ...S.sb, ...(small ? { height: 36, padding: "0 16px", fontSize: 12 } : {}), ...style }} hover={{ borderColor: C.acero }}>
      {children}
    </H>
  );
}
export function GhostB({ children, style, ...rest }: { children: ReactNode; style?: Sty } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style">) {
  return (
    <H as="button" {...rest} style={{ height: 36, padding: "0 16px", borderRadius: 999, background: "transparent", color: C.niebla, border: "none", fontSize: 12, cursor: "pointer", ...style }} hover={{ color: C.papel }}>
      {children}
    </H>
  );
}
/** Botón circular (↗, +, ✕…) */
export function Circle({ children, size = 48, bg = C.p3, color = C.papel, border, style, onClick, title }: { children: ReactNode; size?: number; bg?: string; color?: string; border?: string; style?: Sty; onClick?: () => void; title?: string }) {
  const base: Sty = { width: size, height: size, borderRadius: "50%", background: bg, color, border: border ? `1px solid ${border}` : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, cursor: onClick ? "pointer" : undefined, ...style };
  return onClick ? <button type="button" onClick={onClick} title={title} style={base}>{children}</button> : <span title={title} style={base}>{children}</span>;
}

/* ---------- Pestañas píldora ---------- */
export function Tabs({ items, value, onChange, style }: { items: string[]; value: number; onChange: (i: number) => void; style?: Sty }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", ...style }}>
      {items.map((l, i) => {
        const a = value === i;
        return (
          <H key={l} as="button" type="button" onClick={() => onChange(i)}
            style={{ height: 40, padding: "0 16px", borderRadius: 999, border: `1px solid ${a ? C.papel : "rgba(238,235,228,0.09)"}`, background: a ? C.papel : "rgba(22,26,33,0.5)", color: a ? C.tinta : C.niebla, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", backdropFilter: "blur(16px)", transition: "all .2s", fontWeight: a ? 600 : 400 }}
            hover={a ? {} : { borderColor: C.borde2 }}>
            {l}
          </H>
        );
      })}
    </div>
  );
}

/* ---------- Chips de filtro (44px) ---------- */
export function Chips({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <>
      {items.map((l) => {
        const a = value === l;
        return (
          <H key={l} as="button" type="button" onClick={() => onChange(l)}
            style={{ height: 44, padding: "0 18px", borderRadius: 999, border: `1px solid ${a ? C.papel : C.borde}`, background: a ? C.papel : C.panel, color: a ? C.tinta : C.niebla, fontSize: 13, cursor: "pointer" }}
            hover={{ borderColor: C.borde2 }}>
            {l}
          </H>
        );
      })}
    </>
  );
}

/* ---------- Campo de texto ---------- */
export function Input({ style, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} style={{ height: 44, padding: "0 16px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 13, outline: "none", ...style }} />;
}

/* ---------- Glifo + código en círculo (proyecto/cliente) ---------- */
export function CodeDot({ code, bg = "#2A2F36", color = C.papel, size = 40, glow, anim }: { code: string; bg?: string; color?: string; size?: number; glow?: string; anim?: string }) {
  return <span style={{ width: size, height: size, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, fontWeight: 500, flexShrink: 0, boxShadow: glow, animation: anim }}>{code}</span>;
}
