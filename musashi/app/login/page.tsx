"use client";
import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { C, MONO } from "@/lib/tokens";
import { Eyebrow, Glass, Input, PB, RGlyph } from "@/components/ui";

function Acceso() {
  const sp = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || enviando) return;
    setEnviando(true); setError(null);
    try {
      const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, next: sp.get("next") }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) { window.location.href = d.next ?? "/"; return; }
      setError(d.error ?? "No se pudo entrar.");
      setPassword("");
    } catch { setError("Sin conexión. Intenta de nuevo."); }
    setEnviando(false);
  };

  return (
    <main style={{ minHeight: "100vh", background: C.tinta, color: C.papel, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, position: "relative", overflow: "hidden", isolation: "isolate" }}>
      <div style={{ position: "absolute", zIndex: -1, left: "calc(50% - 310px)", top: "calc(45% - 210px)", width: 620, height: 420, borderRadius: "50%", background: "radial-gradient(closest-side,rgba(176,81,57,.38),rgba(176,81,57,0))", filter: "blur(30px)", animation: "drift 14s ease-in-out infinite", pointerEvents: "none" }} />
      <Glass radius={28} pad={32} style={{ width: "100%", maxWidth: 400 }}>
        <form onSubmit={entrar} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <RGlyph size={34} active={2} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em", textTransform: "uppercase", lineHeight: 1 }}>Musashi</div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.tenue, marginTop: 4 }}>RONIN STUDIO · PLATAFORMA INTERNA</div>
            </div>
          </div>
          <Eyebrow>ACCESO</Eyebrow>
          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: C.niebla }}>CONTRASEÑA</span>
            <Input type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} style={{ width: "100%" }} />
          </label>
          {error && <div role="alert" style={{ fontSize: 13, color: "#E07A5F" }}>{error}</div>}
          <PB type="submit" disabled={!password || enviando} style={{ width: "100%", opacity: !password || enviando ? 0.6 : 1 }}>{enviando ? "Entrando…" : "Entrar"}</PB>
          <div style={{ fontSize: 12, color: C.tenue, lineHeight: 1.5 }}>La sesión dura 30 días en este navegador.</div>
        </form>
      </Glass>
    </main>
  );
}

export default function Page() {
  return <Suspense fallback={null}><Acceso /></Suspense>;
}
