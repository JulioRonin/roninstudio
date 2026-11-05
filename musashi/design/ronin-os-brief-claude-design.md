# Ronin OS · Brief de diseño para Claude Design

Este documento es el contexto completo para diseñar la interfaz de **Ronin OS**, la plataforma interna de Ronin Studio. Léelo entero antes de generar cualquier pantalla. Todo lo que no esté aquí, pregúntalo o déjalo en blanco; no inventes clientes, cifras ni funciones.

---

## 0. Qué se pide a Claude Design

Diseñar la interfaz web de Ronin OS, en **modo oscuro** como tema principal, con la identidad de Ronin Studio (sección 3), para escritorio primero y con versiones de tableta y celular en las pantallas marcadas.

**Entregables, en este orden:**

1. Sistema de diseño: tokens de color, tipografía, espaciado, componentes base (botones, inputs, tablas, tarjetas, chips de estado, barra lateral, encabezado, bandeja de aprobación, vacíos, modales).
2. Dashboard (pantalla de inicio).
3. Clientes: lista, tablero de embudo y ficha del cliente.
4. Diagnósticos: bandeja de diagnósticos exprés, guía de visita, editor del mapa de flujo, hallazgos y plan, vista previa del PDF.
5. Proyectos: lista por etapa, resumen del proyecto, acta, EDT, Gantt, entregables, riesgos, horas, cierre, y la vista de solo lectura para el cliente.
6. Tareas: Hoy, Semana, tablero por proyecto.
7. Finanzas: estado de resultados, margen por proyecto, flujo de efectivo, reportes programados.
8. Facturación: cotizaciones, facturas, emisión de CFDI, conciliación.
9. Marketing y contenido: calendario editorial, campañas, ficha de pieza, bandeja de aprobación, métricas.
10. Agentes: panel de los 13 agentes, historial de propuestas, informe semanal del Investigador, costo de tokens.
11. Configuración.
12. Versión móvil de: Dashboard, Tareas · Hoy, bandeja de aprobación, ficha del cliente.

Formato: pantallas a 1440 px de ancho para escritorio, 1024 px para tableta y 390 px para celular. Cada pantalla con sus estados: con datos, vacía, cargando y con error donde aplique.

---

## 1. Ronin Studio: quiénes somos

**Ronin Studio** es un estudio de consultoría y desarrollo de software con sede en Ciudad Juárez, Chihuahua, que atiende Juárez, El Paso (Texas) y Chihuahua, en español e inglés. Construye plataformas a la medida para negocios de servicios de 5 a 200 personas: escuelas, restaurantes, clínicas, gimnasios, notarías, talleres y plantas.

**Fundador:** Julio César Ibarra. Más de diez años en la industria manufacturera: ingeniero mecánico, ingeniero de proyectos y líder del departamento de ingeniería mecánica de una planta, con gestión de proyectos bajo metodología PMI. Fundó Ronin Studio para unir la disciplina de la gestión de proyectos con la flexibilidad del software y la IA. Nombre público: "Julio César Ibarra, fundador de Ronin Studio".

**Postura de marca (la frase):** *Primero el flujo. Después la IA.*

**Posicionamiento:** Ronin Studio es el estudio que primero ordena cómo trabaja un negocio y después lo automatiza, con software propio que ya opera en comercializadoras, talleres, restaurantes, escuelas y gimnasios de la frontera. El enemigo es la IA pegada encima del desorden: el chatbot que nadie usa, la automatización que se rompe al mes, el software genérico que el equipo abandona.

**El Método Ronin (cuatro etapas, siempre en este orden):**

| # | Etapa | Qué significa |
|---|---|---|
| 01 | Mapear | Hacer visible cómo se mueve hoy la operación, en el negocio del cliente |
| 02 | Diseñar | Definir el flujo de trabajo, el papel de la IA y quién aprueba |
| 03 | Construir | Plataforma en producción, probada con casos reales |
| 04 | Evolucionar | Medir, ajustar y mantenerla útil cada mes |

**Principio con la IA:** la IA prepara, resume, avisa y propone. Una persona aprueba lo importante: enviar, cobrar, facturar, publicar, cambiar un precio.

**Lo que ya construimos (contexto, no para mostrar como datos reales):**

- Orka Oleo Group: comercializadora de aceites en Juárez y Texas; plataforma de ventas, precios, crédito y clientes con tableros integrados; dos años operando.
- Kanri: gestión de talleres CNC de la cotización al cobro; en producción con IMC Design; se ofrece como SaaS.
- Mono Atelier: estudio de diseño propio; ERP con cotización, facturación CFDI y un agente de cotización en Discord con Hermes Agent; dos años operando.
- Servirest: punto de venta y operación de restaurantes; primer cliente en vivo.
- Operación multi-sucursal: auditorías de inocuidad con foto y calificación por sucursal para una cadena de steakhouses (cliente anónimo).
- Dogma (moda), Lana (finanzas personales con IA), Vértice (escuelas), Dojo (gimnasios), GENBA (estudios de tiempo desde video), Andén (auditoría de transporte de personal).

**Cómo vendemos:** contenido en video y carruseles (Instagram, LinkedIn, TikTok, YouTube) → diagnóstico exprés gratuito en el sitio (12 preguntas, 5 minutos) → llamada de 15 minutos → diagnóstico completo pagado (visita, mapa del flujo actual, plan con presupuesto cerrado; se acredita al proyecto) → proyecto por módulos → acompañamiento mensual.

**Stack con el que trabajamos:** Supabase, Vercel, Next.js, Hermes Agent (Nous Research), Claude y otros modelos por API, Facturapi (CFDI), Stripe, WhatsApp Business API, Higgsfield (imagen y video), ElevenLabs (voz).

---

## 2. Qué es Ronin OS

La plataforma con la que Ronin Studio opera, de punta a punta: perfila clientes, hace los diagnósticos, planea y entrega proyectos con nivel PMI, lleva las finanzas, factura, produce y publica el contenido de marketing, y tiene agentes de IA que trabajan sobre todos los módulos. Y es, al mismo tiempo, **la demostración de lo que vendemos**: cuando un dueño pregunta "¿y ustedes cómo trabajan?", la respuesta es abrir Ronin OS.

**Usuarios:** Julio (dueño, usa todo), su equipo (roles por módulo), y el cliente (vista de solo lectura de su proyecto, por enlace).

**Principios de diseño:**

1. **Es la demo.** Cada pantalla debe poder mostrarse a un cliente sin preparar nada. Hay un **modo demo** (interruptor en la barra lateral) que oculta nombres y montos reales y los reemplaza por datos de ejemplo.
2. **Un flujo, de punta a punta.** El cliente entra como lead y recorre el sistema hasta el acompañamiento sin cambiar de herramienta. Nada se captura dos veces: lo de la llamada aparece en el diagnóstico, el plan se vuelve propuesta, la propuesta se vuelve proyecto con hitos ligados a facturas.
3. **Primero el flujo, después la IA.** Los agentes proponen; Julio aprueba con un clic. Toda propuesta de IA se ve como borrador, con su origen y un botón de aprobar o editar.
4. **El método es la columna vertebral.** Cada proyecto vive en Mapear → Diseñar → Construir → Evolucionar. La banda en Óxido de la R marca en qué etapa va.
5. **Nivel PMI, sin burocracia.** Acta, EDT, Gantt, entregables con criterios de aceptación, riesgos, cambios, horas, cierre. Se generan desde el diagnóstico, no se capturan a mano.
6. **Sobrio y denso.** Es una herramienta de trabajo diario: tablas, listas y paneles con mucha información legible, no una landing. Nada de ilustraciones decorativas, ni neón, ni robots.

---

## 3. Identidad visual (obligatoria)

### 3.1 Color · Paleta Planta

| Nombre | HEX | Uso en la plataforma |
|---|---|---|
| Tinta | #0C0F14 | Fondo principal y texto sobre claro |
| Panel | #13171D | Tarjetas y paneles sobre Tinta |
| Panel 2 | #101318 | Inputs y zonas hundidas |
| Borde | #252A31 | Bordes de tarjetas, tablas e inputs |
| Papel | #EEEBE4 | Texto principal sobre Tinta; fondo del tema claro y de los PDF |
| Papel panel | #F7F5F0 | Tarjetas en tema claro |
| Niebla | #A9A6A0 | Texto secundario sobre Tinta |
| Tenue | #7C8088 | Etiquetas, metadatos, placeholders |
| Acero | #5B6068 | Texto secundario sobre claro, bordes en claro |
| Óxido | #B05139 | **Acción**: botones principales, lo que requiere decisión, tareas vencidas, hitos atrasados, facturas vencidas, etapa activa |
| Óxido hover | #9A4530 | Estado hover del botón principal |
| Óxido claro | #F7D6CA | Fondo de alerta suave en tema claro |
| Olivo | #4C8141 | **Ya funciona solo**: en producción, cobrado, publicado, aprobado y ejecutado. Nunca como decoración |
| Olivo claro | #D1E5CC | Fondo de éxito suave en tema claro |
| Ámbar | #C98A3C | Único color adicional permitido: "en revisión" o "atención media" (nivel intermedio) |
| WhatsApp | #25D366 | Solo en botones que abren WhatsApp |

**Reglas semánticas:** Óxido = alguien debe actuar. Olivo = ya funciona solo. Texto sobre Óxido siempre en Papel. Nunca Óxido sobre Olivo. Proporción aproximada: 60 % Tinta, 25 % Papel, 10 % Óxido, 5 % Olivo. Los gráficos usan Papel, Niebla y Acero para lo neutro; Óxido para lo que pide acción; Olivo para lo cobrado o en producción.

### 3.2 Tipografía

- **Archivo** (Google Fonts), con `font-stretch: 112%`: peso 900 para títulos y cifras grandes, en mayúsculas y con `letter-spacing: -0.02em`; peso 300 como contrapeso en subtítulos; peso 400 para el cuerpo; 600 para énfasis.
- **JetBrains Mono** 400/500: etiquetas, estados, etapas, códigos, fechas y números tabulares, en mayúsculas con `letter-spacing: 0.1em` a `0.16em` ("01 / 04", "EN PRODUCCIÓN", "DATOS DE DEMOSTRACIÓN").
- Tamaños base: cuerpo 14 a 15 px; etiquetas mono 10 a 11 px; títulos de sección 22 a 28 px; cifras de KPI 32 a 44 px.
- Enlace de Google Fonts: `https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,300..900&family=JetBrains+Mono:wght@400;500&display=swap`

### 3.3 El logo: la R Pipeline

Una R cortada en cuatro bandas diagonales, desplazadas de izquierda a derecha (−12, −4, +4, +12). Cada banda es una etapa del método (de arriba abajo: Mapear, Diseñar, Construir, Evolucionar). Una sola banda en Óxido marca la etapa activa; las demás van en Papel (sobre oscuro) o Tinta (sobre claro).

- Wordmark: **RONIN** en Archivo 900 y STUDIO en Archivo 300, con el isotipo a la izquierda (24 a 26 px en navegación).
- En Ronin OS, la etiqueta de etapa de cada proyecto es la R con la banda correspondiente en Óxido, a 20 a 28 px, junto al nombre de la etapa en JetBrains Mono.
- Tres estados para animación: Mapeo (bandas desordenadas) → En flujo (desplazamiento progresivo, versión oficial) → En producción (bandas alineadas).
- No alinear las bandas en la versión oficial, no cambiar el orden del desplazamiento, no degradados, no sombras, no rotar.
- Archivos: `assets/brand/logo/` (ronin-isotipo-papel.svg, ronin-isotipo-tinta.svg, ronin-isotipo-oxido.svg, ronin-isotipo-etapa-01..04.svg, ronin-logo-horizontal-papel.svg, favicon.svg, ronin-app-icon.svg). Trazo de la R: `M0 0H122C170 0 198 28 198 66C198 98 180 120 152 128L200 220H128L88 134H64V220H0Z M64 50H116C131 50 138 57 138 67C138 78 131 85 116 85H64Z`, viewBox `-14 0 228 220`.

### 3.4 Otros rasgos del lenguaje visual

- Esquinas de 4 a 6 px; sin sombras suaves grandes; separación por bordes de 1 px en #252A31.
- Los eyebrows (etiquetas sobre un título) llevan una barra Óxido corta inclinada (`skewY(-14deg)`) a la izquierda.
- Botón principal: fondo Óxido, texto Papel, 4 px de radio, peso 600. Botón secundario: borde #3A4048 sin relleno. Botón de texto: subrayado Óxido al pasar el cursor.
- Progreso: barra de 4 px con relleno Óxido.
- Fotografía, si aparece: blanco y negro, contraste alto, personas reales en su negocio. En Ronin OS casi no hay fotos; las fotos de visita del diagnóstico se muestran en B/N.
- Tono de los textos de interfaz: directo, en español neutro de México, sin jerga ("Lo de hoy", "Aprobar y enviar", "Convertir en tarea"). Nada de "¡Hola!", emojis ni signos de exclamación.

---

## 4. Estructura de navegación

Barra lateral fija a la izquierda (240 px, colapsable a 64 px con solo íconos), con el isotipo y RONIN OS arriba, los módulos en el orden del flujo, y abajo el interruptor de **Modo demo** y el usuario.

1. Dashboard
2. Marketing y contenido
3. Clientes
4. Diagnósticos
5. Proyectos
6. Tareas
7. Finanzas
8. Facturación
9. Agentes
10. Configuración

Encabezado superior: saludo con fecha ("Buenos días, Julio · miércoles 4 de noviembre"), buscador global (clientes, proyectos, piezas; atajo Ctrl K), campana de avisos con la cuenta de propuestas de IA pendientes de aprobar, y el menú del usuario.

Elemento transversal: la **bandeja de aprobación**, un panel lateral derecho que se abre desde la campana y lista todo lo que los agentes proponen hoy (mensajes, calendario, borradores, recordatorios), cada uno con Aprobar, Editar o Descartar.

---

## 5. Pantallas por módulo

### 5.1 Dashboard

Responde tres preguntas en diez segundos: qué tengo que hacer hoy, cómo van los proyectos, cómo va el dinero.

- **Fila de KPIs (4 a 6 tarjetas):** leads esta semana por origen; llamadas agendadas y realizadas; cobrado este mes; margen del mes; piezas publicadas contra planeadas; tareas vencidas. Cada tarjeta: etiqueta mono, cifra grande en Archivo 900, comparación contra la semana o mes anterior, y una línea de tendencia pequeña.
- **Panel "Hoy · tareas y seguimientos":** lista agrupada por cliente, las vencidas primero en Óxido; cada fila con el origen (llamada, hito, factura, lead), la hora y, cuando hay un mensaje preparado por la IA, un botón "Aprobar y enviar".
- **Panel "Proyectos por etapa":** cuatro filas, Mapear, Diseñar, Construir, Evolucionar, con los proyectos como chips; los hitos atrasados en Óxido; clic abre el Gantt.
- **Panel "Cobranza":** facturas por vencer y vencidas con monto, cliente y el recordatorio listo para aprobar.
- **Panel "Embudo":** conteo por etapa (lead, contactado, llamada, diagnóstico, propuesta, cliente) como barras horizontales; perdidos aparte con su objeción principal.
- **Panel "Contenido de la semana":** las piezas del calendario con su estado y, para las publicadas, alcance y leads.
- **Panel "Informe del Investigador":** las tres recomendaciones de la semana con botón "Convertir en tarea".
- Estado vacío (primer uso): la misma estructura con una línea por panel que dice de dónde se llenará ("Las tareas aparecen aquí cuando registres una llamada o entre un lead").

### 5.2 Marketing y contenido

- **Calendario editorial:** vista semanal y mensual; columnas por día, filas por canal (Instagram, YouTube, TikTok, LinkedIn); cada pieza como tarjeta con tipo (video, carrusel, post), gancho en una línea, estado por color (idea en Tenue, guion en Niebla, producción en Ámbar, aprobación en Óxido, programada en Papel, publicada en Olivo).
- **Campañas:** lista con objetivo, sector, fechas, piezas, presupuesto de pauta y leads generados; ficha de campaña con sus piezas y sus métricas.
- **Ficha de pieza:** encabezado con tipo, canal, campaña y estado; pestañas: Gancho y guion (texto para teleprompter, con tiempos), Textos por red (Instagram, LinkedIn, TikTok, YouTube, cada uno con su contador de caracteres y hashtags), Apoyos (tomas generadas, voz, subtítulos, láminas; cada archivo con su prompt y su origen), Publicación (fecha y hora por canal, vista previa), Métricas (alcance, reproducciones, retención a 3 segundos y completa, visitas al perfil, clics, diagnósticos exprés atribuidos).
- **Bandeja de aprobación de marketing:** lo que proponen el Estratega, el Guionista, el Productor y el Publicador, con vista previa y los botones Aprobar, Editar, Descartar.
- **Métricas por canal:** comparación semanal por canal y por tipo de pieza; los mejores ganchos de la semana.

### 5.3 Clientes y perfil

- **Lista:** tabla con negocio, sector, ciudad, etapa del embudo, origen, último contacto, siguiente paso con fecha, responsable. Filtros por sector, etapa, ciudad y origen. Las filas con siguiente paso vencido llevan la fecha en Óxido.
- **Tablero de embudo:** columnas lead, contactado, llamada, diagnóstico, propuesta, cliente, perdido; tarjetas arrastrables con negocio, sector y fecha del siguiente paso.
- **Ficha del cliente:** encabezado con negocio, sector, tamaño, sucursales, ciudad, etapa y los contactos (nombre, puesto, WhatsApp, correo, si decide). Columna principal: línea de tiempo de interacciones (visitas, llamadas, mensajes, correos, diagnósticos, propuestas, proyectos, facturas) con notas; cada llamada registra punto A, punto B, intentos previos y costo de no actuar. Columna lateral: resumen del Perfilador (5 líneas de IA con botón para regenerar), las respuestas del diagnóstico exprés, objeción principal, y la pieza de contenido por la que llegó.
- **Registro de pérdida:** al mover a perdido, un modal pide la razón (una de las cuatro objeciones o una cortina de humo) y una nota.

### 5.4 Diagnósticos

- **Bandeja de diagnósticos exprés:** lo que llega del sitio: negocio, sector, fecha, los tres hallazgos, horas estimadas, texto de "Otro", y el estado de seguimiento (sin contactar, contactado, llamada agendada). Botón "Crear cliente" si no existe.
- **Diagnóstico completo:** encabezado con cliente, fecha de visita, guía usada y estado (programado, en visita, en redacción, entregado, convertido en proyecto). Pestañas:
  - **Guía de visita:** lista de preguntas por sector con espacio para notas, fotos y audios; se puede usar desde tableta en la visita.
  - **Mapa de flujo:** editor de diagrama: pasos (cajas), responsables (carriles), herramientas, tiempos, y los puntos donde se atora marcados en Óxido. Paleta a la izquierda, lienzo al centro, propiedades a la derecha. El Mapeador propone el primer borrador; se ve como capa editable con etiqueta "Borrador de IA".
  - **Hallazgos:** lista priorizada con hallazgo, prioridad, módulo propuesto y estimación.
  - **Plan:** los hitos propuestos con estimación y precio; de aquí sale la cotización con un clic.
  - **PDF:** vista previa del documento con la marca (portada, mapa, hallazgos, plan), en tema claro Papel.

### 5.5 Proyectos · PMI

- **Lista:** agrupada por etapa del método, cada proyecto con cliente, avance, próximo hito y su fecha, horas contra estimación, estado de cobranza.
- **Resumen del proyecto:** encabezado con cliente, etapa actual (R con banda en Óxido), fechas, presupuesto, avance, y el enlace de solo lectura para el cliente. Debajo, cuatro tarjetas: próximo hito, riesgos abiertos, horas contra estimación, facturas del proyecto.
- **Acta de constitución:** documento con objetivo, alcance, fuera de alcance, supuestos, riesgos iniciales, hitos y presupuesto; editable por secciones; generada por el Planeador desde el diagnóstico.
- **EDT:** árbol de entregables, expandible; cada entregable con criterios de aceptación, responsable, horas estimadas y estado.
- **Gantt:** cronograma con actividades agrupadas por etapa del método, dependencias, duración, ruta crítica resaltada, línea base contra avance real, hoy marcado con una línea vertical. Barras en Niebla; la etapa activa en Óxido claro; lo terminado en Olivo. Zoom por semana y por mes.
- **Entregables e hitos:** tabla con hito, fecha comprometida, estado (pendiente, en revisión, aceptado), evidencia adjunta y la factura ligada. Aceptar un hito dispara la factura.
- **Riesgos y cambios:** registro de riesgos con probabilidad e impacto en una matriz 3×3; solicitudes de cambio con efecto en fecha y precio y su aprobación.
- **Horas:** registro de tiempo por actividad y persona; resumen contra estimación.
- **Cierre:** acta de cierre, lecciones aprendidas, encuesta al cliente; al cerrar pasa a Evolucionar.
- **Vista del cliente (solo lectura, por enlace):** su Gantt simplificado, sus entregables con estado, sus facturas, y el reporte semanal. Tema claro Papel, con la marca de Ronin discreta. Es la pantalla que más se enseña en ventas.

### 5.6 Tareas y seguimiento

- **Hoy:** lista por cliente; cada tarea con origen (lead nuevo, llamada, hito, factura, acompañamiento, investigación), hora, canal, y el mensaje propuesto por la IA cuando aplica, con Aprobar y enviar. Las vencidas arriba en Óxido.
- **Semana:** siete columnas; arrastrar para mover.
- **Tablero por proyecto:** columnas por hacer, en curso, en revisión, hecho.
- **Crear tarea manual:** formulario corto: título, cliente o proyecto, fecha, canal del siguiente paso.

### 5.7 Finanzas

- **Estado de resultados del mes:** tabla ingresos cobrados, costo directo (horas al costo, subcontratos, herramientas por proyecto), margen bruto, gastos generales, utilidad; comparación contra el mes anterior; gráfica de 12 meses.
- **Margen por proyecto y por cliente:** tabla ordenable con ingreso, horas, costo, margen en pesos y en porcentaje.
- **Flujo de efectivo:** cobros esperados por hito en las próximas 8 semanas, contra gastos previstos.
- **Costo de IA:** tokens por agente y por mes, contra el tope.
- **Reportes programados:** lista de reportes (semanal lunes, mensual día 1) con destinatarios, canal (correo, WhatsApp) y vista previa; interruptor por reporte.

### 5.8 Facturación

- **Cotizaciones:** lista con cliente, monto, vigencia, estado (borrador, enviada, abierta, aceptada, vencida) y cuándo la abrieron; editor de cotización con conceptos e hitos; vista previa del PDF en tema Papel.
- **Facturas:** lista con cliente, proyecto, concepto, monto, moneda, estado (borrador, emitida, vencida, pagada, cancelada), fecha de pago; emisión de CFDI con Facturapi (datos fiscales del cliente, uso de CFDI, forma de pago) y complementos de pago.
- **Cobranza:** las facturas por vencer y vencidas con el recordatorio del Cobrador listo para aprobar; historial de avisos.
- **Conciliación:** marcar pagos recibidos; para clientes en Estados Unidos, factura en dólares con Stripe.

### 5.9 Agentes

- **Panel de agentes:** 13 tarjetas en tres grupos (Operación, Investigación, Marketing), cada una con nombre, qué hace en una línea, disparador, modelo asignado, costo del mes contra tope, última corrida, interruptor activo/inactivo, y si puede actuar solo.
- **Historial de propuestas:** tabla con fecha, agente, cliente o campaña, lo que propuso, lo que se aprobó, lo que se cambió, modelo y costo. Clic abre la propuesta con la comparación antes y después.
- **Informe semanal del Investigador:** documento de una página: tres prácticas que aplicar, qué hicieron los competidores esa semana, qué ofrecen y a qué precio, una recomendación concreta; cada punto con sus fuentes y un botón "Convertir en tarea". Historial de informes por semana.
- **Prueba de modelos:** por agente, comparación de dos modelos durante dos semanas: calidad (aprobaciones sin cambios), costo y tiempo.

**Los 13 agentes:** Perfilador, Seguimiento, Mapeador, Planeador, Reportero, Cobrador, Analista (operación); Investigador (investigación); Estratega, Guionista, Productor, Publicador, Analista de canal (marketing). Todos corren sobre Hermes Agent, y ninguno actúa hacia afuera sin aprobación, salvo el Cobrador en segundo aviso y el Publicador a la hora ya aprobada.

### 5.10 Configuración

Usuarios y roles; catálogo de sectores con su guía de visita y sus preguntas del diagnóstico exprés; plantillas de documentos (acta, cotización, reporte semanal, PDF del diagnóstico); datos fiscales de Ronin; integraciones (Supabase, Facturapi, Stripe, WhatsApp, Meta, YouTube, TikTok, Higgsfield, ElevenLabs, Hermes) con estado conectado o no; tope de tokens total y por agente.

---

## 6. Estados y semántica de color en la interfaz

| Situación | Color | Ejemplos |
|---|---|---|
| Requiere acción de una persona | Óxido | Tarea vencida, hito atrasado, factura vencida, propuesta de IA por aprobar, etapa activa |
| Atención media, en revisión | Ámbar | Pieza en producción, hito en revisión, riesgo medio |
| Ya funciona, cerrado, cobrado | Olivo | En producción, factura pagada, pieza publicada, hito aceptado, propuesta ejecutada |
| Neutro, informativo | Niebla / Tenue | Pendientes sin fecha, borradores, metadatos |
| Error del sistema | Óxido con ícono de error | Integración desconectada, envío fallido |

Chips de estado siempre en JetBrains Mono, mayúsculas, con un punto de color a la izquierda.

**Modo demo activado:** una franja delgada arriba dice "MODO DEMO · datos de ejemplo" en mono; los nombres se reemplazan por "Negocio demo 1, 2…" y los montos por cifras redondas de ejemplo. Nada de la interfaz cambia de lugar.

---

## 7. Componentes a definir en el sistema de diseño

- Barra lateral (expandida y colapsada) y encabezado con buscador y campana.
- Tarjeta de KPI con etiqueta mono, cifra grande, comparación y tendencia.
- Tabla densa con ordenamiento, filtros, selección y acciones por fila; versión con agrupación por cliente o etapa.
- Tarjeta de tarea con origen, hora, canal, mensaje de IA y botón Aprobar y enviar.
- Chip de estado y chip de etapa del método (con la R y la banda en Óxido).
- Bandeja de aprobación (panel lateral derecho) y la tarjeta de propuesta de IA con Aprobar, Editar y Descartar, y la etiqueta "Borrador de IA · [agente] · [modelo]".
- Tablero de columnas con tarjetas arrastrables (embudo, tareas, calendario).
- Gantt (barras, dependencias, ruta crítica, línea de hoy, zoom).
- Árbol expandible (EDT).
- Matriz 3×3 de riesgos.
- Editor de diagrama (paleta, lienzo, propiedades) para el mapa de flujo.
- Vista previa de documento en tema Papel (PDF del diagnóstico, cotización, acta, reporte).
- Formularios con etiquetas mono arriba del campo, foco en Óxido, errores en Óxido.
- Estados vacíos con una línea que dice de dónde se llena cada panel.
- Toast de confirmación discreto, abajo a la izquierda.
- Interruptor de modo demo y franja de modo demo.

---

## 8. Datos y contenido de ejemplo

- **No usar nombres de clientes reales** (ni Orka, ni IMC Design, ni la cadena de steakhouses) como datos dentro de las pantallas. Usar "Negocio demo" con sectores reales: Escuela privada, Restaurante con sucursales, Clínica, Gimnasio, Notaría, Taller.
- **No inventar cifras que parezcan resultados de Ronin.** Las cifras de ejemplo deben ser redondas y verosímiles, y el modo demo debe estar visible en las pantallas con datos.
- Fechas de ejemplo: noviembre de 2026 en adelante.
- Moneda: pesos mexicanos con el formato $12,500.00 MXN; dólares como USD cuando aplique.
- Idioma de la interfaz: español de México. Deja prevista una versión en inglés, sin diseñarla.

---

## 9. Responsive y accesibilidad

- Escritorio primero (1440). Tableta (1024) para la guía de visita, el mapa de flujo y la vista del cliente. Celular (390) para Dashboard, Tareas · Hoy, bandeja de aprobación y ficha del cliente; en celular la barra lateral se vuelve una barra inferior con cinco accesos: Hoy, Clientes, Proyectos, Aprobar, Más.
- Contraste mínimo 4.5:1 en texto; Óxido sobre Tinta se usa para texto grande o con fondo; para texto pequeño sobre Tinta se usa Papel y se marca la acción con un punto o borde Óxido.
- Todo accionable con teclado; el buscador con Ctrl K; la bandeja de aprobación con atajos A (aprobar), E (editar), D (descartar).

---

## 10. Lo que no se hace

- Ilustraciones decorativas, degradados, neón, robots, cerebros o chips brillantes.
- Más de un color de acento por pantalla además de Óxido; Olivo solo cuando algo ya funciona.
- Avatares o fotos generadas de personas que parezcan clientes.
- Pantallas de "IA mágica": cada propuesta de IA se ve como borrador con su origen y su botón de aprobar.
- Textos con exclamaciones, emojis o jerga ("potenciar", "disruptivo", "soluciones integrales").

---

## 11. Referencias

- Sitio actual, con la identidad aplicada: roninstudio.com.mx (inicio, /diagnostico, /restaurantes, /escuelas, /clinicas, /dojo).
- Manual de marca: Paleta Planta, R Pipeline, Serie Método (fotos B/N con la R y una banda en Óxido).
- Plan completo de Ronin OS (módulos, flujo, modelo de datos, roadmap): documento "Ronin OS · Plan de la plataforma interna".
