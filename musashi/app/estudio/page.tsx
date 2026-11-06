"use client";
import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { C, MONO } from "@/lib/tokens";
import { Glass, Eyebrow, H, Dot, PB, SB, RGlyph } from "@/components/ui";
import { useUI, PageHead } from "@/components/shell";

/* =====================================================================
   ESTUDIO DE CONTENIDO · la fábrica de piezas de Ronin Studio
   Flujo: Señales → Brief → Ideas → Fabricación (Higgsfield / ElevenLabs) → Paquete
   En modo demo la generación se simula; en producción el agente Productor
   envía estos mismos prompts a Higgsfield y ElevenLabs.
   ===================================================================== */

const TABS = ["Fábrica", "Estilo y tono", "Avatar y voz", "Biblioteca"];
const STEPS = ["Señales", "Brief", "Ideas", "Fabricación", "Paquete"];

type Signal = { id: string; agent: string; kind: string; title: string; why: string; data: string; hot?: boolean; topic: string; sector: string };
const SIGNALS: Signal[] = [
  { id: "s1", agent: "INVESTIGADOR", kind: "TEMA", title: "Cuánto cuesta copiar la misma orden tres veces", why: "Es el dolor más repetido en diagnósticos exprés de restaurantes este mes (6 de 9).", data: "6 DX EXPRÉS · 2 FUENTES", hot: true, topic: "La captura doble en restaurantes", sector: "Restaurantes" },
  { id: "s2", agent: "ANALISTA DE CANAL", kind: "GANCHO", title: "«El chatbot que nadie usa» fue el mejor gancho de octubre", why: "Alcance 4,000 y 2 leads; conviene una segunda parte con otro sector.", data: "IG · 4,000 ALCANCE · 2 LEADS", topic: "El chatbot que nadie usa, versión clínicas", sector: "Clínicas" },
  { id: "s3", agent: "SEGUIMIENTO", kind: "PREGUNTA", title: "«¿Y si mi gente no quiere usar el sistema?»", why: "Pregunta que aparece en 4 llamadas de 15 minutos. Nadie la responde en público.", data: "4 LLAMADAS · OBJECIÓN", topic: "Cuando el equipo no quiere usar el sistema", sector: "Todos" },
  { id: "s4", agent: "ESTRATEGA", kind: "HUECO", title: "Sábado 7 sin pieza en YouTube", why: "El calendario de la semana 45 deja el sábado vacío; el formato que mejor rinde ahí es video de 60 s.", data: "CALENDARIO · SEMANA 45", topic: "Cómo mapeamos una cocina en una mañana", sector: "Restaurantes" },
  { id: "s5", agent: "INVESTIGADOR", kind: "COMPETENCIA", title: "Dos competidores publican precio del diagnóstico", why: "Oportunidad de explicar qué incluye el nuestro sin hablar de precio.", data: "2 FUENTES · SITIOS", topic: "Qué incluye un diagnóstico de flujo", sector: "Todos" },
];

type Q = { k: string; label: string; opts: string[] };
const QUESTIONS: Q[] = [
  { k: "goal", label: "¿Para qué es esta pieza?", opts: ["Leads", "Autoridad", "Educar", "Lanzar producto"] },
  { k: "who", label: "¿Para quién?", opts: ["Restaurantes", "Clínicas", "Escuelas", "Gimnasios", "Talleres", "Manufactura", "Todos"] },
  { k: "fmt", label: "¿Qué formato?", opts: ["Video 9:16", "Carrusel", "Post", "Foto"] },
  { k: "angle", label: "¿Desde qué ángulo?", opts: ["El dolor", "El método", "Un caso", "El producto", "Un dato"] },
  { k: "face", label: "¿Quién aparece?", opts: ["Julio en cámara", "Clon de IA", "Solo visual"] },
  { k: "len", label: "¿Cuánto dura?", opts: ["30 s", "45 s", "60 s", "90 s"] },
  { k: "cta", label: "¿Qué pedimos al final?", opts: ["Diagnóstico exprés", "Escribir por WhatsApp", "Comentar", "Guardar"] },
];
const DEFAULT_BRIEF: Record<string, string> = { goal: "Leads", who: "Restaurantes", fmt: "Video 9:16", angle: "El dolor", face: "Julio en cámara", len: "60 s", cta: "Diagnóstico exprés" };

type Idea = { n: string; hook: string; premise: string; beats: string[]; why: string };
function makeIdeas(topic: string, b: Record<string, string>): Idea[] {
  const who = b.who === "Todos" ? "un negocio" : `un ${b.who.toLowerCase().replace(/s$/, "")}`;
  return [
    { n: "01", hook: `Esto le cuesta a ${who} más que la renta.`, premise: `${topic}: nombrar el dolor con una escena concreta y ponerle número solo si el número es real.`, beats: ["Escena del dolor (3 s)", "Qué pasa cada día por esa fuga", "Qué cambia cuando el flujo se ordena", "Un solo siguiente paso"], why: "Abre con consecuencia, no con tecnología. Es el ángulo que más leads trajo en octubre." },
    { n: "02", hook: "Nadie necesita un chatbot. Necesita que la orden llegue una sola vez.", premise: `${topic} contado desde el método: primero el flujo, después la IA.`, beats: ["Contraste chatbot vs. flujo", "Cómo lo mapeamos en una mañana", "Qué automatizamos y qué no", "Invitación al diagnóstico"], why: "Refuerza la promesa de marca y se diferencia de la oferta genérica de IA." },
    { n: "03", hook: "Lo que vimos en una cocina real el martes.", premise: `${topic} como mini caso: una visita, tres hallazgos, un cambio.`, beats: ["Llegada y primera señal", "Tres hallazgos en el mapa", "El cambio que se hizo", "Qué sigue"], why: "La prueba convence más que la promesa. Funciona en video con B-roll de Higgsfield." },
  ];
}

type Shot = { id: number; kind: "A-ROLL" | "B-ROLL FOTO" | "B-ROLL VIDEO" | "PORTADA"; t: string; prompt: string; model: string; status: "pendiente" | "en cola" | "generando" | "listo"; img?: string };
const SAMPLE = ["/estudio/portada-01.webp", "/estudio/portada-02.webp"];
function makeShots(b: Record<string, string>): Shot[] {
  const face = b.face === "Clon de IA" ? "Clon de Julio (Soul) · voz ElevenLabs" : b.face === "Julio en cámara" ? "Grabación en oficina · teleprompter" : "Sin presentador";
  return [
    { id: 1, kind: "A-ROLL", t: "Presentador · 0:00–0:60", prompt: face, model: b.face === "Clon de IA" ? "soul_2 + lipsync" : "cámara", status: "pendiente" },
    { id: 2, kind: "PORTADA", t: "Portada 9:16", prompt: "B/N documental, cocina de restaurante en servicio, manos anotando una orden en libreta, un solo elemento en Óxido (#B05139), sin texto, sin rostros.", model: "gpt_image_2_6", status: "pendiente", img: SAMPLE[0] },
    { id: 3, kind: "B-ROLL FOTO", t: "Plano del dolor · 0:03", prompt: "B/N, comanda de papel sobre acero inoxidable, tres copias de la misma orden, grano de película, alto contraste, sin texto.", model: "gpt_image_2_6", status: "pendiente", img: SAMPLE[1] },
    { id: 4, kind: "B-ROLL VIDEO", t: "Mapa de flujo · 0:20", prompt: "Clip de 5 s: mano dibujando un diagrama de flujo con marcador negro sobre papel crema, cámara fija, luz de ventana, un trazo en Óxido.", model: "video · image-to-video", status: "pendiente" },
    { id: 5, kind: "B-ROLL VIDEO", t: "El cambio · 0:40", prompt: "Clip de 5 s: pantalla de tablet con comanda digital en cocina, B/N salvo un botón en Óxido, sin marcas, sin texto legible.", model: "video · image-to-video", status: "pendiente" },
  ];
}

function script(topic: string, b: Record<string, string>) {
  const cta = { "Diagnóstico exprés": "Haz el diagnóstico exprés en roninstudio.com.mx; son cinco minutos y te decimos dónde se está yendo el tiempo.", "Escribir por WhatsApp": "Escríbenos por WhatsApp y te decimos en una llamada de 15 minutos si tiene sentido.", "Comentar": "Cuéntame en comentarios cómo lo resuelven hoy.", "Guardar": "Guarda este video para la próxima vez que pase." }[b.cta] ?? "";
  return [
    { t: "0:00–0:03", k: "GANCHO", s: `${topic}. Y no, no se arregla con un chatbot.` },
    { t: "0:03–0:15", k: "EL DOLOR", s: "Mesero anota en libreta. Cocina reescribe en el tablero. Caja captura en el POS. Tres veces la misma orden, y en una de las tres se equivoca alguien." },
    { t: "0:15–0:35", k: "QUÉ HACEMOS", s: "Nosotros primero vamos a la cocina y mapeamos el flujo real, no el que está en el manual. Ahí aparece dónde se atora. Y solo después decidimos qué parte conviene automatizar." },
    { t: "0:35–0:50", k: "LA PRUEBA", s: "En una cadena de steakhouses el cierre de caja pasó de una hoja de cálculo a un cierre automático. Lo que cambió no fue la tecnología: fue que la orden entra una sola vez." },
    { t: "0:50–0:60", k: "CIERRE", s: cta },
  ];
}

function chip(a: boolean): CSSProperties {
  return { height: 38, padding: "0 16px", borderRadius: 999, border: `1px solid ${a ? C.papel : "rgba(238,235,228,0.12)"}`, background: a ? C.papel : "rgba(22,26,33,0.55)", color: a ? C.tinta : C.papel, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontWeight: a ? 600 : 400, transition: "all .15s" };
}
const mono10: CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: C.tenue };

export default function Estudio() {
  const { flash } = useUI();
  const [tab, setTab] = useState(0);
  const [step, setStep] = useState(0);
  const [signal, setSignal] = useState<Signal | null>(null);
  const [brief, setBrief] = useState<Record<string, string>>(DEFAULT_BRIEF);
  const [note, setNote] = useState("");
  const [idea, setIdea] = useState<number | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [voice, setVoice] = useState<"pendiente" | "generando" | "lista">("pendiente");
  const [sent, setSent] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const topic = signal?.topic ?? "Tema libre";
  const ideas = useMemo(() => makeIdeas(topic, brief), [topic, brief]);
  const lines = useMemo(() => script(topic, brief), [topic, brief]);
  const done = shots.length > 0 && shots.every((s) => s.status === "listo") && voice === "lista";

  const pick = (s: Signal) => { setSignal(s); setBrief((b) => ({ ...b, who: s.sector === "Todos" ? b.who : s.sector })); setStep(1); };
  const goIdeas = () => { setStep(2); flash("Guionista: 3 ideas listas"); };
  const fabricate = (i: number) => { setIdea(i); setShots(makeShots(brief)); setVoice("pendiente"); setStep(3); };
  const generateAll = () => {
    setShots((ss) => ss.map((s) => (s.kind === "A-ROLL" && brief.face === "Julio en cámara" ? { ...s, status: "listo" } : { ...s, status: "en cola" })));
    shots.forEach((s, i) => {
      if (s.kind === "A-ROLL" && brief.face === "Julio en cámara") return;
      timers.current.push(setTimeout(() => setShots((ss) => ss.map((x) => (x.id === s.id ? { ...x, status: "generando" } : x))), 500 + i * 700));
      timers.current.push(setTimeout(() => setShots((ss) => ss.map((x) => (x.id === s.id ? { ...x, status: "listo" } : x))), 2200 + i * 900));
    });
    setVoice("generando");
    timers.current.push(setTimeout(() => { setVoice("lista"); flash("Productor: tomas y locución listas"); }, 3800));
  };

  return (
    <>
      <PageHead
        stage={1}
        eyebrow="02 · MARKETING · ESTUDIO DE CONTENIDO"
        title="ESTUDIO"
        sub="De la señal del agente a la pieza publicada · Higgsfield para imagen y video · ElevenLabs para voz"
        style={{ paddingTop: 34, gap: 24, animation: "rise .6s cubic-bezier(.2,.7,.2,1) both" }}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ ...mono10, padding: "0 16px", height: 48, display: "flex", alignItems: "center", gap: 10, borderRadius: 999, border: `1px solid ${C.borde}`, background: "rgba(22,26,33,0.55)" }}>
              <Dot color={C.olivo} />HIGGSFIELD · 951 CRÉDITOS<span style={{ color: C.borde2 }}>·</span>ELEVENLABS · OK
            </div>
            <H as="button" type="button" onClick={() => { setTab(0); setStep(0); setSignal(null); setIdea(null); setShots([]); setSent(false); }}
              style={{ height: 48, padding: "0 22px", borderRadius: 999, background: C.oxido, color: C.papel, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 0 28px rgba(176,81,57,.45)" }} hover={{ background: C.oxidoHover }}>
              Nueva pieza
            </H>
          </div>
        }
      />

      <nav style={{ display: "flex", gap: 6, padding: "22px 32px 0" }}>
        {TABS.map((l, i) => { const a = i === tab; return <H key={l} as="button" type="button" onClick={() => setTab(i)} style={{ ...chip(a), height: 44, padding: "0 18px" }} hover={a ? {} : { borderColor: C.acero }}>{l}</H>; })}
      </nav>

      {tab === 0 && (
        <section style={{ padding: "22px 32px 48px", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Pasos */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {STEPS.map((s, i) => {
              const a = i === step, d = i < step;
              return (
                <React.Fragment key={s}>
                  <button type="button" onClick={() => { if (d) setStep(i); }} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: d ? "pointer" : "default", padding: 0 }}>
                    <span style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, background: a ? C.oxido : d ? C.papel : "rgba(22,26,33,0.8)", color: a || d ? (a ? C.papel : C.tinta) : C.tenue, border: `1px solid ${a ? C.oxido : d ? C.papel : C.borde}`, boxShadow: a ? "0 0 22px rgba(176,81,57,.5)" : "none", animation: a ? "pulseOx 2.4s infinite" : "none" }}>{`0${i + 1}`}</span>
                    <span style={{ fontSize: 13, fontWeight: a ? 600 : 400, color: a || d ? C.papel : C.tenue }}>{s}</span>
                  </button>
                  {i < STEPS.length - 1 && <span style={{ flex: 1, height: 1, background: d ? C.papel : C.borde, margin: "0 14px" }} />}
                </React.Fragment>
              );
            })}
          </div>

          {/* 01 Señales */}
          {step === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
              <Glass>
                <Eyebrow>LO QUE LOS AGENTES VIERON ESTA SEMANA · {SIGNALS.length} SEÑALES</Eyebrow>
                <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", marginTop: 6, marginBottom: 14 }}>¿DE QUÉ HACEMOS CONTENIDO?</div>
                {SIGNALS.map((s, i) => (
                  <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center", borderTop: `1px solid ${C.borde}`, padding: "14px 0", animation: "rise .5s both", animationDelay: `${i * 0.06}s` }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, ...mono10 }}><Dot color={s.hot ? C.oxido : C.acero} anim={s.hot ? "pulseOx 2s infinite" : undefined} />{s.agent} · {s.kind}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 5 }}>{s.title}</div>
                      <div style={{ fontSize: 13, color: C.niebla, marginTop: 3, textWrap: "pretty" }}>{s.why}</div>
                      <div style={{ ...mono10, marginTop: 6 }}>{s.data}</div>
                    </div>
                    <SB small onClick={() => pick(s)} style={s.hot ? { borderColor: C.oxido } : undefined}>Usar esta señal</SB>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${C.borde}`, paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: C.niebla }}>¿Tienes un tema propio? Empieza sin señal.</span>
                  <SB small onClick={() => { setSignal({ id: "x", agent: "JULIO", kind: "TEMA LIBRE", title: "Tema libre", why: "", data: "", topic: "Tema libre", sector: "Todos" }); setStep(1); }}>Tema libre</SB>
                </div>
              </Glass>
              <Glass style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Eyebrow>CÓMO FUNCIONA</Eyebrow>
                {[["01", "Señal", "Investigador, Analista de canal, Seguimiento y Estratega dejan aquí lo que vale la pena contar."], ["02", "Brief", "Siete preguntas de un toque. Menos de un minuto."], ["03", "Ideas", "El Guionista propone tres ángulos con gancho y estructura."], ["04", "Fabricación", "Guion con tiempos, plan de tomas y prompts. El Productor genera imagen y video en Higgsfield y la voz en ElevenLabs."], ["05", "Paquete", "Video, portada, textos por red y horario. Un botón: a la bandeja de aprobación."]].map(([n, t, d]) => (
                  <div key={n} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 10 }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: C.acero, paddingTop: 2 }}>{n}</span>
                    <div><div style={{ fontSize: 14, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 13, color: C.niebla, lineHeight: 1.4, textWrap: "pretty" }}>{d}</div></div>
                  </div>
                ))}
                <div style={{ marginTop: "auto", background: C.p2, border: `1px dashed ${C.borde2}`, borderRadius: 14, padding: "10px 12px", fontSize: 12.5, color: C.niebla, lineHeight: 1.4 }}>Regla de la casa: ninguna cifra en pantalla que no sea real. Si no hay dato, se cuenta la escena.</div>
              </Glass>
            </div>
          )}

          {/* 02 Brief */}
          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
              <Glass>
                <Eyebrow>BRIEF RÁPIDO · 7 PREGUNTAS</Eyebrow>
                <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", marginTop: 6 }}>{topic.toUpperCase()}</div>
                <div style={{ fontSize: 13, color: C.niebla, marginTop: 2 }}>Señal de {signal?.agent.toLowerCase()} · toca una opción por pregunta</div>
                {QUESTIONS.map((q) => (
                  <div key={q.k} style={{ borderTop: `1px solid ${C.borde}`, padding: "14px 0", display: "grid", gridTemplateColumns: "200px 1fr", gap: 14, alignItems: "center" }}>
                    <div style={{ fontSize: 14 }}>{q.label}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {q.opts.map((o) => <H key={o} as="button" type="button" onClick={() => setBrief((b) => ({ ...b, [q.k]: o }))} style={chip(brief[q.k] === o)} hover={brief[q.k] === o ? {} : { borderColor: C.acero }}>{o}</H>)}
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${C.borde}`, padding: "14px 0 4px", display: "grid", gridTemplateColumns: "200px 1fr", gap: 14, alignItems: "center" }}>
                  <div style={{ fontSize: 14 }}>Algo que no puede faltar</div>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Una frase, un dato real, una objeción que quieras responder…" style={{ height: 44, padding: "0 16px", borderRadius: 999, background: C.p2, border: `1px solid ${C.borde}`, color: C.papel, fontSize: 13, outline: "none" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                  <SB onClick={() => setStep(0)}>Volver</SB>
                  <PB onClick={goIdeas}>Generar ideas</PB>
                </div>
              </Glass>
              <Glass style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Eyebrow>RESUMEN DEL BRIEF</Eyebrow>
                {QUESTIONS.map((q) => (
                  <div key={q.k} style={{ display: "flex", justifyContent: "space-between", gap: 10, borderBottom: `1px solid ${C.borde}`, padding: "8px 0" }}>
                    <span style={mono10}>{q.label.replace("¿", "").replace("?", "").toUpperCase()}</span>
                    <span style={{ fontSize: 13 }}>{brief[q.k]}</span>
                  </div>
                ))}
                {brief.face === "Clon de IA" && <div style={{ background: "rgba(176,81,57,0.1)", border: `1px solid ${C.oxido}`, borderRadius: 14, padding: "10px 12px", fontSize: 12.5, lineHeight: 1.4 }}>Con clon de IA la pieza lleva aviso de "imagen y voz generadas con IA" en la descripción. Política de la casa.</div>}
              </Glass>
            </div>
          )}

          {/* 03 Ideas */}
          {step === 2 && (
            <Glass>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <Eyebrow>BORRADOR DE IA · GUIONISTA · CLAUDE</Eyebrow>
                  <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", marginTop: 6 }}>TRES ÁNGULOS PARA «{topic.toUpperCase()}»</div>
                  <div style={{ fontSize: 13, color: C.niebla, marginTop: 2 }}>{brief.fmt} · {brief.len} · {brief.who} · {brief.angle.toLowerCase()} · {brief.face.toLowerCase()}</div>
                </div>
                <SB onClick={() => setStep(1)}>Ajustar brief</SB>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
                {ideas.map((it, i) => (
                  <H key={it.n} style={{ background: "rgba(12,15,20,0.5)", border: `1px solid ${i === 0 ? C.oxido : "rgba(238,235,228,0.09)"}`, boxShadow: i === 0 ? "0 0 26px rgba(176,81,57,0.25)" : "none", borderRadius: 20, padding: 18, display: "flex", flexDirection: "column", gap: 10, transition: "transform .2s" }} hover={{ transform: "translateY(-3px)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", ...mono10 }}><span>IDEA {it.n}</span>{i === 0 && <span style={{ color: C.oxido }}>RECOMENDADA</span>}</div>
                    <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.25, textWrap: "pretty" }}>«{it.hook}»</div>
                    <div style={{ fontSize: 13, color: C.niebla, lineHeight: 1.45, textWrap: "pretty" }}>{it.premise}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: `1px solid ${C.borde}`, paddingTop: 10 }}>
                      {it.beats.map((b, k) => <div key={k} style={{ display: "flex", gap: 8, fontSize: 12.5 }}><span style={{ fontFamily: MONO, fontSize: 10, color: C.acero, paddingTop: 2 }}>{k + 1}</span>{b}</div>)}
                    </div>
                    <div style={{ fontSize: 12, color: C.tenue, lineHeight: 1.4, textWrap: "pretty", flex: 1 }}>{it.why}</div>
                    <PB small onClick={() => fabricate(i)} style={{ alignSelf: "flex-start" }}>Fabricar esta</PB>
                  </H>
                ))}
              </div>
            </Glass>
          )}

          {/* 04 Fabricación */}
          {step === 3 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Glass>
                <Eyebrow>GUION CON TIEMPOS · {brief.len} · {brief.face.toUpperCase()}</Eyebrow>
                <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em", marginTop: 6, textWrap: "pretty" }}>«{ideas[idea ?? 0].hook.toUpperCase()}»</div>
                {lines.map((l) => (
                  <div key={l.t} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 12, borderTop: `1px solid ${C.borde}`, padding: "12px 0" }}>
                    <div><div style={{ fontFamily: MONO, fontSize: 12, color: C.papel }}>{l.t}</div><div style={mono10}>{l.k}</div></div>
                    <div style={{ fontSize: 14, lineHeight: 1.45, textWrap: "pretty" }}>{l.s}</div>
                  </div>
                ))}
                {note && <div style={{ background: C.p2, border: `1px dashed ${C.borde2}`, borderRadius: 14, padding: "10px 12px", fontSize: 13, color: C.niebla }}>No puede faltar: {note}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <SB small onClick={() => flash("Guion copiado al teleprompter")}>Al teleprompter</SB>
                  <SB small onClick={() => flash("Abriendo editor del guion")}>Editar</SB>
                </div>
              </Glass>
              <Glass style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Eyebrow>PLAN DE TOMAS · PRODUCTOR · HIGGSFIELD + ELEVENLABS</Eyebrow>
                    <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em", marginTop: 6 }}>{shots.length} TOMAS · 1 LOCUCIÓN</div>
                  </div>
                  <PB small onClick={generateAll} disabled={shots.some((s) => s.status !== "pendiente")} style={shots.some((s) => s.status !== "pendiente") ? { opacity: 0.5, cursor: "default" } : undefined}>Generar todo</PB>
                </div>
                {shots.map((s) => {
                  const col = s.status === "listo" ? C.olivo : s.status === "generando" ? C.ambar : s.status === "en cola" ? C.niebla : C.acero;
                  return (
                    <div key={s.id} style={{ display: "grid", gridTemplateColumns: "54px 1fr", gap: 12, borderTop: `1px solid ${C.borde}`, padding: "12px 0" }}>
                      <div style={{ width: 54, height: 96, borderRadius: 10, background: s.img && s.status === "listo" ? `url(${s.img}) center/cover` : "linear-gradient(180deg,#1B2027,#101318)", border: `1px solid ${C.borde}`, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 6, overflow: "hidden", position: "relative" }}>
                        {s.status === "generando" && <span style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, background: C.ambar, animation: "sweep 1.4s linear infinite" }} />}
                        {!(s.img && s.status === "listo") && <span style={{ fontFamily: MONO, fontSize: 8, color: C.tenue }}>{s.kind.split(" ")[0]}</span>}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{s.t}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, ...mono10, color: C.papel }}><Dot color={col} anim={s.status === "generando" ? "blink 1s infinite" : undefined} />{s.status.toUpperCase()}</span>
                        </div>
                        <div style={{ ...mono10, marginTop: 3 }}>{s.kind} · {s.model}</div>
                        <div style={{ fontSize: 12.5, color: C.niebla, lineHeight: 1.4, marginTop: 5, textWrap: "pretty" }}>{s.prompt}</div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: "grid", gridTemplateColumns: "54px 1fr", gap: 12, borderTop: `1px solid ${C.borde}`, padding: "12px 0" }}>
                  <div style={{ width: 54, height: 54, borderRadius: "50%", background: C.p3, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 9, color: C.tenue }}>VOZ</div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 14, fontWeight: 600 }}>Locución · {brief.face === "Solo visual" ? "voz en off de Julio" : "voz de Julio"}</span><span style={{ display: "flex", alignItems: "center", gap: 6, ...mono10, color: C.papel }}><Dot color={voice === "lista" ? C.olivo : voice === "generando" ? C.ambar : C.acero} />{voice.toUpperCase()}</span></div>
                    <div style={{ ...mono10, marginTop: 3 }}>ELEVENLABS · CLON DE VOZ · ES-MX · SUBTÍTULOS AUTOMÁTICOS</div>
                  </div>
                </div>
                <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12 }}>
                  <span style={{ fontSize: 12.5, color: C.tenue }}>En producción, estos prompts salen tal cual al Productor.</span>
                  <PB onClick={() => setStep(4)} disabled={!done} style={!done ? { opacity: 0.5, cursor: "default", boxShadow: "none" } : undefined}>Armar paquete</PB>
                </div>
              </Glass>
            </div>
          )}

          {/* 05 Paquete */}
          {step === 4 && (
            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
              <Glass style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Eyebrow>PIEZA LISTA · {brief.fmt.toUpperCase()}</Eyebrow>
                <div style={{ width: "100%", aspectRatio: "9/16", borderRadius: 18, background: `url(${SAMPLE[0]}) center/cover`, border: `1px solid ${C.borde}`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(12,15,20,0) 40%,rgba(12,15,20,.85))" }} />
                  <div style={{ position: "absolute", left: 14, right: 14, bottom: 16 }}>
                    <div style={{ ...mono10, color: C.papel }}>RONIN STUDIO</div>
                    <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 4, textTransform: "uppercase" }}>{ideas[idea ?? 0].hook}</div>
                  </div>
                  <span style={{ position: "absolute", top: 12, left: 12, width: 6, height: 24, background: C.oxido, transform: "skewY(-14deg)", boxShadow: `0 0 10px ${C.oxido}` }} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <SB small onClick={() => flash("Reproduciendo vista previa")}>Ver</SB>
                  <SB small onClick={() => flash("Descargando MP4 1080×1920")}>MP4</SB>
                  <SB small onClick={() => flash("Portada descargada")}>Portada</SB>
                </div>
              </Glass>
              <Glass style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <Eyebrow>PAQUETE COMPLETO · LISTO PARA APROBAR</Eyebrow>
                    <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-0.02em", marginTop: 6 }}>{topic.toUpperCase()}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <SB onClick={() => setStep(3)}>Volver a tomas</SB>
                    <PB onClick={() => { setSent(true); flash("Enviado a la bandeja de aprobación"); }} disabled={sent} style={sent ? { opacity: 0.5, boxShadow: "none" } : undefined}>{sent ? "En aprobación" : "Enviar a aprobación"}</PB>
                  </div>
                </div>
                {[
                  ["INSTAGRAM · REEL", `${ideas[idea ?? 0].hook}\n\nTres veces la misma orden: libreta, tablero, POS. Primero ordenamos el flujo; después decidimos qué automatizar.\n\nDiagnóstico exprés en el enlace del perfil.`, "#restaurantes #juarez #elpaso #operacion #primeroelflujo"],
                  ["LINKEDIN · POST", `${ideas[idea ?? 0].hook}\n\nEn restaurantes con sucursales la fuga no está en el sistema: está en que la orden se captura tres veces. Mapear el flujo real toma una mañana; automatizar sin mapear toma meses.\n\nSi diriges un negocio de servicios, el diagnóstico exprés toma cinco minutos.`, ""],
                  ["TIKTOK · VIDEO", `${ideas[idea ?? 0].hook} #restaurantes #negocios #ia`, ""],
                  ["YOUTUBE · SHORT", `Título: ${ideas[idea ?? 0].hook}\nDescripción: Primero el flujo. Después la IA. Diagnóstico exprés en roninstudio.com.mx${brief.face === "Clon de IA" ? "\nImagen y voz generadas con IA a partir de Julio César Ibarra." : ""}`, ""],
                ].map(([ch, txt, tags]) => (
                  <div key={ch} style={{ display: "grid", gridTemplateColumns: "140px 1fr auto", gap: 14, borderTop: `1px solid ${C.borde}`, padding: "12px 0", alignItems: "start" }}>
                    <div style={mono10}>{ch}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.45, whiteSpace: "pre-wrap", textWrap: "pretty" }}>{txt}{tags && <div style={{ ...mono10, marginTop: 6, color: C.niebla }}>{tags}</div>}</div>
                    <button type="button" onClick={() => flash("Texto copiado")} style={{ height: 30, padding: "0 12px", borderRadius: 999, background: "transparent", border: `1px solid ${C.borde2}`, color: C.papel, fontSize: 11, cursor: "pointer" }}>Copiar</button>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, borderTop: `1px solid ${C.borde}`, paddingTop: 14, marginTop: 2 }}>
                  {[["PUBLICACIÓN", "Sáb 7 nov · 19:00", "hueco del calendario"], ["CANALES", "IG · TT · YT · LI", "4 salidas, 1 pieza"], ["ORIGEN", signal?.agent ?? "—", "señal usada"], ["COSTO", "≈ 38 créditos", "Higgsfield + voz"]].map(([k, v, s]) => (
                    <div key={k} style={{ background: C.p2, borderRadius: 14, padding: "10px 12px" }}><div style={mono10}>{k}</div><div style={{ fontSize: 14, marginTop: 4 }}>{v}</div><div style={{ fontSize: 11.5, color: C.tenue }}>{s}</div></div>
                  ))}
                </div>
              </Glass>
            </div>
          )}
        </section>
      )}

      {tab === 1 && <EstiloTono />}
      {tab === 2 && <AvatarVoz />}
      {tab === 3 && <Biblioteca />}
    </>
  );
}

/* ---------- Estilo y tono ---------- */
function EstiloTono() {
  const { flash } = useUI();
  const blocks: [string, string, string[]][] = [
    ["VOZ", "Cómo hablamos", ["Directo y concreto. Una idea por frase. Sin jerga de IA.", "Hablamos de flujo, tiempo y dinero; la tecnología va al final.", "Cifras solo si son reales y de un cliente que lo autoriza. Si no, se cuenta la escena.", "Tono de taller, no de conferencia: se nota que venimos de piso."]],
    ["ESTRUCTURA", "Cómo se arma una pieza", ["Gancho de 3 segundos con consecuencia, no con promesa.", "Dolor → qué hacemos → prueba → un solo siguiente paso.", "Siempre una frase de marca: «Primero el flujo. Después la IA.»", "Cierre con una sola llamada: diagnóstico exprés o WhatsApp."]],
    ["VISUAL", "Cómo se ve", ["Fondo Tinta (#0C0F14), texto Papel (#EEEBE4), un solo acento Óxido (#B05139).", "B-roll en blanco y negro con un elemento en color; grano de película; luz natural.", "Rótulos en JetBrains Mono (mayúsculas, espaciado 0.12em); títulos en Archivo 900.", "Nada de stock brillante, nada de robots, nada de pantallas azules."]],
    ["AUDIO", "Cómo suena", ["Voz propia o clon de voz de Julio, ritmo pausado, sin música épica.", "Música de fondo baja o ninguna; silencio en el gancho.", "Subtítulos siempre, blancos con sombra, dos líneas máximo."]],
    ["FORMATOS", "Qué fabricamos", ["Video 9:16 de 30 a 60 s: el formato base, 2 por semana.", "Carrusel de 6 láminas: método, señales, casos.", "Post de texto en LinkedIn: 120 a 180 palabras, una idea.", "Video de 90 s en YouTube: un caso o una visita contada."]],
    ["NO HACEMOS", "Líneas rojas", ["No nombrar clientes sin permiso; «una cadena de steakhouses» basta.", "No prometer porcentajes de ahorro ni plazos.", "No usar «revoluciona», «potencia», «impulsa» ni «el futuro».", "No publicar piezas con clon de IA sin el aviso en la descripción."]],
  ];
  return (
    <section style={{ padding: "22px 32px 48px", display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 16 }}>
      {blocks.map(([k, t, items], i) => (
        <Glass key={k} delay={`${i * 0.06}s`} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Eyebrow>{k}</Eyebrow>
          <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em", textTransform: "uppercase" }}>{t}</div>
          {items.map((s, j) => <div key={j} style={{ display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.45, borderTop: `1px solid ${C.borde}`, paddingTop: 10, textWrap: "pretty" }}><span style={{ width: 3, height: 12, background: C.oxido, transform: "skewY(-14deg)", flexShrink: 0, marginTop: 4 }} />{s}</div>)}
        </Glass>
      ))}
      <Glass style={{ gridColumn: "span 3", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <Eyebrow>REFERENCIA VISUAL</Eyebrow>
          <div style={{ fontSize: 14, marginTop: 6, textWrap: "pretty" }}>Dos cuadros generados en Higgsfield con esta guía: B/N documental, un solo acento Óxido, sin texto ni rostros. El Productor usa este mismo prompt base para todo el B-roll.</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {SAMPLE.map((s) => <div key={s} style={{ width: 90, height: 160, borderRadius: 12, background: `url(${s}) center/cover`, border: `1px solid ${C.borde}` }} />)}
        </div>
        <SB onClick={() => flash("Guía exportada como PDF")}>Exportar guía</SB>
      </Glass>
    </section>
  );
}

/* ---------- Avatar y voz ---------- */
function AvatarVoz() {
  const { flash } = useUI();
  const [mode, setMode] = useState(1);
  const opts = [
    { t: "Julio en cámara", for: "Autoridad y confianza", pros: ["Lo que vende en servicios es la persona.", "Cero riesgo de rechazo del público.", "Material para entrenar el clon."], cons: ["Depende de tu agenda.", "Una sesión por semana, mínimo."], use: "Piezas de autoridad, casos, respuestas a objeciones." },
    { t: "Híbrido: Julio + clon de IA", for: "Volumen sin perder la cara", pros: ["Tú grabas 1 vez por semana; el clon cubre 3 o 4 explicativos.", "Misma voz, mismo encuadre, mismo tono.", "Higgsfield genera el B-roll; nadie actúa."], cons: ["Hay que entrenar Soul (5 a 20 fotos) y la voz (10 min de audio).", "Aviso de IA obligatorio en cada pieza con clon."], use: "Explicativos cortos, respuestas rápidas, series por sector.", rec: true },
    { t: "Presentador sintético", for: "Volumen máximo", pros: ["Sin agenda.", "Costo bajo por pieza."], cons: ["Rompe la promesa de marca: nadie confía su operación a un avatar genérico.", "Se parece a todo lo que ya circula."], use: "No recomendado para Ronin Studio." },
  ];
  return (
    <section style={{ padding: "22px 32px 48px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
        {opts.map((o, i) => (
          <H key={o.t} onClick={() => setMode(i)} style={{ ...{ background: "rgba(22,26,33,0.5)", backdropFilter: "blur(22px) saturate(140%)", WebkitBackdropFilter: "blur(22px) saturate(140%)" }, border: `1px solid ${mode === i ? C.papel : o.rec ? C.oxido : "rgba(238,235,228,0.09)"}`, boxShadow: o.rec ? "0 0 26px rgba(176,81,57,0.25)" : "inset 0 1px 0 rgba(238,235,228,0.08)", borderRadius: 24, padding: 22, cursor: "pointer", display: "flex", flexDirection: "column", gap: 10, transition: "transform .2s" }} hover={{ transform: "translateY(-3px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", ...mono10 }}><span>OPCIÓN 0{i + 1}</span>{o.rec && <span style={{ color: C.oxido }}>RECOMENDADA</span>}{mode === i && !o.rec && <span style={{ color: C.papel }}>ELEGIDA</span>}</div>
            <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-0.02em", textTransform: "uppercase" }}>{o.t}</div>
            <div style={{ fontSize: 13, color: C.niebla }}>{o.for}</div>
            <div style={{ borderTop: `1px solid ${C.borde}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
              {o.pros.map((p) => <div key={p} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.4 }}><Dot color={C.olivo} style={{ marginTop: 6 }} />{p}</div>)}
              {o.cons.map((p) => <div key={p} style={{ display: "flex", gap: 8, fontSize: 13, lineHeight: 1.4, color: C.niebla }}><Dot color={C.oxido} style={{ marginTop: 6 }} />{p}</div>)}
            </div>
            <div style={{ ...mono10, marginTop: "auto", paddingTop: 8 }}>USO · <span style={{ color: C.papel, letterSpacing: 0, fontFamily: "inherit", fontSize: 12.5 }}>{o.use}</span></div>
          </H>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Glass style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Eyebrow>ACTIVOS DEL CLON · ESTADO</Eyebrow>
          {[["Soul de Julio (Higgsfield)", "Pendiente de entrenar · 5 a 20 fotos, 10 minutos", C.ambar, "Entrenar"], ["Voz de Julio (ElevenLabs)", "Pendiente · 10 minutos de audio limpio leído en la oficina", C.ambar, "Grabar guía"], ["Encuadre y fondo base", "Definido · oficina, luz de ventana, fondo Tinta", C.olivo, "Ver"], ["Aviso de IA", "Texto fijo en descripción cuando aparece el clon", C.olivo, "Editar"]].map(([t, s, c, b]) => (
            <div key={t} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", borderTop: `1px solid ${C.borde}`, paddingTop: 12 }}>
              <div><div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}><Dot color={c} />{t}</div><div style={{ fontSize: 12.5, color: C.niebla, marginTop: 3, marginLeft: 14 }}>{s}</div></div>
              <SB small onClick={() => flash(`${b}: pendiente de conectar`)}>{b}</SB>
            </div>
          ))}
        </Glass>
        <Glass style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Eyebrow>CÓMO SE REPARTE LA SEMANA (HÍBRIDO)</Eyebrow>
          {[["LUN", "Grabación en oficina · 45 min", "2 piezas de autoridad con Julio en cámara + material para el clon"], ["MAR", "Clon de IA · explicativo 1", "Guion del Guionista, voz clonada, B-roll Higgsfield"], ["JUE", "Clon de IA · explicativo 2", "Serie por sector: una señal, un dolor, un siguiente paso"], ["VIE", "Carrusel + post LinkedIn", "Sin presentador: Higgsfield y texto"], ["SÁB", "Video 90 s YouTube", "Caso o visita contada por Julio; se graba el lunes"]].map(([d, t, s]) => (
            <div key={d} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 12, borderTop: `1px solid ${C.borde}`, paddingTop: 12 }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: C.papel }}>{d}</span>
              <div><div style={{ fontSize: 14 }}>{t}</div><div style={{ fontSize: 12.5, color: C.niebla, marginTop: 2 }}>{s}</div></div>
            </div>
          ))}
          <div style={{ marginTop: "auto", background: "rgba(176,81,57,0.1)", border: `1px solid ${C.oxido}`, borderRadius: 14, padding: "10px 12px", fontSize: 12.5, lineHeight: 1.45 }}>Tu cara sigue siendo la marca. El clon no te reemplaza en lo que vende; te multiplica en lo que explica.</div>
        </Glass>
      </div>
    </section>
  );
}

/* ---------- Biblioteca ---------- */
function Biblioteca() {
  const rows: [string, string, string, string, string, string][] = [
    ["El chatbot que nadie usa", "Carrusel · IG", "Investigador", "Publicada", "4,000 · 2 leads", "LUN 2"],
    ["Primero el flujo. Después la IA.", "Post · LI", "Estratega", "Publicada", "1,500 · 1 lead", "MAR 3"],
    ["Lo que pierdes copiando la misma orden tres veces", "Video 9:16 · TT", "Investigador", "Aprobación", "—", "JUE 5"],
    ["Cómo mapeamos una cocina en una mañana", "Video 90 s · YT", "Estratega", "Producción", "—", "VIE 6"],
    ["Cuatro señales de que tu operación vive en WhatsApp", "Carrusel · IG", "Analista de canal", "Guion", "—", "SÁB 7"],
  ];
  const colr: Record<string, string> = { Publicada: C.olivo, Aprobación: C.oxido, Producción: C.ambar, Guion: C.niebla };
  return (
    <section style={{ padding: "22px 32px 48px" }}>
      <Glass pad="4px 22px 10px" radius={24}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "18px 0 4px" }}><div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.02em", textTransform: "uppercase" }}>Piezas fabricadas</div><div style={mono10}>SEMANA 45 · 5 PIEZAS</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 70px", gap: 16, padding: "14px 0 10px", borderBottom: "1px solid rgba(238,235,228,0.09)" }}>
          {["PIEZA", "FORMATO", "SEÑAL", "ESTADO", "RESULTADO", "DÍA"].map((h) => <div key={h} style={mono10}>{h}</div>)}
        </div>
        {rows.map((r) => (
          <H key={r[0]} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 70px", gap: 16, padding: "12px 0", alignItems: "center", borderBottom: "1px solid rgba(238,235,228,0.06)", cursor: "pointer" }} hover={{ background: "rgba(238,235,228,0.035)" }}>
            <div style={{ fontSize: 13.5 }}>{r[0]}</div>
            <div style={{ fontSize: 13, color: "#D9D5CD" }}>{r[1]}</div>
            <div style={{ fontSize: 13, color: "#D9D5CD" }}>{r[2]}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, ...mono10, color: C.papel }}><Dot color={colr[r[3]]} />{r[3].toUpperCase()}</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.niebla }}>{r[4]}</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.tenue }}>{r[5]}</div>
          </H>
        ))}
      </Glass>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, ...mono10 }}><RGlyph active={3} size={14} />LAS PIEZAS PUBLICADAS ALIMENTAN AL ANALISTA DE CANAL; SUS MÉTRICAS VUELVEN COMO SEÑALES.</div>
    </section>
  );
}
