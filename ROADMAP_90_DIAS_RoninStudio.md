# Ronin Studio — Roadmap de 90 días

**De "tengo productos" a "tengo clientes que pagan".**
Periodo: 3 meses · Actualizado: junio 2026

---

## 0. La estrella polar (el único objetivo de estos 90 días)

> **Cerrar 2 clientes de pago nuevos (GENBA y/o Kanri) y construir un pipeline de
> 10 prospectos calificados en Juárez / El Paso, con el motor de LinkedIn +
> contacto directo prendido y funcionando.**

Todo lo demás (más features, más productos, más diseño) es secundario a esto.
El riesgo #1 del proyecto hoy NO es técnico — es comercial. Tienes dos productos
sólidos y cero motor de adquisición. Estos 90 días prenden ese motor.

---

## 1. Realidad operativa y reglas del juego

- **Tienes empleo de tiempo completo (Orka).** Esto es una operación de fundador
  *part-time*: presupuesto realista **10–15 h/semana**. El roadmap está diseñado
  para ese ritmo. No intentes construir; intenta **vender lo que ya tienes**.
- **Ritmo semanal fijo (no negociable):**
  - 2–3 posts en LinkedIn/semana.
  - 5 contactos nuevos de outbound/semana.
  - 1 bloque de 2–3 h de producto/semana (solo lo que desbloquea ventas).
- **Guardarraíl legal (resolver en semana 1):** revisa tu contrato con Orka —
  propiedad intelectual, no-competencia y uso de tiempo. El sistema de Orka es de
  Orka; GENBA y Kanri deben quedar claramente separados como tuyos. No mezcles.

---

## 2. Los tres carriles

| Carril | Qué busca | Tu tiempo |
|---|---|---|
| **A · Comercial** (el motor) | Conseguir conversaciones → demos → pilotos → pago | 60% |
| **B · Marca/Contenido** | LinkedIn como imán de demanda y prueba social | 25% |
| **C · Producto** | Solo lo que desbloquea cobrar/replicar | 15% |

Nota: **producto es el carril más chico a propósito.** Ya construiste; ahora toca
vender. Solo tocas código para (a) poder cobrar en GENBA y (b) poder replicar
Kanri a un segundo cliente.

---

## 3. Orden de ejecución de los 4 entregables

1. **LinkedIn personal** → Semana 1 (prende el canal propio).
2. **Plan de adquisición (GTM Juárez)** → Semana 1–2 (para empezar outbound ya).
3. **Empaque + pricing + guion de demo** → Semana 2 (para que las demos cierren).
4. **Producto:** Stripe/cobro en GENBA → Sem. 2–3 · Multitenant Kanri → Sem. 5–8.

---

## MES 1 — FUNDACIONES (prende el motor)

**Objetivo del mes:** canal propio activo, oferta clara, primeras 20 conversaciones
iniciadas, GENBA capaz de cobrar.

### Semana 1 — Casa en orden
- **A:** Define el perfil del comprador (Ing. IE / gerente de planta / dir. de
  operaciones). Empieza la lista objetivo (meta: 30 maquilas/talleres en Juárez–El Paso).
- **B:** Reescribe tu perfil de LinkedIn (titular + "Acerca de" + experiencia
  enfocada a manufactura+IA). Publica el **post de lanzamiento** ("por qué construyo
  software para la maquila").
- **C:** Resuelve el guardarraíl legal con Orka. Confirma que GENBA puede desplegarse.
- **Hecho cuando:** perfil nuevo público + 1 post + lista con 30 nombres.

### Semana 2 — Oferta y demo
- **A:** Termina la lista objetivo (30). Redacta los guiones de contacto
  (LinkedIn DM, email, pitch de 60s). Define la **oferta piloto** de GENBA.
- **B:** 2 posts (1 tip de IE/lean, 1 detrás-de-cámaras de GENBA).
- **C:** Empieza Stripe en GENBA (checkout + gating de demo expirada).
- **Hecho cuando:** oferta piloto escrita + guiones listos + demo de GENBA grabada (90s).

### Semana 3 — Primer outbound
- **A:** Manda los primeros **10 contactos** (prioriza tu red tibia de BRP/Orka).
  Agenda las primeras demos.
- **B:** 2 posts (1 caso IMC/Kanri con números, 1 opinión sobre IA en manufactura).
- **C:** Cierra Stripe en GENBA (ya puede cobrar) + pantalla de planes.
- **Hecho cuando:** 10 contactos enviados + GENBA cobrando técnicamente.

### Semana 4 — Primeras demos
- **A:** Otros **10 contactos** (20 acumulados). Da las primeras 2–3 demos.
  Registra cada objeción en una hoja.
- **B:** 2 posts (1 mini-demo en video, 1 lección de la semana).
- **C:** Pulir lo que las demos revelen (solo bloqueadores).
- **Hecho cuando:** 20 contactos · ≥3 demos dadas · 1er piloto en negociación.

**Métricas fin de Mes 1:** 20 contactos · 3+ demos · 5 posts mínimo · GENBA cobrando.

---

## MES 2 — TRACCIÓN (pilotos y replicar Kanri)

**Objetivo del mes:** 2–3 pilotos de GENBA corriendo, Kanri listo para multi-tenant,
pipeline creciendo.

### Semana 5 — Convertir demos en pilotos
- **A:** Cierra **2 pilotos** de GENBA (gratis o de bajo costo a cambio de testimonio
  + datos). 5 contactos nuevos.
- **B:** 2 posts (anuncia "estamos en piloto con plantas de Juárez" — prueba social).
- **C:** Arranca **Fase 1 multitenant de Kanri** (tablas `tenants`, `tenant_id`).
- **Hecho cuando:** 2 pilotos de GENBA firmados/arrancados.

### Semana 6 — Acompañar pilotos
- **A:** Onboarding práctico de los pilotos. Que logren su primer estudio real.
  5 contactos nuevos.
- **B:** 2 posts (resultado real de un piloto, con permiso).
- **C:** Multitenant Kanri: reescribir RLS por `tenant_id` + onboarding de empresa.
- **Hecho cuando:** cada piloto entregó ≥1 estudio con valor real.

### Semana 7 — Empuje comercial
- **A:** 5 contactos nuevos (40+ acumulado). 2 demos nuevas. Pide referidos a IMC y
  a los pilotos.
- **B:** 2 posts (testimonio o quote de cliente).
- **C:** Multitenant Kanri: Storage por tenant + migrar IMC como tenant 1.
- **Hecho cuando:** Kanri corre multi-tenant con IMC migrado sin romper nada.

### Semana 8 — Preparar la conversión
- **A:** Define la conversación de "fin de piloto → suscripción". Agenda esos cierres.
  5 contactos nuevos.
- **B:** 2 posts (1 educativo, 1 de producto).
- **C:** Stripe en Kanri (planes Básico/Plus) reutilizando lo de GENBA.
- **Hecho cuando:** ≥1 piloto listo para convertir a pago · Kanri puede cobrar.

**Métricas fin de Mes 2:** 40+ contactos · 2–3 pilotos · Kanri multi-tenant + cobrando ·
pipeline de 8–10 prospectos.

---

## MES 3 — CONVERSIÓN (primeros pesos nuevos)

**Objetivo del mes:** convertir pilotos en clientes de pago, conseguir el 2º cliente
tipo-IMC para Kanri, y decidir el plan de escala.

### Semana 9 — Cerrar GENBA
- **A:** Convierte **1–2 pilotos** de GENBA a suscripción de pago. 5 contactos nuevos.
- **B:** 2 posts (caso de éxito del primer cliente de pago).
- **C:** Soporte/estabilidad de los clientes nuevos (no construir features nuevas).
- **Hecho cuando:** 1er cliente de GENBA pagando.

### Semana 10 — Empujar Kanri
- **A:** Lleva a 1 taller CNC nuevo a demo de Kanri (usa el caso IMC). 5 contactos.
- **B:** 2 posts (diferenciadores de Kanri: dimensional ISO, portal cliente).
- **C:** Ajustes de Kanri que pida el prospecto (solo si cierra).
- **Hecho cuando:** 1 taller nuevo en piloto/negociación de Kanri.

### Semana 11 — Consolidar
- **A:** Cierres pendientes. Recoge **testimonios formales** (video o escrito) de IMC
  y del 1er cliente GENBA. 5 contactos.
- **B:** 2 posts (testimonios reales).
- **C:** Documenta el onboarding (reduce tu dependencia como persona-clave).
- **Hecho cuando:** 2+ testimonios grabados.

### Semana 12 — Revisión y decisión de escala
- **A:** Revisa números: ¿cuántos clientes, cuánto MRR, cuál producto jala más?
- **B:** Post de cierre de trimestre ("lo que aprendí construyendo en público").
- **C:** Plan del siguiente trimestre basado en datos, no en corazonadas.
- **Hecho cuando:** decisión clara: ¿GENBA o Kanri lidera el siguiente trimestre? ¿se
  justifica dejar Orka o no todavía?

**Métricas fin de Mes 3 (meta):** 2 clientes de pago nuevos · MRR > tu costo de
operación · 2 testimonios · pipeline de 10 calificados · decisión de escala tomada.

---

## 4. Tablero semanal (lo que mides cada viernes)

| Métrica | Meta semanal |
|---|---|
| Contactos nuevos enviados | 5 |
| Demos agendadas | 1–2 |
| Posts publicados | 2–3 |
| Pilotos activos | (creciendo) |
| Clientes de pago | (objetivo: 2 al día 90) |
| MRR nuevo (USD) | (objetivo: cubrir costos) |

Si una semana no llegas a 5 contactos, **eso es la alarma roja** — no la falta de
features.

---

## 5. Riesgos y cómo los manejas

1. **Conflicto/tiempo con Orka** → resolver legal en semana 1; trabajar noches/fines.
2. **Sobre-construir en vez de vender** → regla: no tocas código si no desbloquea un
   cierre concreto. Producto = 15% del tiempo.
3. **Persona-clave** → documenta onboarding desde el mes 3; productiza, no
   personalices cada cliente.
4. **Concentración en IMC** → la meta de los 90 días es justamente romper esa
   dependencia con clientes #2 y #3.
5. **Ciclo de venta largo en maquila** → por eso entras con *piloto barato/gratis*:
   acorta el "sí" y genera el dato + testimonio.

---

## 6. Qué NO hacer estos 90 días (lista de "no")

- ❌ No retomar Lana ni Servirest.
- ❌ No agregar módulos nuevos a GENBA/Kanri que nadie pidió pagando.
- ❌ No perseguir clientes fuera del nicho manufactura del norte.
- ❌ No invertir tiempo serio en Instagram/Facebook (solo repost).
- ❌ No esperar a que "el producto esté perfecto" para vender. Ya está listo.

---

_Ronin Studio · Ciudad Juárez. Roadmap vivo: recalibrar cada fin de mes con datos reales._
