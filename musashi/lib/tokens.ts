// Tokens de Musashi (Paleta Planta de Ronin Studio).
export const C = {
  tinta: "#0C0F14",
  fondo: "#07090C",
  panel: "#13171D",
  p2: "#101318",
  p3: "#1B2027",
  borde: "#252A31",
  borde2: "#3A4048",
  papel: "#EEEBE4",
  niebla: "#A9A6A0",
  tenue: "#7C8088",
  acero: "#5B6068",
  oxido: "#B05139",
  oxidoHover: "#9A4530",
  olivo: "#4C8141",
  ambar: "#C98A3C",
} as const;

export type ColorKey = "ox" | "ol" | "am" | "ni" | "te" | "pa" | "ac";
const SHORT: Record<ColorKey, string> = {
  ox: C.oxido, ol: C.olivo, am: C.ambar, ni: C.niebla, te: C.tenue, pa: C.papel, ac: C.acero,
};
/** Acepta una clave corta (ox, ol, am…) o un color CSS literal. */
export function col(c?: string | null): string | null {
  if (!c) return null;
  return (SHORT as Record<string, string>)[c] ?? c;
}

export const MONO = "'JetBrains Mono',monospace";
export const SANS = "'Archivo',sans-serif";

/** Estilos reutilizables (equivalen a los § del handoff de diseño). */
export const S = {
  glass: {
    background: "rgba(22,26,33,0.5)",
    backdropFilter: "blur(22px) saturate(140%)",
    WebkitBackdropFilter: "blur(22px) saturate(140%)",
    border: "1px solid rgba(238,235,228,0.09)",
    boxShadow: "inset 0 1px 0 rgba(238,235,228,0.08)",
  },
  label: { fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue },
  eyebrow: { fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue },
  h2: { fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em", textTransform: "uppercase" },
  pb: {
    height: 44, padding: "0 20px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none",
    fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 0 22px rgba(176,81,57,.4)",
  },
  sb: {
    height: 44, padding: "0 18px", borderRadius: 999, background: "transparent", color: C.papel,
    border: `1px solid ${C.borde2}`, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
  },
} as const;

export const R_PATH =
  "M0 0H122C170 0 198 28 198 66C198 98 180 120 152 128L200 220H128L88 134H64V220H0Z M64 50H116C131 50 138 57 138 67C138 78 131 85 116 85H64Z";
