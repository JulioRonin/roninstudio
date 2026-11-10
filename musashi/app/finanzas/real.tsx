"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { C, MONO } from "@/lib/tokens";
import { Glass, Eyebrow, Dot } from "@/components/ui";
import { useUI, PageHead } from "@/components/shell";
import { datos, fechaCorta, hoyISO, mesCorto } from "@/lib/datos";
import { useTarifas, margenPct } from "@/lib/tarifas";
import { Cargando, Vacio, Tabla, Kpis, fila, mono10, mxn, mxn0 } from "@/components/real";

/* Finanzas con datos reales: caja del mes (cobros y gastos registrados) y margen por proyecto
   (presupuesto sin IVA contra horas registradas al costo por hora de Configuración). */
type Mov = { id: string; tipo: "Cobro" | "Gasto"; fecha: string; concepto: string; metodo: string | null; monto: number; cliente?: { nombre: string } | null };
type Proy = { id: string; codigo: string; nombre: string; etapa: string; presupuesto: number; horas_estimadas: number; cliente?: { nombre: string } | null; horas?: { horas: number }[] };
type Fac = { proyecto_id: string | null; monto: number; estado: string; vence: string | null };

export default function FinanzasReal() {
  const { flash } = useUI();
  const [tarifas] = useTarifas();
  const [d, setD] = useState<{ mov: Mov[]; proy: Proy[]; fac: Fac[] } | null>(null);
  useEffect(() => {
    Promise.all([datos.lista<Mov>("movimientos", "select=*,cliente:clientes(nombre)&order=fecha.desc"), datos.lista<Proy>("proyectos", "select=id,codigo,nombre,etapa,presupuesto,horas_estimadas,cliente:clientes(nombre),horas(horas)&order=creado_en.desc"), datos.lista<Fac>("facturas", "select=proyecto_id,monto,estado,vence")])
      .then(([m, p, f]) => setD({ mov: m.filas, proy: p.filas, fac: f.filas })).catch((e) => { flash("No se pudieron cargar las finanzas: " + (e as Error).message); setD({ mov: [], proy: [], fac: [] }); });
  }, [flash]);
  if (!d) return <Cargando />;

  const hoy = hoyISO(), mes = hoy.slice(0, 7);
  const suma = (tipo: string, m: string) => d.mov.filter((x) => x.tipo === tipo && x.fecha.slice(0, 7) === m).reduce((s, x) => s + Number(x.monto), 0);
  const cobrado = suma("Cobro", mes), gastos = suma("Gasto", mes);
  const porCobrar = d.fac.filter((f) => f.estado === "Vigente" || f.estado === "Vencida").reduce((s, f) => s + Number(f.monto), 0);
  const meses = [5, 4, 3, 2, 1, 0].map((k) => { const x = new Date(mes + "-15T12:00:00"); x.setMonth(x.getMonth() - k); const c = x.toISOString().slice(0, 7); return { c, m: mesCorto(c + "-15"), cobro: suma("Cobro", c), gasto: suma("Gasto", c) }; });
  const max = Math.max(1, ...meses.map((x) => Math.max(x.cobro, x.gasto)));
  const W = "64px 1.5fr 110px 120px 110px 120px 130px 120px";
  const nombreMes = new Date(hoy + "T12:00:00").toLocaleDateString("es-MX", { month: "long" }).toUpperCase();

  return (
    <>
      <PageHead stage={3} eyebrow="08 · FINANZAS · CAJA Y MARGEN" title="FINANZAS" sub={`${nombreMes.charAt(0) + nombreMes.slice(1).toLowerCase()} · costo por hora ${mxn0(tarifas.costoHora)} · precio ${mxn0(tarifas.precioHora)} · margen por hora ${margenPct(tarifas)} %`} style={{ paddingTop: 34 }} />
      <section style={{ padding: "22px 32px 56px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Kpis items={[[`COBRADO · ${nombreMes}`, mxn(cobrado), "cobros registrados, con IVA", C.olivo], [`GASTOS · ${nombreMes}`, mxn(gastos), "herramientas, IA, oficina", C.oxido], ["CAJA DEL MES", mxn(cobrado - gastos), cobrado ? `${Math.round(((cobrado - gastos) / cobrado) * 100)} % de lo cobrado` : "sin cobros este mes", C.papel], ["POR COBRAR", mxn(porCobrar), "facturas vigentes y vencidas", C.ambar]]} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Glass>
            <Eyebrow>COBROS Y GASTOS · 6 MESES</Eyebrow>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 200, marginTop: 18 }}>
              {meses.map((s) => (
                <div key={s.c} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: "100%", width: "100%", justifyContent: "center" }}>
                    <div title={`Cobrado ${mxn(s.cobro)}`} style={{ width: 22, height: `${(s.cobro / max) * 100}%`, minHeight: s.cobro ? 3 : 0, background: C.olivo, borderRadius: 5 }} />
                    <div title={`Gastos ${mxn(s.gasto)}`} style={{ width: 22, height: `${(s.gasto / max) * 100}%`, minHeight: s.gasto ? 3 : 0, background: C.oxido, borderRadius: 5 }} />
                  </div>
                  <div style={{ ...mono10, color: s.c === mes ? C.papel : C.tenue }}>{s.m}</div>
                  <div style={{ ...mono10, fontSize: 9 }}>{mxn0(s.cobro - s.gasto)}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12, ...mono10 }}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Dot color={C.olivo} glow={false} />COBRADO</span><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Dot color={C.oxido} glow={false} />GASTOS</span><span>ABAJO · CAJA DEL MES</span></div>
          </Glass>
          <Glass pad="20px 22px 8px">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Eyebrow>ÚLTIMOS MOVIMIENTOS</Eyebrow><Link href="/cotizaciones?tab=cobros" style={{ ...mono10, color: C.papel }}>REGISTRAR COBRO O GASTO ↗</Link></div>
            {d.mov.length === 0 && <Vacio>Sin movimientos. Registra cobros y gastos en Cotizaciones → Cobros y gastos, o cobra una factura en Facturación.</Vacio>}
            {d.mov.slice(0, 7).map((m) => (
              <div key={m.id} style={{ display: "grid", gridTemplateColumns: "58px 1fr auto", gap: 10, alignItems: "center", padding: "10px 0", borderTop: `1px solid ${C.borde}`, fontSize: 13 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.tenue }}>{fechaCorta(m.fecha).toUpperCase()}</span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.concepto}<span style={{ color: C.tenue }}> · {m.tipo === "Cobro" ? m.cliente?.nombre ?? "—" : m.metodo ?? "Gasto"}</span></span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: m.tipo === "Cobro" ? C.papel : C.oxido }}>{m.tipo === "Cobro" ? "+" : "−"}{mxn(Number(m.monto))}</span>
              </div>
            ))}
          </Glass>
        </div>
        <Tabla cols={W} heads={["CÓDIGO", "CLIENTE · PROYECTO", "ETAPA", "PRESUPUESTO", "HORAS", "COSTO DE HORAS", "MARGEN A LA FECHA", "FACTURADO"]} titulo="MARGEN POR PROYECTO">
          {d.proy.length === 0 && <Vacio>Sin proyectos todavía. El margen aparece cuando un proyecto tiene presupuesto (de su cotización) y horas registradas.</Vacio>}
          {d.proy.map((p) => {
            const h = (p.horas ?? []).reduce((s, x) => s + Number(x.horas), 0), costo = h * tarifas.costoHora, pres = Number(p.presupuesto), mg = pres - costo;
            const fact = d.fac.filter((f) => f.proyecto_id === p.id && f.estado !== "Cancelada" && f.estado !== "Borrador").reduce((s, f) => s + Number(f.monto), 0);
            return (
              <div key={p.id} style={fila(W)}>
                <span style={{ fontFamily: MONO, fontSize: 11 }}>{p.codigo}</span>
                <div style={{ minWidth: 0 }}><div>{p.cliente?.nombre ?? "—"}</div><div style={{ ...mono10, fontSize: 9.5, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nombre.toUpperCase()}</div></div>
                <span style={{ ...mono10, color: C.papel }}>{p.etapa.toUpperCase()}</span>
                <span style={{ fontFamily: MONO, fontSize: 12 }}>{mxn0(pres)}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: h > Number(p.horas_estimadas) && Number(p.horas_estimadas) > 0 ? C.oxido : C.niebla }}>{h} / {Number(p.horas_estimadas)}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.niebla }}>{mxn0(costo)}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: mg < 0 ? C.oxido : C.papel }}>{pres ? `${mxn0(mg)} · ${Math.round((mg / pres) * 100)} %` : "—"}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.niebla }}>{mxn0(fact)}</span>
              </div>
            );
          })}
        </Tabla>
        <div style={{ fontSize: 12.5, color: C.tenue, lineHeight: 1.5 }}>Presupuesto y margen van sin IVA; cobros y facturado incluyen IVA. El costo de horas usa tu costo por hora de Configuración → Tarifas y costos.</div>
      </section>
    </>
  );
}
