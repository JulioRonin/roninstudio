export type Lang = "es" | "en";

/* Nombre del ERP de CNC — cámbialo aquí en un solo lugar.
   Candidatos: Kanri · Takt · Koma · Hone */
export const ERP_NAME = "Kanri";

export const content = {
  es: {
    nav: {
      product: "GENBA",
      how: "Cómo funciona",
      case: "Caso real",
      about: "Quién está detrás",
      cta: "Probar gratis",
    },
    hero: {
      badge: "Hecho por ingenieros de planta · Ciudad Juárez",
      title: "Software e IA para la",
      titleAccent: "manufactura del norte de México",
      sub: "Deja el cronómetro y el Excel. Convierte el video de una estación de trabajo en estudios de tiempo, balanceo de línea (Yamazumi) y análisis de capacidad — en minutos, en español, con IA.",
      ctaPrimary: "Probar GENBA gratis 20 días",
      ctaSecondary: "Ver demo de 90s",
      stat1: "Minutos",
      stat1Label: "de un video a un estudio formal",
      stat2: "0 créditos",
      stat2Label: "si capturas a mano",
      stat3: "ISO 9001",
      stat3Label: "entregables firmables",
    },
    logos: "Construido sobre el lenguaje del piso: Yamazumi · SPC · PFMEA · OEE · Takt",
    how: {
      kicker: "GENBA Studies",
      title: "De un video del piso a un entregable formal",
      sub: "Tres pasos. El ingeniero siempre en el bucle: nada se auto-aprueba.",
      steps: [
        {
          n: "01",
          title: "Captura",
          body: "Sube un video de la estación de trabajo o captura las operaciones a mano. Sin hardware especial, desde tu teléfono.",
        },
        {
          n: "02",
          title: "Analiza con IA",
          body: "GENBA extrae tiempos de ciclo, balancea la línea (Yamazumi), detecta el cuello de botella y calcula capacidad y OEE.",
        },
        {
          n: "03",
          title: "Entregable firmable",
          body: "Genera el estudio de tiempos, capacidad y reportes en PDF/Excel listos para firmar. Tú apruebas; la IA asiste, nunca controla.",
        },
      ],
    },
    forWhom: {
      kicker: "Para quién",
      title: "Para el ingeniero industrial de la maquila mexicana",
      sub: "Hablamos tu idioma porque venimos del piso: una década en manufactura pesada (BRP / Can-Am) antes de construir software.",
      bullets: [
        { t: "Estudios de tiempo y métodos", d: "Tiempo estándar, valoración de ritmo y suplementos — sin cronómetro." },
        { t: "Balanceo de línea (Yamazumi)", d: "Visualiza la carga por estación y reasigna para subir eficiencia." },
        { t: "Capacidad y OEE", d: "Manpower, piezas/hora, sensibilidad y cuello de botella en segundos." },
        { t: "Calidad y seguridad", d: "PFMEA y JSA en camino, sobre los mismos datos del proceso." },
      ],
    },
    caseStudy: {
      kicker: "Caso real",
      title: `${ERP_NAME}: digitalizamos la operación completa de un taller CNC`,
      sub: "Para IMC Design (manufactura CNC para maquiladoras en Juárez) construimos un ERP/CRM que cubre todo el ciclo bajo un solo techo digital.",
      flow: "Cotización → Compra → Diseño → Master Plan → Producción → Calidad (ISO 9001) → Embarque → Portal del cliente",
      points: [
        { t: "Reporte dimensional ISO 9001", d: "Plano globalizado (ballooned) con OK/NG automático — nativo, no un extra." },
        { t: "Master Plan PMI realista", d: "Scheduler con días hábiles y escalamiento por volumen, no un Gantt manual." },
        { t: "Portal del cliente con magic link", d: "El cliente ve avance y entregables sin pelear con otro login." },
        { t: "White-label completo", d: "Cada taller ve su marca, no la nuestra. Listo para multi-tenant." },
      ],
      quote: "“Pasó de ser un sistema interno a un producto que vendemos como SaaS a otros talleres y maquilas.”",
    },
    founder: {
      kicker: "Quién está detrás",
      title: "Julio Ibarra — Julio Ronin",
      role: "Ingeniero en Sistemas Automotrices · Project Manager",
      body: "Una década liderando proyectos e ingeniería en manufactura pesada —BRP (Can-Am, Ski-Doo, Ryker), NPI/NPD de P1 a SOP— y ahora construyendo software con IA. Esa es la diferencia: no es software hecho por programadores que nunca pisaron una planta. Es software hecho por alguien que vivió el piso y el cronómetro.",
      tags: ["Lean & ergonomía", "Estudios de tiempo", "Project Management", "Forecast & business case", "Desarrollo con IA"],
    },
    finalCta: {
      title: "¿Listo para dejar el cronómetro?",
      sub: "Prueba GENBA 20 días gratis, sin tarjeta. O agenda un diagnóstico de tu operación.",
      ctaPrimary: "Probar GENBA gratis",
      ctaSecondary: "Agendar diagnóstico",
      contact: "Ciudad Juárez, Chihuahua · ibarra.julio800@gmail.com",
    },
    footer: {
      tagline: "Software de ingeniería industrial e IA para la manufactura del norte de México.",
      products: "Productos",
      company: "Estudio",
      rights: "Todos los derechos reservados.",
    },
  },

  en: {
    nav: {
      product: "GENBA",
      how: "How it works",
      case: "Real case",
      about: "Who's behind it",
      cta: "Try free",
    },
    hero: {
      badge: "Built by plant engineers · Ciudad Juárez",
      title: "Software & AI for",
      titleAccent: "manufacturing in Northern Mexico",
      sub: "Drop the stopwatch and the spreadsheet. Turn a workstation video into time studies, line balancing (Yamazumi) and capacity analysis — in minutes, with AI.",
      ctaPrimary: "Try GENBA free for 20 days",
      ctaSecondary: "Watch 90s demo",
      stat1: "Minutes",
      stat1Label: "from a video to a formal study",
      stat2: "0 credits",
      stat2Label: "if you capture manually",
      stat3: "ISO 9001",
      stat3Label: "signature-ready deliverables",
    },
    logos: "Speaks the shop-floor language: Yamazumi · SPC · PFMEA · OEE · Takt",
    how: {
      kicker: "GENBA Studies",
      title: "From a shop-floor video to a formal deliverable",
      sub: "Three steps. The engineer is always in the loop: nothing auto-approves.",
      steps: [
        { n: "01", title: "Capture", body: "Upload a workstation video or log operations by hand. No special hardware, straight from your phone." },
        { n: "02", title: "Analyze with AI", body: "GENBA extracts cycle times, balances the line (Yamazumi), finds the bottleneck and computes capacity and OEE." },
        { n: "03", title: "Signature-ready", body: "Generate time-study, capacity and reports as PDF/Excel ready to sign. You approve; AI assists, never controls." },
      ],
    },
    forWhom: {
      kicker: "Who it's for",
      title: "For the industrial engineer of the Mexican maquila",
      sub: "We speak your language because we come from the floor: a decade in heavy manufacturing (BRP / Can-Am) before building software.",
      bullets: [
        { t: "Time & method studies", d: "Standard time, rating and allowances — without a stopwatch." },
        { t: "Line balancing (Yamazumi)", d: "Visualize station load and reassign to lift efficiency." },
        { t: "Capacity & OEE", d: "Manpower, parts/hour, sensitivity and bottleneck in seconds." },
        { t: "Quality & safety", d: "PFMEA and JSA coming, on the same process data." },
      ],
    },
    caseStudy: {
      kicker: "Real case",
      title: `${ERP_NAME}: we digitized an entire CNC shop's operation`,
      sub: "For IMC Design (CNC manufacturing for maquiladoras in Juárez) we built an ERP/CRM covering the full cycle under one digital roof.",
      flow: "Quote → Purchasing → Design → Master Plan → Production → Quality (ISO 9001) → Shipping → Customer Portal",
      points: [
        { t: "ISO 9001 dimensional report", d: "Ballooned drawing with automatic OK/NG — native, not an add-on." },
        { t: "Realistic PMI Master Plan", d: "Scheduler with business days and volume scaling, not a manual Gantt." },
        { t: "Customer portal via magic link", d: "Clients see progress and deliverables without fighting another login." },
        { t: "Full white-label", d: "Each shop sees its own brand, not ours. Multi-tenant ready." },
      ],
      quote: "“It went from an internal system to a product we sell as SaaS to other shops and maquilas.”",
    },
    founder: {
      kicker: "Who's behind it",
      title: "Julio Ibarra — Julio Ronin",
      role: "Automotive Systems Engineer · Project Manager",
      body: "A decade leading projects and engineering in heavy manufacturing —BRP (Can-Am, Ski-Doo, Ryker), NPI/NPD from P1 to SOP— now building software with AI. That's the difference: this isn't software made by coders who never set foot in a plant. It's software built by someone who lived the floor and the stopwatch.",
      tags: ["Lean & ergonomics", "Time studies", "Project Management", "Forecast & business case", "AI development"],
    },
    finalCta: {
      title: "Ready to drop the stopwatch?",
      sub: "Try GENBA free for 20 days, no card. Or book a diagnostic of your operation.",
      ctaPrimary: "Try GENBA free",
      ctaSecondary: "Book a diagnostic",
      contact: "Ciudad Juárez, Chihuahua · ibarra.julio800@gmail.com",
    },
    footer: {
      tagline: "Industrial-engineering software & AI for manufacturing in Northern Mexico.",
      products: "Products",
      company: "Studio",
      rights: "All rights reserved.",
    },
  },
};
